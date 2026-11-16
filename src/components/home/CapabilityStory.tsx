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
 * Phones and tablets: the scene on top, the index under it, then the copy, all within one screen.
 * Nothing is masked over the live canvas (its edges fade inside WebGL), so scrolling stays flicker-free.
 */
export function CapabilityStory({ intro }: { intro?: ReactNode }) {
  const storyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const optRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const handleRef = useRef<StoryHandle | null>(null);
  const progressRef = useRef(-1);
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
    const apply = (p: number) => {
      const t = -1 + p * SPAN;
      progressRef.current = t;
      handleRef.current?.setProgress(t);
      setActive(t < 0 ? -1 : Math.min(N - 1, Math.floor(t)));
      fillRefs.current.forEach((f, i) => {
        if (f) f.style.transform = `scaleX(${Math.min(1, Math.max(0, t - i))})`;
      });
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
    ScrollTrigger.refresh();
    return () => {
      st.kill();
      delete story.dataset.live;
    };
  }, []);

  // Copy that would not fit its space (short phones, the analyser's longer text) is set a little smaller.
  useEffect(() => {
    const area = panelsRef.current;
    if (!area) return;
    const fit = () => {
      const max = area.clientHeight;
      panelRefs.current.forEach((p) => {
        if (!p) return;
        p.style.setProperty('--fit', '1');
        if (p.scrollHeight <= max) return;
        let lo = 0.7;
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

  // Keep the current capability in view in the sideways index (phones and tablets).
  useEffect(() => {
    const index = indexRef.current;
    const opt = active >= 0 ? optRefs.current[active] : null;
    if (!index || !opt || index.scrollWidth <= index.clientWidth + 1) return;
    const left = opt.offsetLeft - (index.clientWidth - opt.offsetWidth) / 2;
    index.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [active]);

  /** Go to a capability: the page jumps within the pinned section and the camera flies there. */
  const go = useCallback((i: number) => {
    const story = storyRef.current;
    if (!story) return;
    const distance = story.offsetHeight - window.innerHeight;
    const y = story.getBoundingClientRect().top + window.scrollY + ((i + 1.45) / SPAN) * distance;
    const lenis = scrollState.lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: 'instant' });
  }, []);

  return (
    <div ref={storyRef} className={`${s.story} ${ready ? s.ready : ''}`} style={{ '--span': SPAN } as CSSProperties}>
      <div className={s.pin}>
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

        <nav className={s.index} aria-label="Capabilities">
          <div ref={indexRef} className={s.indexList}>
            {STAGES.map((st, i) => (
              <button
                key={st.label}
                ref={(el) => void (optRefs.current[i] = el)}
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
        </nav>
      </div>
    </div>
  );
}
