import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import portrait from '../../assets/portrait.webp';
import { profile } from '../../content/site';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cx } from '../../lib/cx';
import { Guilloche, Monogram } from '../brand/Brand';
import { ButtonIcon } from '../ui/Button';
import s from './Badge.module.css';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * The hero's signature piece: a developer access badge hanging from a lanyard.
 * It is a real (if simple) pendulum — drag it to swing it, brush past it to nudge it,
 * click or tap to flip it to its credential.json. Static under reduced motion.
 */
export function Badge() {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
  const stacked = useMediaQuery('(max-width: 1023px)');
  const coarse = useMediaQuery('(pointer: coarse)');
  const stageRef = useRef<HTMLDivElement>(null);
  const swingRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const lanyardRef = useRef(420);
  const [flipped, setFlipped] = useState(false);
  const [lanyard, setLanyard] = useState(420);
  const [visible, setVisible] = useState(9999);
  // Kept in state, not added with classList: React rewrites className when `stacked` flips (zooming
  // across 1024 px), which would drop the class and freeze the drop animation on its first frame.
  const [inView, setInView] = useState(false);

  // On wide screens the lanyard reaches past the top of the page; when stacked it is a short strap.
  useLayoutEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const hero = stage?.closest('section');
      if (!stage || !hero) return;
      const offset = stage.getBoundingClientRect().top - hero.getBoundingClientRect().top;
      const reach = stacked ? 96 : offset + 120;
      const length = Math.round(clamp(reach, 80, 900));
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 76;
      lanyardRef.current = length;
      setLanyard(length);
      // The strap shows only below the header, so it never crosses the navigation.
      setVisible(stacked ? 9999 : Math.max(40, Math.round(offset - header - 6)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [stacked]);

  useEffect(() => {
    const stage = stageRef.current;
    const swing = swingRef.current;
    const card = cardRef.current;
    const tilt = tiltRef.current;
    if (!stage || !swing || !card || !tilt) return;

    if (reduced) {
      swing.style.transform = '';
      const onClick = (e: MouseEvent) => {
        if (!(e.target as Element).closest('a, button')) setFlipped((f) => !f);
      };
      card.addEventListener('click', onClick);
      return () => card.removeEventListener('click', onClick);
    }

    let theta = 0; // the entrance swing (0.2 rad) starts when the badge first comes into view
    let omega = 0;
    let rx = 0;
    let ry = 0;
    let targetRx = 0;
    let targetRy = 0;
    let raf = 0;
    let last = performance.now();
    let hovering = false;
    let lastPointerX: number | null = null;

    const drag = { active: false, moved: false, id: -1, x: 0, y: 0, t: 0, startAngle: 0, startTheta: 0, prev: 0, prevT: 0 };

    const pivot = () => {
      const r = stage.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top - lanyardRef.current };
    };
    const pointerAngle = (x: number, y: number) => {
      const p = pivot();
      return -Math.atan2(x - p.x, Math.max(1, y - p.y));
    };

    const frame = (now: number) => {
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;

      if (!drag.active) {
        const length = lanyardRef.current + card.offsetHeight / 2;
        const g = 9300 / length;
        const steps = 4;
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          omega += (-g * Math.sin(theta) - 1.15 * omega) * h;
          theta += omega * h;
        }
      }

      rx += (targetRx - rx) * 0.14;
      ry += (targetRy - ry) * 0.14;

      swing.style.transform = `rotate(${theta.toFixed(5)}rad)`;
      tilt.style.setProperty('--rx', `${rx.toFixed(3)}deg`);
      tilt.style.setProperty('--ry', `${ry.toFixed(3)}deg`);

      const resting =
        !drag.active &&
        !hovering &&
        Math.abs(theta) < 0.0005 &&
        Math.abs(omega) < 0.0005 &&
        Math.abs(targetRx - rx) < 0.01 &&
        Math.abs(targetRy - ry) < 0.01;
      if (resting) {
        theta = 0;
        omega = 0;
        rx = targetRx;
        ry = targetRy;
        swing.style.transform = 'rotate(0rad)';
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const setSheen = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const px = clamp((e.clientX - r.left) / r.width, 0, 1);
      const py = clamp((e.clientY - r.top) / r.height, 0, 1);
      targetRy = (px - 0.5) * 18;
      targetRx = -(py - 0.5) * 14;
      tilt.style.setProperty('--px', `${(px * 100).toFixed(1)}%`);
      tilt.style.setProperty('--py', `${(py * 100).toFixed(1)}%`);
      tilt.style.setProperty('--holo', `${Math.round(px * 220 + py * 140)}deg`);
    };

    const onEnter = () => {
      hovering = true;
      lastPointerX = null;
      wake();
    };
    const onLeave = () => {
      hovering = false;
      targetRx = 0;
      targetRy = 0;
      lastPointerX = null;
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (drag.active && e.pointerId === drag.id) {
        if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) drag.moved = true;
        if (drag.moved) {
          const now = performance.now();
          const next = clamp(drag.startTheta + (pointerAngle(e.clientX, e.clientY) - drag.startAngle), -0.75, 0.75);
          const dtv = Math.max(0.008, (now - drag.prevT) / 1000);
          omega = omega * 0.6 + ((next - drag.prev) / dtv) * 0.4;
          drag.prev = next;
          drag.prevT = now;
          theta = next;
        }
      } else if (e.pointerType === 'mouse') {
        // Brushing past the card gives it a small push.
        if (lastPointerX !== null) omega = clamp(omega - (e.clientX - lastPointerX) * 0.0035, -2.2, 2.2);
        lastPointerX = e.clientX;
      }
      if (e.pointerType === 'mouse' || drag.active) setSheen(e);
      wake();
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest('a, button')) return;
      drag.active = true;
      drag.moved = false;
      drag.id = e.pointerId;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.t = performance.now();
      drag.startAngle = pointerAngle(e.clientX, e.clientY);
      drag.startTheta = theta;
      drag.prev = theta;
      drag.prevT = drag.t;
      card.setPointerCapture(e.pointerId);
      wake();
    };
    const onUp = (e: PointerEvent) => {
      if (!drag.active || e.pointerId !== drag.id) return;
      const isTap = !drag.moved && performance.now() - drag.t < 450;
      drag.active = false;
      omega = clamp(omega, -3, 3);
      if (card.hasPointerCapture(e.pointerId)) card.releasePointerCapture(e.pointerId);
      if (e.pointerType !== 'mouse') {
        targetRx = 0;
        targetRy = 0;
        if (touch) onScroll();
      }
      if (isTap && e.type === 'pointerup') setFlipped((f) => !f);
      wake();
    };

    // Without a hovering pointer the badge still catches the light: it tips and sways a little
    // with the scroll, and the sheen and foil move with it.
    const touch = window.matchMedia('(hover: none)').matches;
    const onScroll = () => {
      if (drag.active) return;
      const r = card.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (r.bottom < -vh || r.top > 2 * vh) return; // far off screen: nothing to light
      const d = clamp((vh / 2 - (r.top + r.height / 2)) / vh, -1, 1);
      targetRx = d * 11;
      targetRy = Math.sin((window.scrollY / vh) * 2.4) * 8;
      tilt.style.setProperty('--px', `${(50 + targetRy * 4).toFixed(1)}%`);
      tilt.style.setProperty('--py', `${(46 - d * 42).toFixed(1)}%`);
      tilt.style.setProperty('--holo', `${Math.round(200 + d * 150 + targetRy * 10)}deg`);
      wake();
    };

    // The entrance (drop + swing) waits until the badge is first in view — on phones it sits
    // below the fold, and would otherwise finish unseen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setInView(true);
        omega = 0;
        theta = 0.2;
        wake();
      },
      { threshold: 0.2 },
    );
    io.observe(stage);

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointerleave', onLeave);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerdown', onDown);
    card.addEventListener('pointerup', onUp);
    card.addEventListener('pointercancel', onUp);
    if (touch) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointerleave', onLeave);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerdown', onDown);
      card.removeEventListener('pointerup', onUp);
      card.removeEventListener('pointercancel', onUp);
    };
  }, [reduced]);

  const strap = 'AHMED ABBAS ASHOUR · أحمد عباس عاشور · FULL-STACK · ';

  return (
    <div className={s.wrap}>
      <div
        ref={stageRef}
        className={cx(s.stage, stacked && s.stacked, (inView || reduced) && s.inView)}
        style={{ '--lanyard': `${lanyard}px`, '--lanyard-visible': `${visible}px` } as CSSProperties}
      >
        <div className={s.drop}>
          <div ref={swingRef} className={s.swing}>
            <div className={s.lanyard} aria-hidden>
              <span>{strap.repeat(8)}</span>
            </div>
            <div className={s.clip} aria-hidden>
              <i />
            </div>

            <figure ref={cardRef} className={s.card} aria-label={t.badge.label}>
              <div ref={tiltRef} className={s.tilt}>
                <div className={cx(s.flipper, flipped && s.flipped)}>
                  {/* Front */}
                  <div className={cx(s.face, s.front)} inert={flipped}>
                    <Guilloche className={s.watermark} />
                    <span className={s.slot} aria-hidden />
                    <div className={s.top}>
                      <Monogram className={s.mono} />
                      <span className={s.access}>{t.badge.access}</span>
                    </div>
                    <div className={s.photoWrap}>
                      <Guilloche className={s.photoRing} spin />
                      <div className={s.photo}>
                        <img src={portrait} alt={profile.name[lang]} width={840} height={1120} fetchPriority="high" />
                      </div>
                    </div>
                    <figcaption className={s.names}>
                      <span className={s.nameEn} lang="en" dir="ltr">
                        Ahmed Abbas Ashour
                      </span>
                      <span className={s.nameAr} lang="ar" dir="rtl">
                        أحمد عباس عاشور
                      </span>
                      <span className={s.role}>{t.badge.role}</span>
                    </figcaption>
                    <dl className={s.fields}>
                      {t.badge.fields.map((field) => (
                        <div key={field.k}>
                          <dt>{field.k}</dt>
                          <dd>{field.v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className={s.bottom} aria-hidden>
                      <p className={s.mrz}>
                        <span>ID&lt;IRQ&lt;ASHOUR&lt;&lt;AHMED&lt;ABBAS&lt;&lt;&lt;&lt;&lt;</span>
                        <span>FULLSTACK&lt;CSHARP&lt;DOTNET&lt;REACT&lt;SQL</span>
                      </p>
                      <span className={s.seal}>
                        <ShieldCheck size={18} strokeWidth={1.6} />
                      </span>
                    </div>
                    <span className={s.sheen} aria-hidden />
                  </div>

                  {/* Back */}
                  <div className={cx(s.face, s.back)} inert={!flipped}>
                    <Guilloche className={s.watermarkBack} />
                    <span className={s.slot} aria-hidden />
                    <div className={s.top}>
                      <Monogram className={s.mono} />
                      <span className={s.access}>{t.badge.backTitle}</span>
                    </div>
                    <pre className={s.code} dir="ltr">
                      <code>
                        <span className={s.p}>{'{'}</span>
                        {'\n  '}
                        <span className={s.k}>"name"</span>: <span className={s.v}>"Ahmed Abbas Ashour"</span>,{'\n  '}
                        <span className={s.k}>"name_ar"</span>: <span className={s.v}>"أحمد عباس عاشور"</span>,{'\n  '}
                        <span className={s.k}>"role"</span>: [<span className={s.v}>"full-stack"</span>, <span className={s.v}>"tech-lead"</span>],
                        {'\n  '}
                        <span className={s.k}>"base"</span>: <span className={s.v}>"Baghdad, IQ"</span>,{'\n  '}
                        <span className={s.k}>"core"</span>: [<span className={s.v}>"C#"</span>, <span className={s.v}>".NET"</span>,{' '}
                        <span className={s.v}>"React"</span>, <span className={s.v}>"SQL"</span>],{'\n  '}
                        <span className={s.k}>"degree"</span>: <span className={s.v}>"BSc CS · Data Security"</span>,{'\n  '}
                        <span className={s.k}>"available"</span>: <span className={s.b}>{String(profile.available)}</span>
                        {'\n'}
                        <span className={s.p}>{'}'}</span>
                      </code>
                    </pre>
                    <p className={s.backNote}>{t.badge.backNote}</p>
                    <a className={s.backCta} href="#contact">
                      <span>{t.badge.backCta}</span>
                      <ButtonIcon icon="arrow" size={16} />
                    </a>
                    <span className={s.sheen} aria-hidden />
                  </div>
                </div>
              </div>
            </figure>
          </div>
        </div>
      </div>

      <button type="button" className={s.hint} aria-pressed={flipped} onClick={() => setFlipped((f) => !f)}>
        <RefreshCw size={13} strokeWidth={1.8} aria-hidden />
        <span className="sr-only">{t.badge.flip}</span>
        <span aria-hidden>{coarse || reduced ? t.badge.hintTouch : t.badge.hint}</span>
      </button>
    </div>
  );
}
