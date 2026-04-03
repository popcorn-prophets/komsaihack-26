'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';

import {
  asErrorState,
  buildInviteDelivery,
  buildInviteExpiresAt,
  deriveReissueExpiresAt,
  emailBelongsToExistingUser,
  INITIAL_AUTH_ACTION_STATE,
  inviteRoleAllowed,
  releaseInviteClaim,
} from './action-helpers';
import { requireRole, userHasRole } from './dal';
import {
  acceptInviteSchema,
  createInviteSchema,
  reissueInviteSchema,
} from './schemas';
import type { AuthActionState } from './types';
import { createInviteToken, hashInviteToken, normalizeEmail } from './utils';

export async function createAccountInviteAction(
  previousState: AuthActionState = INITIAL_AUTH_ACTION_STATE,
  formData: FormData
): Promise<AuthActionState> {
  void previousState;

  const inviter = await requireRole(['admin', 'super_admin']);
  const canInviteAdmins = userHasRole(inviter, 'super_admin');

  const validatedFields = createInviteSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
    expiresInDays: formData.get('expiresInDays'),
  });

  if (!validatedFields.success) {
    return asErrorState(
      'Review the highlighted fields and try again.',
      validatedFields.error.flatten().fieldErrors
    );
  }

  const { email, role, expiresInDays } = validatedFields.data;

  if (!inviteRoleAllowed(role, canInviteAdmins)) {
    return asErrorState('You are not allowed to create invites for that role.');
  }

  const adminClient = createAdminClient();
  const sessionClient = await createClient();
  const token = createInviteToken();
  const tokenHash = hashInviteToken(token);
  const now = new Date();
  const expiresAt = buildInviteExpiresAt(expiresInDays);

  try {
    if (await emailBelongsToExistingUser(adminClient, email)) {
      return asErrorState('That email address already belongs to an account.');
    }

    await adminClient
      .from('account_invites')
      .update({
        revoked_at: now.toISOString(),
      })
      .eq('email', email)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .lt('expires_at', now.toISOString());

    const { error: insertError } = await sessionClient
      .from('account_invites')
      .insert({
        email,
        role,
        invited_by: inviter.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (insertError) {
      if (insertError.message.includes('account_invites_active_email_idx')) {
        return asErrorState(
          'There is already a pending invite for that email address.'
        );
      }

      throw insertError;
    }
  } catch (error) {
    unstable_rethrow(error);

    return asErrorState(
      error instanceof Error ? error.message : 'Unable to create invite.'
    );
  }

  revalidatePath('/admin/invites');

  return {
    status: 'success',
    message: 'Invite created. Share the link directly or send it by email.',
    ...buildInviteDelivery(email, token),
    inviteRole: role,
  };
}

export async function reissueAccountInviteAction(
  previousState: AuthActionState = INITIAL_AUTH_ACTION_STATE,
  formData: FormData
): Promise<AuthActionState> {
  void previousState;

  const inviter = await requireRole(['admin', 'super_admin']);
  const canInviteAdmins = userHasRole(inviter, 'super_admin');

  const validatedFields = reissueInviteSchema.safeParse({
    inviteId: formData.get('inviteId'),
  });

  if (!validatedFields.success) {
    return asErrorState(
      'The selected invite could not be reissued.',
      validatedFields.error.flatten().fieldErrors
    );
  }

  const { inviteId } = validatedFields.data;
  const adminClient = createAdminClient();
  const sessionClient = await createClient();

  try {
    const { data: invite, error: inviteError } = await sessionClient
      .from('account_invites')
      .select(
        'id, email, role, invited_by, created_at, expires_at, accepted_at, revoked_at'
      )
      .eq('id', inviteId)
      .maybeSingle();

    if (inviteError) {
      throw inviteError;
    }

    if (!invite) {
      return asErrorState('Invite not found.');
    }

    if (invite.accepted_at) {
      return asErrorState('Accepted invites cannot be reissued.');
    }

    if (!inviteRoleAllowed(invite.role, canInviteAdmins)) {
      return asErrorState(
        'You are not allowed to reissue invites for that role.'
      );
    }

    if (!canInviteAdmins && invite.invited_by !== inviter.id) {
      return asErrorState('You can only reissue your own responder invites.');
    }

    if (await emailBelongsToExistingUser(adminClient, invite.email)) {
      return asErrorState('That email address already belongs to an account.');
    }

    const token = createInviteToken();
    const tokenHash = hashInviteToken(token);
    const expiresAt = deriveReissueExpiresAt(
      invite.created_at,
      invite.expires_at
    );

    const { data: deletedInvite, error: deleteError } = await sessionClient
      .from('account_invites')
      .delete()
      .eq('id', invite.id)
      .select('id')
      .maybeSingle();

    if (deleteError) {
      throw deleteError;
    }

    if (!deletedInvite) {
      return asErrorState(
        'This invite could not be reissued. It may have changed since the page loaded.'
      );
    }

    const { error: insertError } = await sessionClient
      .from('account_invites')
      .insert({
        email: invite.email,
        role: invite.role,
        invited_by: inviter.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (insertError) {
      throw insertError;
    }

    revalidatePath('/admin/invites');

    return {
      status: 'success',
      message: 'Invite reissued. Share the fresh link with the recipient.',
      ...buildInviteDelivery(invite.email, token),
      inviteRole: invite.role,
    };
  } catch (error) {
    unstable_rethrow(error);

    return asErrorState(
      error instanceof Error ? error.message : 'Unable to reissue invite.'
    );
  }
}

export async function acceptAccountInviteAction(
  previousState: AuthActionState = INITIAL_AUTH_ACTION_STATE,
  formData: FormData
): Promise<AuthActionState> {
  void previousState;

  const validatedFields = acceptInviteSchema.safeParse({
    token: formData.get('token'),
    fullName: formData.get('fullName'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return asErrorState(
      'Review the highlighted fields and try again.',
      validatedFields.error.flatten().fieldErrors
    );
  }

  const { token, fullName, password } = validatedFields.data;
  const tokenHash = hashInviteToken(token);
  const adminClient = createAdminClient();

  let createdUserId: string | null = null;

  try {
    const { data: claimRows, error: claimError } = await adminClient.rpc(
      'claim_account_invite',
      {
        target_token_hash: tokenHash,
      }
    );

    if (claimError) {
      throw claimError;
    }

    const claimedInvite = Array.isArray(claimRows) ? claimRows[0] : null;

    if (!claimedInvite) {
      return asErrorState(
        'This invite is invalid, expired, or has already been used.'
      );
    }

    if (
      await emailBelongsToExistingUser(
        adminClient,
        normalizeEmail(claimedInvite.email)
      )
    ) {
      await releaseInviteClaim(tokenHash);

      return asErrorState(
        'That invite email already belongs to an existing account.'
      );
    }

    const { data: createdUser, error: createUserError } =
      await adminClient.auth.admin.createUser({
        email: claimedInvite.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || undefined,
        },
      });

    if (createUserError || !createdUser.user) {
      await releaseInviteClaim(tokenHash);

      return asErrorState(
        createUserError?.message ?? 'Unable to create your account.'
      );
    }

    createdUserId = createdUser.user.id;

    const { data: completionRows, error: completionError } =
      await adminClient.rpc('complete_account_invite', {
        target_token_hash: tokenHash,
        target_user_id: createdUserId,
      });

    if (completionError) {
      throw completionError;
    }

    if (!Array.isArray(completionRows) || completionRows.length === 0) {
      throw new Error('Invite completion failed.');
    }

    revalidatePath('/admin/invites');
    revalidatePath('/auth/login');
  } catch (error) {
    unstable_rethrow(error);

    if (createdUserId) {
      await adminClient.auth.admin.deleteUser(createdUserId);
    }

    await releaseInviteClaim(tokenHash);

    return asErrorState(
      error instanceof Error ? error.message : 'Unable to accept this invite.'
    );
  }

  redirect('/auth/login?notice=invite-accepted');
}
