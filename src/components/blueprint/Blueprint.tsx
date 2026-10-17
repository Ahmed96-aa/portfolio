import { useEffect, useId, useMemo, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import { Braces, Database, Globe, LayoutDashboard, MonitorSmartphone, Sparkles, Users, type LucideProps } from 'lucide-react';
import type { Blueprint as Spec, BlueprintEdge, BlueprintNode, NodeKind, Side } from '../../content/projects';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cx } from '../../lib/cx';
import s from './Blueprint.module.css';

/** Grid geometry for the two layouts. The canvas width is fixed per layout so every sketch shares one scale. */
const LAYOUTS = {
  wide: { cols: 4, w: 134, h: 68, gx: 32, gy: 50, pad: 14 },
  tall: { cols: 2, w: 154, h: 64, gx: 34, gy: 44, pad: 12 },
} as const;

const ICONS: Record<NodeKind, ComponentType<LucideProps>> = {
  actor: Users,
  app: MonitorSmartphone,
  api: Braces,
  db: Database,
  ext: Globe,
  out: LayoutDashboard,
  ai: Sparkles,
};

interface Box {
  node: BlueprintNode;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
}

const port = (b: Box, side: Side): Point => {
  if (side === 'l') return { x: b.x, y: b.y + b.h / 2 };
  if (side === 'r') return { x: b.x + b.w, y: b.y + b.h / 2 };
  if (side === 't') return { x: b.x + b.w / 2, y: b.y };
  return { x: b.x + b.w / 2, y: b.y + b.h };
};

const horizontal = (side: Side) => side === 'l' || side === 'r';
const mirrorSide = (side: Side): Side => (side === 'l' ? 'r' : side === 'r' ? 'l' : side);

function autoSides(a: Box, b: Box): [Side, Side] {
  const dx = b.x + b.w / 2 - (a.x + a.w / 2);
  const dy = b.y + b.h / 2 - (a.y + a.h / 2);
  if (Math.abs(dy) < 1) return dx > 0 ? ['r', 'l'] : ['l', 'r'];
  if (Math.abs(dx) < 1) return dy > 0 ? ['b', 't'] : ['t', 'b'];
  return [dx > 0 ? 'r' : 'l', dy > 0 ? 't' : 'b'];
}

/** Orthogonal route between two ports, as a list of corner points. */
function route(p1: Point, s1: Side, p2: Point, s2: Side): Point[] {
  if (horizontal(s1) && horizontal(s2)) {
    const mx = (p1.x + p2.x) / 2;
    return [p1, { x: mx, y: p1.y }, { x: mx, y: p2.y }, p2];
  }
  if (!horizontal(s1) && !horizontal(s2)) {
    const my = (p1.y + p2.y) / 2;
    return [p1, { x: p1.x, y: my }, { x: p2.x, y: my }, p2];
  }
  if (horizontal(s1)) return [p1, { x: p2.x, y: p1.y }, p2];
  return [p1, { x: p1.x, y: p2.y }, p2];
}

/** Polyline with softly rounded corners; collinear points are dropped first. */
function roundedPath(points: Point[], radius = 9): string {
  const pts = points.filter((p, i) => {
    if (i === 0 || i === points.length - 1) return true;
    const a = points[i - 1];
    const b = points[i + 1];
    return !((a.x === p.x && p.x === b.x) || (a.y === p.y && p.y === b.y));
  });
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const next = pts[i + 1];
    const inLen = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const outLen = Math.hypot(next.x - cur.x, next.y - cur.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const a = { x: cur.x - ((cur.x - prev.x) / inLen) * r, y: cur.y - ((cur.y - prev.y) / inLen) * r };
    const b = { x: cur.x + ((next.x - cur.x) / outLen) * r, y: cur.y + ((next.y - cur.y) / outLen) * r };
    d += `L${a.x} ${a.y}Q${cur.x} ${cur.y} ${b.x} ${b.y}`;
  }
  const last = pts[pts.length - 1];
  return `${d}L${last.x} ${last.y}`;
}

const polylineLength = (pts: Point[]) =>
  pts.reduce((sum, p, i) => (i === 0 ? 0 : sum + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y)), 0);

/** Midpoint of the longest segment — where an edge label reads best — or null when it would not fit. */
function labelPoint(pts: Point[], text: string): Point | null {
  let best = { len: -1, p: pts[0], vertical: false };
  for (let i = 1; i < pts.length; i++) {
    const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (len > best.len)
      best = { len, p: { x: (pts[i].x + pts[i - 1].x) / 2, y: (pts[i].y + pts[i - 1].y) / 2 }, vertical: pts[i].x === pts[i - 1].x };
  }
  const needed = best.vertical ? 34 : text.length * 6.6 + 34;
  return best.len >= needed ? best.p : null;
}

interface BlueprintProps {
  spec: Spec;
  title: string;
  className?: string;
}

export function Blueprint({ spec, title, className }: BlueprintProps) {
  const { t, lang, dir } = useLanguage();
  const tall = useMediaQuery('(max-width: 640px)');
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const [live, setLive] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  const layout = tall ? LAYOUTS.tall : LAYOUTS.wide;

  const geometry = useMemo(() => {
    const cell = (n: BlueprintNode) => (tall ? n.tall : n.wide);
    const usedCols = Math.max(...spec.nodes.map((n) => cell(n)[0])) + 1;
    const usedRows = Math.max(...spec.nodes.map((n) => cell(n)[1])) + 1;
    const W = layout.pad * 2 + layout.cols * layout.w + (layout.cols - 1) * layout.gx;
    const usedW = usedCols * layout.w + (usedCols - 1) * layout.gx;
    const offsetX = (W - usedW) / 2;
    const H = layout.pad * 2 + usedRows * layout.h + (usedRows - 1) * layout.gy + 8;
    const rtl = dir === 'rtl';

    const boxes = new Map<string, Box>();
    for (const node of spec.nodes) {
      const [c, r] = cell(node);
      const col = rtl ? usedCols - 1 - c : c;
      boxes.set(node.id, {
        node,
        x: offsetX + col * (layout.w + layout.gx),
        y: layout.pad + 8 + r * (layout.h + layout.gy),
        w: layout.w,
        h: layout.h,
      });
    }

    const edges = spec.edges.map((edge: BlueprintEdge, i) => {
      const a = boxes.get(edge.from)!;
      const b = boxes.get(edge.to)!;
      const override = tall ? edge.tallSides : edge.wideSides;
      const [s1, s2] = override ? (rtl ? [mirrorSide(override[0]), mirrorSide(override[1])] : override) : autoSides(a, b);
      const pts = route(port(a, s1), s1, port(b, s2), s2);
      return {
        key: `${edge.from}-${edge.to}-${i}`,
        edge,
        d: roundedPath(pts),
        length: polylineLength(pts),
        label: edge.label ? labelPoint(pts, edge.label) : null,
      };
    });

    return { W, H, boxes: [...boxes.values()], edges };
  }, [spec, tall, layout, dir]);

  // Draw in when scrolled into view; pause the packet animations while off screen.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLive(true);
        if (entry.isIntersecting) svg.unpauseAnimations?.();
        else svg.pauseAnimations?.();
      },
      { threshold: 0.25 },
    );
    io.observe(svg);
    return () => io.disconnect();
  }, []);

  const description = useMemo(() => {
    const name = (id: string) => spec.nodes.find((n) => n.id === id)?.label[lang] ?? id;
    const flows = spec.edges.map((e) => `${name(e.from)} ${e.twoWay ? '↔' : '→'} ${name(e.to)}`).join('; ');
    const mine = spec.nodes.filter((n) => n.mine).map((n) => n.label[lang]);
    return `${flows}. ${t.work.mine}: ${mine.join(lang === 'ar' ? '، ' : ', ')}.`;
  }, [spec, lang, t.work.mine]);

  const connected = (edgeFrom: string, edgeTo: string) => !focus || focus === edgeFrom || focus === edgeTo;

  return (
    <figure className={cx(s.blueprint, live && s.live, focus && s.focusing, className)}>
      <figcaption className={s.head}>
        <span className={s.title}>
          <span className={s.titleDot} aria-hidden />
          {t.work.sketch} — {title}
        </span>
        <span className={s.legend} aria-hidden>
          <span className={s.legendMine}>{t.work.mine}</span>
          <span className={s.legendFlow}>{t.work.flow}</span>
        </span>
      </figcaption>

      <svg
        ref={svgRef}
        className={s.svg}
        viewBox={`0 0 ${geometry.W} ${geometry.H}`}
        role="img"
        aria-labelledby={`${uid}-t ${uid}-d`}
        onPointerLeave={() => setFocus(null)}
      >
        <title id={`${uid}-t`}>{`${t.work.sketch} — ${title}`}</title>
        <desc id={`${uid}-d`}>{description}</desc>
        <defs>
          <pattern id={`${uid}-minor`} width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0H0V12" fill="none" className={s.gridMinor} />
          </pattern>
          <pattern id={`${uid}-major`} width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill={`url(#${uid}-minor)`} />
            <path d="M60 0H0V60" fill="none" className={s.gridMajor} />
          </pattern>
          <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1.2L9 5L0 8.8z" className={s.arrow} />
          </marker>
        </defs>

        <rect width={geometry.W} height={geometry.H} fill={`url(#${uid}-major)`} />

        <g>
          {geometry.edges.map(({ key, edge, d }, i) => (
            <path
              key={key}
              d={d}
              pathLength={1}
              className={cx(s.edge, !connected(edge.from, edge.to) && s.dim, focus && connected(edge.from, edge.to) && s.hot)}
              markerEnd={`url(#${uid}-arrow)`}
              markerStart={edge.twoWay ? `url(#${uid}-arrow)` : undefined}
              style={{ '--i': i } as CSSProperties}
            />
          ))}
        </g>

        {live && !reduced ? (
          <g className={s.packets}>
            {geometry.edges.map(({ key, edge, d, length }, i) => {
              const dur = `${Math.max(1.6, length / 70).toFixed(2)}s`;
              const begin = `${(0.9 + i * 0.35).toFixed(2)}s`;
              return (
                <g key={key} className={cx(!connected(edge.from, edge.to) && s.dim)}>
                  <circle r="3.2" className={s.packet}>
                    <animateMotion dur={dur} begin={begin} repeatCount="indefinite" path={d} />
                  </circle>
                  {edge.twoWay ? (
                    <circle r="2.6" className={s.packetBack}>
                      <animateMotion
                        dur={dur}
                        begin={`${(0.9 + i * 0.35 + length / 140).toFixed(2)}s`}
                        repeatCount="indefinite"
                        path={d}
                        keyPoints="1;0"
                        keyTimes="0;1"
                        calcMode="linear"
                      />
                    </circle>
                  ) : null}
                </g>
              );
            })}
          </g>
        ) : null}

        {geometry.edges.map(({ key, edge, label }) =>
          label && edge.label ? (
            <g key={`${key}-label`} className={s.edgeLabel} transform={`translate(${label.x} ${label.y})`}>
              <rect x={-(edge.label.length * 3.3 + 8)} y={-8} width={edge.label.length * 6.6 + 16} height={16} rx={8} />
              <text y={3.4} textAnchor="middle">
                {edge.label}
              </text>
            </g>
          ) : null,
        )}

        {geometry.boxes.map((box, i) => {
          const Icon = ICONS[box.node.kind];
          const active = focus === box.node.id;
          return (
            <g
              key={box.node.id}
              className={cx(s.node, s[box.node.kind], box.node.mine && s.mine, active && s.active, focus && !active && s.dimNode)}
              transform={`translate(${box.x} ${box.y})`}
              style={{ '--i': i } as CSSProperties}
              onPointerEnter={() => setFocus(box.node.id)}
              onClick={() => setFocus((f) => (f === box.node.id ? null : box.node.id))}
            >
              <rect className={s.box} width={box.w} height={box.h} rx={11} />
              {box.node.kind === 'db' ? (
                <path className={s.dbLine} d={`M10 13Q${box.w / 2} 21 ${box.w - 10} 13`} fill="none" />
              ) : null}
              <Icon x={box.w / 2 - 7} y={10} width={14} height={14} strokeWidth={1.6} className={s.icon} aria-hidden />
              <text className={s.label} x={box.w / 2} y={39} textAnchor="middle">
                {box.node.label[lang]}
              </text>
              {box.node.sub ? (
                <text className={s.sub} x={box.w / 2} y={54} textAnchor="middle">
                  {box.node.sub[lang]}
                </text>
              ) : null}
              {box.node.mine ? (
                // The "built by me" mark (see the legend): a mint dot in the top end corner, clear of every edge.
                <g className={s.mark} transform={`translate(${dir === 'rtl' ? 11 : box.w - 11} 11)`}>
                  <circle className={s.markHalo} r={6} />
                  <circle r={3.2} />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>

      <p className={s.note}>{t.work.sketchNote}</p>
    </figure>
  );
}
