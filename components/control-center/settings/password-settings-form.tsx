'use client';

import { useState } from 'react';
import Link from 'next/link';

import { passwordSchema } from '@/lib/auth/schemas';
import { createClient } from '@/lib/supabase/client';
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

type InlineMessage = {
  status: 'success' | 'error';
  text: string;
};

export function PasswordSettingsForm({ email }: { email: string | null }) {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<InlineMessage | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setOldPasswordError(null);
    setPasswordErrors([]);
    setConfirmError(null);

    const normalizedOldPassword = oldPassword.trim();

    if (!normalizedOldPassword) {
      setOldPasswordError('Enter your current password.');
      return;
    }

    const validatedPassword = passwordSchema.safeParse(password);

    if (!validatedPassword.success) {
      setPasswordErrors(
        validatedPassword.error.issues.map((issue) => issue.message)
      );
      return;
    }

    const nextPassword = validatedPassword.data;
    const normalizedConfirmation = confirmPassword.trim();

    if (nextPassword !== normalizedConfirmation) {
      setConfirmError('Passwords do not match.');
      return;
    }

    if (!email) {
      setMessage({
        status: 'error',
        text: 'No account email is available for password verification.',
      });
      return;
    }

    const supabase = createClient();
    setPending(true);

    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: normalizedOldPassword,
      });

      if (verifyError) {
        setOldPasswordError('Old password is incorrect.');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: nextPassword,
      });

      if (error) {
        throw error;
      }

      setOldPassword('');
      setPassword('');
      setConfirmPassword('');
      setMessage({
        status: 'success',
        text: 'Password updated.',
      });
    } catch (error) {
      setMessage({
        status: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Unable to update your password right now.',
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Change your password here or use the email reset flow from login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field data-invalid={Boolean(oldPasswordError) || undefined}>
              <FieldLabel htmlFor="settings-old-password">
                Old password
              </FieldLabel>
              <Input
                id="settings-old-password"
                type="password"
                autoComplete="current-password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                aria-invalid={Boolean(oldPasswordError) || undefined}
              />
              <FieldError>{oldPasswordError}</FieldError>
            </Field>

            <Field data-invalid={passwordErrors.length > 0 || undefined}>
              <FieldLabel htmlFor="settings-password">New password</FieldLabel>
              <Input
                id="settings-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={passwordErrors.length > 0 || undefined}
              />
              <FieldDescription>
                Use at least 8 characters with at least one letter and one
                number.
              </FieldDescription>
              <FieldError
                errors={passwordErrors.map((entry) => ({ message: entry }))}
              />
            </Field>

            <Field data-invalid={Boolean(confirmError) || undefined}>
              <FieldLabel htmlFor="settings-confirm-password">
                Confirm new password
              </FieldLabel>
              <Input
                id="settings-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={Boolean(confirmError) || undefined}
              />
              <FieldError>{confirmError}</FieldError>
            </Field>
          </FieldGroup>

          {message ? (
            <p
              className={cn(
                'text-sm',
                message.status === 'success'
                  ? 'text-emerald-600'
                  : 'text-destructive'
              )}
            >
              {message.text}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Reset password by email
            </Link>
            <Button type="submit" disabled={pending}>
              {pending ? 'Updating...' : 'Update password'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
