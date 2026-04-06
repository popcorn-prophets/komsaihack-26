import type { AuthUser, AppRole } from '@/lib/auth/types';

export const INCIDENT_EXPORT_ALLOWED_ROLES: AppRole[] = [
  'responder',
  'admin',
  'super_admin',
];

export const INCIDENT_EXPORT_TIMEZONE = 'Asia/Manila';
export const INCIDENT_EXPORT_TIMEZONE_OFFSET = '+08:00';

export function canAccessIncidentExport(
  viewer: Pick<AuthUser, 'roles'> | null
) {
  return INCIDENT_EXPORT_ALLOWED_ROLES.some((role) =>
    viewer?.roles.some((assignment) => assignment.role === role)
  );
}
