'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Showcase } from '@/components/ui/Showcase';
import { routes } from '@/lib/routes';
import s from './WeekStory.module.css';

gsap.registerPlugin(ScrollTrigger);

export interface WeekChapter {
  /** The moment in the week, e.g. "A new circular lands on Friday evening." */
  title: string;
  /** How it goes with Gieom.cloud. */
  answer: string;
  body: string;
  bullets: string[];
  visual: ReactNode;
}

const vars = (v: Record<string, number | string>) => v as CSSProperties;

/** The light behind each chapter moves through the week: Friday evening's tangerine to Thursday morning's teal. */
const GLOW = ['255, 138, 36', '255, 160, 92', '120, 200, 170', '40, 190, 178', '0, 179, 170'];

/**
 * "Every compliance week tells the same story": five moments from the circular to the auditor.
 *
 * A thread runs through the week. On desktop it weaves between the chapters (copy and live demo alternate
 * either side) and draws itself under the reading line as you scroll, its glowing head following your eye;
 * on phones and tablets it runs down the left and travels on to each chapter as you reach it. Each node
 * catches light when the thread arrives. Titles rise in word by word, the list rules draw, the demo slides
 * in from its side, and the light behind it shifts through the week.
 *
 * Scroll-linked motion is kept to desktop pointers; touch screens get one-shot transitions only. Chapters
 * already on screen are never hidden, and with reduced motion or without scripts everything is simply there.
 */
export function WeekStory({ chapters }: { chapters: WeekChapter[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const drawRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const gradRef = useRef<SVGLinearGradientElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const draw = drawRef.current;
    const glow = glowRef.current;
    const grad = gradRef.current;
    const head = headRef.current;
    if (!root || !svg || !path || !draw || !glow || !grad || !head) return;
    const items = itemRefs.current.filter((li): li is HTMLLIElement => li !== null);
    const nodes = nodeRefs.current.filter((n): n is HTMLSpanElement => n !== null);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches;
    const scrub = fine && !reduced;

    /* ── The thread ── */
    let total = 1;
    let ys: number[] = [];
    let step = 4;
    let nodeLen: number[] = [];
    const state = { len: 0 };
    const lit: boolean[] = items.map(() => false);

    const lengthAtY = (y: number) => {
      if (!ys.length) return 0;
      if (y <= ys[0]) return 0;
      if (y >= ys[ys.length - 1]) return total;
      let lo = 0;
      let hi = ys.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (ys[mid] < y) lo = mid;
        else hi = mid;
      }
      const f = (y - ys[lo]) / Math.max(1e-6, ys[hi] - ys[lo]);
      return Math.min(total, (lo + f) * step);
    };

    const render = () => {
      const len = Math.max(0, Math.min(total, state.len));
      draw.style.strokeDashoffset = `${total - len}`;
      glow.style.strokeDashoffset = `${total - len}`;
      const p = path.getPointAtLength(len);
      head.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      head.style.opacity = len > 1 && len < total - 1 ? '1' : '0';
      nodeLen.forEach((nl, i) => {
        const on = len >= nl - 1;
        if (on === lit[i]) return;
        lit[i] = on;
        if (on) items[i].dataset.lit = '';
        else delete items[i].dataset.lit;
      });
    };

    const measure = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', `${w}`);
      svg.setAttribute('height', `${h}`);
      const pts = items.map((li, i) => {
        const n = nodes[i];
        return {
          x: li.offsetLeft + (n?.offsetLeft ?? 0) + (n?.offsetWidth ?? 0) / 2,
          y: li.offsetTop + (n?.offsetTop ?? 0) + (n?.offsetHeight ?? 0) / 2,
        };
      });
      if (!pts.length) return;
      // a weave on desktop, a straight run down the left on phones and tablets
      const swing = w >= 1024 ? Math.min(72, w * 0.05) : 0;
      const lead = Math.min(150, pts[0].y);
      let d = `M ${pts[0].x} ${pts[0].y - lead} L ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const dy = b.y - a.y;
        const side = i % 2 ? 1 : -1;
        d += ` C ${a.x + side * swing} ${a.y + dy * 0.36} ${b.x + side * swing} ${b.y - dy * 0.36} ${b.x} ${b.y}`;
      }
      for (const el of [path, draw, glow]) el.setAttribute('d', d);
      grad.setAttribute('y1', `${pts[0].y - lead}`);
      grad.setAttribute('y2', `${pts[pts.length - 1].y}`);
      total = Math.max(1, path.getTotalLength());
      step = Math.max(2, total / 1400);
      ys = [];
      for (let l = 0; l <= total; l += step) ys.push(path.getPointAtLength(l).y);
      nodeLen = pts.map((p) => lengthAtY(p.y));
      for (const el of [draw, glow]) el.style.strokeDasharray = `${total} ${total}`;
      render();
    };

    /* ── Arrivals: chapters below the fold wait, then play once ── */
    const fold = window.innerHeight * 0.88;
    if (!reduced) {
      items.forEach((li) => {
        if (li.getBoundingClientRect().top > fold) li.dataset.wait = '';
        else li.dataset.in = '';
      });
      root.dataset.armed = '';
    } else items.forEach((li) => (li.dataset.in = ''));
    const arrive = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLLIElement).dataset.in = '';
          arrive.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -14% 0px' },
    );
    items.forEach((li) => li.dataset.wait !== undefined && arrive.observe(li));

    /* ── The thread moves smoothly: following the scroll on desktop, travelling chapter to chapter on touch ── */
    const move = scrub
      ? gsap.quickTo(state, 'len', { duration: 0.7, ease: 'power3.out', onUpdate: render })
      : gsap.quickTo(state, 'len', { duration: 1.5, ease: 'power3.inOut', onUpdate: render });

    /* ── The chapter being read: the one crossing the middle of the screen ── */
    let current = -1;
    const reading = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = items.indexOf(e.target as HTMLLIElement);
          if (!e.isIntersecting || i === current) continue;
          if (current >= 0) delete items[current].dataset.now;
          items[i].dataset.now = '';
          root.dataset.focus = '';
          current = i;
          // touch screens: the thread travels on to the chapter being read
          if (!scrub) {
            if (reduced) {
              state.len = nodeLen[i] ?? 0;
              render();
            } else move(nodeLen[i] ?? 0);
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    items.forEach((li) => reading.observe(li));

    measure();
    // The thread follows any size change. (Scroll positions are refreshed by ScrollTrigger itself on resize.)
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    // A demo never changes the page's height while it plays: each one keeps the tallest height it has
    // shown at this width, so nothing below it (the pinned 3D story included) ever moves.
    const holds = items.map((li) => {
      const visual = li.querySelector<HTMLElement>(`.${s.visual}`);
      const inner = li.querySelector<HTMLElement>(`.${s.drift}`);
      return { visual, inner, width: 0, max: 0 };
    });
    const hold = new ResizeObserver(() => {
      for (const h of holds) {
        if (!h.visual || !h.inner) continue;
        const w = h.visual.clientWidth;
        const ht = h.inner.offsetHeight;
        if (w !== h.width) {
          h.width = w;
          h.max = 0;
          h.visual.style.minHeight = '';
        }
        if (ht > h.max) {
          h.max = ht;
          h.visual.style.minHeight = `${ht}px`;
        }
      }
    });
    holds.forEach((h) => h.inner && hold.observe(h.inner));

    /* ── Desktop: the thread draws itself under the reading line ── */
    const st = scrub
      ? ScrollTrigger.create({
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: () => move(lengthAtY(window.innerHeight * 0.52 - root.getBoundingClientRect().top)),
        })
      : null;

    return () => {
      ro.disconnect();
      hold.disconnect();
      arrive.disconnect();
      reading.disconnect();
      st?.kill();
      gsap.killTweensOf(state);
    };
  }, []);

  return (
    <div ref={rootRef} className={s.story}>
      <svg ref={svgRef} className={s.thread} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient ref={gradRef} id="week-thread" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ff8a24" stopOpacity="0" />
            <stop offset="0.06" stopColor="#ff8a24" />
            <stop offset="0.5" stopColor="#3cc0a8" />
            <stop offset="1" stopColor="#00b3aa" />
          </linearGradient>
          <radialGradient id="week-head">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#ffc28a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#00b3aa" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path ref={pathRef} className={s.base} />
        <path ref={glowRef} className={s.glow} stroke="url(#week-thread)" />
        <path ref={drawRef} className={s.draw} stroke="url(#week-thread)" />
        <g ref={headRef} className={s.head}>
          <circle r="16" fill="url(#week-head)" />
          <circle r="3.6" className={s.core} />
        </g>
      </svg>

      <ol className={s.chapters}>
        {chapters.map((c, i) => {
          const words = c.title.split(' ');
          return (
            <li
              key={c.title}
              ref={(el) => void (itemRefs.current[i] = el)}
              className={s.chapter}
              data-side={i % 2 ? 'right' : 'left'}
              style={vars({ '--glow': GLOW[i % GLOW.length] })}
            >
              <span ref={(el) => void (nodeRefs.current[i] = el)} className={s.node} aria-hidden="true" />
              <div className={s.copy}>
                <h3 className={s.title}>
                  {words.map((w, k) => (
                    <Fragment key={k}>
                      <span className={s.word}>
                        <span style={vars({ '--w': k })}>{w}</span>
                      </span>
                      {k < words.length - 1 ? ' ' : null}
                    </Fragment>
                  ))}
                </h3>
                <p className={s.answer} style={vars({ '--i': 2 })}>
                  {c.answer}
                </p>
                <p className={s.body} style={vars({ '--i': 3 })}>
                  {c.body}
                </p>
                <ul className={`checklist ${s.bullets}`}>
                  {c.bullets.map((b, k) => (
                    <li key={b} style={vars({ '--i': 4 + k })}>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className={`actions ${s.actions}`} style={vars({ '--i': 7 })}>
                  <ButtonLink href={routes.demo} arrow>
                    Book a demo
                  </ButtonLink>
                  <ButtonLink href={routes.trial} variant="secondary">
                    Start free trial
                  </ButtonLink>
                </div>
              </div>
              <div className={s.visual}>
                <div className={s.drift} data-parallax="0.04">
                  <Showcase>{c.visual}</Showcase>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
