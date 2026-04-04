'use client';

import { useActionState, useEffect, useState } from 'react';

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
  const [selectedRole, setSelectedRole] = useState<AppRole>(allowedRoles[0]);
  const [state, action, pending] = useActionState(
    createAccountInviteAction,
    INITIAL_STATE
  );

  useEffect(() => {
    setSelectedRole(allowedRoles[0]);
  }, [allowedRoles]);

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
            <input type="hidden" name="role" value={selectedRole} />

            <FieldGroup>
              <Field
                data-invalid={Boolean(fieldError(state, 'email')) || undefined}
              >
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  placeholder="responder@example.com"
                  required
                  aria-invalid={
                    Boolean(fieldError(state, 'email')) || undefined
                  }
                />
                <FieldDescription>
                  Invite links are single-use and bound to this email address.
                </FieldDescription>
                <FieldError>{fieldError(state, 'email')}</FieldError>
              </Field>

              <Field
                data-invalid={Boolean(fieldError(state, 'role')) || undefined}
              >
                <FieldLabel htmlFor="invite-role">Role</FieldLabel>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as AppRole)}
                >
                  <SelectTrigger
                    id="invite-role"
                    aria-invalid={
                      Boolean(fieldError(state, 'role')) || undefined
                    }
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {allowedRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {prettyRole(role)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Responders can manage incidents. Admins can also access this
                  panel.
                </FieldDescription>
                <FieldError>{fieldError(state, 'role')}</FieldError>
              </Field>

              <Field
                data-invalid={
                  Boolean(fieldError(state, 'expiresInDays')) || undefined
                }
              >
                <FieldLabel htmlFor="invite-expiration">
                  Expiration (days, optional)
                </FieldLabel>
                <Input
                  id="invite-expiration"
                  name="expiresInDays"
                  type="number"
                  min={1}
                  max={30}
                  placeholder="7"
                  aria-invalid={
                    Boolean(fieldError(state, 'expiresInDays')) || undefined
                  }
                />
                <FieldDescription>
                  Leave blank to keep the invite valid until it is accepted or
                  revoked.
                </FieldDescription>
                <FieldError>{fieldError(state, 'expiresInDays')}</FieldError>
              </Field>
            </FieldGroup>

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
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="invite-link">
                  Secure invite link
                </FieldLabel>
                <Input id="invite-link" value={state.inviteUrl} readOnly />
              </Field>
            </FieldGroup>
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
