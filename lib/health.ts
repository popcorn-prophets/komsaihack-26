import { connection } from 'next/server';

/**
 * Shared health / readiness logic for Route Handlers and the /status page.
 * Keeps probes consistent and avoids the status UI HTTP-looping on itself.
 */

export type LivenessPayload = {
  status: 'ok';
  service: string;
  timestamp: string;
};

export type ReadinessChecks = {
  env: { okay: boolean; missing?: string[] };
  supabase: { okay: boolean; detail?: string };
};

export type ReadinessResult = {
  ready: boolean;
  checks: ReadinessChecks;
};

const SERVICE = 'project-hermes';

const REQUIRED_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
] as const;

/**
 * Liveness: cheap “is the app process serving?” signal.
 * `await connection()` before `new Date()` satisfies Cache Components prerender
 * rules (per-request clock); see connection() docs.
 */
export async function getLivenessPayload(): Promise<LivenessPayload> {
  await connection();
  return {
    status: 'ok',
    service: SERVICE,
    timestamp: new Date().toISOString(),
  };
}

function collectMissingEnvKeys(): string[] {
  const missing: string[] = [];
  for (const key of REQUIRED_ENV_KEYS) {
    const value = process.env[key];
    if (value === undefined || value.trim() === '') {
      missing.push(key);
    }
  }
  return missing;
}

const SUPABASE_HEALTH_TIMEOUT_MS = 5_000;

/**
 * Readiness: required configuration + Supabase Auth (GoTrue) reachable.
 * Uses GET {SUPABASE_URL}/auth/v1/health with the anon key (public);
 * does not assert database RLS or application tables.
 */
export async function getReadinessResult(): Promise<ReadinessResult> {
  const missingEnv = collectMissingEnvKeys();
  const envOk = missingEnv.length === 0;

  let supabaseOk = false;
  let supabaseDetail: string | undefined;

  if (!envOk) {
    supabaseDetail = 'skipped_missing_env';
  } else {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '');
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      SUPABASE_HEALTH_TIMEOUT_MS
    );

    try {
      const res = await fetch(`${baseUrl}/auth/v1/health`, {
        method: 'GET',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`, //Token
        },
        signal: controller.signal,
        cache: 'no-store',
      });

      supabaseOk = res.ok;
      if (!supabaseOk) {
        supabaseDetail = `http_${res.status}`;
      }
    } catch (err) {
      supabaseDetail =
        err instanceof Error
          ? err.name === 'AbortError'
            ? 'timeout'
            : 'network'
          : 'error';
    } finally {
      clearTimeout(timeoutId);
    }
  }

  const ready = envOk && supabaseOk;

  return {
    ready,
    checks: {
      env: envOk ? { okay: true } : { okay: false, missing: missingEnv },
      supabase: supabaseOk
        ? { okay: true }
        : { okay: false, detail: supabaseDetail },
    },
  };
}
