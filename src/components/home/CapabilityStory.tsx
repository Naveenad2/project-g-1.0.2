'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { StoryHandle } from '@/components/story/scene';
import { Icon } from '@/components/ui/Icon';
import { scrollState } from '@/lib/scroll';
import { IMPACT_STAGE, STAGES } from './stages';
import s from './CapabilityStory.module.css';

gsap.registerPlugin(ScrollTrigger);

const N = STAGES.length;
const SUMMARY =
  '§ 4.2 changed · 1 draft, 3 linked items, 1 procedure, 1 workflow, 2 reviews, 1 risk rating and 1 report flagged · owners notified · nothing missed';
const DESKTOP = '(min-width: 1024px)';
/** Scroll length in chapters: the opening shot (1), the ten capabilities, and a short hold at the end. */
const SPAN = N + 1.4;
/** Phones and tablets: the copy changes with the scroll itself, so scrolling back plays it in reverse. */
const SCRUB = '(max-width: 1023.98px), (hover: none)';
/** Where in its chapter (in chapters) a panel rises in and where it leaves, and how far it travels. */
const ENTER = [-0.02, 0.12] as const;
const EXIT = [0.86, 1] as const;
const RISE = 26;
/** How quickly the copy follows the scroll; the same rate as the scene's camera, so the two move together. */
const RATE = 7.5;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (x: number) => x * x * (3 - 2 * x);

type Align = 'above' | 'below' | 'left' | 'right';

/** Annotations drawn beside the 3D capabilities: [anchor, chapter, text, alignment]. */
const LABELS: [string, number, string, Align?][] = [
  ['r0', 0, 'Regulations', 'right'],
  ['r1', 0, 'Risks', 'right'],
  ['r2', 0, 'Controls', 'right'],
  ['r3', 0, 'Policies', 'right'],
  ['r4', 0, 'Procedures', 'right'],
  ['r5', 0, '+ your own registry'],
  ['r42', 0, '§ 4.2'],
  ['m0', 1, 'cites § 4.2'],
  ['m1', 1, 'contradicts?'],
  ['m2', 1, 'link § 4.2'],
  ['m3', 1, 'rate risk'],
  ['m4', 1, 'draft steps'],
  ['l0', 2, 'policy'],
  ['l1', 2, 'regulation'],
  ['l2', 2, 'control'],
  ['l3', 2, 'risk'],
  ['l4', 2, 'owner'],
  ['p0', 3, 'Start'],
  ['p1', 3, 'Approve?'],
  ['p2', 3, 'Record', 'below'],
  ['w0', 4, 'Trigger'],
  ['w1', 4, 'Review'],
  ['w2', 4, 'Legal'],
  ['w3', 4, 'Publish'],
  ['y0', 5, 'Draft', 'below'],
  ['y1', 5, 'Under review'],
  ['y2', 5, 'Approved', 'below'],
  ['y3', 5, 'Published'],
  ['y4', 5, 'Archived', 'below'],
  ['yb', 5, 'Board'],
  ['yv', 5, 'v3 · every decision recorded', 'below'],
  ['a0', 6, 'Published to me'],
  ['a1', 6, '3', 'right'],
  ['a2', 6, 'read', 'left'],
  ['a3', 6, 'due', 'left'],
  ['a4', 6, 'read', 'left'],
  ['a5', 6, 'read by 1,240 of 1,300', 'below'],
  ['k0', 7, 'score 3.6'],
  ['k1', 7, 'evidence attached', 'below'],
  ['k2', 7, 'likelihood →', 'below'],
  ['i0', 8, '§ 4.2'],
  ['i1', 8, '7 items affected · 3 owners notified', 'below'],
];

/**
 * "Gieom.cloud brings all of it together" as a pinned 3D story. The section holds still while you scroll
 * through it: the copy for each capability changes in place, the camera moves through one scene, and only
 * the capability being told is built (the document, the other capabilities and the links between them
 * appear for the opening shot and the Impact Analyser's overview). The index of all ten fills as you go and
 * takes you to any capability, with the camera flying straight there.
 *
 * Desktop: copy on the left, the scene in its own column on the right, the index along the foot.
 * Phones and tablets: the scene on top, the index under it, then the copy, all within one screen. There the
 * copy moves with the scroll: each panel rises in as its chapter begins and lifts away as it ends, eased
 * at the camera's rate, so both play backwards when you scroll back up.
 * Nothing is masked over the live canvas (its edges fade inside WebGL), so scrolling stays flicker-free.
 */
export function CapabilityStory({ intro, backdrop }: { intro?: ReactNode; backdrop?: ReactNode }) {
  const storyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const handleRef = useRef<StoryHandle | null>(null);
  const progressRef = useRef(-1);
  const jumpRef = useRef(false);
  const [active, setActive] = useState(-1);
  const [ready, setReady] = useState(false);

  const runImpact = useCallback(() => handleRef.current?.runImpact(), []);

  useEffect(() => {
    if (active === IMPACT_STAGE) runImpact();
  }, [active, runImpact]);

  // The 3D scene loads when the story nears the viewport and renders only while it is on screen.
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const labelsEl = labelsRef.current;
    if (!stage || !canvas || !labelsEl) return;
    const root = document.documentElement;
    let cancelled = false;
    let started = false;
    let visible = false;
    const sync = () => handleRef.current?.setActive(visible && !document.hidden);
    const ro = new ResizeObserver(() => {
      handleRef.current?.setLayout(window.matchMedia(DESKTOP).matches);
      handleRef.current?.resize();
    });
    const mo = new MutationObserver(() => handleRef.current?.setTheme(root.dataset.theme === 'dark'));
    const start = () => {
      started = true;
      import('@/components/story/scene')
        .then(({ createStory }) => {
          if (cancelled) return;
          const handle = createStory(canvas, {
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            dark: root.dataset.theme === 'dark',
            desktop: window.matchMedia(DESKTOP).matches,
            labels: Array.from(labelsEl.children) as HTMLElement[],
            onReady: () => setReady(true),
          });
          if (!handle) return;
          handleRef.current = handle;
          handle.setProgress(progressRef.current);
          ro.observe(canvas);
          mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
          document.addEventListener('visibilitychange', sync);
          sync();
        })
        .catch(() => {
          /* Without WebGL the story still reads as text. */
        });
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) start();
        sync();
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(stage);
    return () => {
      cancelled = true;
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', sync);
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, []);

  // Scroll through the pinned section → story position; the index fills along with it.
  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrubQuery = window.matchMedia(SCRUB);
    let scrub = false;
    let target = -1;
    let cur = -1;
    let shown = Number.NaN;
    let raf = 0;
    let last = 0;
    const written = new Map<HTMLElement, string>();

    const fill = (t: number) =>
      fillRefs.current.forEach((f, i) => {
        if (f) f.style.transform = `scaleX(${clamp01(t - i)})`;
      });

    /** Phones and tablets: every panel's place in its own rise-and-leave, at story position t. Lines of a
        panel follow one another a little. Only panels on show keep their layers; the rest are let go. */
    const paint = (t: number) => {
      for (let k = -1; k < N; k++) {
        const panel = panelRefs.current[k < 0 ? N : k];
        if (!panel) continue;
        const x = t - k;
        const kids = Array.from(panel.children) as HTMLElement[];
        const vals = kids.map((_, j) => {
          // the opening view is there from the start; the last capability stays to the end
          const e = k < 0 ? 1 : easeInOut(clamp01((x - ENTER[0] - j * 0.014) / (ENTER[1] - ENTER[0])));
          const q = k === N - 1 ? 0 : easeInOut(clamp01((x - EXIT[0] - j * 0.01) / (EXIT[1] - EXIT[0])));
          return [Math.round(e * (1 - q) * 1000) / 1000, Math.round(((1 - e) * RISE - q * RISE) * 10) / 10];
        });
        const seen = vals.some(([o]) => o > 0);
        kids.forEach((el, j) => {
          const [o, y] = vals[j];
          const key = seen ? `${o}|${y}` : 'off';
          if (written.get(el) === key) return;
          written.set(el, key);
          el.style.opacity = seen ? `${o}` : '0';
          el.style.transform = seen ? `translate3d(0, ${y}px, 0)` : '';
        });
        const vis = seen ? 'visible' : 'hidden';
        if (panel.style.visibility !== vis) panel.style.visibility = vis;
      }
      fill(t);
    };

    const clear = () => {
      written.clear();
      panelRefs.current.forEach((panel) => {
        if (!panel) return;
        panel.style.visibility = '';
        Array.from(panel.children).forEach((child) => {
          (child as HTMLElement).style.opacity = '';
          (child as HTMLElement).style.transform = '';
        });
      });
    };

    // the copy eases after the scroll at the camera's own rate, frame-rate independent
    const tick = (ms: number) => {
      const dt = Math.min(0.05, Math.max(0, (ms - last) / 1000));
      last = ms;
      cur += (target - cur) * (1 - Math.exp(-dt * RATE));
      if (Math.abs(target - cur) < 0.0005) cur = target;
      if (cur !== shown) {
        shown = cur;
        paint(cur);
      }
      raf = cur === target ? 0 : requestAnimationFrame(tick);
    };

    /** A tap on the index: the copy is there at once and rises in, while the camera flies. */
    const riseIn = (t: number) => {
      const panel = panelRefs.current[t < 0 ? N : Math.min(N - 1, Math.floor(t))];
      if (!panel) return;
      Array.from(panel.children).forEach((child, j) =>
        (child as HTMLElement).animate(
          [
            { opacity: 0, transform: `translate3d(0, ${RISE}px, 0)` },
            { opacity: 1, transform: 'translate3d(0, 0, 0)' },
          ],
          { duration: 820, delay: j * 70, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' },
        ),
      );
    };

    const apply = (p: number) => {
      const t = -1 + p * SPAN;
      const jump = jumpRef.current;
      jumpRef.current = false;
      progressRef.current = t;
      handleRef.current?.setProgress(t, jump);
      setActive(t < 0 ? -1 : Math.min(N - 1, Math.floor(t)));
      target = t;
      if (!scrub) {
        fill(t);
        return;
      }
      if (jump || Number.isNaN(shown)) {
        cancelAnimationFrame(raf);
        raf = 0;
        cur = shown = t;
        paint(t);
        if (jump) riseIn(t);
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const setMode = () => {
      const next = !reduced && scrubQuery.matches;
      if (next === scrub) return;
      scrub = next;
      cancelAnimationFrame(raf);
      raf = 0;
      shown = Number.NaN;
      if (scrub) {
        story.dataset.scrub = '';
        cur = target;
        apply(progressRef.current < -1 ? 0 : (progressRef.current + 1) / SPAN);
      } else {
        delete story.dataset.scrub;
        clear();
      }
    };

    // Pinning starts once the script runs; before that (or without it) the story is plain text in flow.
    story.dataset.live = '';
    const st = ScrollTrigger.create({
      trigger: story,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    setMode();
    scrubQuery.addEventListener('change', setMode);
    ScrollTrigger.refresh();
    return () => {
      st.kill();
      cancelAnimationFrame(raf);
      scrubQuery.removeEventListener('change', setMode);
      clear();
      delete story.dataset.live;
      delete story.dataset.scrub;
    };
  }, []);

  // Copy that would not fit its space (short phones, the analyser's longer text) is set a little smaller,
  // panel by panel. Each panel's top line keeps its size, so every title starts at the same height.
  useEffect(() => {
    const area = panelsRef.current;
    if (!area) return;
    const fit = () => {
      const max = area.clientHeight;
      panelRefs.current.forEach((p) => {
        if (!p) return;
        p.style.setProperty('--fit', '1');
        if (p.scrollHeight <= max) return;
        let lo = 0.66;
        let hi = 1;
        for (let k = 0; k < 7; k++) {
          const mid = (lo + hi) / 2;
          p.style.setProperty('--fit', `${mid}`);
          if (p.scrollHeight <= max) lo = mid;
          else hi = mid;
        }
        p.style.setProperty('--fit', `${lo}`);
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(area);
    document.fonts?.ready.then(fit).catch(() => undefined);
    return () => ro.disconnect();
  }, []);

  /** Go to a capability: the page jumps within the pinned section and the camera flies there. */
  const go = useCallback((i: number) => {
    const story = storyRef.current;
    if (!story) return;
    const distance = story.offsetHeight - window.innerHeight;
    const y = story.getBoundingClientRect().top + window.scrollY + ((i + 1.45) / SPAN) * distance;
    // the scroll update this causes is a jump, not a swipe (and the mark lapses if the page was already there)
    jumpRef.current = true;
    window.setTimeout(() => (jumpRef.current = false), 160);
    const lenis = scrollState.lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: 'instant' });
  }, []);

  return (
    <div ref={storyRef} className={`${s.story} ${ready ? s.ready : ''}`} style={{ '--span': SPAN } as CSSProperties} data-motion-skip="">
      <div className={s.pin}>
        {backdrop && (
          <div className={s.backdrop} aria-hidden="true">
            {backdrop}
          </div>
        )}
        <div ref={panelsRef} className={s.panels}>
          <div
            ref={(el) => void (panelRefs.current[N] = el)}
            className={`${s.panel} ${s.introPanel} ${active < 0 ? s.on : ''}`}
            inert={active >= 0}
          >
            {intro}
          </div>
          {STAGES.map((st, i) => (
            <div
              key={st.label}
              ref={(el) => void (panelRefs.current[i] = el)}
              className={`${s.panel} ${i === active ? s.on : ''}`}
              inert={i !== active}
            >
              <p className={s.meta}>
                {i === IMPACT_STAGE ? (
                  <button type="button" className={s.analyser} onClick={runImpact}>
                    {st.label}
                  </button>
                ) : (
                  <b>{st.label}</b>
                )}
                <span>{st.sub}</span>
              </p>
              <h3 className={s.title}>{st.title}</h3>
              <p className={s.body}>{st.body}</p>
              {i === IMPACT_STAGE && <p className={s.summary}>{SUMMARY}</p>}
              <Link href={st.href} className={`link-arrow ${s.cta}`}>
                {st.cta}
                <Icon name="arrowRight" size={15} strokeWidth={2} />
              </Link>
            </div>
          ))}
        </div>

        <div ref={stageRef} className={s.stage}>
          <canvas ref={canvasRef} className={s.canvas} />
          <div ref={labelsRef} className={s.labels} aria-hidden="true">
            {LABELS.map(([k, c, text, align = 'above']) => (
              <span key={k} data-k={k} data-c={c} data-a={align} className={s.label}>
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Desktop: all ten by name. Phones and tablets: one tappable segment each, and a count. */}
        <nav className={s.index} aria-label="Capabilities">
          <div className={s.indexList}>
            {STAGES.map((st, i) => (
              <button
                key={st.label}
                type="button"
                className={`${s.opt} ${i === active ? s.optOn : ''}`}
                aria-current={i === active ? 'step' : undefined}
                onClick={() => go(i)}
              >
                <span className={s.optTrack} aria-hidden="true">
                  <span ref={(el) => void (fillRefs.current[i] = el)} className={s.optFill} />
                </span>
                <span className={s.optNum} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={s.optName}>{st.label}</span>
              </button>
            ))}
          </div>
          <span className={s.count} aria-hidden="true">
            {String(Math.max(0, active) + 1).padStart(2, '0')}
            <span> / {N}</span>
          </span>
        </nav>
      </div>
    </div>
  );
}
