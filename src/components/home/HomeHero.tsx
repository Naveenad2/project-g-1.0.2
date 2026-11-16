'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, type ReactNode } from 'react';
import { GradientBg } from '@/components/ui/GradientBg';
import { ImpactMap } from './ImpactMap';
import styles from './HomeHero.module.css';

gsap.registerPlugin(ScrollTrigger);

interface HomeHeroProps {
  intro: ReactNode;
  lede: ReactNode;
  actions: ReactNode;
  band: ReactNode;
  cover: ReactNode;
}

/**
 * The home hero: copy beside a board of liquid-glass product widgets, with the regulators band along its foot,
 * followed by the next section in normal flow (nothing slides over it). With a mouse, the copy and the board
 * lift as the hero scrolls away; it follows the scroll position (no timers), so it never jumps.
 */
export function HomeHero({ intro, lede, actions, band, cover }: HomeHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      // Moving content against native touch scrolling can jitter, so only mouse and trackpad screens get this.
      mm.add('(hover: hover) and (pointer: fine)', () => {
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
          })
          .to('[data-hero-text]', { y: -70, duration: 1 }, 0)
          .to('[data-hero-text]', { autoAlpha: 0.08, duration: 0.7, ease: 'power1.in' }, 0.3)
          .to(visualRef.current, { y: -56, duration: 1 }, 0);
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section ref={heroRef} className={styles.hero} id="top">
        <GradientBg variant="hero" warm />
        <div className={`container ${styles.grid}`}>
          {/* On phones and tablets the board sits in the first screen, between the actions and the intro */}
          <div className={styles.copy}>
            <div className={`${styles.part} ${styles.intro}`} data-hero-text="">
              {intro}
            </div>
            <div className={`${styles.part} ${styles.lede}`} data-hero-text="">
              {lede}
            </div>
            <div className={`${styles.part} ${styles.actions}`} data-hero-text="">
              {actions}
            </div>
            <div ref={visualRef} className={styles.visual}>
              <ImpactMap />
            </div>
          </div>
        </div>
        <div className={styles.band}>{band}</div>
      </section>
      {cover}
    </>
  );
}
