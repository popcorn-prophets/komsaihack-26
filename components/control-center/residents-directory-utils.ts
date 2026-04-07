import {
  getResidentLanguageLabel,
  isResidentLanguage,
  RESIDENT_LANGUAGE_OPTIONS,
} from '@/lib/residents/languages';
import type {
  ResidentDirectoryFilters,
  ResidentDirectoryRow,
  ResidentLanguage,
  ResidentPlatform,
} from '@/lib/residents/types';

export const INITIAL_FILTERS: ResidentDirectoryFilters = {
  query: '',
  platform: 'all',
  language: 'all',
};

export type ResidentDirectoryStats = {
  totalResidents: number;
  telegramCount: number;
  messengerCount: number;
  languageCounts: Record<ResidentLanguage, number>;
  unknownLanguageCount: number;
};

export function formatResidentName(name: string | null) {
  return name?.trim() || 'Unknown resident';
}

export function formatPlatform(platform: ResidentPlatform | null) {
  if (platform === 'telegram') {
    return 'Telegram';
  }

  if (platform === 'messenger') {
    return 'Messenger';
  }

  if (platform === 'webchat') {
    return 'Web Chat';
  }

  return 'Unknown platform';
}

export function formatLanguage(language: ResidentLanguage | null) {
  return getResidentLanguageLabel(language);
}

export function formatTimestamp(value: string | null) {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatCoordinates(
  latitude: number | null,
  longitude: number | null
) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return 'Unavailable';
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function getInitials(name: string | null) {
  const source = name?.trim();

  if (!source) {
    return '?';
  }

  const words = source.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function normalizeResidentSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

function getResidentSearchText(resident: ResidentDirectoryRow) {
  return [
    formatResidentName(resident.name),
    resident.id,
    formatPlatform(resident.platform),
    formatLanguage(resident.language),
    resident.platformUserId ?? 'Unknown platform user ID',
    resident.threadId ?? 'Unknown thread ID',
    formatCoordinates(resident.latitude, resident.longitude),
  ]
    .join(' ')
    .toLowerCase();
}

export function filterResidentDirectory(
  residents: ResidentDirectoryRow[],
  filters: ResidentDirectoryFilters,
  normalizedQuery: string
) {
  return residents.filter((resident) => {
    if (filters.platform !== 'all' && resident.platform !== filters.platform) {
      return false;
    }

    if (filters.language !== 'all' && resident.language !== filters.language) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return getResidentSearchText(resident).includes(normalizedQuery);
  });
}

export function getResidentDirectoryStats(
  residents: ResidentDirectoryRow[]
): ResidentDirectoryStats {
  const languageCounts = RESIDENT_LANGUAGE_OPTIONS.reduce(
    (counts, { value }) => {
      counts[value] = 0;
      return counts;
    },
    {} as Record<ResidentLanguage, number>
  );

  let unknownLanguageCount = 0;

  for (const resident of residents) {
    if (isResidentLanguage(resident.language)) {
      languageCounts[resident.language] += 1;
    } else {
      unknownLanguageCount += 1;
    }
  }

  return {
    totalResidents: residents.length,
    telegramCount: residents.filter(
      (resident) => resident.platform === 'telegram'
    ).length,
    messengerCount: residents.filter(
      (resident) => resident.platform === 'messenger'
    ).length,
    languageCounts,
    unknownLanguageCount,
  };
}
