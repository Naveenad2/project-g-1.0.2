'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Status } from '@/components/ui/Status';
import { offsetWithin } from '@/lib/geometry';
import { useInView, useSequence } from '@/lib/hooks';
import { Cursor } from './Cursor';
import d from './demos.module.css';
import p from './ProofDemo.module.css';

/**
 * The auditor's questions, answered one click each: coverage per regulator, the approval trail, the
 * acknowledgement record, and finally what a change to § 4.2 would touch.
 * Stages: 1 point at a tab, 2 click it, 3–4 the next tab, 5–6 the last, 7 the impact strip.
 */
const TIMES = [700, 1300, 3800, 4400, 6900, 7500, 9600] as const;

const TABS = ['Coverage', 'Approval trail', 'Acknowledgement record'] as const;

const REGS = [
  { reg: 'CBUAE', value: 86, n: '12 / 14', color: 'var(--success)' },
  { reg: 'RBI', value: 100, n: '9 / 9', color: 'var(--accent)' },
  { reg: 'SAMA', value: 100, n: '6 / 6', color: 'var(--primary)' },
];

const TRAIL = [
  { step: 'Author', date: '10 Apr 2026' },
  { step: 'Review', date: '22 May 2026' },
  { step: 'Approval', date: '15 Jun 2026' },
];

export function ProofDemo() {
  const [viewRef, inView] = useInView<HTMLDivElement>(0.35);
  const { stage: P } = useSequence(TIMES, { active: inView, loopAfter: 15000 });
  const cardRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const tab = P >= 6 ? 2 : P >= 4 ? 1 : 0;
  const pointing = P >= 1 && P <= 6 ? Math.floor((P - 1) / 2) : -1;

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      const card = cardRef.current;
      const target = pointing >= 0 ? tabRefs.current[pointing] : null;
      if (!card || !target) {
        setCursor(null);
        return;
      }
      // Layout offsets rather than client rects, so the pointer lines up while the card is animating in.
      const o = offsetWithin(target, card);
      setCursor({ x: o.x + Math.min(o.w - 18, 64), y: o.y + o.h / 2 - 4 });
    });
    return () => cancelAnimationFrame(id);
  }, [pointing]);

  const on = (b: boolean) => (b ? p.on : '');

  return (
    <div ref={viewRef}>
      <div ref={cardRef} className={`frame ${p.proof}`}>
        <div className={d.top}>
          <span className={d.topTitle}>AML-POL-0115</span>
          <Status tone="success">Published</Status>
          <span className={d.topMeta} style={{ marginLeft: 'auto' }}>
            Version 2.2
          </span>
        </div>

        <div className={p.body}>
          <div className={p.tabs} role="presentation">
            {TABS.map((t, i) => (
              <span key={t} ref={(el) => void (tabRefs.current[i] = el)} className={`${p.tab} ${i === tab ? p.tabOn : ''}`}>
                {t}
              </span>
            ))}
          </div>

          <div className={p.panes}>
            <div className={`${p.pane} ${on(tab === 0)}`}>
              {REGS.map((r) => (
                <div key={r.reg} className={p.row}>
                  <b>{r.reg}</b>
                  <span className={d.track}>
                    <i style={{ width: P >= 2 ? `${r.value}%` : '0%', background: r.color }} />
                  </span>
                  <span className={p.n}>{r.n}</span>
                </div>
              ))}
            </div>

            <ol className={`${p.pane} ${p.trail} ${on(tab === 1)}`}>
              {TRAIL.map((s) => (
                <li key={s.step}>
                  <span className={p.tick} aria-hidden="true">
                    ✓
                  </span>
                  <b>{s.step}</b>
                  <small>{s.date}</small>
                </li>
              ))}
              <li>
                <span className={`${p.tick} ${p.lock}`} aria-hidden="true">
                  <svg viewBox="0 0 16 16">
                    <rect x="3" y="7" width="10" height="7.5" rx="1.5" fill="currentColor" />
                    <path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
                <b>Version 2.2 locked</b>
              </li>
            </ol>

            <div className={`${p.pane} ${on(tab === 2)}`}>
              <p className={p.ackFig}>
                <b>1,240</b> of 1,300
              </p>
              <span className={`${d.track} ${p.ackTrack}`}>
                <i style={{ width: P >= 6 ? '95.4%' : '0%', background: 'var(--primary)' }} />
              </span>
              <p className={p.ackNote}>read by 1,240 of 1,300</p>
            </div>
          </div>
        </div>

        <div className={`${p.impact} ${on(P >= 7)}`}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="2.2" fill="currentColor" />
            <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
            <circle cx="8" cy="8" r="7.3" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          </svg>
          <span>
            <b>§ 4.2 changed</b> · 7 items affected · 3 owners notified
          </span>
        </div>

        <Cursor point={cursor} clicking={P === 2 || P === 4 || P === 6} />
      </div>
    </div>
  );
}
