'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { StoryHandle } from '@/components/story/scene';
import { Icon } from '@/components/ui/Icon';
import { IMPACT_STAGE, STAGES } from './stages';
import s from './CapabilityStory.module.css';

gsap.registerPlugin(ScrollTrigger);

const N = STAGES.length;
const SUMMARY =
  '§ 4.2 changed · 1 draft, 3 linked items, 1 procedure, 1 workflow, 2 reviews, 1 risk rating and 1 report flagged · owners notified · nothing missed';
const DESKTOP = '(min-width: 1024px)';
const lineFor = (desktop: boolean) => (desktop ? 0.55 : 0.72);

type Align = 'above' | 'below' | 'left' | 'right';

/** Annotations drawn beside the 3D capabilities: [anchor, chapter, text, alignment]. */
const LABELS: [string, number, string, Align?][] = [
  ['r0', 0, 'Regulations', 'right'],
  ['r1', 0, 'Risks', 'right'],
  ['r2', 0, 'Controls', 'right'],
  ['r3', 0, 'Policies', 'right'],
  ['r4', 0, 'Procedures', 'right'],
  ['r5', 0, '+ your own registry', 'right'],
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
  ['a1', 6, '3'],
  ['a2', 6, 'read', 'left'],
  ['a3', 6, 'due', 'left'],
  ['a4', 6, 'read', 'left'],
  ['a5', 6, 'read by 1,240 of 1,300', 'below'],
  ['k0', 7, 'score 3.6'],
  ['k1', 7, 'evidence attached', 'right'],
  ['k2', 7, 'likelihood →', 'below'],
  ['i0', 8, '§ 4.2'],
  ['i1', 8, '7 items affected · 3 owners notified', 'below'],
];

/**
 * "How it works" as a 3D scroll story. The ten capabilities are told one at a time while a camera moves
 * through a single scene: the policy document at the centre, each capability built around it as you
 * reach it, then the Impact Analyser's wave through everything. The scene is a transparent canvas that
 * blends into the page; all copy stays in the page as real text.
 */
export function CapabilityStory({ intro }: { intro?: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
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
          ro.observe(stage);
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

  // Scroll position → story position, measured from the real step positions.
  useEffect(() => {
    const track = trackRef.current;
    const intro = introRef.current;
    const outro = outroRef.current;
    if (!track || !intro || !outro) return;
    let tops: number[] = [];
    let heights: number[] = [];
    const measure = () => {
      tops = stepRefs.current.map((li) => li?.offsetTop ?? 0);
      heights = stepRefs.current.map((li) => Math.max(1, li?.offsetHeight ?? 1));
    };
    const toStory = (y: number) => {
      if (y < intro.offsetHeight) return -1 + y / Math.max(1, intro.offsetHeight);
      if (y >= outro.offsetTop) return N + (y - outro.offsetTop) / Math.max(1, outro.offsetHeight);
      let k = 0;
      while (k < N - 1 && y >= tops[k + 1]) k++;
      return k + Math.min(0.999, (y - tops[k]) / heights[k]);
    };
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: DESKTOP, mobile: '(max-width: 1023.98px)' }, (context) => {
        const line = `${lineFor(Boolean(context.conditions?.desktop)) * 100}%`;
        ScrollTrigger.create({
          trigger: track,
          start: `top ${line}`,
          end: `bottom ${line}`,
          onRefresh: measure,
          onUpdate: (self) => {
            const t = toStory(self.progress * track.offsetHeight);
            progressRef.current = t;
            handleRef.current?.setProgress(t);
            setActive(t >= 0 && t < N ? Math.floor(t) : -1);
            if (barRef.current) barRef.current.style.transform = `scale(${Math.min(1, Math.max(0, t / N))})`;
          },
        });
      });
    });
    measure();
    return () => ctx.revert();
  }, []);

  return (
    <div className={s.story}>
      <div ref={stageRef} className={`${s.stage} ${ready ? s.ready : ''}`}>
        <canvas ref={canvasRef} className={s.canvas} />
        <div ref={labelsRef} className={s.labels} aria-hidden="true">
          {LABELS.map(([k, c, text, align = 'above']) => (
            <span key={k} data-k={k} data-c={c} data-a={align} className={s.label}>
              {text}
            </span>
          ))}
        </div>
        <span className={s.progress} aria-hidden="true">
          <span ref={barRef} />
        </span>
      </div>

      <div className={`container ${s.inner}`}>
        <div ref={trackRef} className={s.track}>
          <div ref={introRef} className={s.intro}>
            {intro}
          </div>
          <ol className={s.steps}>
            {STAGES.map((st, i) => (
              <li key={st.label} ref={(el) => void (stepRefs.current[i] = el)} className={`${s.step} ${i === active ? s.on : ''}`}>
                <div className={s.stepInner}>
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
              </li>
            ))}
          </ol>
          <div ref={outroRef} className={s.outro} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
