'use client';

import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { Status } from '@/components/ui/Status';
import { offsetWithin } from '@/lib/geometry';
import m from './ImpactMap.module.css';

interface Row {
  name: string;
  clause?: string;
  hit: boolean;
}

/** What CBUAE Circular 1/2026 touches (the words of Gieom's design). */
const ROWS: Row[] = [
  { name: 'BCM Policy', clause: '§ 3.2 Impact tolerances', hit: true },
  { name: 'Outsourcing Policy', clause: '§ 7.1 Critical third parties', hit: true },
  { name: 'Incident Procedure', clause: '§ 2.4 Notification timelines', hit: true },
  { name: 'AML & Sanctions Policy', hit: false },
  { name: 'Records Retention Policy', hit: false },
];

/** Linkage coverage of one policy (the product demo's figures). */
const COVERAGE = [
  { label: 'Regulatory', value: 86, n: '12 / 14', tone: 'reg' },
  { label: 'Controls', value: 100, n: '6 / 6', tone: 'ctl' },
  { label: 'Risks', value: 75, n: '3 / 4', tone: 'risk' },
] as const;

/** Timings on the entrance clock (ms), matching the CSS: when each light line draws and the readers count up. */
const WIRE_AT = [2350, 2500, 2650];
const WIRE_MS = 650;
const COUNT_AT = 4000;
const COUNT_MS = 1500;
const READ = 1240;

interface Wire {
  d: string;
  a: [number, number];
  b: [number, number];
}

/** How far each layer drifts with the pointer, so the board reads in depth. */
const DEPTH = { back: 0.5, mid: 1, front: 1.7 };

const Check = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="7" fill="currentColor" />
    <path d="M4.8 8.2 7 10.3l4.3-4.6" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Clock = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 4.6V8l2.3 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Doc = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.8h5.2L12 4.6v9.6H4z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M9 1.9v2.9h2.9M6 8h4M6 10.5h3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/**
 * The hero's visual: a board of liquid-glass widgets, after the impact map in Gieom's design, with product
 * content from the rest of the site. A new circular drops into the regulations feed, light runs from it into
 * the three policies it hits, the approver signs off and the readers count up; linkage coverage fills beside.
 *
 * Everything is real text on flat layers, so it stays pixel-sharp: no 3D, scaling or rotation on text.
 * Depth comes from the glass itself (clear, saturated backdrop, bright rims, a light that follows the
 * pointer and a slow sheen), shadows, and layers that drift apart with the pointer. The entrance plays once
 * in CSS from the page's own load; the light lines and the count are run by script on the same clock.
 * Touch screens keep the look without backdrop blur or pointer effects, so scrolling never flickers.
 */
export function ImpactMap() {
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLLIElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const casingRefs = useRef<(SVGPathElement | null)[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [box, setBox] = useState({ w: 1, h: 1 });

  // The light lines: from the new circular to each policy it hits, measured from the layout itself.
  useEffect(() => {
    const root = rootRef.current;
    const source = sourceRef.current;
    const panel = panelRef.current;
    if (!root || !source || !panel) return;
    const measure = () => {
      const s = offsetWithin(source, root);
      const p = offsetWithin(panel, root);
      const next: Wire[] = [];
      rowRefs.current.forEach((row, i) => {
        if (!row || !ROWS[i].hit || !row.offsetHeight) return;
        const r = offsetWithin(row, root);
        const by = r.y + r.h / 2;
        const bx = p.x - 5;
        // beside the feed (wide layouts) or below it (narrow ones)
        if (bx > s.x + s.w + 12) {
          const ax = s.x + s.w + 4;
          const ay = s.y + s.h / 2;
          const dx = (bx - ax) * 0.55;
          next.push({ d: `M ${ax} ${ay} C ${ax + dx} ${ay}, ${bx - dx} ${by}, ${bx} ${by}`, a: [ax, ay], b: [bx, by] });
        } else {
          const ax = s.x + Math.min(22, s.w * 0.08);
          const ay = s.y + s.h + 4;
          const k = (by - ay) * 0.62;
          next.push({ d: `M ${ax} ${ay} C ${ax} ${ay + k}, ${bx - 30} ${by}, ${bx} ${by}`, a: [ax, ay], b: [bx, by] });
        }
      });
      const w = root.clientWidth;
      const h = root.clientHeight;
      setBox((b) => (b.w === w && b.h === h ? b : { w, h }));
      setWires((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => ro.disconnect();
  }, []);

  // Draw the lines on the entrance's own clock (the CSS animations), so they arrive with the policies they light.
  useEffect(() => {
    if (!wires.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const clock = panelRef.current?.getAnimations().find((a) => a.startTime !== null);
    const n = Math.max(1, pathRefs.current.length);
    [...pathRefs.current, ...casingRefs.current].forEach((path, k) => {
      if (!path || path.dataset.drawn) return;
      path.dataset.drawn = '';
      const a = path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: WIRE_MS,
        delay: WIRE_AT[k % n] ?? 0,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        fill: 'backwards',
      });
      if (clock?.startTime != null) a.startTime = clock.startTime;
    });
  }, [wires]);

  // The readers count up as the ring fills, on the same clock.
  useEffect(() => {
    const el = countRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const clock = panelRef.current?.getAnimations().find((a) => a.startTime !== null);
    const t0 = clock?.startTime != null ? Number(clock.startTime) : Number(document.timeline.currentTime ?? 0);
    const fmt = (v: number) => v.toLocaleString('en-US');
    let raf = 0;
    const tick = () => {
      const now = Number(document.timeline.currentTime ?? 0);
      const p = Math.min(1, Math.max(0, (now - t0 - COUNT_AT) / COUNT_MS));
      el.textContent = fmt(Math.round(READ * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // With a mouse: the layers drift apart in depth, and light on the glass follows the pointer (2D only: text stays sharp).
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = rootRef.current;
    if (!root) return;
    const layers = [
      [backRef.current, DEPTH.back],
      [midRef.current, DEPTH.mid],
      [frontRef.current, DEPTH.front],
    ] as const;
    const movers = layers.map(([el, depth]) =>
      el
        ? {
            depth,
            x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
            y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
          }
        : null,
    );
    const panes = Array.from(root.querySelectorAll<HTMLElement>(`.${m.glass}`));
    let raf = 0;
    let px = -1e4;
    let py = -1e4;
    const light = () => {
      raf = 0;
      for (const pane of panes) {
        const r = pane.getBoundingClientRect();
        pane.style.setProperty('--mx', `${px - r.left}px`);
        pane.style.setProperty('--my', `${py - r.top}px`);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = root.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
      movers.forEach((mv) => {
        if (!mv) return;
        mv.x(nx * 11 * mv.depth);
        mv.y(ny * 8 * mv.depth);
      });
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(light);
    };
    const onLeave = () => movers.forEach((mv) => mv && (mv.x(0), mv.y(0)));
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className={m.wrap}>
      <div
        ref={rootRef}
        className={m.map}
        role="img"
        aria-label="Impact map: CBUAE Circular 1/2026, mapped in 4 min. 3 policies hit: BCM Policy, Outsourcing Policy and Incident Procedure. 3 of 3 policy owners notified."
      >
        {/* light for the glass to catch */}
        <span className={m.mesh} aria-hidden="true" />
        <span className={`${m.orb} ${m.orbTeal}`} aria-hidden="true" />
        <span className={`${m.orb} ${m.orbWarm}`} aria-hidden="true" />

        <div ref={backRef} className={m.layer} aria-hidden="true">
          <article className={`${m.glass} ${m.coverage}`}>
            <header className={m.head}>
              <b className={m.title}>Linkage coverage</b>
              <span className={m.meta}>AML-POL-0115</span>
            </header>
            <div className={m.bars}>
              {COVERAGE.map((c) => (
                <div key={c.label} className={m.barRow} data-tone={c.tone}>
                  <span className={m.barLabel}>{c.label}</span>
                  <span className={m.track}>
                    <i style={{ width: `${c.value}%` }} />
                  </span>
                  <b className={m.barN}>{c.n}</b>
                </div>
              ))}
            </div>
            <p className={m.warn}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 1.8 14.6 13.6H1.4z" fill="currentColor" />
                <path d="M8 6v3.4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11.4" r="0.85" fill="#fff" />
              </svg>
              Consistency check: 2 clauses without a regulatory basis
            </p>
          </article>
        </div>

        <div ref={midRef} className={m.layer} aria-hidden="true">
          <svg className={m.wires} viewBox={`0 0 ${box.w} ${box.h}`} width={box.w} height={box.h}>
            <defs>
              <linearGradient id="impact-wire" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ff8a24" />
                <stop offset="1" stopColor="#00b3aa" />
              </linearGradient>
            </defs>
            {wires.map((w, i) => (
              <g key={i}>
                <path ref={(el) => void (casingRefs.current[i] = el)} d={w.d} pathLength={1} className={`${m.wire} ${m.casing}`} />
                <path ref={(el) => void (pathRefs.current[i] = el)} d={w.d} pathLength={1} className={m.wire} />
                <path d={w.d} pathLength={1} className={m.pulse} style={{ animationDelay: `${4.6 + i * 0.55}s` }} />
                <circle
                  cx={w.b[0]}
                  cy={w.b[1]}
                  r={3.2}
                  className={m.node}
                  style={{ animationDelay: `${(WIRE_AT[i] + WIRE_MS) / 1000}s` }}
                />
              </g>
            ))}
            {wires[0] && <circle cx={wires[0].a[0]} cy={wires[0].a[1]} r={3.6} className={`${m.node} ${m.origin}`} />}
          </svg>

          <article className={`${m.glass} ${m.feed}`}>
            <header className={m.head}>
              <b className={m.title}>Regulations</b>
              <span className={m.meta}>Fri · 18:42</span>
            </header>
            <ul className={m.feedList}>
              <li ref={sourceRef} className={`${m.feedRow} ${m.isNew}`}>
                <span className={m.newTag}>New</span>
                <span className={m.feedText}>
                  <b>CBUAE Circular 1/2026</b>
                  <span>Operational Resilience</span>
                </span>
                <span className={m.scan}>
                  <i />
                </span>
              </li>
              <li className={m.feedRow}>
                <span className={m.ok}>
                  <Check />
                </span>
                <span className={m.feedText}>
                  <b>FCA · PS26/4</b>
                  <span>Mapped</span>
                </span>
              </li>
              <li className={m.feedRow}>
                <span className={m.docIcon}>
                  <Doc />
                </span>
                <span className={m.feedText}>
                  <b>RBI · Master Direction</b>
                  <span>Mapped</span>
                </span>
              </li>
            </ul>
          </article>

          <article ref={panelRef} className={`${m.glass} ${m.panel}`}>
            <header className={m.head}>
              <span className={m.headText}>
                <b className={m.title}>Impact map</b>
                <span className={m.meta}>CBUAE Circular 1/2026</span>
              </span>
              <Status tone="primary" className={m.live}>
                Live
              </Status>
            </header>
            <ul className={m.rows}>
              {ROWS.map((r, i) => (
                <li key={r.name} ref={(el) => void (rowRefs.current[i] = el)} className={m.row} data-hit={r.hit ? '' : undefined}>
                  <span className={m.rowText}>
                    <b>{r.name}</b>
                    {r.clause && <span>{r.clause}</span>}
                  </span>
                  <span className={r.hit ? m.update : m.none}>{r.hit ? 'Update' : 'No impact'}</span>
                </li>
              ))}
              <span className={m.beam} aria-hidden="true" />
            </ul>
            <footer className={m.foot}>
              <span className={m.bar}>
                <i />
              </span>
              <span className={m.notified}>3 of 3 policy owners notified</span>
            </footer>
          </article>
        </div>

        <div ref={frontRef} className={m.layer} aria-hidden="true">
          <article className={`${m.glass} ${m.toast}`}>
            <span className={m.avatar}>MT</span>
            <span className={m.toastText}>
              <b>Michael Torres</b>
              <span>Approver</span>
            </span>
            <span className={m.approved}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="7" fill="currentColor" />
                <path
                  className={m.tick}
                  d="M4.8 8.2 7 10.3l4.3-4.6"
                  pathLength={1}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Approved
            </span>
          </article>

          <article className={`${m.glass} ${m.ack}`}>
            <b className={m.title}>Acknowledgement</b>
            <span className={m.ring}>
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <linearGradient id="ack-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ff8a24" />
                    <stop offset="1" stopColor="#00b3aa" />
                  </linearGradient>
                </defs>
                <circle className={m.ringTrack} cx="60" cy="60" r="50" />
                <circle className={m.ringArc} cx="60" cy="60" r="50" pathLength={1} />
              </svg>
              <span className={m.ringText}>
                <b ref={countRef}>1,240</b>
                <span>of 1,300</span>
              </span>
            </span>
          </article>

          <p className={`${m.note} ${m.time}`}>
            <Clock />
            Mapped in 4 min
          </p>
          <p className={`${m.note} ${m.hits}`}>
            <Check />3 policies hit
          </p>
          <p className={m.caption}>
            <Check />
            <span>
              12 circulars this quarter. <b>12 mapped.</b>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
