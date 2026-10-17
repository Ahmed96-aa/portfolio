import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Menu, X } from 'lucide-react';
import { profile } from '../../content/site';
import { useLanguage } from '../../i18n/LanguageProvider';
import { formatIndex } from '../../i18n/format';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useLocalTime } from '../../hooks/useLocalTime';
import { cx } from '../../lib/cx';
import { openPalette, shortcutLabel } from '../../lib/palette';
import { Logo, Monogram } from '../brand/Brand';
import { WhatsAppIcon, TelegramIcon, InstagramIcon } from '../ui/BrandIcons';
import { LanguageToggle } from './LanguageToggle';
import s from './Header.module.css';

export const SECTION_IDS = ['work', 'services', 'process', 'stack', 'about', 'contact'] as const;
const DESKTOP_LINKS = ['work', 'services', 'process', 'stack', 'about'] as const;

export function LocalClock({ className }: { className?: string }) {
  const { t, lang } = useLanguage();
  const { time } = useLocalTime(profile.timeZone, lang);
  return (
    <span className={cx(s.clock, className)}>
      <span className="sr-only">
        {t.a11y.localTime}: {time}
      </span>
      <span className={s.clockDot} aria-hidden />
      <span aria-hidden>{t.time.city}</span>
      <time className="tabular" aria-hidden>
        {time}
      </time>
    </span>
  );
}

export function Header() {
  const { t, lang } = useLanguage();
  const active = useActiveSection(SECTION_IDS);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [shortcut] = useState(shortcutLabel);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    // A gold hairline under the bar measures how far down the page the reader is.
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 16);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current?.style.setProperty('--progress', (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const openMenu = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };
  const closeMenu = () => dialogRef.current?.close();

  return (
    <>
      <header className={cx(s.header, scrolled && s.scrolled)}>
        <span ref={progressRef} className={s.progress} aria-hidden />
        <div className={cx('container', s.bar)}>
          <a href="#top" className={s.brand}>
            <Logo className={s.logo} />
            <Monogram className={s.mono} />
            <span className="sr-only">
              {profile.name[lang]} — {t.a11y.home}
            </span>
          </a>

          <nav aria-label={t.a11y.primaryNav} className={s.nav}>
            <ul>
              {DESKTOP_LINKS.map((id) => (
                <li key={id}>
                  <a href={`#${id}`} aria-current={active === id ? 'true' : undefined}>
                    {t.nav[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={s.actions}>
            <LocalClock className={s.clockWide} />
            <LanguageToggle className={s.lang} />
            <button
              type="button"
              className={s.kbd}
              onClick={openPalette}
              aria-label={`${shortcut} — ${t.a11y.palette}`}
              aria-keyshortcuts="Control+K Meta+K"
            >
              <kbd aria-hidden>{shortcut}</kbd>
            </button>
            <a className={s.cta} href="#contact">
              {t.nav.cta}
            </a>
            <button
              type="button"
              className={s.menuButton}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label={t.a11y.openMenu}
              onClick={openMenu}
            >
              <Menu size={20} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <dialog ref={dialogRef} className={s.menu} aria-label={t.nav.menu} onClose={() => setOpen(false)}>
        <div className={cx('container', s.menuInner)}>
          <div className={s.menuTop}>
            <Logo className={s.menuLogo} label={profile.name[lang]} />
            <div className={s.menuTopActions}>
              <LanguageToggle />
              <button type="button" className={s.menuButton} aria-label={t.a11y.closeMenu} onClick={closeMenu}>
                <X size={20} strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          </div>
          <nav aria-label={t.a11y.primaryNav}>
            <ol className={s.menuList}>
              {SECTION_IDS.map((id, i) => (
                <li key={id} style={{ '--i': i } as CSSProperties}>
                  <a href={`#${id}`} onClick={closeMenu} aria-current={active === id ? 'true' : undefined}>
                    <span className={s.menuIndex}>{formatIndex(i + 1, lang)}</span>
                    <span className={s.menuLabel}>{t.nav[id]}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className={s.menuFoot}>
            <LocalClock />
            <div className={s.menuSocials}>
              {profile.whatsapp ? (
                <a
                  href={`https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(t.contact.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t.contact.whatsapp} ${t.a11y.newTab}`}
                >
                  <WhatsAppIcon size={18} />
                </a>
              ) : null}
              {profile.socials.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.label[lang]} ${t.a11y.newTab}`}
                >
                  {social.id === 'telegram' ? <TelegramIcon size={18} /> : <InstagramIcon size={18} />}
                </a>
              ))}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
