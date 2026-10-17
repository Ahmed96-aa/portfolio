import { useLanguage } from '../../i18n/LanguageProvider';
import { cx } from '../../lib/cx';
import s from './LanguageToggle.module.css';

/** EN / عربي segmented switch with a sliding thumb. */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <div role="group" aria-label={t.a11y.language} className={cx(s.toggle, lang === 'ar' && s.ar, className)} dir="ltr">
      <span className={s.thumb} aria-hidden />
      <button type="button" lang="en" title="English" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
        EN
      </button>
      <button type="button" lang="ar" title="العربية" aria-pressed={lang === 'ar'} onClick={() => setLang('ar')}>
        عربي
      </button>
    </div>
  );
}
