import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Forbidden</CardTitle>
            <CardDescription>
              You do not have permission to access that page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <Link href="/" className="underline underline-offset-4">
                Return home
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
