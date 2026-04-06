import { getCurrentUser, isBootstrapRegistrationOpen } from '@/lib/auth/dal';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { LogoutButton } from './logout-button';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

type AuthButtonProps = {
  className?: string;
  fullWidth?: boolean;
  size?: ComponentProps<typeof Button>['size'];
};

export async function AuthButton({
  className,
  fullWidth = false,
  size = 'sm',
}: AuthButtonProps = {}) {
  const [user, bootstrapOpen] = await Promise.all([
    getCurrentUser(),
    isBootstrapRegistrationOpen(),
  ]);

  return user ? (
    <div
      className={cn(
        'flex items-center gap-4',
        fullWidth && 'w-full',
        className
      )}
    >
      <LogoutButton
        size={size}
        className={cn(fullWidth && 'w-full justify-center')}
      />
    </div>
  ) : (
    <div
      className={cn('flex gap-2', fullWidth && 'w-full flex-col', className)}
    >
      {bootstrapOpen ? (
        <Button
          asChild
          size={size}
          variant={'default'}
          className={cn(fullWidth && 'w-full justify-center')}
        >
          <Link href="/auth/sign-up">Create Admin</Link>
        </Button>
      ) : (
        <Button
          asChild
          size={size}
          variant={'outline'}
          className={cn(fullWidth && 'w-full justify-center')}
        >
          <Link href="/auth/login">Sign in</Link>
        </Button>
      )}
    </div>
  );
}
