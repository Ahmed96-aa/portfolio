import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { profile } from '../../content/site';
import { useLanguage } from '../../i18n/LanguageProvider';
import { fill } from '../../i18n/format';
import { cx } from '../../lib/cx';
import { openPalette, shortcutLabel } from '../../lib/palette';
import { rich } from '../../lib/rich';
import { Astrolabe } from '../astrolabe/Astrolabe';
import { Logo } from '../brand/Brand';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from '../ui/BrandIcons';
import { ButtonIcon } from '../ui/Button';
import { LocalClock, SECTION_IDS } from './Header';
import { CvChoice } from '../ui/CvChoice';
import s from './Footer.module.css';

export function Footer() {
  const { t, lang } = useLanguage();
  const [shortcut] = useState(shortcutLabel);
  const year = new Date().getFullYear();
  const [before, after] = t.footer.quick.split('{key}');

  return (
    <footer className={s.footer}>
      {/* The page closes on the instrument it opened with, rising like a sun. */}
      <Astrolabe className={s.sun} cy={1.1} radius={0.4} fitWidth strength={0.34} />
      <div className="container">
        <div className={s.cta}>
          <p className={cx('display', s.ctaTitle)} data-reveal>
            {rich(t.footer.cta)}
          </p>
          <div className={s.ctaSide} data-reveal>
            <p className={s.ctaBody}>{t.footer.ctaBody}</p>
            <a className={s.mail} href={`mailto:${profile.email}`}>
              <span>{profile.email}</span>
              <ButtonIcon icon="external" size={20} />
            </a>
          </div>
        </div>

        <div className={s.cols}>
          <div className={s.brandCol}>
            <Logo className={s.logo} label={t.footer.monogram} />
            <p className={s.heritage}>{t.footer.heritage}</p>
          </div>

          <nav aria-label={t.a11y.footerNav}>
            <h2 className={cx('label', s.colTitle)}>{t.footer.navigate}</h2>
            <ul className={s.links}>
              {SECTION_IDS.map((id) => (
                <li key={id}>
                  <a href={`#${id}`}>{t.nav[id]}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={cx('label', s.colTitle)}>{t.footer.elsewhere}</h2>
            <ul className={s.links}>
              {profile.whatsapp ? (
                <li>
                  <a href={`https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(t.contact.whatsappMessage)}`} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon size={15} />
                    {t.contact.whatsapp}
                    <span className="sr-only">{t.a11y.newTab}</span>
                  </a>
                </li>
              ) : null}
              {profile.socials.map((social) => (
                <li key={social.id}>
                  <a href={social.href} target="_blank" rel="noopener noreferrer">
                    {social.id === 'telegram' ? <TelegramIcon size={15} /> : <InstagramIcon size={15} />}
                    {social.label[lang]}
                    <span className="sr-only">{t.a11y.newTab}</span>
                  </a>
                </li>
              ))}
              {profile.cv.en || profile.cv.ar ? (
                <li>
                  <CvChoice className={s.cv} label={t.contact.cv} />
                </li>
              ) : null}
            </ul>
          </div>

          <div className={s.metaCol}>
            <LocalClock />
            <button type="button" className={s.quick} onClick={openPalette}>
              {before}
              <kbd>{shortcut}</kbd>
              {after}
            </button>
          </div>
        </div>

        <div className={s.bottom}>
          <p>{fill(t.footer.rights, { year })}</p>
          <p className={s.monoNote} lang="en" dir="ltr">
            <bdi lang="ar">أحمد</bdi> ← A → Ahmed
          </p>
          <a href="#top" className={s.top}>
            <span>{t.footer.backToTop}</span>
            <ArrowUp size={16} strokeWidth={1.8} aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
