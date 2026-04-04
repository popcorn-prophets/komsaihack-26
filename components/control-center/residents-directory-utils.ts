import type {
  ResidentDirectoryFilters,
  ResidentDirectoryRow,
  ResidentLanguage,
  ResidentPlatform,
} from '@/lib/residents/types';

export const INITIAL_FILTERS = {
  query: '',
  platform: 'all',
  language: 'all',
} satisfies ResidentDirectoryFilters;

export type ResidentDirectoryStats = {
  totalResidents: number;
  telegramCount: number;
  messengerCount: number;
  filipinoCount: number;
  englishCount: number;
};

export function formatPlatform(platform: ResidentPlatform) {
  return platform === 'telegram' ? 'Telegram' : 'Messenger';
}

export function formatLanguage(language: ResidentLanguage) {
  return language === 'fil' ? 'Filipino' : 'English';
}

export function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

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

    const haystack = [
      resident.name,
      resident.platform,
      formatPlatform(resident.platform),
      resident.platformUserId,
      resident.threadId,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function getResidentDirectoryStats(
  residents: ResidentDirectoryRow[]
): ResidentDirectoryStats {
  const filipinoCount = residents.filter(
    (resident) => resident.language === 'fil'
  ).length;

  return {
    totalResidents: residents.length,
    telegramCount: residents.filter(
      (resident) => resident.platform === 'telegram'
    ).length,
    messengerCount: residents.filter(
      (resident) => resident.platform === 'messenger'
    ).length,
    filipinoCount,
    englishCount: residents.length - filipinoCount,
  };
}
