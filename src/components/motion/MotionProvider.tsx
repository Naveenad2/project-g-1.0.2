'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { scrollState } from '@/lib/scroll';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Blocks that fade and rise into place. */
const REVEAL = '.reveal, [data-reveal]';
/** Headings whose lines rise out of a mask. */
const SPLIT = '.section-head > h2, [data-split]';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Phones and tablets keep native scrolling, and content is simply there rather than fading in. */
const touchScreen = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

/**
 * Site-wide motion: Lenis smooth scrolling driven by GSAP's ticker, and scroll-triggered reveals
 * re-applied on every route. Only content that starts below the fold is ever hidden, so nothing
 * flashes on load and everything stays visible if scripts fail or motion is reduced.
 */
export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (reducedMotion() || touchScreen()) return;
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      prevent: (node) => node instanceof HTMLElement && node.closest('[data-lenis-prevent]') !== null,
    });
    scrollState.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (seconds: number) => lenis.raf(seconds * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      scrollState.lenis = null;
    };
  }, []);

  useEffect(() => {
    if (reducedMotion() || touchScreen()) return;
    const ctx = gsap.context(() => {
      const fold = window.innerHeight * 0.94;
      const below = (el: Element) => el.getBoundingClientRect().top > fold && !el.closest('[data-motion-skip]');

      gsap.utils.toArray<HTMLElement>(SPLIT).forEach((el) => {
        if (!below(el)) return;
        gsap.set(el, { autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
            gsap.set(el, { autoAlpha: 1 });
            gsap.from(split.lines, {
              yPercent: 112,
              duration: 1.2,
              ease: 'expo.out',
              stagger: 0.09,
              onComplete: () => split.revert(),
            });
          },
        });
      });

      const items = gsap.utils.toArray<HTMLElement>(REVEAL).filter(below);
      if (items.length) {
        gsap.set(items, { autoAlpha: 0, y: 46 });
        ScrollTrigger.batch(items, {
          start: 'top 92%',
          once: true,
          interval: 0.08,
          batchMax: 6,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 1.15,
              ease: 'expo.out',
              stagger: 0.09,
              overwrite: true,
              clearProps: 'transform,opacity,visibility',
            }),
        });
      }

      // Parallax only with a mouse: on touch screens it would lag behind native scrolling and jitter.
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (fine)
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const amount = parseFloat(el.dataset.parallax || '0.1');
          gsap.fromTo(
            el,
            { yPercent: amount * 100 },
            { yPercent: -amount * 100, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        });
    });

    const refresh = () => ScrollTrigger.refresh();
    const timer = window.setTimeout(refresh, 400);
    document.fonts?.ready.then(refresh).catch(() => undefined);
    return () => {
      window.clearTimeout(timer);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
