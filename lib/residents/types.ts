import type { Enums } from '@/types/supabase';
import type { ResidentLanguage } from './languages';

export type ResidentPlatform = Enums<'resident_platform'>;
export type { ResidentLanguage } from './languages';

export type ResidentDirectoryRow = {
  id: string;
  name: string | null;
  platform: ResidentPlatform | null;
  platformUserId: string | null;
  threadId: string | null;
  language: ResidentLanguage | null;
  createdAt: string | null;
  longitude: number | null;
  latitude: number | null;
};

export type ResidentDirectoryFilters = {
  query: string;
  platform: ResidentPlatform | 'all';
  language: ResidentLanguage | 'all';
};
