'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import {
  asErrorState,
  describeActionError,
  INITIAL_AUTH_ACTION_STATE,
} from './action-helpers';
import { requireUser } from './dal';
import { updateOwnProfileSchema } from './schemas';
import type { AuthActionState } from './types';

export async function updateOwnProfileAction(
  previousState: AuthActionState = INITIAL_AUTH_ACTION_STATE,
  formData: FormData
): Promise<AuthActionState> {
  void previousState;

  const viewer = await requireUser();
  const validatedFields = updateOwnProfileSchema.safeParse({
    fullName: formData.get('fullName'),
  });

  if (!validatedFields.success) {
    return asErrorState(
      'Review the highlighted field and try again.',
      validatedFields.error.flatten().fieldErrors
    );
  }

  const supabase = await createClient();
  const { fullName } = validatedFields.data;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
      })
      .eq('id', viewer.id)
      .select('id')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return asErrorState('Your profile could not be updated right now.');
    }

    revalidatePath('/control-center/settings');

    return {
      status: 'success',
      message: fullName ? 'Profile updated.' : 'Display name cleared.',
    };
  } catch (error) {
    unstable_rethrow(error);

    return asErrorState(
      describeActionError(error, 'Unable to update your profile right now.')
    );
  }
}
