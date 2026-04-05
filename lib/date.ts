/**
 * Safely converts an input into a valid Date instance.
 * Returns null if the value cannot be parsed.
 */
function toValidDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a date into a localized absolute date-time string.
 *
 * @example
 * formatDateTime(new Date()) // "Apr 4, 2026, 3:45 PM"
 *
 * @param value - Date object or ISO/string date input
 * @param locale - BCP 47 locale string (default: 'en-PH')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateTime(
  value: string | Date,
  locale: string = 'en-PH',
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  }
): string {
  const date = toValidDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Formats a date into a human-readable relative time string
 * (e.g., "5 minutes ago", "in 2 days", "yesterday").
 *
 * Uses Intl.RelativeTimeFormat under the hood.
 *
 * @example
 * formatRelativeTime(Date.now() - 60000) // "1 minute ago"
 *
 * @param value - Date object or ISO/string date input
 * @param locale - BCP 47 locale string (default: 'en-PH')
 * @returns Relative time string or empty string if invalid
 */
export function formatRelativeTime(
  value: string | Date,
  locale: string = 'en-PH'
): string {
  const date = toValidDate(value);
  if (!date) return '';

  const now = Date.now();
  const diffInSeconds = Math.floor((date.getTime() - now) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  // Ordered from smallest → largest unit
  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' }, // avg weeks per month
    { amount: 12, unit: 'month' },
    { amount: Infinity, unit: 'year' },
  ];

  let duration = diffInSeconds;

  for (const { amount, unit } of divisions) {
    if (Math.abs(duration) < amount) {
      return rtf.format(Math.round(duration), unit);
    }
    duration /= amount;
  }

  return '';
}

/**
 * Smart date formatter:
 * - Uses relative time for "recent" dates
 * - Falls back to absolute formatting for older dates
 *
 * Common UX pattern for feeds, notifications, logs.
 *
 * @example
 * formatSmartDateTime(new Date()) // "now"
 * formatSmartDateTime(oldDate)    // "Apr 1, 2026, 10:30 AM"
 *
 * @param value - Date object or ISO/string date input
 * @param locale - BCP 47 locale string (default: 'en-PH')
 * @param relativeThresholdDays - Max age (in days) to use relative format (default: 7)
 * @param absoluteOptions - Intl.DateTimeFormat options for fallback
 * @returns Smart formatted date string or empty string if invalid
 */
export function formatSmartDateTime(
  value: string | Date,
  locale: string = 'en-PH',
  relativeThresholdDays: number = 7,
  absoluteOptions: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  }
): string {
  const date = toValidDate(value);
  if (!date) return '';

  const now = Date.now();
  const diffInDays = Math.abs((date.getTime() - now) / (1000 * 60 * 60 * 24));

  if (diffInDays < relativeThresholdDays) {
    return formatRelativeTime(date, locale);
  }

  return new Intl.DateTimeFormat(locale, absoluteOptions).format(date);
}
