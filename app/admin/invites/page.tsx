import { InviteCreateForm } from '@/components/invite-create-form';
import { InviteList } from '@/components/invite-list';
import { requireRole, userHasRole } from '@/lib/auth/dal';
import { createClient } from '@/lib/supabase/server';
import type { AppRole, InviteRecord } from '@/lib/auth/types';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { connection } from 'next/server';

export default async function Page() {
  await connection();

  const user = await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();
  const { data: invites, error } = await supabase
    .from('account_invites')
    .select(
      'id, email, role, invited_by, created_at, expires_at, accepted_at, revoked_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const allowedRoles: AppRole[] = userHasRole(user, 'super_admin')
    ? ['responder', 'admin']
    : ['responder'];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6 md:p-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Account invites
            </h1>
            <p className="text-sm text-muted-foreground">
              Provision new staff accounts without reopening public
              registration.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <InviteCreateForm allowedRoles={allowedRoles} />
          <InviteList invites={(invites ?? []) as InviteRecord[]} />
        </div>
      </div>
    </main>
  );
}
