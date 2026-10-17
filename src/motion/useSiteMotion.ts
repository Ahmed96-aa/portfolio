import { useEffect } from 'react';
import { ALLOW_MOTION, gsap, motion, REDUCED, ScrollTrigger, useGSAP } from './gsap';

/**
 * Declarative scroll motion for the whole page, driven by data attributes:
 *  data-reveal            fade + rise when entering the viewport
 *  data-reveal-stagger    the same for each direct child, in sequence
 *  data-title             a heading whose split words turn up into place, in sequence
 *  data-rule              a hairline that draws in from the inline start
 *  .accent                gold accent words catch a single sweep of light when they arrive
 * Under reduced motion nothing moves, but the page still arrives: fades only, and the light.
 */
export function useSiteMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    const once = (trigger: Element, start = 'top 86%') => ({ trigger, start, once: true });
    // Reveals hand the element back to its own styles when done, so hover tilts and
    // CSS transforms are not shadowed by a finished tween.
    // Opacity only, never autoAlpha: autoAlpha sets visibility:hidden until the element scrolls in,
    // which takes every link, button and form field below the fold out of the Tab order and hides
    // the text from screen readers. Tabbing to an element scrolls it in, and that plays its reveal.
    const done = 'transform,opacity';
    const lightAccents = () => {
      gsap.utils.toArray<HTMLElement>('.accent').forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: 'top 84%', once: true, onEnter: () => el.classList.add('is-lit') });
      });
      return () => {
        document.querySelectorAll('.accent.is-lit').forEach((el) => el.classList.remove('is-lit'));
      };
    };

    mm.add(ALLOW_MOTION, () => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, { opacity: 0, y: 34, duration: motion.mid, ease: motion.ease, clearProps: done, scrollTrigger: once(el) });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((el) => {
        gsap.from(el.children, {
          opacity: 0,
          y: 28,
          duration: motion.mid,
          ease: motion.ease,
          stagger: 0.08,
          clearProps: done,
          scrollTrigger: once(el),
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-title]').forEach((el) => {
        gsap.from(el.querySelectorAll('.split-inner'), {
          yPercent: 112,
          rotateX: 38,
          transformOrigin: '50% 100%',
          transformPerspective: 700,
          duration: 1.35,
          ease: motion.ease,
          stagger: 0.04,
          scrollTrigger: once(el, 'top 88%'),
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-rule]').forEach((el) => {
        gsap.from(el, { scaleX: 0, duration: motion.slow, ease: motion.easeInOut, scrollTrigger: once(el, 'top 92%') });
      });

      return lightAccents();
    });

    mm.add(REDUCED, () => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, { opacity: 0, duration: 0.8, ease: 'power1.out', clearProps: done, scrollTrigger: once(el) });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((el) => {
        gsap.from(el.children, { opacity: 0, duration: 0.8, ease: 'power1.out', stagger: 0.06, clearProps: done, scrollTrigger: once(el) });
      });
      gsap.utils.toArray<HTMLElement>('[data-title]').forEach((el) => {
        gsap.from(el.querySelectorAll('.split-inner'), {
          opacity: 0,
          duration: 0.9,
          ease: 'power1.out',
          stagger: 0.05,
          scrollTrigger: once(el, 'top 88%'),
        });
      });
      return lightAccents();
    });
  });

  // Layout changes (language/direction switch, late-loading fonts) need trigger positions recomputed.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('languagechange-applied', refresh);
    document.fonts?.addEventListener('loadingdone', refresh);
    void document.fonts?.ready.then(refresh);
    return () => {
      window.removeEventListener('languagechange-applied', refresh);
      document.fonts?.removeEventListener('loadingdone', refresh);
    };
  }, []);
}
