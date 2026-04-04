'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';

import { createAdminClient } from '@/lib/supabase/admin';

import { asErrorState, INITIAL_AUTH_ACTION_STATE } from './action-helpers';
import { getManagedStaffUserById } from './admin-panel';
import { requireRole, userHasRole } from './dal';
import {
  changeManagedUserRoleSchema,
  setManagedUserActivationSchema,
} from './schemas';
import type { AuthActionState, ManagedStaffUser } from './types';

const DEACTIVATION_BAN_DURATION = '876000h';

function canManageTarget(
  actor: Awaited<ReturnType<typeof requireRole>>,
  target: ManagedStaffUser
) {
  if (actor.id === target.id) {
    return false;
  }

  if (target.primaryRole === 'super_admin') {
    return false;
  }

  if (userHasRole(actor, 'super_admin')) {
    return true;
  }

  return target.primaryRole === 'responder';
}

export async function changeManagedUserRoleAction(
  previousState: AuthActionState = INITIAL_AUTH_ACTION_STATE,
  formData: FormData
): Promise<AuthActionState> {
  void previousState;

  const actor = await requireRole(['admin', 'super_admin']);
  const validatedFields = changeManagedUserRoleSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return asErrorState(
      'The selected role change could not be processed.',
      validatedFields.error.flatten().fieldErrors
    );
  }

  const { userId, role } = validatedFields.data;

  if (!userHasRole(actor, 'super_admin') && role !== 'responder') {
    return asErrorState('Only super admins can assign the admin role.');
  }

  try {
    const target = await getManagedStaffUserById(userId);

    if (!target) {
      return asErrorState('The selected user could not be found.');
    }

    if (!canManageTarget(actor, target)) {
      return asErrorState('You are not allowed to change this user’s role.');
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.rpc('set_staff_role', {
      target_user_id: userId,
      target_role: role,
    });

    if (error) {
      throw error;
    }

    revalidatePath('/control-center/admin-panel');

    return {
      status: 'success',
      message: `Updated ${target.email} to ${role.replace('_', ' ')}.`,
    };
  } catch (error) {
    unstable_rethrow(error);

    return asErrorState(
      error instanceof Error
        ? error.message
        : 'Unable to update this user’s role.'
    );
  }
}

export async function setManagedUserActivationAction(
  previousState: AuthActionState = INITIAL_AUTH_ACTION_STATE,
  formData: FormData
): Promise<AuthActionState> {
  void previousState;

  const actor = await requireRole(['admin', 'super_admin']);
  const validatedFields = setManagedUserActivationSchema.safeParse({
    userId: formData.get('userId'),
    nextStatus: formData.get('nextStatus'),
  });

  if (!validatedFields.success) {
    return asErrorState(
      'The selected status change could not be processed.',
      validatedFields.error.flatten().fieldErrors
    );
  }

  const { userId, nextStatus } = validatedFields.data;

  try {
    const target = await getManagedStaffUserById(userId);

    if (!target) {
      return asErrorState('The selected user could not be found.');
    }

    if (!canManageTarget(actor, target)) {
      return asErrorState('You are not allowed to change this user’s status.');
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration:
        nextStatus === 'deactivate' ? DEACTIVATION_BAN_DURATION : 'none',
    });

    if (error) {
      throw error;
    }

    revalidatePath('/control-center/admin-panel');

    return {
      status: 'success',
      message:
        nextStatus === 'deactivate'
          ? `Deactivated ${target.email}.`
          : `Reactivated ${target.email}.`,
    };
  } catch (error) {
    unstable_rethrow(error);

    return asErrorState(
      error instanceof Error
        ? error.message
        : 'Unable to update this user’s status.'
    );
  }
}
