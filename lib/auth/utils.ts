import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
export { normalizeEmail } from './normalization';

export function createInviteToken() {
  return randomBytes(32).toString('base64url');
}

export function hashInviteToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://127.0.0.1:3000';
}
