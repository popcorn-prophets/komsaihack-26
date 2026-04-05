import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { ResidentDirectoryRow } from '@/lib/residents/types';

import {
  formatLanguage,
  formatPlatform,
  formatTimestamp,
  formatResidentName,
  getInitials,
} from './residents-directory-utils';

export function ResidentDetailSheet({
  resident,
  open,
  onOpenChange,
}: {
  resident: ResidentDirectoryRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!resident) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Resident details</SheetTitle>
            <SheetDescription>
              Select a resident to review onboarding and location data.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{formatResidentName(resident.name)}</SheetTitle>
          <SheetDescription>
            Review the resident profile captured during onboarding, including
            platform identity and saved coordinates.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
          <Card>
            <CardHeader className="gap-4">
              <div className="flex items-start gap-4">
                <Avatar size="lg">
                  <AvatarFallback>{getInitials(resident.name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl">
                      {formatResidentName(resident.name)}
                    </CardTitle>
                    <Badge variant="outline">
                      {formatPlatform(resident.platform)}
                    </Badge>
                    <Badge variant="secondary">
                      {formatLanguage(resident.language)}
                    </Badge>
                  </div>
                  <CardDescription>
                    Joined {formatTimestamp(resident.createdAt)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resident profile</CardTitle>
              <CardDescription>
                Read-only onboarding details stored for incident and advisory
                operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Platform user ID
                </div>
                <div className="mt-1 break-all text-sm font-medium">
                  {resident.platformUserId ?? 'Unavailable'}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Thread ID
                </div>
                <div className="mt-1 break-all text-sm font-medium">
                  {resident.threadId ?? 'Unavailable'}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Latitude
                </div>
                <div className="mt-1 text-sm font-medium">
                  {typeof resident.latitude === 'number'
                    ? resident.latitude.toFixed(6)
                    : 'Unavailable'}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Longitude
                </div>
                <div className="mt-1 text-sm font-medium">
                  {typeof resident.longitude === 'number'
                    ? resident.longitude.toFixed(6)
                    : 'Unavailable'}
                </div>
              </div>
              <div className="rounded-lg border p-3 sm:col-span-2">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Resident record ID
                </div>
                <div className="mt-1 break-all font-mono text-sm">
                  {resident.id}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
