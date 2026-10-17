import { useEffect, useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cx } from '../../lib/cx';
import s from './Astrolabe.module.css';

/**
 * A slowly turning armillary sphere drawn in guilloche line-work: the security-print rosette of the
 * badge lifted into three dimensions, and a nod to the astrolabes of Baghdad's House of Wisdom.
 *
 * One canvas, no library. Each ring is a band of sine strands r(θ) = R + A·sin(pθ + 2πk/n) that also
 * undulates out of its own plane, so the rings read as engraved ribbons. The sky rings turn about a
 * polar axis raised to Baghdad's latitude (33.3°) inside a fixed horizon ring. Depth is drawn with line
 * opacity and weight. The rings engrave themselves in on first sight, follow a fine pointer gently,
 * and tilt as the page scrolls. Paused off screen and in background tabs; one still frame under
 * reduced motion.
 */

interface RingSpec {
  R: number; // radius (sphere = 1)
  A: number; // in-plane amplitude
  Z: number; // out-of-plane amplitude
  petals: number;
  strands: number;
  /** Fixed orientation of the ring plane: rotation about X, then about Y (radians). */
  ox: number;
  oy: number;
  /** Turn about its own normal (rad/s) — the pattern flows along the ring. */
  flow: number;
  mint?: boolean;
  weight: number;
  /** Sky rings turn with the sphere; the horizon ring stays put. */
  sky: boolean;
}

const LATITUDE = (33.3 * Math.PI) / 180;
const H = Math.PI / 2;

const RINGS: RingSpec[] = [
  { R: 1.0, A: 0.028, Z: 0.026, petals: 30, strands: 4, ox: H, oy: 0, flow: 0.03, weight: 0.9, sky: false }, // horizon
  { R: 0.94, A: 0.03, Z: 0.03, petals: 26, strands: 4, ox: H, oy: 0, flow: -0.05, weight: 1, sky: true }, // equator
  { R: 0.9, A: 0.03, Z: 0.026, petals: 24, strands: 3, ox: H - 0.409, oy: 0.2, flow: 0.04, weight: 0.85, sky: true }, // ecliptic
  { R: 0.97, A: 0.024, Z: 0.022, petals: 28, strands: 3, ox: 0, oy: 0, flow: 0.025, weight: 0.7, sky: true }, // meridian
  { R: 0.86, A: 0.026, Z: 0.024, petals: 22, strands: 3, ox: 0, oy: H, flow: -0.03, weight: 0.65, sky: true }, // colure
  { R: 0.5, A: 0.045, Z: 0.04, petals: 14, strands: 3, ox: H + 0.62, oy: 0.55, flow: 0.08, mint: true, weight: 0.85, sky: true }, // inner orbit
  { R: 0.2, A: 0.05, Z: 0.02, petals: 9, strands: 5, ox: 0.2, oy: 0, flow: 0.12, weight: 0.8, sky: false }, // the rete
];

/** Beads travelling along rings: [ring index, speed rad/s, phase]. */
const BEADS: [number, number, number][] = [
  [1, 0.22, 0],
  [2, -0.16, 2.1],
  [5, 0.34, 4.2],
];

type Mat = [number, number, number, number, number, number, number, number, number];

const mul = (a: Mat, b: Mat): Mat => [
  a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
  a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
  a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
  a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
  a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
  a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
  a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
  a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
  a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
];
const rotX = (t: number): Mat => [1, 0, 0, 0, Math.cos(t), -Math.sin(t), 0, Math.sin(t), Math.cos(t)];
const rotY = (t: number): Mat => [Math.cos(t), 0, Math.sin(t), 0, 1, 0, -Math.sin(t), 0, Math.cos(t)];
const rotZ = (t: number): Mat => [Math.cos(t), -Math.sin(t), 0, Math.sin(t), Math.cos(t), 0, 0, 0, 1];

/** Points of one ring in its own plane (x, y, z triples), strand after strand. */
function ringPoints(ring: RingSpec, perPetal: number): { pts: Float32Array; perStrand: number } {
  const perStrand = ring.petals * perPetal + 1;
  const pts = new Float32Array(perStrand * ring.strands * 3);
  let o = 0;
  for (let k = 0; k < ring.strands; k++) {
    const phase = (2 * Math.PI * k) / ring.strands;
    for (let i = 0; i < perStrand; i++) {
      const th = (i / (perStrand - 1)) * Math.PI * 2;
      const r = ring.R + ring.A * Math.sin(ring.petals * th + phase);
      pts[o++] = r * Math.cos(th);
      pts[o++] = r * Math.sin(th);
      pts[o++] = ring.Z * Math.cos(ring.petals * th + phase);
    }
  }
  return { pts, perStrand };
}

const BUCKETS = 6;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

interface AstrolabeProps {
  className?: string;
  /** Sphere centre as fractions of the canvas box. */
  cx?: number;
  cy?: number;
  /** Sphere radius as a fraction of the canvas box's smaller side (or of its width with fitWidth). */
  radius?: number;
  fitWidth?: boolean;
  /** Overall line strength, 0–1. */
  strength?: number;
  /**
   * Optional per-frame placement in canvas pixels (centre, radius, and a strength factor). When it
   * returns a value it overrides cx / cy / radius — used to let the sphere travel with the scroll.
   */
  place?: (box: { width: number; height: number; rect: DOMRect; reduced: boolean }) => Placement | null;
}

export interface Placement {
  x: number;
  y: number;
  r: number;
  alpha?: number;
}

export function Astrolabe({ className, cx: centerX = 0.5, cy: centerY = 0.5, radius = 0.46, fitWidth = false, strength = 1, place }: AstrolabeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const placeRef = useRef(place);
  const reduced = useReducedMotion();

  // The frame loop reads the latest placement through a ref, so a new callback never restarts it.
  useLayoutEffect(() => {
    placeRef.current = place;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const small = window.matchMedia('(max-width: 760px)').matches;
    let quality = coarse || small ? 6 : 9; // points per petal
    let geometry = RINGS.map((ring) => ringPoints(ring, quality));

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      if (reduced) draw(performance.now());
    };

    // Pointer (fine pointers only) and scroll steer the view, eased.
    let targetYaw = 0;
    let targetPitch = 0;
    let yaw = 0;
    let pitch = 0;
    let lastX = -1;
    let lastY = -1;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = canvas.getBoundingClientRect();
      const nx = (e.clientX - (r.left + (lastX >= 0 ? lastX : r.width * centerX))) / Math.max(320, window.innerWidth);
      const ny = (e.clientY - (r.top + (lastY >= 0 ? lastY : r.height * centerY))) / Math.max(320, window.innerHeight);
      targetYaw = Math.max(-1, Math.min(1, nx * 2)) * 0.32;
      targetPitch = Math.max(-1, Math.min(1, ny * 2)) * 0.18;
      wake();
    };

    const gold = (a: number) => `rgba(217, 193, 141, ${a.toFixed(3)})`;
    const mint = (a: number) => `rgba(95, 224, 200, ${a.toFixed(3)})`;
    const paths: Path2D[] = [];
    const mintPaths: Path2D[] = [];

    let start = -1;
    let skyAngle = 0.6;
    let lastNow = 0;

    function draw(now: number) {
      if (!ctx) return;
      if (start < 0) start = now;
      const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0;
      lastNow = now;
      const t = reduced ? 30 : (now - start) / 1000;

      const rect = canvas!.getBoundingClientRect();
      const placed = placeRef.current?.({ width, height, rect, reduced }) ?? null;
      const R = placed ? placed.r : (fitWidth ? width : Math.min(width, height)) * radius;
      const ox = placed ? placed.x : width * centerX;
      const oy = placed ? placed.y : height * centerY;
      const s = strength * (placed?.alpha ?? 1);
      lastX = ox;
      lastY = oy;

      // Scroll position of the sphere through the viewport, -1 (below) … 1 (above).
      const vh = window.innerHeight || 1;
      const through = Math.max(-1, Math.min(1, (vh / 2 - (rect.top + oy)) / vh));

      yaw += (targetYaw - yaw) * 0.045;
      pitch += (targetPitch - pitch) * 0.045;
      if (!reduced) skyAngle += dt * 0.07;

      const D = 3.4;
      const f = D - 1;

      // view = camera pitch · slow yaw drift; sky = latitude tilt · daily turn.
      const view = mul(rotX(-0.42 + pitch + through * 0.34), rotY(0.5 + t * 0.045 + yaw));
      const sky = mul(rotZ(H - LATITUDE), rotY(skyAngle));

      for (let b = 0; b < BUCKETS; b++) {
        paths[b] = new Path2D();
        mintPaths[b] = new Path2D();
      }

      const reveal = (i: number) => (reduced ? 1 : easeOut(Math.max(0, Math.min(1, (t - 0.15 - i * 0.16) / 2.3))));

      RINGS.forEach((ring, ri) => {
        const amount = reveal(ri);
        if (amount <= 0) return;
        const { pts, perStrand } = geometry[ri];
        const own = mul(mul(rotY(ring.oy), rotX(ring.ox)), rotZ(t * ring.flow));
        const m = mul(view, ring.sky ? mul(sky, own) : own);
        const limit = Math.max(2, Math.floor(perStrand * amount));
        const target = ring.mint ? mintPaths : paths;
        for (let k = 0; k < ring.strands; k++) {
          let prevX = 0;
          let prevY = 0;
          let prevB = -1;
          const base = k * perStrand * 3;
          for (let i = 0; i < limit; i++) {
            const j = base + i * 3;
            const x = pts[j];
            const y = pts[j + 1];
            const z = pts[j + 2];
            const vx = m[0] * x + m[1] * y + m[2] * z;
            const vy = m[3] * x + m[4] * y + m[5] * z;
            const vz = m[6] * x + m[7] * y + m[8] * z;
            const scale = f / (D - vz);
            const sx = ox + vx * scale * R;
            const sy = oy - vy * scale * R;
            const bucket = Math.min(BUCKETS - 1, Math.max(0, Math.floor(((vz + 1) / 2) * BUCKETS)));
            if (i > 0) {
              const path = target[bucket];
              if (bucket !== prevB) path.moveTo(prevX, prevY);
              path.lineTo(sx, sy);
            }
            prevX = sx;
            prevY = sy;
            prevB = i > 0 ? bucket : -1;
          }
        }
      });

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let b = 0; b < BUCKETS; b++) {
        const depth = (b + 0.5) / BUCKETS; // 0 far … 1 near
        const alpha = (0.1 + 0.62 * depth * depth) * s;
        ctx.lineWidth = 0.55 + depth * 0.75;
        ctx.strokeStyle = gold(alpha);
        ctx.stroke(paths[b]);
        ctx.strokeStyle = mint(alpha * 0.9);
        ctx.stroke(mintPaths[b]);
      }

      // Beads on the rings, and the pin at the centre.
      for (const [ri, speed, phase] of BEADS) {
        const ring = RINGS[ri];
        if (reveal(ri) < 1) continue;
        const own = mul(mul(rotY(ring.oy), rotX(ring.ox)), rotZ(t * ring.flow));
        const m = mul(view, ring.sky ? mul(sky, own) : own);
        const th = phase + t * speed;
        const x = ring.R * Math.cos(th);
        const y = ring.R * Math.sin(th);
        const vx = m[0] * x + m[1] * y;
        const vy = m[3] * x + m[4] * y;
        const vz = m[6] * x + m[7] * y;
        const scale = f / (D - vz);
        const near = (vz + 1) / 2;
        const px = ox + vx * scale * R;
        const py = oy - vy * scale * R;
        const size = (2 + near * 2.6) * Math.max(0.7, R / 380);
        const glow = ctx.createRadialGradient(px, py, 0, px, py, size * 4);
        glow.addColorStop(0, `rgba(239, 230, 204, ${(0.85 * s * (0.35 + near * 0.65)).toFixed(3)})`);
        glow.addColorStop(0.25, mint(0.55 * s * (0.35 + near * 0.65)));
        glow.addColorStop(1, mint(0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      const pulse = reduced ? 1 : 1 + Math.sin(t * 1.4) * 0.08;
      const pin = ctx.createRadialGradient(ox, oy, 0, ox, oy, R * 0.12 * pulse);
      pin.addColorStop(0, gold(0.34 * s * reveal(RINGS.length - 1)));
      pin.addColorStop(1, gold(0));
      ctx.fillStyle = pin;
      ctx.beginPath();
      ctx.arc(ox, oy, R * 0.12 * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // Frame loop: runs only while visible; drops detail if frames are too slow for the device.
    // Phones draw every other frame — at this pace a frame moves the rings by a fraction of a
    // pixel, so 30 fps reads as smooth and halves the battery cost.
    let raf = 0;
    let visible = false;
    let costs = 0;
    let frames = 0;
    let lastDraw = 0;
    const loop = (now: number) => {
      if (coarse && now - lastDraw < 30) {
        raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
        return;
      }
      lastDraw = now;
      const t0 = performance.now();
      draw(now);
      costs += performance.now() - t0;
      if (++frames === 40) {
        if (costs / frames > 7 && quality > 4) {
          quality -= 2;
          geometry = RINGS.map((ring) => ringPoints(ring, quality));
        }
        costs = 0;
        frames = 0;
      }
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    function wake() {
      if (!reduced && visible && !raf && !document.hidden) {
        lastNow = 0;
        raf = requestAnimationFrame(loop);
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (reduced) {
        if (visible) draw(performance.now());
        return;
      }
      if (visible) wake();
    });
    io.observe(canvas);

    const onVisibility = () => wake();
    document.addEventListener('visibilitychange', onVisibility);
    if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [reduced, centerX, centerY, radius, fitWidth, strength]);

  return <canvas ref={canvasRef} className={cx(s.astrolabe, className)} aria-hidden />;
}
