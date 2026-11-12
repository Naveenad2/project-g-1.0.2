'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

/** True while the element is at least `threshold` visible in the viewport. */
export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      const id = window.setTimeout(() => setInView(true), 0);
      return () => window.clearTimeout(id);
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

interface SequenceOptions {
  /** Timeline only advances while active (e.g. while on screen). */
  active: boolean;
  /** Restart from stage 0 this many ms after the timeline starts. */
  loopAfter?: number;
}

/**
 * Drives a scripted demo. `times[i]` is the ms offset at which stage i + 1 begins.
 * Returns the current stage (0…times.length), a run counter that increments on each
 * loop/replay, and a `replay` function. With reduced motion the final stage is shown.
 */
export function useSequence(times: readonly number[], { active, loopAfter }: SequenceOptions) {
  const [stage, setStage] = useState(0);
  const [run, setRun] = useState(0);
  const reduced = usePrefersReducedMotion();
  const timesKey = times.join(',');

  useEffect(() => {
    if (!active || reduced) return;
    const offsets = timesKey.split(',').map(Number);
    const timers = [window.setTimeout(() => setStage(0), 0)];
    offsets.forEach((t, i) => timers.push(window.setTimeout(() => setStage(i + 1), t)));
    if (loopAfter) timers.push(window.setTimeout(() => setRun((r) => r + 1), loopAfter));
    return () => timers.forEach(window.clearTimeout);
  }, [active, reduced, run, loopAfter, timesKey]);

  const replay = useCallback(() => setRun((r) => r + 1), []);

  return { stage: reduced ? times.length : stage, run, replay, reduced };
}
