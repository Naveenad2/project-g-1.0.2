'use client';

import { useEffect, useRef } from 'react';
import type { GlobeHandle, GlobeVariant } from './scene';
import styles from './Globe.module.css';

interface GlobeProps {
  variant?: GlobeVariant;
  /** 'dark' keeps the navy palette whatever the site theme (for navy panels). */
  tone?: 'auto' | 'dark';
  /** Scroll-linked transition value (0 → 1) the scene reads on every frame. */
  progress?: { current: number };
  className?: string;
}

/**
 * WebGL earth drawn as fine coastline outlines, with arcs between the regulators the platform covers.
 * three.js loads only when the globe nears the viewport; the canvas fades in on its first frame and
 * renders only while it is on screen and the tab is visible. Without WebGL nothing is drawn and the
 * gradient behind it shows.
 *
 * A parent can set `--globe-fade: <start> <end>` (fractions of the canvas height from the top) to fade
 * the drawing out towards its foot, for layouts where copy follows directly below the earth.
 */
export function Globe({ variant = 'hero', tone = 'auto', progress, className }: GlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const root = document.documentElement;
    let handle: GlobeHandle | null = null;
    let cancelled = false;
    let started = false;
    let visible = false;

    const readFade = (): [number, number] | null => {
      const [start, end] = getComputedStyle(wrap).getPropertyValue('--globe-fade').trim().split(/\s+/).map(Number);
      return Number.isFinite(start) && Number.isFinite(end) && end > start ? [start, end] : null;
    };
    const sync = () => handle?.setActive(visible && !document.hidden);
    const ro = new ResizeObserver(() => {
      handle?.setFade(readFade());
      handle?.resize();
    });
    const mo = new MutationObserver(() => handle?.setTheme(root.dataset.theme === 'dark'));

    const start = () => {
      started = true;
      import('./scene')
        .then(({ createGlobe }) => {
          if (cancelled) return;
          handle = createGlobe(canvas, {
            variant,
            progress,
            forceDark: tone === 'dark',
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            dark: root.dataset.theme === 'dark',
            onReady: () => wrap.setAttribute('data-ready', ''),
          });
          if (!handle) return;
          ro.observe(wrap);
          mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
          document.addEventListener('visibilitychange', sync);
          sync();
        })
        .catch(() => {
          /* WebGL or the chunk is unavailable: the gradient field stands on its own. */
        });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) start();
        sync();
      },
      { rootMargin: '240px 0px' },
    );
    io.observe(wrap);

    return () => {
      cancelled = true;
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', sync);
      handle?.dispose();
      handle = null;
    };
  }, [variant, tone, progress]);

  return (
    <div ref={wrapRef} className={[styles.wrap, className].filter(Boolean).join(' ')} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
