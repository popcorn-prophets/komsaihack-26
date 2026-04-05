import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

import type { AdvisoryListItem, AdvisoryTemplateItem } from './types';

export async function getRecentAdvisories(limit: number = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('advisories')
    .select('id, title, message, created_at, created_by')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  const advisories = (data ?? []) as Omit<AdvisoryListItem, 'creator_name'>[];
  const creatorIds = [
    ...new Set(advisories.map((item) => item.created_by)),
  ].filter((value): value is string => Boolean(value));

  if (creatorIds.length === 0) {
    return advisories.map((item) => ({
      ...item,
      creator_name: null,
    }));
  }

  const adminClient = createAdminClient();
  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('id, full_name')
    .in('id', creatorIds);

  if (profilesError) {
    console.error(
      'Failed to resolve advisory creators from profiles:',
      profilesError
    );

    return advisories.map((item) => ({
      ...item,
      creator_name: null,
    }));
  }

  const creatorNameById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.full_name ?? null])
  );

  return advisories.map((item) => ({
    ...item,
    creator_name: item.created_by
      ? (creatorNameById.get(item.created_by) ?? null)
      : null,
  }));
}

export async function getAdvisoryTemplates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('advisory_templates')
    .select('id, name, title, message, created_at, created_by')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdvisoryTemplateItem[];
}
