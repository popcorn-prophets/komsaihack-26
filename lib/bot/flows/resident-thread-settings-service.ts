import type { BotThread } from '@/lib/bot/types';
import { pointToString } from '@/lib/geo';
import { isResidentLanguage } from '@/lib/residents/languages';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Point } from '@/types/geo';
import type { Database } from '@/types/supabase';

export type ResidentSettingsEditableField = 'name' | 'language' | 'location';

export interface ResidentSettingsUpdatePayload {
  thread: BotThread;
  field: ResidentSettingsEditableField;
  value: string | Point;
}

export async function updateResidentThreadSetting({
  thread,
  field,
  value,
}: ResidentSettingsUpdatePayload): Promise<void> {
  const supabase = createAdminClient();

  const updatePatch: Database['public']['Tables']['residents']['Update'] = {};

  if (field === 'name') {
    if (typeof value !== 'string') {
      throw new Error('Invalid name value.');
    }
    updatePatch.name = value;
  }

  if (field === 'language') {
    if (!isResidentLanguage(value)) {
      throw new Error('Invalid language value.');
    }
    updatePatch.language = value;
  }

  if (field === 'location') {
    if (!value || typeof value !== 'object') {
      throw new Error('Invalid location value.');
    }

    const point = value as { type?: unknown; coordinates?: unknown };
    if (point.type !== 'Point' || !Array.isArray(point.coordinates)) {
      throw new Error('Invalid location value.');
    }

    const [lng, lat] = point.coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      throw new Error('Invalid location value.');
    }

    updatePatch.location = pointToString({
      type: 'Point',
      coordinates: [lng, lat],
    });
  }

  const { data, error } = await supabase
    .from('residents')
    .update(updatePatch)
    .eq('thread_id', thread.id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to update resident setting:', error);
    throw new Error('Failed to update your settings. Please try again later.');
  }

  if (!data) {
    throw new Error(
      'You need to complete onboarding before updating settings.'
    );
  }
}
