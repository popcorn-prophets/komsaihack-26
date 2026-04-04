import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6 md:p-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading invites</CardTitle>
            <CardDescription>
              Preparing the admin provisioning tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please wait a moment.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
