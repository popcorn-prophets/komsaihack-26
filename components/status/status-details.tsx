import { getLivenessPayload, getReadinessResult } from '@/lib/health';

export async function StatusDetails() {
  const [liveness, readiness] = await Promise.all([
    getLivenessPayload(),
    getReadinessResult(),
  ]);

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-lg border border-border bg-card p-4 text-card-foreground">
        <h2 className="text-sm font-semibold">Application</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:text-xs">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted-foreground">Service</dt>
            <dd className="font-mono">{liveness.service}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted-foreground">Checked at</dt>
            <dd className="font-mono text-muted-foreground">
              {liveness.timestamp}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 text-card-foreground">
        <h2 className="text-sm font-semibold">Checks</h2>
        <ul className="mt-3 space-y-3 text-sm">
          <li className="flex flex-wrap items-start justify-between gap-2">
            <span className="text-muted-foreground">Environment</span>
            <span
              className={
                readiness.checks.env.okay
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-destructive'
              }
            >
              {readiness.checks.env.okay
                ? 'Required public env present'
                : `Missing: ${readiness.checks.env.missing?.join(', ') ?? 'unknown'}`}
            </span>
          </li>
          <li className="flex flex-wrap items-start justify-between gap-2">
            <span className="text-muted-foreground">Supabase Auth</span>
            <span
              className={
                readiness.checks.supabase.okay
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-destructive'
              }
            >
              {readiness.checks.supabase.okay
                ? 'auth/v1/health OK'
                : `Not ready (${readiness.checks.supabase.detail ?? 'unknown'})`}
            </span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Readiness does not verify Postgres RLS or app tables—only that Auth is
          reachable with your anon key. Extend{' '}
          <code className="font-mono">getReadinessResult</code> if you need
          database-level checks.
        </p>
      </section>

      <section className="rounded-lg border border-dashed border-border p-4">
        <h2 className="text-sm font-semibold">API probes</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Use for load balancers, Kubernetes, or monitoring.{' '}
          <code className="font-mono">HEAD</code> returns the same status code
          without a body.
        </p>
        <ul className="mt-3 space-y-2 font-mono text-xs">
          <li>
            <span className="text-muted-foreground">GET</span>{' '}
            <a className="underline underline-offset-4" href="/api/healthz">
              /api/healthz
            </a>
          </li>
          <li>
            <span className="text-muted-foreground">GET</span>{' '}
            <a className="underline underline-offset-4" href="/api/readyz">
              /api/readyz
            </a>{' '}
            <span className="text-muted-foreground">(503 if not ready)</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
