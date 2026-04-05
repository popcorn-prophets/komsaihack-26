'use server';

import { ThreadImpl, deriveChannelId } from 'chat';
import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';

import { requireRole } from '@/lib/auth/dal';
import { adapters, state as botState } from '@/lib/bot/adapters';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

import { advisoryTemplateNameSchema, createAdvisorySchema } from './schemas';
import {
  INITIAL_ADVISORY_ACTION_STATE,
  type AdvisoryActionState,
} from './types';

type ResidentTarget = {
  id: string;
  thread_id: string;
  platform: Database['public']['Enums']['resident_platform'];
};

function formatAdvisoryMessage(title: string, message: string) {
  return {
    markdown: `**${title}**\n\n${message}`,
  };
}

async function sendAdvisoryToResident(
  resident: ResidentTarget,
  payload: { title: string; message: string }
) {
  const adapterName = resident.thread_id.split(':', 1)[0];

  if (!adapterName) {
    return {
      residentId: resident.id,
      deliveredAt: null,
    };
  }

  const adapter =
    adapters[adapterName as keyof typeof adapters] ??
    adapters[resident.platform as keyof typeof adapters];

  if (!adapter) {
    return {
      residentId: resident.id,
      deliveredAt: null,
    };
  }

  try {
    const thread = new ThreadImpl({
      id: resident.thread_id,
      channelId: deriveChannelId(adapter, resident.thread_id),
      adapter,
      stateAdapter: botState,
      isDM: true,
    });

    await thread.post(formatAdvisoryMessage(payload.title, payload.message));

    return {
      residentId: resident.id,
      deliveredAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to deliver advisory to resident thread:', {
      residentId: resident.id,
      threadId: resident.thread_id,
      error,
    });

    return {
      residentId: resident.id,
      deliveredAt: null,
    };
  }
}

export async function createAdvisoryAction(
  previousState: AdvisoryActionState = INITIAL_ADVISORY_ACTION_STATE,
  formData: FormData
): Promise<AdvisoryActionState> {
  void previousState;

  const actor = await requireRole(['responder', 'admin', 'super_admin']);
  const intent = formData.get('intent');
  const normalizedIntent =
    intent === 'save_template' ? 'save_template' : 'send';
  const validatedFields = createAdvisorySchema.safeParse({
    title: formData.get('title'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Please correct the highlighted fields and try again.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();

    if (normalizedIntent === 'save_template') {
      const templateNameValidation = advisoryTemplateNameSchema.safeParse(
        formData.get('templateName')
      );

      if (!templateNameValidation.success) {
        return {
          status: 'error',
          message: 'Please enter a valid template name.',
          fieldErrors: {
            templateName: templateNameValidation.error.flatten().formErrors,
          },
        };
      }

      const { error: templateInsertError } = await supabase
        .from('advisory_templates')
        .insert({
          name: templateNameValidation.data,
          title: validatedFields.data.title,
          message: validatedFields.data.message,
          created_by: actor.id,
        });

      if (templateInsertError) {
        const duplicateTemplate =
          templateInsertError.code === '23505' ||
          templateInsertError.message.includes(
            'advisory_templates_creator_name_key'
          );

        return {
          status: 'error',
          message: duplicateTemplate
            ? 'A template with this name already exists in your library.'
            : templateInsertError.message,
          fieldErrors: duplicateTemplate
            ? {
                templateName: [
                  'Use another template name or edit the existing one.',
                ],
              }
            : undefined,
        };
      }

      revalidatePath('/control-center/advisories');

      return {
        status: 'success',
        message: 'Template saved to your advisory library.',
      };
    }

    const adminClient = createAdminClient();

    const { data: insertedAdvisory, error: insertAdvisoryError } =
      await supabase
        .from('advisories')
        .insert({
          title: validatedFields.data.title,
          message: validatedFields.data.message,
          created_by: actor.id,
        })
        .select('id')
        .single();

    if (insertAdvisoryError) {
      throw insertAdvisoryError;
    }

    const { data: residents, error: residentsError } = await adminClient
      .from('residents')
      .select('id, thread_id, platform');

    if (residentsError) {
      throw residentsError;
    }

    const deliveryResults = await Promise.all(
      (residents ?? []).map((resident) =>
        sendAdvisoryToResident(resident as ResidentTarget, {
          title: validatedFields.data.title,
          message: validatedFields.data.message,
        })
      )
    );

    if (deliveryResults.length > 0) {
      const { error: recipientsError } = await adminClient
        .from('advisory_recipients')
        .insert(
          deliveryResults.map((result) => ({
            advisory_id: insertedAdvisory.id,
            resident_id: result.residentId,
            delivered_at: result.deliveredAt,
          }))
        );

      if (recipientsError) {
        throw recipientsError;
      }
    }

    revalidatePath('/control-center/advisories');

    const deliveredCount = deliveryResults.filter(
      (result) => result.deliveredAt
    ).length;

    return {
      status: 'success',
      message: 'Advisory published and broadcast finished.',
      stats: {
        targeted: deliveryResults.length,
        delivered: deliveredCount,
        failed: deliveryResults.length - deliveredCount,
      },
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      status: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'Unable to publish advisory right now.',
    };
  }
}
