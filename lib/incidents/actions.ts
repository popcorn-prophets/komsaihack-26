'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { z } from 'zod';

import { requireRole } from '@/lib/auth/dal';
import {
  formatIncidentStatusLabel,
  INCIDENT_STATUSES,
  type IncidentStatus,
} from '@/lib/incidents/shared';
import { createClient } from '@/lib/supabase/server';

const moveIncidentSchema = z.object({
  incidentId: z.string().min(1, 'Select an incident first.'),
  nextStatus: z.enum(INCIDENT_STATUSES),
});

export type MoveIncidentActionState =
  | {
      status: 'success';
      incidentId: string;
      nextStatus: IncidentStatus;
      message: string;
    }
  | {
      status: 'error';
      message: string;
    };

export async function moveIncidentAction(
  previousState: MoveIncidentActionState | null,
  formData: FormData
): Promise<MoveIncidentActionState> {
  void previousState;

  await requireRole(['responder', 'admin', 'super_admin']);

  const validatedFields = moveIncidentSchema.safeParse({
    incidentId: formData.get('incidentId'),
    nextStatus: formData.get('nextStatus'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message:
        validatedFields.error.issues[0]?.message ??
        'Review the incident move request and try again.',
    };
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('incidents')
      .update({
        status: validatedFields.data.nextStatus,
      })
      .eq('id', validatedFields.data.incidentId)
      .select('id, status')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.id || !data.status) {
      return {
        status: 'error',
        message: 'The incident could not be moved right now.',
      };
    }

    revalidatePath('/control-center/incidents');

    return {
      status: 'success',
      incidentId: data.id,
      nextStatus: data.status,
      message: `Incident moved to ${formatIncidentStatusLabel(data.status)}.`,
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      status: 'error',
      message: 'Unable to update the incident status right now.',
    };
  }
}

export async function moveIncidentStatusAction(input: {
  incidentId: string;
  nextStatus: IncidentStatus;
}) {
  const formData = new FormData();
  formData.set('incidentId', input.incidentId);
  formData.set('nextStatus', input.nextStatus);

  return moveIncidentAction(null, formData);
}
