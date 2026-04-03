export const APP_ROLES = ['super_admin', 'admin', 'responder'] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type RoleAssignment = {
  role: AppRole;
  scope_type: string;
  scope_id: string | null;
};

export type AuthUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  roles: RoleAssignment[];
};

export type AuthActionState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  inviteUrl?: string;
  inviteMailtoUrl?: string;
  inviteEmail?: string;
  inviteRole?: AppRole;
};

export type InvitePreviewStatus =
  | 'valid'
  | 'invalid'
  | 'expired'
  | 'accepted'
  | 'revoked';

export type InvitePreview = {
  status: InvitePreviewStatus;
  email?: string;
  role?: AppRole;
  expiresAt?: string | null;
};

export type InviteRecord = {
  id: string;
  email: string;
  role: AppRole;
  invited_by: string;
  created_at: string;
  expires_at: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
};
