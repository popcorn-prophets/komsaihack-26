import { isBootstrapRegistrationOpen } from '@/lib/auth/dal';
import { LoginForm } from '@/components/login-form';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';

function getNoticeMessage(notice: string | undefined) {
  switch (notice) {
    case 'bootstrap-admin-created':
      return 'Initial admin account created. Sign in to continue.';
    case 'invite-accepted':
      return 'Account setup complete. Sign in to continue.';
    default:
      return null;
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await connection();

  const [params, bootstrapOpen] = await Promise.all([
    searchParams,
    isBootstrapRegistrationOpen(),
  ]);

  if (bootstrapOpen) {
    redirect('/auth/sign-up');
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          notice={getNoticeMessage(params.notice)}
          showBootstrapLink={bootstrapOpen}
        />
      </div>
    </div>
  );
}
