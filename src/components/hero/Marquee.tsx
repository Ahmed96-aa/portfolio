import { useRef } from 'react';
import { marquee } from '../../content/site';
import { useLanguage } from '../../i18n/LanguageProvider';
import { ALLOW_MOTION, gsap, ScrollTrigger, useGSAP } from '../../motion/gsap';
import s from './Marquee.module.css';

/**
 * A slow band of the stack. It quickens with the speed of the scroll and eases back to its own
 * pace, and slows almost to a stop under a fine pointer. Read once by screen readers; the
 * duplicate only closes the loop.
 */
export function Marquee() {
  const { t } = useLanguage();
  const band = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(ALLOW_MOTION, () => {
        const loop = gsap.to(track.current, { xPercent: -50, duration: 46, ease: 'none', repeat: -1 });
        let boost = 0;
        let hold = 1;
        const st = ScrollTrigger.create({
          onUpdate: (self) => {
            boost = Math.min(Math.abs(self.getVelocity()) / 420, 5);
          },
        });
        const tick = () => {
          boost *= 0.94;
          const target = (1 + boost) * hold;
          loop.timeScale(loop.timeScale() + (target - loop.timeScale()) * 0.08);
        };
        gsap.ticker.add(tick);
        const el = band.current;
        const slow = (e: PointerEvent) => {
          if (e.pointerType === 'mouse') hold = 0.12;
        };
        const resume = () => {
          hold = 1;
        };
        el?.addEventListener('pointerenter', slow);
        el?.addEventListener('pointerleave', resume);
        return () => {
          gsap.ticker.remove(tick);
          st.kill();
          el?.removeEventListener('pointerenter', slow);
          el?.removeEventListener('pointerleave', resume);
        };
      });
    },
    { scope: band },
  );

  const list = (hidden: boolean) => (
    <ul className={s.list} aria-hidden={hidden || undefined} aria-label={hidden ? undefined : t.marquee}>
      {marquee.map((item) => (
        <li key={item}>
          <span>{item}</span>
          <i aria-hidden />
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={band} className={s.band} dir="ltr">
      <div ref={track} className={s.track}>
        {list(false)}
        {list(true)}
      </div>
    </div>
  );
}
