import type { Lang, Localized } from './types';

const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

/** Western digits → Arabic-Indic digits for Arabic; unchanged for English. */
export function localDigits(value: string | number, lang: Lang): string {
  const text = String(value);
  return lang === 'ar' ? text.replace(/\d/g, (d) => arabicDigits[Number(d)]) : text;
}

/** "01", "02"… rendered in Arabic-Indic digits for Arabic. */
export function formatIndex(n: number, lang: Lang): string {
  return localDigits(String(n).padStart(2, '0'), lang);
}

/** Fills {placeholders} in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function pick<T>(value: Localized<T>, lang: Lang): T {
  return value[lang];
}

/** True when a localized string has content in the active language. */
export const filled = (value: Localized | null | undefined, lang: Lang): value is Localized =>
  !!value && value[lang].trim().length > 0;
