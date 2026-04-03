'use client';

import { useActionState, useEffect, useState } from 'react';
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconSearch,
  IconShieldCog,
  IconUserCircle,
} from '@tabler/icons-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  changeManagedUserRoleAction,
  setManagedUserActivationAction,
} from '@/lib/auth/user-management-actions';
import type {
  AppRole,
  AuthActionState,
  ManagedStaffUser,
} from '@/lib/auth/types';

const INITIAL_STATE: AuthActionState = {
  status: 'idle',
};

function formatAppRole(role: AppRole) {
  if (role === 'super_admin') {
    return 'Super Admin';
  }

  if (role === 'admin') {
    return 'Admin';
  }

  return 'Responder';
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return 'Never';
  }

  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getStatusBadgeVariant(
  user: ManagedStaffUser
): 'secondary' | 'outline' {
  return user.status === 'active' ? 'secondary' : 'outline';
}

function getInitials(user: ManagedStaffUser) {
  const source = user.fullName?.trim() || user.email;
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function getRoleOptions(
  canManageAdmins: boolean
): Array<'admin' | 'responder'> {
  return canManageAdmins ? ['admin', 'responder'] : ['responder'];
}

function canManageUser(
  user: ManagedStaffUser,
  viewerId: string,
  canManageAdmins: boolean
) {
  if (user.id === viewerId) {
    return false;
  }

  if (user.primaryRole === 'super_admin') {
    return false;
  }

  if (canManageAdmins) {
    return true;
  }

  return user.primaryRole === 'responder';
}

function SearchField({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full max-w-sm">
      <IconSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search staff by name or email"
        className="pl-9"
      />
    </div>
  );
}

function UserDetailSheet({
  user,
  open,
  onOpenChange,
  viewerId,
  canManageAdmins,
}: {
  user: ManagedStaffUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewerId: string;
  canManageAdmins: boolean;
}) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'responder'>(
    'responder'
  );
  const [roleState, roleAction, rolePending] = useActionState(
    changeManagedUserRoleAction,
    INITIAL_STATE
  );
  const [statusState, statusAction, statusPending] = useActionState(
    setManagedUserActivationAction,
    INITIAL_STATE
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    setSelectedRole(user.primaryRole === 'admin' ? 'admin' : 'responder');
  }, [user]);

  if (!user) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Staff details</SheetTitle>
            <SheetDescription>
              Select a user to review access details.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const manageable = canManageUser(user, viewerId, canManageAdmins);
  const roleOptions = getRoleOptions(canManageAdmins);
  const roleSelectDisabled =
    !manageable || (user.primaryRole === 'admin' && !canManageAdmins);
  const metadataPreview = {
    user_metadata: user.userMetadata,
    app_metadata: user.appMetadata,
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{user.fullName ?? user.email}</SheetTitle>
          <SheetDescription>
            Review account metadata, adjust the assigned role, and control
            sign-in access.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
          <Card>
            <CardHeader className="gap-4">
              <div className="flex items-start gap-4">
                <Avatar className="size-12">
                  <AvatarFallback>{getInitials(user)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl">
                      {user.fullName ?? 'Unnamed account'}
                    </CardTitle>
                    <Badge variant="outline">
                      {formatAppRole(user.primaryRole)}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(user)}>
                      {user.status === 'active' ? 'Active' : 'Deactivated'}
                    </Badge>
                  </div>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Created
                </div>
                <div className="mt-1 text-sm">
                  {formatTimestamp(user.createdAt)}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Last sign-in
                </div>
                <div className="mt-1 text-sm">
                  {formatTimestamp(user.lastSignInAt)}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email confirmed
                </div>
                <div className="mt-1 text-sm">
                  {user.emailConfirmedAt
                    ? formatTimestamp(user.emailConfirmedAt)
                    : 'Not confirmed'}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Invite created
                </div>
                <div className="mt-1 text-sm">
                  {formatTimestamp(user.invitedAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Access control</CardTitle>
              <CardDescription>
                {manageable
                  ? 'Change the role assignment or block this account from signing in.'
                  : 'This account is read-only for your current permissions.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <form action={roleAction} className="flex flex-col gap-4">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="role" value={selectedRole} />

                <FieldGroup>
                  <Field data-disabled={roleSelectDisabled || undefined}>
                    <FieldLabel htmlFor="managed-user-role">Role</FieldLabel>
                    <Select
                      value={selectedRole}
                      onValueChange={(value) =>
                        setSelectedRole(value as 'admin' | 'responder')
                      }
                      disabled={roleSelectDisabled}
                    >
                      <SelectTrigger id="managed-user-role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {formatAppRole(role)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Admins can only keep responders at responder level. Super
                      admins can assign admin or responder.
                    </FieldDescription>
                    <FieldError>
                      {roleState.status === 'error'
                        ? roleState.message
                        : undefined}
                    </FieldError>
                  </Field>
                </FieldGroup>

                <Button
                  type="submit"
                  variant="outline"
                  disabled={rolePending || roleSelectDisabled}
                >
                  <IconShieldCog data-icon="inline-start" />
                  {rolePending ? 'Saving role...' : 'Save role'}
                </Button>
                {roleState.status === 'success' && roleState.message ? (
                  <p className="text-sm text-emerald-600">
                    {roleState.message}
                  </p>
                ) : null}
              </form>

              <form action={statusAction} className="flex flex-col gap-4">
                <input type="hidden" name="userId" value={user.id} />
                <input
                  type="hidden"
                  name="nextStatus"
                  value={user.status === 'active' ? 'deactivate' : 'activate'}
                />
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">
                        {user.status === 'active'
                          ? 'Deactivate account'
                          : 'Reactivate account'}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.status === 'active'
                          ? 'Blocked users keep their profile and role assignment but cannot sign in.'
                          : 'Restore sign-in access without changing the assigned role.'}
                      </p>
                    </div>
                    <Button
                      type="submit"
                      variant={
                        user.status === 'active' ? 'destructive' : 'default'
                      }
                      disabled={statusPending || !manageable}
                    >
                      {user.status === 'active' ? (
                        <IconPlayerPause data-icon="inline-start" />
                      ) : (
                        <IconPlayerPlay data-icon="inline-start" />
                      )}
                      {statusPending
                        ? user.status === 'active'
                          ? 'Deactivating...'
                          : 'Reactivating...'
                        : user.status === 'active'
                          ? 'Deactivate'
                          : 'Reactivate'}
                    </Button>
                  </div>
                </div>
                {statusState.message ? (
                  <p
                    className={
                      statusState.status === 'success'
                        ? 'text-sm text-emerald-600'
                        : 'text-sm text-destructive'
                    }
                  >
                    {statusState.message}
                  </p>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
              <CardDescription>
                Raw auth metadata from Supabase for debugging and audit context.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                {JSON.stringify(metadataPreview, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function StaffDirectory({
  users,
  viewerId,
  canManageAdmins,
}: {
  users: ManagedStaffUser[];
  viewerId: string;
  canManageAdmins: boolean;
}) {
  const [query, setQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredUsers = normalizedQuery
    ? users.filter((user) => {
        const haystack = `${user.fullName ?? ''} ${user.email} ${formatAppRole(
          user.primaryRole
        )}`.toLowerCase();

        return haystack.includes(normalizedQuery);
      })
    : users;

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;

  return (
    <>
      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Staff directory</CardTitle>
            <CardDescription>
              Review every admin and responder account provisioned in the
              control center.
            </CardDescription>
          </div>
          <SearchField query={query} onQueryChange={setQuery} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last sign-in</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const manageable = canManageUser(
                    user,
                    viewerId,
                    canManageAdmins
                  );

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarFallback>{getInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-col gap-1">
                            <span className="truncate font-medium">
                              {user.fullName ?? 'Unnamed account'}
                            </span>
                            <span className="truncate text-sm text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatAppRole(user.primaryRole)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user)}>
                          {user.status === 'active' ? 'Active' : 'Deactivated'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatTimestamp(user.createdAt)}</TableCell>
                      <TableCell>
                        {formatTimestamp(user.lastSignInAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          {manageable ? 'Manage' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <IconUserCircle className="text-muted-foreground" />
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">
                          No matching staff accounts
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try a different search term or create a new invite in
                          the Invites tab.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserDetailSheet
        key={selectedUser?.id ?? 'empty'}
        user={selectedUser}
        open={selectedUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUserId(null);
          }
        }}
        viewerId={viewerId}
        canManageAdmins={canManageAdmins}
      />
    </>
  );
}
