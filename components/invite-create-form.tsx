'use client';

import { useActionState } from 'react';

import { createAccountInviteAction } from '@/lib/auth/invite-actions';
import type { AppRole, AuthActionState } from '@/lib/auth/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const INITIAL_STATE: AuthActionState = {
  status: 'idle',
};

function prettyRole(role: AppRole) {
  if (role === 'super_admin') {
    return 'Super Admin';
  }

  if (role === 'admin') {
    return 'Admin';
  }

  return 'Responder';
}

function fieldError(
  state: AuthActionState,
  name: 'email' | 'role' | 'expiresInDays'
) {
  return state.fieldErrors?.[name]?.[0];
}

export function InviteCreateForm({
  allowedRoles,
  className,
}: {
  allowedRoles: AppRole[];
  className?: string;
}) {
  const [state, action, pending] = useActionState(
    createAccountInviteAction,
    INITIAL_STATE
  );

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle>Create invite</CardTitle>
          <CardDescription>
            Provision responder access with single-use invite links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                placeholder="responder@example.com"
                required
              />
              {fieldError(state, 'email') ? (
                <p className="text-sm text-red-500">
                  {fieldError(state, 'email')}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invite-role">Role</Label>
              <select
                id="invite-role"
                name="role"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                defaultValue={allowedRoles[0]}
              >
                {allowedRoles.map((role) => (
                  <option key={role} value={role}>
                    {prettyRole(role)}
                  </option>
                ))}
              </select>
              {fieldError(state, 'role') ? (
                <p className="text-sm text-red-500">
                  {fieldError(state, 'role')}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invite-expiration">
                Expiration (days, optional)
              </Label>
              <Input
                id="invite-expiration"
                name="expiresInDays"
                type="number"
                min={1}
                max={30}
                placeholder="7"
              />
              {fieldError(state, 'expiresInDays') ? (
                <p className="text-sm text-red-500">
                  {fieldError(state, 'expiresInDays')}
                </p>
              ) : null}
            </div>

            {state.message ? (
              <p
                className={cn(
                  'text-sm',
                  state.status === 'success'
                    ? 'text-emerald-600'
                    : 'text-red-500'
                )}
              >
                {state.message}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Creating invite...' : 'Create invite'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {state.inviteUrl ? (
        <Card>
          <CardHeader>
            <CardTitle>Invite ready</CardTitle>
            <CardDescription>
              This link is single-use and bound to {state.inviteEmail}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-link">Secure invite link</Label>
              <Input id="invite-link" value={state.inviteUrl} readOnly />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href={state.inviteUrl}>Open invite</a>
              </Button>
              {state.inviteMailtoUrl ? (
                <Button asChild variant="outline">
                  <a href={state.inviteMailtoUrl}>Send by email</a>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
