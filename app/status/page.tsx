import Header from '@/components/header';
import { StatusDetails } from '@/components/status/status-details';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Status — Project HERMES',
  description: 'Service health and readiness for Project HERMES.',
};

/**
 * Public status UI. Async health runs inside {@link StatusDetails} + Suspense
 * so each navigation gets fresh checks (Cache Components / streaming pattern).
 * @see https://nextjs.org/docs/app/getting-started/layouts-and-pages
 * @see https://nextjs.org/docs/app/getting-started/caching
 */
export default function StatusPage() {
  return (
    <main className="min-h-svh bg-background">
      <Header />

      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight">System Status</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          This page runs checks on each load. For automation, use the JSON
          endpoints{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            /api/healthz
          </code>{' '}
          (liveness) and{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            /api/readyz
          </code>{' '}
          (readiness).
        </p>

        <Suspense
          fallback={
            <p className="mt-8 text-sm text-muted-foreground animate-pulse">
              Running checks…
            </p>
          }
        >
          <StatusDetails />
        </Suspense>
      </div>
    </main>
  );
}
