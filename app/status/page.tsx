import { AuthButton } from '@/components/auth-button';
import Logo from '@/components/brand/logo';
import Wordmark from '@/components/brand/wordmark';
import WordmarkLogo from '@/components/brand/wordmark-logo';
import { ThemeSwitcher } from '@/components/theme-switcher';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { StatusDetails } from '@/components/status/status-details';

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
    <main className="min-h-svh flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <Link href="/" className="font-semibold flex items-center">
            <Logo className="block sm:hidden" />
            <Wordmark className="hidden sm:block md:hidden" />
            <WordmarkLogo className="hidden md:block" />
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Suspense>
              <AuthButton />
            </Suspense>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight">System status</h1>
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
