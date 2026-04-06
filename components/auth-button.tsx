import {
  getCurrentUser,
  isBootstrapRegistrationOpen,
  userHasRole,
} from '@/lib/auth/dal';
import Link from 'next/link';
import { LogoutButton } from './logout-button';
import { Button } from './ui/button';

export async function AuthButton() {
  const [user, bootstrapOpen] = await Promise.all([
    getCurrentUser(),
    isBootstrapRegistrationOpen(),
  ]);
  const canManageInvites =
    userHasRole(user, 'admin') || userHasRole(user, 'super_admin');
  return user ? (
    <div className="flex items-center gap-4">
      <span className="hidden text-muted-foreground sm:inline">
        {user.email}
      </span>
      {canManageInvites ? (
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/invites">Invites</Link>
        </Button>
      ) : null}
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={'outline'}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      {bootstrapOpen ? (
        <Button asChild size="sm" variant={'default'}>
          <Link href="/auth/sign-up">Create Admin</Link>
        </Button>
      ) : null}
    </div>
  );
}
