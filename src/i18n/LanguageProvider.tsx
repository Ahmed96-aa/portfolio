import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { en, type Dictionary } from './en';
import { ar } from './ar';
import { site } from '../content/site';
import { siteMeta } from './meta';
import { dirOf, type Lang } from './types';

const STORAGE_KEY = 'aaa-lang';
const dictionaries: Record<Lang, Dictionary> = { en, ar };

interface LanguageContextValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  t: Dictionary;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const base = import.meta.env.BASE_URL;
const pathFor = (lang: Lang) => (lang === 'ar' ? `${base}ar/` : base);

/** The URL decides the language; on the root path a remembered choice wins. */
export function detectInitialLang(): Lang {
  if (document.documentElement.lang === 'ar') return 'ar';
  try {
    if (localStorage.getItem(STORAGE_KEY) === 'ar') return 'ar';
  } catch {
    /* storage unavailable */
  }
  return 'en';
}

function setMeta(selector: string, value: string) {
  document.head.querySelector(selector)?.setAttribute('content', value);
}

/** Remember which section is in view so a direction change doesn't lose the reader's place. */
function captureAnchor() {
  const probe = window.innerHeight * 0.3;
  const sections = document.querySelectorAll<HTMLElement>('main > section[id]');
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= probe && rect.bottom > probe) {
      return { id: section.id, ratio: (probe - rect.top) / rect.height };
    }
  }
  return null;
}

function restoreAnchor(anchor: ReturnType<typeof captureAnchor>) {
  if (!anchor) return;
  const section = document.getElementById(anchor.id);
  if (!section) return;
  const top = section.getBoundingClientRect().top + window.scrollY;
  const y = top + anchor.ratio * section.offsetHeight - window.innerHeight * 0.3;
  window.scrollTo({ top: y, behavior: 'instant' });
}

export function LanguageProvider({ initialLang, children }: { initialLang: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useLayoutEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dirOf(lang);

    const meta = siteMeta[lang];
    document.title = meta.title;
    setMeta('meta[name="description"]', meta.description);
    setMeta('meta[property="og:title"]', meta.title);
    setMeta('meta[property="og:description"]', meta.description);
    setMeta('meta[property="og:site_name"]', meta.siteName);
    setMeta('meta[property="og:locale"]', meta.ogLocale);
    setMeta('meta[property="og:locale:alternate"]', siteMeta[lang === 'ar' ? 'en' : 'ar'].ogLocale);
    setMeta('meta[property="og:image:alt"]', meta.title);
    // The build writes these for the page's own language; keep them in step after a switch, so the
    // canonical URL, og:url and the preview image always describe the language on screen.
    if (site.url) {
      const url = `${site.url}${lang === 'ar' ? '/ar/' : '/'}`;
      document.head.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
      setMeta('meta[property="og:url"]', url);
    }
    const image = site.ogImage[lang];
    if (image) setMeta('meta[property="og:image"]', image.startsWith('http') ? image : `${site.url}${image}`);

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable */
    }

    const target = pathFor(lang);
    if (window.location.pathname !== target) {
      window.history.replaceState(window.history.state, '', target + window.location.search + window.location.hash);
    }
  }, [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang) return;
      const anchor = captureAnchor();
      flushSync(() => setLangState(next));
      restoreAnchor(anchor);
      window.dispatchEvent(new CustomEvent('languagechange-applied'));
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, dir: dirOf(lang), t: dictionaries[lang], setLang }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
