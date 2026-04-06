'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { updateOwnProfileAction } from '@/lib/auth/settings-actions';
import type { AuthActionState } from '@/lib/auth/types';
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

const INITIAL_STATE: AuthActionState = {
  status: 'idle',
};

function fieldError(state: AuthActionState, name: 'fullName') {
  return state.fieldErrors?.[name]?.[0];
}

export function ProfileSettingsForm({
  initialFullName,
}: {
  initialFullName: string | null;
}) {
  const router = useRouter();
  const pendingRef = useRef(false);
  const [state, action, pending] = useActionState(
    updateOwnProfileAction,
    INITIAL_STATE
  );

  useEffect(() => {
    if (pendingRef.current && !pending && state.status === 'success') {
      router.refresh();
    }

    pendingRef.current = pending;
  }, [pending, router, state.status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update the display name shown across the control center.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-6">
          <FieldGroup>
            <Field
              data-invalid={Boolean(fieldError(state, 'fullName')) || undefined}
            >
              <FieldLabel htmlFor="settings-full-name">Full name</FieldLabel>
              <Input
                id="settings-full-name"
                name="fullName"
                type="text"
                placeholder="Alex Reyes"
                defaultValue={initialFullName ?? ''}
                aria-invalid={
                  Boolean(fieldError(state, 'fullName')) || undefined
                }
              />
              <FieldDescription>
                Leave this blank if you prefer to use your email as the fallback
                label.
              </FieldDescription>
              <FieldError>{fieldError(state, 'fullName')}</FieldError>
            </Field>
          </FieldGroup>

          {state.message ? (
            <p
              className={cn(
                'text-sm',
                state.status === 'success'
                  ? 'text-emerald-600'
                  : 'text-destructive'
              )}
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
