import 'server-only';

import { cache } from 'react';

import { createAdminClient } from '@/lib/supabase/admin';

import type {
  AppRole,
  InviteRecord,
  ManagedStaffUser,
  ManagedUserStatus,
} from './types';

const ROLE_ORDER: Record<AppRole, number> = {
  super_admin: 0,
  admin: 1,
  responder: 2,
};

type AdminListUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  last_sign_in_at?: string | null;
  invited_at?: string | null;
  email_confirmed_at?: string | null;
  banned_until?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
};

type AdminRoleAssignmentRow = {
  user_id: string;
  role: string;
  scope_type: string;
  scope_id: string | null;
};

type AdminRoleSummaryRow = Pick<
  AdminRoleAssignmentRow,
  'role' | 'scope_type' | 'scope_id'
>;

function isAppRole(value: string): value is AppRole {
  return value === 'super_admin' || value === 'admin' || value === 'responder';
}

function derivePrimaryRole(roles: AppRole[]) {
  return [...roles].sort(
    (left, right) => ROLE_ORDER[left] - ROLE_ORDER[right]
  )[0];
}

function deriveManagedUserStatus(
  bannedUntil: string | null | undefined
): ManagedUserStatus {
  if (!bannedUntil) {
    return 'active';
  }

  return new Date(bannedUntil).getTime() > Date.now()
    ? 'deactivated'
    : 'active';
}

function sortManagedUsers(left: ManagedStaffUser, right: ManagedStaffUser) {
  const roleDifference =
    ROLE_ORDER[left.primaryRole] - ROLE_ORDER[right.primaryRole];

  if (roleDifference !== 0) {
    return roleDifference;
  }

  if (left.status !== right.status) {
    return left.status === 'active' ? -1 : 1;
  }

  const leftLabel = (left.fullName ?? left.email).toLowerCase();
  const rightLabel = (right.fullName ?? right.email).toLowerCase();

  return leftLabel.localeCompare(rightLabel);
}

function collectRoles(
  assignments: AdminRoleSummaryRow[] | null | undefined
): AppRole[] {
  const roles: AppRole[] = [];

  for (const assignment of assignments ?? []) {
    if (
      assignment.scope_type === 'global' &&
      isAppRole(assignment.role) &&
      !roles.includes(assignment.role)
    ) {
      roles.push(assignment.role);
    }
  }

  return roles.sort((left, right) => ROLE_ORDER[left] - ROLE_ORDER[right]);
}

function buildManagedStaffUser(
  user: AdminListUser,
  fullName: string | null,
  roles: AppRole[]
): ManagedStaffUser | null {
  const email = user.email?.trim().toLowerCase();
  const primaryRole = derivePrimaryRole(roles);

  if (!email || roles.length === 0 || !primaryRole) {
    return null;
  }

  return {
    id: user.id,
    email,
    fullName,
    roles,
    primaryRole,
    status: deriveManagedUserStatus(user.banned_until),
    createdAt: user.created_at ?? new Date(0).toISOString(),
    lastSignInAt: user.last_sign_in_at ?? null,
    invitedAt: user.invited_at ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    bannedUntil: user.banned_until ?? null,
    userMetadata: user.user_metadata ?? {},
    appMetadata: user.app_metadata ?? {},
  };
}

async function loadUsersContext() {
  const adminClient = createAdminClient();

  const [
    { data: authUsersPage, error: authUsersError },
    { data: profiles, error: profilesError },
    { data: roleAssignments, error: roleAssignmentsError },
  ] = await Promise.all([
    adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),
    adminClient.from('profiles').select('id, full_name'),
    adminClient
      .from('role_assignments')
      .select('user_id, role, scope_type, scope_id')
      .eq('scope_type', 'global'),
  ]);

  if (authUsersError) {
    throw authUsersError;
  }

  if (profilesError) {
    throw profilesError;
  }

  if (roleAssignmentsError) {
    throw roleAssignmentsError;
  }

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.full_name ?? null])
  );

  const rolesByUserId = new Map<string, AppRole[]>();

  for (const assignment of (roleAssignments ??
    []) as AdminRoleAssignmentRow[]) {
    const roles = rolesByUserId.get(assignment.user_id) ?? [];

    if (
      assignment.scope_type === 'global' &&
      isAppRole(assignment.role) &&
      !roles.includes(assignment.role)
    ) {
      roles.push(assignment.role);
      rolesByUserId.set(assignment.user_id, roles);
    }
  }

  return {
    authUsers: (authUsersPage?.users ?? []) as AdminListUser[],
    profilesById,
    rolesByUserId,
  };
}

async function loadStaffUsers(): Promise<ManagedStaffUser[]> {
  const { authUsers, profilesById, rolesByUserId } = await loadUsersContext();

  return authUsers
    .map((user) =>
      buildManagedStaffUser(
        user,
        profilesById.get(user.id) ?? null,
        rolesByUserId.get(user.id) ?? []
      )
    )
    .filter((user): user is ManagedStaffUser => Boolean(user))
    .sort(sortManagedUsers);
}

async function loadInviteRecords(): Promise<InviteRecord[]> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('account_invites')
    .select(
      'id, email, role, invited_by, created_at, expires_at, accepted_at, revoked_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as InviteRecord[];
}

async function loadAdminPanelData() {
  const [users, invites] = await Promise.all([
    loadStaffUsers(),
    loadInviteRecords(),
  ]);

  return {
    users,
    invites,
  };
}

export const getAdminPanelData = cache(loadAdminPanelData);

export async function getManagedStaffUserById(userId: string) {
  const adminClient = createAdminClient();

  const [
    { data: authUserResponse, error: authUserError },
    { data: profile, error: profileError },
    { data: roleAssignments, error: roleAssignmentsError },
  ] = await Promise.all([
    adminClient.auth.admin.getUserById(userId),
    adminClient
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle(),
    adminClient
      .from('role_assignments')
      .select('role, scope_type, scope_id')
      .eq('user_id', userId)
      .eq('scope_type', 'global'),
  ]);

  if (authUserError) {
    throw authUserError;
  }

  if (profileError) {
    throw profileError;
  }

  if (roleAssignmentsError) {
    throw roleAssignmentsError;
  }

  const user = authUserResponse?.user;

  if (!user) {
    return null;
  }

  const managedUser = buildManagedStaffUser(
    {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      invited_at: user.invited_at,
      email_confirmed_at: user.email_confirmed_at,
      banned_until: user.banned_until,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
    },
    profile?.full_name ?? null,
    collectRoles(roleAssignments as AdminRoleSummaryRow[])
  );

  return managedUser;
}
