import 'server-only';

import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/supabase';

import type { ResidentDirectoryRow } from './types';

type ResidentRow = Tables<'residents_with_coords'>;

function compareResidents(
  left: ResidentDirectoryRow,
  right: ResidentDirectoryRow
) {
  const leftName = left.name?.trim() ?? '';
  const rightName = right.name?.trim() ?? '';

  if (leftName && rightName) {
    const nameComparison = leftName.localeCompare(rightName, 'en', {
      sensitivity: 'base',
    });

    if (nameComparison !== 0) {
      return nameComparison;
    }
  } else if (leftName && !rightName) {
    return -1;
  } else if (!leftName && rightName) {
    return 1;
  }

  const leftCreatedAt = left.createdAt ? Date.parse(left.createdAt) : 0;
  const rightCreatedAt = right.createdAt ? Date.parse(right.createdAt) : 0;

  return rightCreatedAt - leftCreatedAt;
}

function normalizeResident(row: ResidentRow): ResidentDirectoryRow | null {
  if (!row.id) {
    return null;
  }

  return {
    id: row.id,
    name: row.name ?? null,
    platform: row.platform ?? null,
    platformUserId: row.platform_user_id ?? null,
    threadId: row.thread_id ?? null,
    language: row.language ?? null,
    createdAt: row.created_at ?? null,
    longitude: row.longitude ?? null,
    latitude: row.latitude ?? null,
  };
}

async function loadResidentDirectory() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('residents_with_coords')
    .select(
      'id, name, platform, platform_user_id, thread_id, language, created_at, longitude, latitude'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ResidentRow[])
    .map(normalizeResident)
    .filter((resident): resident is ResidentDirectoryRow => Boolean(resident))
    .sort(compareResidents);
}

export const getResidentDirectory = cache(loadResidentDirectory);
