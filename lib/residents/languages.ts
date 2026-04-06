export const RESIDENT_LANGUAGE_OPTIONS = [
  { label: 'English', value: 'eng' },
  { label: 'Filipino', value: 'fil' },
  { label: 'Hiligaynon', value: 'hil' },
] as const;

export type ResidentLanguage =
  (typeof RESIDENT_LANGUAGE_OPTIONS)[number]['value'];

export type ResidentLanguageOption = (typeof RESIDENT_LANGUAGE_OPTIONS)[number];

export const RESIDENT_LANGUAGE_VALUES = RESIDENT_LANGUAGE_OPTIONS.map(
  ({ value }) => value
) as readonly ResidentLanguage[];

export const RESIDENT_LANGUAGE_LABELS: Record<ResidentLanguage, string> =
  RESIDENT_LANGUAGE_OPTIONS.reduce(
    (labels, option) => {
      labels[option.value] = option.label;
      return labels;
    },
    {} as Record<ResidentLanguage, string>
  );

export function isResidentLanguage(value: unknown): value is ResidentLanguage {
  return (
    typeof value === 'string' &&
    RESIDENT_LANGUAGE_VALUES.includes(value as ResidentLanguage)
  );
}

export function getResidentLanguageLabel(
  language: ResidentLanguage | null | undefined
): string {
  if (!language) {
    return 'Unknown language';
  }

  return RESIDENT_LANGUAGE_LABELS[language] ?? 'Unknown language';
}
