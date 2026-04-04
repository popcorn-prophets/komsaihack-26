import { connection } from 'next/server';

import { AdminPanel } from '@/components/control-center/admin-panel';
import { AdminSummaryCards } from '@/components/control-center/admin-summary-cards';
import { getAdminPanelData } from '@/lib/auth/admin-panel';
import { requireRole, userHasRole } from '@/lib/auth/dal';
import type { AppRole } from '@/lib/auth/types';

type TeamPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

function isPendingInvite(invite: {
  accepted_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
}) {
  if (invite.accepted_at || invite.revoked_at) {
    return false;
  }

  if (
    invite.expires_at &&
    new Date(invite.expires_at).getTime() <= Date.now()
  ) {
    return false;
  }

  return true;
}

export default async function Page({ searchParams }: TeamPageProps) {
  await connection();

  const { tab } = await searchParams;
  const viewer = await requireRole(['admin', 'super_admin']);
  const { users, invites } = await getAdminPanelData();

  const canManageAdmins = userHasRole(viewer, 'super_admin');
  const allowedInviteRoles: AppRole[] = canManageAdmins
    ? ['admin', 'responder']
    : ['responder'];
  const activeStaffCount = users.filter(
    (user) => user.status === 'active'
  ).length;
  const privilegedStaffCount = users.filter(
    (user) => user.primaryRole === 'super_admin' || user.primaryRole === 'admin'
  ).length;
  const responderCount = users.filter(
    (user) => user.primaryRole === 'responder'
  ).length;
  const pendingInviteCount = invites.filter(isPendingInvite).length;
  const initialTab = tab === 'invites' ? 'invites' : 'users';

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
      <AdminSummaryCards
        activeStaffCount={activeStaffCount}
        privilegedStaffCount={privilegedStaffCount}
        responderCount={responderCount}
        pendingInviteCount={pendingInviteCount}
      />
      <AdminPanel
        users={users}
        invites={invites}
        initialTab={initialTab}
        allowedInviteRoles={allowedInviteRoles}
        viewerId={viewer.id}
        canManageAdmins={canManageAdmins}
      />
    </div>
  );
}
