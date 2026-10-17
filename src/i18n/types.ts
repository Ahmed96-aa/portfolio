export type Lang = 'en' | 'ar';

export const LANGS: readonly Lang[] = ['en', 'ar'];

/** A value provided in every supported language. */
export type Localized<T = string> = Record<Lang, T>;

export const dirOf = (lang: Lang): 'ltr' | 'rtl' => (lang === 'ar' ? 'rtl' : 'ltr');
