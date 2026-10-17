import { useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageProvider';
import { formatIndex } from '../../i18n/format';
import { cx } from '../../lib/cx';
import { ALLOW_MOTION, gsap, ScrollTrigger, useGSAP } from '../../motion/gsap';
import { SectionHead } from '../layout/SectionHead';
import s from './Process.module.css';

/** Five steps on one rail. The rail fills as you scroll, and each step lights up as it is reached. */
export function Process() {
  const { t, lang } = useLanguage();
  const section = t.sections.process;
  const listRef = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;
      const steps = Array.from(list.querySelectorAll<HTMLElement>('[data-step]'));
      const mark = (progress: number) => {
        list.style.setProperty('--p', progress.toFixed(4));
        steps.forEach((step, i) => step.toggleAttribute('data-on', progress >= i / steps.length + 0.02));
      };
      const mm = gsap.matchMedia();
      mm.add(ALLOW_MOTION, () => {
        const st = ScrollTrigger.create({
          trigger: list,
          start: 'top 78%',
          end: 'bottom 55%',
          scrub: true,
          onUpdate: (self) => mark(self.progress),
        });
        mark(st.progress);
        return () => st.kill();
      });
      mm.add('(prefers-reduced-motion: reduce)', () => mark(1));
    },
    { dependencies: [lang], revertOnUpdate: true },
  );

  return (
    <section id="process" className="section" aria-labelledby="process-title">
      <div className="container">
        <SectionHead headingId="process-title" index={section.index} label={section.label} title={section.title} intro={section.intro} />

        <ol ref={listRef} className={s.rail}>
          {t.process.steps.map((step, i) => (
            <li key={step.title} className={s.step} data-step>
              <span className={s.node} aria-hidden>
                <i />
              </span>
              <span className={s.num} aria-hidden>
                {formatIndex(i + 1, lang)}
              </span>
              <h3 className={cx('display', s.title)}>{step.title}</h3>
              <p className={s.body}>{step.body}</p>
              <p className={s.output}>
                <span className={s.outputLabel}>{t.process.output}</span>
                <span>{step.output}</span>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
