import { isBootstrapRegistrationOpen } from '@/lib/auth/dal';
import { SignUpForm } from '@/components/sign-up-form';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { connection } from 'next/server';

export default async function Page() {
  await connection();

  const bootstrapOpen = await isBootstrapRegistrationOpen();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {bootstrapOpen ? (
          <SignUpForm />
        ) : (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Registration closed</CardTitle>
                <CardDescription>
                  The first admin has already been created.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  All new accounts must now be provisioned by an existing admin
                  through the invite flow.
                </p>
                <p className="text-sm">
                  <Link
                    href="/auth/login"
                    className="underline underline-offset-4"
                  >
                    Return to login
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
