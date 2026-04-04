'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';

import {
  asErrorState,
  INITIAL_AUTH_ACTION_STATE,
  releaseBootstrapClaim,
} from './action-helpers';
import { bootstrapAdminSchema } from './schemas';
import type { AuthActionState } from './types';

export async function createBootstrapAdminAction(
  previousState: AuthActionState = INITIAL_AUTH_ACTION_STATE,
  formData: FormData
): Promise<AuthActionState> {
  void previousState;

  const validatedFields = bootstrapAdminSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return asErrorState(
      'Review the highlighted fields and try again.',
      validatedFields.error.flatten().fieldErrors
    );
  }

  const { fullName, email, password } = validatedFields.data;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  let claimReserved = false;

  try {
    const { data: canBootstrap, error: bootstrapError } = await supabase.rpc(
      'bootstrap_registration_open'
    );

    if (bootstrapError) {
      throw bootstrapError;
    }

    if (!canBootstrap) {
      return asErrorState(
        'Initial registration is closed. Ask an admin to provision your account.'
      );
    }

    const { data: claimGranted, error: claimError } = await supabase.rpc(
      'claim_bootstrap_admin',
      {
        target_email: email,
      }
    );

    if (claimError) {
      throw claimError;
    }

    if (!claimGranted) {
      return asErrorState(
        'Initial registration is no longer available. Reload the page and try again.'
      );
    }

    claimReserved = true;

    const { error: createUserError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || undefined,
      },
    });

    if (createUserError) {
      await releaseBootstrapClaim(email);
      claimReserved = false;

      return asErrorState(
        createUserError.message.includes('already')
          ? 'That email address is already registered.'
          : createUserError.message
      );
    }

    revalidatePath('/auth/login');
    revalidatePath('/auth/sign-up');
    revalidatePath('/');
  } catch (error) {
    unstable_rethrow(error);

    if (claimReserved) {
      await releaseBootstrapClaim(email);
    }

    return asErrorState(
      error instanceof Error
        ? error.message
        : 'Unable to create the initial admin account right now.'
    );
  }

  redirect('/auth/login?notice=bootstrap-admin-created');
}
