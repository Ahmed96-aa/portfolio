import { useEffect } from 'react';
import { gsap, REDUCED } from './gsap';

/**
 * A guilloche tile — sine strands crossing like the line-work of a banknote — used as a mask by
 * the "engraving under the light" layers (.uv). Built once at runtime, so it costs no bundle bytes
 * beyond this function.
 */
function guillocheTile(): string {
  const w = 240;
  const h = 64;
  let d = '';
  for (let j = 0; j < 6; j++) {
    const phase = (j * Math.PI) / 3;
    for (let x = 0; x <= w; x += 4) {
      const y = h / 2 + (h / 2 - 3) * Math.sin((x / w) * Math.PI * 4 + phase);
      d += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(2)}`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${d}" fill="none" stroke="#000" stroke-width="0.7"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * Light and depth for marked surfaces, page-wide, by delegation:
 *  data-spot          a soft light follows a fine pointer across the surface (CSS vars --sx, --sy,
 *                     --spot); on touch screens the light rides the middle of the viewport while
 *                     the page scrolls, so phones get the same moment.
 *  data-tilt="6"      the surface leans toward a fine pointer in 3D (max degrees); on touch screens
 *                     it settles flat as it scrolls toward the middle of the viewport.
 * Under reduced motion the light stays (nothing moves), the lean does not.
 */
export function useDepth() {
  useEffect(() => {
    document.documentElement.style.setProperty('--guilloche-tile', guillocheTile());
    const still = window.matchMedia(REDUCED).matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const tilters = new WeakMap<HTMLElement, { x: gsap.QuickToFunc; y: gsap.QuickToFunc }>();
    const tilter = (el: HTMLElement) => {
      let t = tilters.get(el);
      if (!t) {
        gsap.set(el, { transformPerspective: 1100 });
        t = {
          x: gsap.quickTo(el, 'rotationX', { duration: 0.9, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'rotationY', { duration: 0.9, ease: 'power3.out' }),
        };
        tilters.set(el, t);
      }
      return t;
    };
    const maxTilt = (el: HTMLElement) => Number(el.dataset.tilt) || 5;

    if (fine) {
      let spotEl: HTMLElement | null = null;
      let tiltEl: HTMLElement | null = null;
      let pending: PointerEvent | null = null;
      let raf = 0;

      const apply = () => {
        raf = 0;
        const e = pending;
        if (!e) return;
        const target = e.target instanceof Element ? e.target : null;
        const nextSpot = target?.closest<HTMLElement>('[data-spot]') ?? null;
        const nextTilt = target?.closest<HTMLElement>('[data-tilt]') ?? null;

        if (spotEl && spotEl !== nextSpot) spotEl.style.setProperty('--spot', '0');
        spotEl = nextSpot;
        if (spotEl) {
          const r = spotEl.getBoundingClientRect();
          spotEl.style.setProperty('--sx', `${(e.clientX - r.left).toFixed(1)}px`);
          spotEl.style.setProperty('--sy', `${(e.clientY - r.top).toFixed(1)}px`);
          spotEl.style.setProperty('--spot', '1');
        }

        if (still) return;
        if (tiltEl && tiltEl !== nextTilt) {
          const t = tilter(tiltEl);
          t.x(0);
          t.y(0);
        }
        tiltEl = nextTilt;
        if (tiltEl) {
          const r = tiltEl.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          const m = maxTilt(tiltEl);
          const t = tilter(tiltEl);
          t.x(-py * m * 2);
          t.y(px * m * 2);
        }
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        pending = e;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      const onLeaveWindow = () => {
        spotEl?.style.setProperty('--spot', '0');
        if (tiltEl) {
          const t = tilter(tiltEl);
          t.x(0);
          t.y(0);
        }
        spotEl = null;
        tiltEl = null;
      };

      document.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeaveWindow);
      return () => {
        cancelAnimationFrame(raf);
        document.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onLeaveWindow);
      };
    }

    // Touch screens: the light and the lean follow the scroll.
    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(el);
        else {
          visible.delete(el);
          el.style.setProperty('--spot', '0');
        }
      }
      schedule();
    });
    const observe = () => {
      io.disconnect();
      visible.clear();
      document.querySelectorAll<HTMLElement>('[data-spot], [data-tilt]').forEach((el) => io.observe(el));
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      for (const el of visible) {
        const r = el.getBoundingClientRect();
        // -1 below the middle of the screen … 0 centred … 1 above.
        const d = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)));
        if (el.hasAttribute('data-spot')) {
          el.style.setProperty('--sx', `${(r.width * (0.5 - d * 0.18)).toFixed(1)}px`);
          el.style.setProperty('--sy', `${(vh / 2 - r.top).toFixed(1)}px`);
          el.style.setProperty('--spot', (0.85 * (1 - Math.abs(d))).toFixed(3));
        }
        if (!still && el.hasAttribute('data-tilt')) {
          const t = tilter(el);
          t.x(-d * maxTilt(el) * 1.2);
          t.y(0);
        }
      }
    };
    function schedule() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    observe();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('languagechange-applied', observe);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('languagechange-applied', observe);
    };
  }, []);
}
