'use client';

import { IconMailPlus, IconShieldCog, IconUsers } from '@tabler/icons-react';

import { InviteCreateForm } from '@/components/invite-create-form';
import { InviteList } from '@/components/invite-list';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AppRole, InviteRecord, ManagedStaffUser } from '@/lib/auth/types';

import { StaffDirectory } from './staff-directory';

export function AdminPanel({
  users,
  invites,
  initialTab,
  allowedInviteRoles,
  viewerId,
  canManageAdmins,
}: {
  users: ManagedStaffUser[];
  invites: InviteRecord[];
  initialTab: 'users' | 'invites';
  allowedInviteRoles: AppRole[];
  viewerId: string;
  canManageAdmins: boolean;
}) {
  return (
    <Tabs defaultValue={initialTab} className="gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="gap-1">
            <IconShieldCog />
            Admin only
          </Badge>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              Admin Panel
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Manage staff accounts, invite new responders, and control access
              inside the control center.
            </p>
          </div>
        </div>

        <TabsList variant="line">
          <TabsTrigger value="users">
            <IconUsers data-icon="inline-start" />
            Users
          </TabsTrigger>
          <TabsTrigger value="invites">
            <IconMailPlus data-icon="inline-start" />
            Invites
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="users">
        <StaffDirectory
          users={users}
          viewerId={viewerId}
          canManageAdmins={canManageAdmins}
        />
      </TabsContent>

      <TabsContent value="invites">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <InviteCreateForm allowedRoles={allowedInviteRoles} />
          <InviteList invites={invites} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
