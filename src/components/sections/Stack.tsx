import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { practices, practicesLabel, stackLayers } from '../../content/stack';
import { useLanguage } from '../../i18n/LanguageProvider';
import { formatIndex } from '../../i18n/format';
import { cx } from '../../lib/cx';
import { ALLOW_MOTION, gsap, useGSAP } from '../../motion/gsap';
import { SectionHead } from '../layout/SectionHead';
import s from './Stack.module.css';

/**
 * The stack as stacked plates: a request drops from the interface through the server to the data
 * and comes back up. The plates open out as the section scrolls in; the layer being read lifts its
 * plate (or the one under a fine pointer). On phones the plates stay pinned above the list.
 */
export function Stack() {
  const { t, lang } = useLanguage();
  const section = t.sections.stack;
  const [hovered, setHovered] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const isoRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const count = stackLayers.length;
  const active = hovered ?? reading;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(ALLOW_MOTION, () => {
        gsap.fromTo(
          isoRef.current,
          { '--gap': '22px', '--rz': '-50deg', '--rx': '62deg' },
          {
            '--gap': '68px',
            '--rz': '-36deg',
            '--rx': '54deg',
            ease: 'none',
            scrollTrigger: { trigger: layoutRef.current, start: 'top 85%', end: 'bottom 65%', scrub: 0.8 },
          },
        );
      });
    },
    { scope: layoutRef },
  );

  // The layer crossing the reading line lifts its plate. The line sits just above the middle of the
  // screen beside the plates, and lower on phones, where the plates are pinned above the list.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const pinned = window.matchMedia('(max-width: 1023px)').matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setReading((entry.target as HTMLElement).dataset.layer ?? null);
        }
      },
      { rootMargin: pinned ? '-58% 0px -34% 0px' : '-42% 0px -52% 0px' },
    );
    list.querySelectorAll('[data-layer]').forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, []);

  const onEnter = (id: string) => (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setHovered(id);
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setHovered(null);
  };

  return (
    <section id="stack" className={cx('section', s.stackSection)} aria-labelledby="stack-title">
      <div className="container">
        <SectionHead headingId="stack-title" index={section.index} label={section.label} title={section.title} intro={section.intro} />

        <div ref={layoutRef} className={s.layout}>
          <div className={s.visual} aria-hidden>
            <div className={s.isoWrap}>
              <div ref={isoRef} className={s.iso}>
                {stackLayers.map((layer, i) => (
                  <div
                    key={layer.id}
                    className={cx(s.plate, active === layer.id && s.plateActive)}
                    style={{ '--z': count - 1 - i } as CSSProperties}
                  >
                    <span className={s.plateLabel}>{layer.title.en}</span>
                    <span className={s.plateIndex}>{formatIndex(i + 1, 'en')}</span>
                  </div>
                ))}
                <span className={s.packet} />
              </div>
            </div>
            <span className={cx(s.flow, s.flowDown)}>↓ {t.stack.request}</span>
            <span className={cx(s.flow, s.flowUp)}>↑ {t.stack.response}</span>
          </div>

          <ol ref={listRef} className={s.layers} data-reveal-stagger>
            {stackLayers.map((layer, i) => (
              <li
                key={layer.id}
                data-layer={layer.id}
                className={cx(s.layer, active === layer.id && s.layerActive)}
                onPointerEnter={onEnter(layer.id)}
                onPointerLeave={onLeave}
                onClick={() => setReading(layer.id)}
              >
                <div className={s.layerHead}>
                  <span className={s.layerIndex}>
                    {t.stack.layer} {formatIndex(i + 1, lang)}
                  </span>
                  <h3 className={cx('display', s.layerTitle)}>{layer.title[lang]}</h3>
                  <p className={s.layerNote}>{layer.note[lang]}</p>
                </div>
                <ul className={s.chips}>
                  {layer.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
            <li className={cx(s.layer, s.practices)}>
              <div className={s.layerHead}>
                <span className={s.layerIndex}>+</span>
                <h3 className={cx('display', s.layerTitle)}>{practicesLabel[lang]}</h3>
              </div>
              <ul className={cx(s.chips, s.chipsSoft)}>
                {practices[lang].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
