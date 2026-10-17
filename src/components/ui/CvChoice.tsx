import { profile } from '../../content/site';
import { useLanguage } from '../../i18n/LanguageProvider';
import type { Lang } from '../../i18n/types';
import { cx } from '../../lib/cx';
import { ButtonIcon } from './Button';
import s from './ui.module.css';

/** Each language is named in itself, as language pickers do, so either reader finds their own. */
const NATIVE: Record<Lang, string> = { en: 'English', ar: 'العربية' };

/**
 * The CV download, in both languages: a label, then one link per PDF — the page's language first.
 * Renders nothing when no CV is configured.
 */
export function CvChoice({ label, className }: { label: string; className?: string }) {
  const { t, lang } = useLanguage();
  const order: Lang[] = lang === 'ar' ? ['ar', 'en'] : ['en', 'ar'];
  const langs = order.filter((l) => profile.cv[l]);
  if (!langs.length) return null;

  return (
    <div className={cx(s.cvChoice, className)} role="group" aria-label={label}>
      <ButtonIcon icon="download" size={16} />
      <span className={s.cvLabel} aria-hidden>
        {label}
      </span>
      <span className={s.cvLangs}>
        {langs.map((l) => (
          <a
            key={l}
            className={s.cvLang}
            href={profile.cv[l]}
            download
            hrefLang={l}
            aria-label={t.contact.cvIn[l]}
          >
            {/* lang on the visible name only: the accessible name is in the page's language. */}
            <span lang={l} dir={l === 'ar' ? 'rtl' : 'ltr'}>
              {NATIVE[l]}
            </span>
          </a>
        ))}
      </span>
    </div>
  );
}
