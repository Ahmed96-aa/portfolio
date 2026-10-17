import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Shared motion vocabulary — every scripted animation uses these. */
export const motion = {
  ease: 'expo.out',
  easeInOut: 'power3.inOut',
  fast: 0.45,
  mid: 0.9,
  slow: 1.3,
  stagger: 0.06,
} as const;

export const REDUCED = '(prefers-reduced-motion: reduce)';
export const ALLOW_MOTION = '(prefers-reduced-motion: no-preference)';

export { gsap, ScrollTrigger, useGSAP };
