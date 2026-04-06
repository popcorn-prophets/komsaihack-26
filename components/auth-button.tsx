import { getCurrentUser, isBootstrapRegistrationOpen } from '@/lib/auth/dal';
import Link from 'next/link';
import { LogoutButton } from './logout-button';
import { Button } from './ui/button';

export async function AuthButton() {
  const [user, bootstrapOpen] = await Promise.all([
    getCurrentUser(),
    isBootstrapRegistrationOpen(),
  ]);

  return user ? (
    <div className="flex items-center gap-4">
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      {bootstrapOpen ? (
        <Button asChild size="sm" variant={'default'}>
          <Link href="/auth/sign-up">Create Admin</Link>
        </Button>
      ) : (
        <Button asChild size="sm" variant={'outline'}>
          <Link href="/auth/login">Sign in</Link>
        </Button>
      )}
    </div>
  );
}
