'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { offsetWithin } from '@/lib/geometry';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { CapabilityArt } from './CapabilityArt';
import { IMPACT_STAGE, STAGES } from './stages';
import c from './CapabilityMap.module.css';

const N = STAGES.length;
const WAVE = 300;
const HOLD = 5200;

/* The ten capabilities run along one path (1 → 5 across the top, 6 → 10 back along the bottom),
   so the impact wave travels outwards along it from the analyser. */
const IMPACT_ORDER = STAGES.map((_, i) => Math.abs(i - IMPACT_STAGE));
const IMPACT_STEPS = Math.max(...IMPACT_ORDER);

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Smooth dotted connector between consecutive illustrations, running from low on one to high on the next. */
function segment(a: Box, b: Box, i: number): string {
  if (i === 4) {
    // turn down the right-hand side from 5 to 6
    const ay = a.y + a.h * 0.62;
    const by = b.y + b.h * 0.42;
    const x1 = a.x + a.w - 2;
    const x2 = b.x + b.w - 2;
    const bend = Math.max(x1, x2) + 44;
    return `M${x1} ${ay} C${bend} ${ay} ${bend} ${by} ${x2} ${by}`;
  }
  const forward = i < 4;
  const x1 = forward ? a.x + a.w * 0.9 : a.x + a.w * 0.1;
  const x2 = forward ? b.x + b.w * 0.1 : b.x + b.w * 0.9;
  const y1 = a.y + a.h * (forward ? 0.82 : 0.2);
  const y2 = b.y + b.h * (forward ? 0.22 : 0.84);
  const pull = Math.abs(x2 - x1) * 0.55 + 24;
  const dir = forward ? 1 : -1;
  return `M${x1} ${y1} C${x1 + dir * pull} ${y1} ${x2 - dir * pull} ${y2} ${x2} ${y2}`;
}

/**
 * "How it works": the ten connected capabilities as a sequence of line illustrations joined by
 * one path. Selecting a capability opens its description underneath; the Impact analyser sends
 * a wave along the path.
 */
export function CapabilityMap() {
  const [active, setActive] = useState(0);
  const [hits, setHits] = useState(-1); // -1 idle, otherwise the wave front (path distance reached)
  const [path, setPath] = useState<{ w: number; h: number; d: string[] } | null>(null);
  const reduced = usePrefersReducedMotion();
  const gridRef = useRef<HTMLOListElement>(null);
  const artRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const measure = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      setPath(null);
      return;
    }
    const boxes = artRefs.current.map((el) => (el ? offsetWithin(el, grid) : null));
    if (boxes.some((b) => !b)) return;
    const d: string[] = [];
    for (let i = 0; i < N - 1; i++) d.push(segment(boxes[i] as Box, boxes[i + 1] as Box, i));
    setPath({ w: grid.offsetWidth, h: grid.offsetHeight, d });
  }, []);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(measure);
    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === 'undefined') return () => cancelAnimationFrame(id);
    const ro = new ResizeObserver(() => measure());
    ro.observe(grid);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [measure]);

  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
    },
    [],
  );

  const runImpact = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    const step = reduced ? 0 : WAVE;
    setHits(0);
    for (let s = 1; s <= IMPACT_STEPS + 1; s++) {
      timers.current.push(window.setTimeout(() => setHits(s), 200 + s * step));
    }
    timers.current.push(window.setTimeout(() => setHits(-1), 200 + (IMPACT_STEPS + 1) * step + HOLD));
  }, [reduced]);

  const select = (i: number) => {
    setActive(i);
    if (i === IMPACT_STAGE) runImpact();
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      detailRef.current?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    }
  };

  const running = hits >= 0;
  const isHit = (i: number) => running && i !== IMPACT_STAGE && IMPACT_ORDER[i] <= hits;
  const done = hits > IMPACT_STEPS;

  return (
    <div className={c.board}>
      <div className={c.gridWrap}>
        {path && (
          <svg className={c.path} width={path.w} height={path.h} viewBox={`0 0 ${path.w} ${path.h}`} aria-hidden="true">
            {path.d.map((d, i) => (
              <path
                key={i}
                d={d}
                className={[
                  c.seg,
                  i < active ? c.segOn : '',
                  running && (isHit(i) || isHit(i + 1) || i === IMPACT_STAGE || i + 1 === IMPACT_STAGE) ? c.segHot : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </svg>
        )}

        <ol ref={gridRef} className={c.grid}>
          {STAGES.map((st, i) => (
            <li key={st.label} className={`${c.cell} ${c[`p${i}`]}`}>
              <button
                type="button"
                className={[c.tile, i === active ? c.on : '', isHit(i) ? c.hit : '', i === IMPACT_STAGE && running ? c.source : '']
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={i === active}
                aria-controls="capability-detail"
                aria-label={st.aria}
                onClick={() => select(i)}
              >
                <div ref={(el) => void (artRefs.current[i] = el)} className={c.artBox}>
                  <span className={c.glow} aria-hidden="true" />
                  <span className={c.badge} aria-hidden="true">
                    {i + 1}
                  </span>
                  <CapabilityArt index={i} />
                </div>
                <span className={c.label}>{st.label}</span>
                <span className={c.sub}>{st.sub}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div ref={detailRef} id="capability-detail" className={c.detail}>
        {STAGES.map((st, i) => (
          <div key={st.label} className={c.detailInner} hidden={i !== active}>
            <div className={c.detailHead}>
              <span className={c.detailNum} aria-hidden="true">
                {i + 1}
              </span>
              <h3>{st.title}</h3>
            </div>
            <div className={c.detailBody}>
              <p>{st.body}</p>
              <Link href={st.href} className="link-arrow">
                {st.cta}
                <Icon name="arrowRight" size={15} strokeWidth={2} />
              </Link>
            </div>
          </div>
        ))}
        <div className={`${c.summary} ${done ? c.summaryOn : ''}`}>
          <span className={c.summaryMark} aria-hidden="true" />
          <p>
            § 4.2 changed · 1 draft, 3 linked items, 1 procedure, 1 workflow, 2 reviews, 1 risk rating and 1 report flagged · owners
            notified · nothing missed
          </p>
        </div>
      </div>
    </div>
  );
}
