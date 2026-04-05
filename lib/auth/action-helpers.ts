import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

import type { AppRole, AuthActionState } from './types';
import { getSiteUrl, normalizeEmail } from './utils';

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = {
  status: 'idle',
};

export function asErrorState(
  message: string,
  fieldErrors?: Record<string, string[] | undefined>
): AuthActionState {
  return {
    status: 'error',
    message,
    fieldErrors,
  };
}

export function describeActionError(
  error: unknown,
  fallbackMessage: string
): string {
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }

    const maybeStatus = (error as { status?: unknown }).status;
    if (typeof maybeStatus === 'number') {
      return `${fallbackMessage} (status ${maybeStatus})`;
    }
  }

  return fallbackMessage;
}

export function inviteRoleAllowed(role: AppRole, canInviteAdmins: boolean) {
  if (role === 'responder') {
    return true;
  }

  return canInviteAdmins && role === 'admin';
}

export async function emailBelongsToExistingUser(
  adminClient: ReturnType<typeof createAdminClient>,
  email: string
) {
  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  return data.users.some((user) => normalizeEmail(user.email ?? '') === email);
}

export function buildInviteExpiresAt(expiresInDays?: number) {
  if (!expiresInDays) {
    return null;
  }

  return new Date(
    Date.now() + expiresInDays * 24 * 60 * 60 * 1000
  ).toISOString();
}

export function deriveReissueExpiresAt(
  createdAt: string,
  expiresAt: string | null
) {
  if (!expiresAt) {
    return null;
  }

  const createdAtMs = new Date(createdAt).getTime();
  const expiresAtMs = new Date(expiresAt).getTime();
  const durationMs = expiresAtMs - createdAtMs;

  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return buildInviteExpiresAt(7);
  }

  const durationDays = Math.max(
    1,
    Math.min(30, Math.round(durationMs / (24 * 60 * 60 * 1000)))
  );

  return buildInviteExpiresAt(durationDays);
}

export function buildInviteDelivery(
  email: string,
  token: string
): Pick<AuthActionState, 'inviteUrl' | 'inviteMailtoUrl' | 'inviteEmail'> {
  const inviteUrl = `${getSiteUrl()}/auth/invite?token=${encodeURIComponent(
    token
  )}`;
  const mailBody = encodeURIComponent(
    `You have been invited to Project HERMES.\n\nOpen this link to finish your account setup:\n${inviteUrl}`
  );

  return {
    inviteUrl,
    inviteMailtoUrl: `mailto:${encodeURIComponent(
      email
    )}?subject=Project%20HERMES%20Invite&body=${mailBody}`,
    inviteEmail: email,
  };
}

export async function releaseBootstrapClaim(email: string) {
  const supabase = await createClient();

  await supabase.rpc('release_bootstrap_admin_claim', {
    target_email: email,
  });
}

export async function releaseInviteClaim(tokenHash: string) {
  const adminClient = createAdminClient();

  await adminClient.rpc('release_account_invite_claim', {
    target_token_hash: tokenHash,
  });
}
