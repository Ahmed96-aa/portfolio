import { useCallback, useEffect, useRef } from 'react';
import { heroStack, profile } from '../../content/site';
import { useLanguage } from '../../i18n/LanguageProvider';
import { localDigits } from '../../i18n/format';
import { useLocalTime } from '../../hooks/useLocalTime';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cx } from '../../lib/cx';
import { ALLOW_MOTION, gsap, REDUCED, useGSAP } from '../../motion/gsap';
import { Astrolabe, type Placement } from '../astrolabe/Astrolabe';
import { Button, ButtonIcon, uiStyles } from '../ui/Button';
import { SplitWords } from '../ui/SplitWords';
import { Badge } from './Badge';
import { CvChoice } from '../ui/CvChoice';
import s from './Hero.module.css';

/** "7+" → { digits: "7", end: 7, rest: "+" }; Arabic-Indic digits are read too. Null for words. */
function splitCount(value: string) {
  const match = /^([0-9٠-٩]+)(.*)$/.exec(value);
  if (!match) return null;
  const end = Number(match[1].replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))));
  return { digits: match[1], end, rest: match[2] };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function Hero() {
  const { t, lang } = useLanguage();
  const { time, isNight } = useLocalTime(profile.timeZone, lang);
  const root = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const stacked = useMediaQuery('(max-width: 1023px)');
  const stackedRef = useRef(stacked);
  useEffect(() => {
    stackedRef.current = stacked;
  }, [stacked]);

  // Stacked layouts (phones, tablets): the instrument starts behind the headline, so the first
  // screen already has it, and descends with the scroll until it frames the badge. Desktop keeps
  // it centred behind the badge (no placement).
  const placeAstrolabe = useCallback(
    ({ width, rect, reduced }: { width: number; rect: DOMRect; reduced: boolean }): Placement | null => {
      if (!stackedRef.current) return null;
      const card = badgeRef.current?.querySelector('figure');
      const title = titleRef.current;
      if (!card || !title) return null;
      const c = card.getBoundingClientRect();
      const h = title.getBoundingClientRect();
      const rtl = document.documentElement.dir === 'rtl';
      const to = { x: c.left + c.width / 2 - rect.left, y: c.top + c.height / 2 - rect.top, r: Math.min(width * 0.64, 380) };
      // Starts half off the end edge, level with the top of the headline, and faint enough to read over.
      const from = { x: width * (rtl ? -0.04 : 1.04), y: h.top - rect.top, r: Math.min(width * 0.7, 380) };
      const cardMiddle = c.top + c.height / 2 + window.scrollY;
      const p = reduced ? 1 : clamp01(window.scrollY / Math.max(1, cardMiddle - window.innerHeight / 2));
      const ey = p * p * (3 - 2 * p);
      const ex = ey * ey; // keeps to the side margin on the way down, centring only as it reaches the badge
      return {
        x: from.x + (to.x - from.x) * ex,
        y: from.y + (to.y - from.y) * ey,
        r: from.r + (to.r - from.r) * ey,
        alpha: 0.4 + 0.6 * ex,
      };
    },
    [],
  );
  const [eyebrowName, eyebrowRole] = t.hero.eyebrow.includes(' — ') ? t.hero.eyebrow.split(' — ') : ['', t.hero.eyebrow];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // The numeric facts count up from zero, in the page's own digits (a change of text, not of
      // place, so it runs under reduced motion too). The text node React rendered is updated in
      // place, so React keeps owning it.
      const countUp = (tl: gsap.core.Timeline, at: number) => {
        const els = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-count]') ?? []);
        els.forEach((el, i) => {
          const node = el.firstChild;
          const end = Number(el.dataset.count);
          if (!node || !Number.isFinite(end)) return;
          const counter = { v: 0 };
          node.nodeValue = localDigits(0, lang);
          tl.to(
            counter,
            {
              v: end,
              duration: 1.8,
              ease: 'power3.out',
              onUpdate: () => {
                node.nodeValue = localDigits(Math.round(counter.v), lang);
              },
            },
            at + i * 0.1,
          );
        });
        return () => {
          els.forEach((el) => {
            if (el.firstChild) el.firstChild.nodeValue = localDigits(el.dataset.count ?? '', lang);
          });
        };
      };

      mm.add(ALLOW_MOTION, () => {
        const tl = gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from('[data-hero="status"]', { opacity: 0, y: 14, duration: 1 }, 0.1)
          .from(
            '[data-split="hero"]',
            { yPercent: 115, rotateX: 38, transformOrigin: '50% 100%', transformPerspective: 700, duration: 1.5, stagger: 0.05 },
            0.2,
          )
          .from('[data-hero="fade"]', { opacity: 0, y: 22, duration: 1.1, stagger: 0.08 }, 0.65)
          .from('[data-hero="fact"]', { opacity: 0, y: 18, duration: 1, stagger: 0.07 }, 0.95)
          .from('[data-hero="bg"]', { opacity: 0, scale: 0.92, duration: 2.4, ease: 'power3.out' }, 0);
        return countUp(tl, 1.05);
      });

      // Reduced motion: the same arrival as fades only.
      mm.add(REDUCED, () => {
        const tl = gsap
          .timeline({ defaults: { ease: 'power1.out' } })
          .from('[data-hero="status"], [data-split="hero"], [data-hero="fade"]', { opacity: 0, duration: 0.9, stagger: 0.04 }, 0.1)
          .from('[data-hero="fact"]', { opacity: 0, duration: 0.8, stagger: 0.06 }, 0.55);
        return countUp(tl, 0.65);
      });
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  );

  return (
    <section id="top" ref={root} className={s.hero} aria-labelledby="hero-title">
      <div className={s.backdrop} aria-hidden>
        <div className={s.grid} />
        <div className={s.glow} data-hero="bg" />
        <div className={s.aurora} />
        <span className={cx(s.coord, s.coordTop)}>33.3152° N · 44.3661° E</span>
        <span className={cx(s.coord, s.coordBottom)}>BGD — IQ / GMT+3</span>
      </div>

      <div className={cx('container', s.inner)}>
        <div className={s.copy}>
          <p className={s.status} data-hero="status">
            {profile.available ? (
              <span className={s.available}>
                <span className={s.dot} aria-hidden />
                {t.hero.status}
              </span>
            ) : null}
            <span className={s.sep} aria-hidden />
            <span className={s.time}>
              {t.time.city} <span className="tabular">{time}</span>
            </span>
            <span className={cx(s.sep, s.sepReply)} aria-hidden />
            <span className={s.reply}>{isNight ? t.time.night : t.time.day}</span>
          </p>

          <p className={cx('label', s.eyebrow)} data-hero="fade">
            {eyebrowName ? <span className={s.eyebrowName}>{eyebrowName} — </span> : null}
            {eyebrowRole}
          </p>

          <h1 id="hero-title" ref={titleRef} className={cx('display', s.title)}>
            <SplitWords text={t.hero.title} data="hero" />
          </h1>

          <p className={s.lead} data-hero="fade">
            {t.hero.lead}
          </p>

          <p className={s.stackLine} dir="ltr" data-hero="fade">
            {heroStack.map((item, i) => (
              <span key={item}>
                {i ? (
                  <i className={s.stackDot} aria-hidden>
                    ·
                  </i>
                ) : null}
                {item}
              </span>
            ))}
          </p>

          <div className={s.ctas} data-hero="fade">
            <Button href="#contact">{t.hero.primary}</Button>
            <Button href="#work" variant="ghost" icon="down" className={s.ghostCta}>
              {t.hero.secondary}
            </Button>
          </div>

          <div className={s.links} data-hero="fade">
            <a className={cx(uiStyles.textLink, s.workLink)} href="#work">
              <ButtonIcon icon="down" size={16} />
              <span>{t.hero.secondary}</span>
            </a>
            <CvChoice className={s.cv} label={t.hero.cv} />
          </div>
        </div>

        <div ref={badgeRef} className={s.badge}>
          <Astrolabe className={s.astrolabe} place={placeAstrolabe} />
          <Badge />
        </div>
      </div>

      <div className={cx('container', s.factsWrap)}>
        <dl className={s.facts} aria-label={t.hero.factsLabel}>
          {t.hero.facts.map((fact) => {
            const count = splitCount(fact.value);
            return (
              <div key={fact.label} className={s.fact} data-hero="fact">
                <dt>{fact.label}</dt>
                <dd>
                  {count ? (
                    <>
                      <span data-count={count.end} className="tabular">
                        {count.digits}
                      </span>
                      {count.rest}
                    </>
                  ) : (
                    fact.value
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
