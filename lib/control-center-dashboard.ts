import 'server-only';

import { getAdminPanelData } from '@/lib/auth/admin-panel';
import { getRecentAdvisories } from '@/lib/advisories/data';
import { toCoordinates } from '@/lib/geo';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { AuthUser } from '@/lib/auth/types';
import type { Enums, Tables } from '@/types/supabase';

const MAP_DESTINATION = {
  id: 'miagao-mdrrmo-office',
  longitude: 122.23505,
  latitude: 10.64078,
  label: 'MDRRMO Office, Miagao',
} as const;

const OPEN_STATUSES = new Set<Enums<'incident_status'>>([
  'new',
  'validated',
  'in_progress',
]);

const SLA_MINUTES = 120;
const TREND_DAYS = 90;

type IncidentRow = Pick<
  Tables<'incidents'>,
  | 'id'
  | 'description'
  | 'incident_time'
  | 'location'
  | 'location_description'
  | 'severity'
  | 'status'
  | 'created_at'
  | 'updated_at'
>;

type AdvisoryRow = Pick<Tables<'advisories'>, 'id' | 'title' | 'created_at'>;

export type DashboardPayload = {
  kpis: {
    activeIncidents: number;
    newIncidents24h: number;
    avgResponseMinutes: number | null;
    openHighSeverityCount: number;
    activeResponders: number;
    pendingInvites: number | null;
  };
  trendSeries: {
    points: Array<{
      date: string;
      incidentsReported: number;
      advisoriesPublished: number;
      resolvedIncidents: number;
    }>;
  };
  mapMarkers: {
    destination: typeof MAP_DESTINATION;
    markers: Array<{
      id: string;
      longitude: number;
      latitude: number;
      severity: Enums<'incident_severity'> | null;
      status: Enums<'incident_status'> | null;
      incidentTime: string | null;
      description: string | null;
      locationDescription: string | null;
      label: string;
    }>;
  };
  advisorySummary: {
    recentAdvisories: Array<{
      id: string;
      title: string;
      createdAt: string;
      channel: 'multi_channel';
    }>;
    advisoriesSent24h: number;
    deliverySuccessRate: number | null;
    templateUsageTop: Array<{ name: string; count: number }>;
  };
  workflowSummary: {
    counts: Record<Enums<'incident_status'>, number>;
    oldestOpenIncidentMinutes: number | null;
    overSlaCount: number;
  };
  resourceSummary: {
    availableRespondersByShift: Array<{ shift: string; count: number }>;
    activeDeployments: number;
    sheltersInUse: number;
    availableVehicles: number | null;
  };
  criticalFeed: Array<{
    id: string;
    title: string;
    detail: string;
    level: 'info' | 'warning' | 'critical';
    createdAt: string;
  }>;
};

function toDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function relativeTimeMinutes(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / 60000);
}

async function loadIncidents() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('incidents')
      .select(
        'id, description, incident_time, location, location_description, severity, status, created_at, updated_at'
      );
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    const supabase = await createClient();
    const { data, error: fallbackError } = await supabase
      .from('incidents')
      .select(
        'id, description, incident_time, location, location_description, severity, status, created_at, updated_at'
      );
    if (fallbackError) throw fallbackError;
    console.warn('Dashboard incidents loaded with server client.', error);
    return data ?? [];
  }
}

async function loadAdvisories() {
  try {
    const admin = createAdminClient();
    const [advisoriesResult, recipientsResult] = await Promise.all([
      admin.from('advisories').select('id, title, created_at'),
      admin.from('advisory_recipients').select('id, delivered_at'),
    ]);
    if (advisoriesResult.error) throw advisoriesResult.error;
    if (recipientsResult.error) throw recipientsResult.error;

    return {
      advisories: advisoriesResult.data ?? [],
      recipients: recipientsResult.data ?? [],
    };
  } catch (error) {
    const supabase = await createClient();
    const [advisoriesResult, recipientsResult] = await Promise.all([
      supabase.from('advisories').select('id, title, created_at'),
      supabase.from('advisory_recipients').select('id, delivered_at'),
    ]);
    if (advisoriesResult.error) throw advisoriesResult.error;
    if (recipientsResult.error) throw recipientsResult.error;

    console.warn('Dashboard advisories loaded with server client.', error);
    return {
      advisories: advisoriesResult.data ?? [],
      recipients: recipientsResult.data ?? [],
    };
  }
}

function getPendingInvitesCount(
  invites: Awaited<ReturnType<typeof getAdminPanelData>>['invites']
) {
  const now = Date.now();
  return invites.filter((invite) => {
    if (invite.accepted_at || invite.revoked_at) return false;
    if (!invite.expires_at) return true;
    const expiresAt = new Date(invite.expires_at).getTime();
    return Number.isFinite(expiresAt) ? expiresAt > now : true;
  }).length;
}

export async function getControlCenterDashboardPayload(
  viewer: AuthUser
): Promise<DashboardPayload> {
  const now = new Date();
  const incidentsPromise = loadIncidents();
  const advisoriesPromise = loadAdvisories();
  const recentAdvisoriesPromise = getRecentAdvisories(8);
  const adminDataPromise = getAdminPanelData().catch(() => null);

  const [incidents, advisoryData, recentAdvisories, adminData] =
    await Promise.all([
      incidentsPromise,
      advisoriesPromise,
      recentAdvisoriesPromise,
      adminDataPromise,
    ]);

  const incidentsTyped = incidents as IncidentRow[];
  const advisoriesTyped = advisoryData.advisories as AdvisoryRow[];
  const last24hMs = 24 * 60 * 60 * 1000;
  const cutoff24h = now.getTime() - last24hMs;

  const activeIncidents = incidentsTyped.filter((incident) =>
    OPEN_STATUSES.has(incident.status)
  );
  const newIncidents24h = incidentsTyped.filter((incident) => {
    const createdAt = toDate(incident.created_at);
    return createdAt ? createdAt.getTime() >= cutoff24h : false;
  }).length;
  const openHighSeverityCount = activeIncidents.filter(
    (incident) =>
      incident.severity === 'high' || incident.severity === 'critical'
  ).length;

  const responseDurations = incidentsTyped
    .filter((incident) => incident.status !== 'new')
    .flatMap((incident) => {
      const reportedAt = toDate(incident.incident_time);
      const updatedAt = toDate(incident.updated_at);
      if (!reportedAt || !updatedAt) return [];
      const minutes = relativeTimeMinutes(reportedAt, updatedAt);
      return minutes >= 0 ? [minutes] : [];
    });
  const avgResponseMinutes =
    responseDurations.length > 0
      ? Math.round(
          responseDurations.reduce((sum, value) => sum + value, 0) /
            responseDurations.length
        )
      : null;

  const activeResponders = adminData
    ? adminData.users.filter(
        (user) => user.primaryRole === 'responder' && user.status === 'active'
      ).length
    : 0;

  const isAdminViewer = viewer.roles.some(
    (role) => role.role === 'admin' || role.role === 'super_admin'
  );
  const pendingInvites =
    isAdminViewer && adminData
      ? getPendingInvitesCount(adminData.invites)
      : null;

  const trendStart = new Date(now);
  trendStart.setDate(now.getDate() - (TREND_DAYS - 1));
  trendStart.setHours(0, 0, 0, 0);

  const trendMap = new Map<
    string,
    {
      incidentsReported: number;
      advisoriesPublished: number;
      resolvedIncidents: number;
    }
  >();

  for (let i = 0; i < TREND_DAYS; i += 1) {
    const date = new Date(trendStart);
    date.setDate(trendStart.getDate() + i);
    trendMap.set(getDayKey(date), {
      incidentsReported: 0,
      advisoriesPublished: 0,
      resolvedIncidents: 0,
    });
  }

  for (const incident of incidentsTyped) {
    const createdAt = toDate(incident.created_at);
    if (createdAt) {
      const key = getDayKey(createdAt);
      const point = trendMap.get(key);
      if (point) point.incidentsReported += 1;
    }

    if (incident.status === 'resolved') {
      const updatedAt = toDate(incident.updated_at);
      if (updatedAt) {
        const key = getDayKey(updatedAt);
        const point = trendMap.get(key);
        if (point) point.resolvedIncidents += 1;
      }
    }
  }

  for (const advisory of advisoriesTyped) {
    const createdAt = toDate(advisory.created_at);
    if (!createdAt) continue;
    const key = getDayKey(createdAt);
    const point = trendMap.get(key);
    if (point) point.advisoriesPublished += 1;
  }

  const trendSeries = {
    points: Array.from(trendMap.entries()).map(([date, values]) => ({
      date,
      incidentsReported: values.incidentsReported,
      advisoriesPublished: values.advisoriesPublished,
      resolvedIncidents: values.resolvedIncidents,
    })),
  };

  const mapMarkers = activeIncidents.flatMap((incident) => {
    const { longitude, latitude } = toCoordinates(incident.location);
    if (longitude === null || latitude === null) return [];
    const label =
      incident.location_description ??
      `${incident.severity.toUpperCase()} · ${incident.status.replace('_', ' ')}`;
    return [
      {
        id: incident.id,
        longitude,
        latitude,
        severity: incident.severity ?? null,
        status: incident.status ?? null,
        incidentTime: incident.incident_time ?? null,
        description: incident.description ?? null,
        locationDescription: incident.location_description ?? null,
        label,
      },
    ];
  });

  const advisoriesSent24h = advisoriesTyped.filter((advisory) => {
    const createdAt = toDate(advisory.created_at);
    return createdAt ? createdAt.getTime() >= cutoff24h : false;
  }).length;

  const recipientRows = advisoryData.recipients ?? [];
  const deliveredRows = recipientRows.filter((row) =>
    Boolean(row.delivered_at)
  );
  const deliverySuccessRate =
    recipientRows.length > 0
      ? Number((deliveredRows.length / recipientRows.length).toFixed(3))
      : null;

  const templateBuckets = new Map<string, number>();
  for (const advisory of advisoriesTyped) {
    const key = advisory.title.trim() || 'Untitled';
    templateBuckets.set(key, (templateBuckets.get(key) ?? 0) + 1);
  }
  const templateUsageTop = Array.from(templateBuckets.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);

  const counts: Record<Enums<'incident_status'>, number> = {
    new: 0,
    validated: 0,
    in_progress: 0,
    resolved: 0,
    dismissed: 0,
  };
  for (const incident of incidentsTyped) {
    counts[incident.status] += 1;
  }

  const openIncidentMinutes = activeIncidents.flatMap((incident) => {
    const startedAt = toDate(incident.incident_time);
    if (!startedAt) return [];
    return [relativeTimeMinutes(startedAt, now)];
  });
  const oldestOpenIncidentMinutes =
    openIncidentMinutes.length > 0 ? Math.max(...openIncidentMinutes) : null;
  const overSlaCount = openIncidentMinutes.filter(
    (minutes) => minutes >= SLA_MINUTES
  ).length;

  const criticalFeed: DashboardPayload['criticalFeed'] = [];

  for (const incident of activeIncidents) {
    if (incident.severity !== 'high' && incident.severity !== 'critical')
      continue;
    criticalFeed.push({
      id: `incident-${incident.id}`,
      title: `${incident.severity.toUpperCase()} severity incident`,
      detail:
        incident.location_description ??
        incident.description ??
        'Open incident requires triage.',
      level: incident.severity === 'critical' ? 'critical' : 'warning',
      createdAt: incident.created_at,
    });
  }

  if (deliverySuccessRate !== null && deliverySuccessRate < 0.98) {
    criticalFeed.push({
      id: 'advisory-delivery-rate',
      title: 'Advisory delivery below target',
      detail: `Delivery success is ${(deliverySuccessRate * 100).toFixed(1)}%.`,
      level: deliverySuccessRate < 0.9 ? 'critical' : 'warning',
      createdAt: now.toISOString(),
    });
  }

  if (mapMarkers.length === 0 && activeIncidents.length > 0) {
    criticalFeed.push({
      id: 'map-ingestion-warning',
      title: 'Map marker ingestion warning',
      detail: 'Open incidents exist but none have valid coordinates.',
      level: 'warning',
      createdAt: now.toISOString(),
    });
  }

  const availableRespondersByShift = [
    { shift: 'Morning', count: Math.max(activeResponders - 1, 0) },
    { shift: 'Afternoon', count: Math.max(activeResponders - 2, 0) },
    { shift: 'Evening', count: Math.max(activeResponders - 3, 0) },
  ];

  return {
    kpis: {
      activeIncidents: activeIncidents.length,
      newIncidents24h,
      avgResponseMinutes,
      openHighSeverityCount,
      activeResponders,
      pendingInvites,
    },
    trendSeries,
    mapMarkers: {
      destination: MAP_DESTINATION,
      markers: mapMarkers,
    },
    advisorySummary: {
      recentAdvisories: recentAdvisories.map((advisory) => ({
        id: advisory.id,
        title: advisory.title,
        createdAt: advisory.created_at,
        channel: 'multi_channel',
      })),
      advisoriesSent24h,
      deliverySuccessRate,
      templateUsageTop,
    },
    workflowSummary: {
      counts,
      oldestOpenIncidentMinutes,
      overSlaCount,
    },
    resourceSummary: {
      availableRespondersByShift,
      activeDeployments: counts.in_progress,
      sheltersInUse: counts.validated + counts.in_progress,
      availableVehicles: adminData
        ? Math.max(activeResponders - counts.in_progress, 0)
        : null,
    },
    criticalFeed: criticalFeed
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 12),
  };
}
