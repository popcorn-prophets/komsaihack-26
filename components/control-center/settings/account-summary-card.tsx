import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { AppRole, AuthUser } from '@/lib/auth/types';

const ROLE_ORDER: AppRole[] = ['super_admin', 'admin', 'responder'];

function formatRole(role: AppRole) {
  if (role === 'super_admin') {
    return 'Super Admin';
  }

  if (role === 'admin') {
    return 'Admin';
  }

  return 'Responder';
}

function getInitials(viewer: AuthUser) {
  const label = viewer.fullName?.trim() || viewer.email?.trim() || 'User';
  const segments = label.split(/\s+/).filter(Boolean);

  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }

  return `${segments[0][0] ?? ''}${segments[segments.length - 1][0] ?? ''}`.toUpperCase();
}

function getRoles(viewer: AuthUser) {
  return ROLE_ORDER.filter((role) =>
    viewer.roles.some((assignment) => assignment.role === role)
  );
}

export function AccountSummaryCard({ viewer }: { viewer: AuthUser }) {
  const roles = getRoles(viewer);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account summary</CardTitle>
        <CardDescription>
          Read-only account details for your control-center access.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <Avatar className="size-12">
            <AvatarFallback>{getInitials(viewer)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="truncate text-lg font-semibold">
              {viewer.fullName ?? 'No display name set'}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {viewer.email ?? 'No email available'}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Display name
            </div>
            <div className="mt-2 text-sm">
              {viewer.fullName ?? 'Using your email as the fallback label'}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email address
            </div>
            <div className="mt-2 break-all text-sm">
              {viewer.email ?? 'No email available'}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Access roles
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.length > 0 ? (
              roles.map((role) => (
                <Badge key={role} variant="outline">
                  {formatRole(role)}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                No roles assigned.
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
