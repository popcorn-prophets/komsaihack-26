'use client';

import { useActionState } from 'react';

import { acceptAccountInviteAction } from '@/lib/auth/invite-actions';
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
  name: 'fullName' | 'password' | 'confirmPassword'
) {
  return state.fieldErrors?.[name]?.[0];
}

export function InviteAcceptForm({
  token,
  email,
  role,
}: {
  token: string;
  email: string;
  role: AppRole;
}) {
  const [state, action, pending] = useActionState(
    acceptAccountInviteAction,
    INITIAL_STATE
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Accept invite</CardTitle>
          <CardDescription>
            Finish setting up your {prettyRole(role).toLowerCase()} account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-6">
            <input type="hidden" name="token" value={token} />

            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={email} readOnly />
            </div>

            <div className="grid gap-2">
              <Label>Assigned role</Label>
              <Input value={prettyRole(role)} readOnly />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invite-full-name">Full name</Label>
              <Input
                id="invite-full-name"
                name="fullName"
                type="text"
                placeholder="Maria Santos"
              />
              {fieldError(state, 'fullName') ? (
                <p className="text-sm text-red-500">
                  {fieldError(state, 'fullName')}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invite-password">Password</Label>
              <Input
                id="invite-password"
                name="password"
                type="password"
                required
              />
              {fieldError(state, 'password') ? (
                <p className="text-sm text-red-500">
                  {fieldError(state, 'password')}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invite-confirm-password">Repeat password</Label>
              <Input
                id="invite-confirm-password"
                name="confirmPassword"
                type="password"
                required
              />
              {fieldError(state, 'confirmPassword') ? (
                <p className="text-sm text-red-500">
                  {fieldError(state, 'confirmPassword')}
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
              {pending ? 'Creating account...' : 'Complete account setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
