import Link from 'next/link';

import { InviteAcceptForm } from '@/components/invite-accept-form';
import { getCurrentUser, getInvitePreviewByToken } from '@/lib/auth/dal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

function InviteStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <Link href="/auth/login" className="underline underline-offset-4">
              Return to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  await connection();

  const [params, currentUser] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);

  if (currentUser) {
    redirect('/');
  }

  const token = typeof params.token === 'string' ? params.token : '';
  const invite = await getInvitePreviewByToken(token);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {invite.status === 'valid' && invite.email && invite.role ? (
          <InviteAcceptForm
            token={token}
            email={invite.email}
            role={invite.role}
          />
        ) : invite.status === 'accepted' ? (
          <InviteStateCard
            title="Invite already used"
            description="This invite has already been accepted."
          />
        ) : invite.status === 'expired' ? (
          <InviteStateCard
            title="Invite expired"
            description="Ask an admin to issue a new invite."
          />
        ) : invite.status === 'revoked' ? (
          <InviteStateCard
            title="Invite revoked"
            description="This invite is no longer valid."
          />
        ) : (
          <InviteStateCard
            title="Invalid invite"
            description="The invite link is missing or invalid."
          />
        )}
      </div>
    </div>
  );
}
