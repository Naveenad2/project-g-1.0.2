'use client';

import { useEffect } from 'react';

/**
 * One delegated pointer listener lights every [data-spotlight] card under the cursor.
 * It only sets --spot-x / --spot-y (no rotation or scaling), so text stays crisp.
 */
export function SpotlightController() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;

    const update = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const el = e.target instanceof Element ? (e.target.closest('[data-spotlight]') as HTMLElement | null) : null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--spot-x', `${Math.round(e.clientX - r.left)}px`);
      el.style.setProperty('--spot-y', `${Math.round(e.clientY - r.top)}px`);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      last = e;
      if (!frame) frame = requestAnimationFrame(update);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
