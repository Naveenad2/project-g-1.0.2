'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Showcase } from '@/components/ui/Showcase';
import { useInView, useMediaQuery, usePrefersReducedMotion } from '@/lib/hooks';
import f from './FeatureTabs.module.css';

export interface FeatureTab {
  label: string;
  title: string;
  pain: string;
  body: ReactNode;
  bullets: string[];
  visual: ReactNode;
  caption?: string;
}

const DWELL = 9000;
const PROBLEM_PREFIX = 'The problem:';

/**
 * Four capabilities as an auto-advancing list beside one live demo. On narrow screens the demo
 * moves directly under the open item (CSS order), so there is one render of each demo.
 */
export function FeatureTabs({ items }: { items: FeatureTab[] }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hold, setHold] = useState(false);
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  // On narrow and touch screens the demo sits under the open item, so advancing would move content
  // while someone reads; there the list only changes when tapped.
  const compact = useMediaQuery('(max-width: 1023px), (hover: none)');
  const playing = auto && !hold && inView && !reduced && !compact;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % items.length), DWELL);
    return () => window.clearTimeout(id);
  }, [playing, active, items.length]);

  return (
    <div
      ref={ref}
      className={f.tabs}
      data-playing={playing ? '' : undefined}
      style={{ '--stage-order': active * 2 + 1 } as CSSProperties}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHold(true)}
      onPointerLeave={() => setHold(false)}
    >
      {items.map((it, i) => {
        const open = i === active;
        const pain = it.pain.startsWith(PROBLEM_PREFIX) ? it.pain.slice(PROBLEM_PREFIX.length).trim() : it.pain;
        return (
          <article key={it.label} className={`${f.item} ${open ? f.open : ''}`} style={{ order: i * 2 }}>
            <h3 className={f.head}>
              <button
                type="button"
                id={`ft-tab-${i}`}
                aria-expanded={open}
                aria-controls={`ft-panel-${i}`}
                className={f.trigger}
                onClick={() => {
                  setActive(i);
                  setAuto(false);
                }}
              >
                <span className={f.meta}>
                  <span className={f.num}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={f.label}>{it.label}</span>
                </span>
                <span className={f.title}>{it.title}</span>
                <span className={f.timer} aria-hidden="true" key={open ? `t${active}` : undefined} />
              </button>
            </h3>
            <div id={`ft-panel-${i}`} role="region" aria-labelledby={`ft-tab-${i}`} className={f.panel} inert={!open}>
              <div className={f.panelInner}>
                <p className={f.pain}>
                  {it.pain.startsWith(PROBLEM_PREFIX) && <span className={f.painKey}>{PROBLEM_PREFIX}</span>} {pain}
                </p>
                <div className={f.body}>{it.body}</div>
                <ul className={`checklist ${f.bullets}`}>
                  {it.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        );
      })}

      <div className={f.stage}>
        {items.map((it, i) => (
          <figure key={it.label} className={f.figure} hidden={i !== active}>
            <Showcase>{it.visual}</Showcase>
            {it.caption && <figcaption className="caption">{it.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </div>
  );
}
