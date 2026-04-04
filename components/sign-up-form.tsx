'use client';

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
import { createBootstrapAdminAction } from '@/lib/auth/bootstrap-actions';
import type { AuthActionState } from '@/lib/auth/types';
import { cn } from '@/lib/utils';
import { useActionState } from 'react';

const INITIAL_STATE: AuthActionState = {
  status: 'idle',
};

function fieldError(
  state: AuthActionState,
  name: 'fullName' | 'email' | 'password' | 'confirmPassword'
) {
  return state.fieldErrors?.[name]?.[0];
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [state, action, pending] = useActionState(
    createBootstrapAdminAction,
    INITIAL_STATE
  );

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create the first admin</CardTitle>
          <CardDescription>
            This bootstrap form works only until the first account is created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Alex Reyes"
                />
                {fieldError(state, 'fullName') ? (
                  <p className="text-sm text-red-500">
                    {fieldError(state, 'fullName')}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                {fieldError(state, 'email') ? (
                  <p className="text-sm text-red-500">
                    {fieldError(state, 'email')}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" name="password" type="password" required />
                {fieldError(state, 'password') ? (
                  <p className="text-sm text-red-500">
                    {fieldError(state, 'password')}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="confirmPassword">Repeat password</Label>
                </div>
                <Input
                  id="confirmPassword"
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
                {pending ? 'Creating admin account...' : 'Create admin account'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
