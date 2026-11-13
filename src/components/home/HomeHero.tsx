'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Globe } from '@/components/globe/Globe';
import { GradientBg } from '@/components/ui/GradientBg';
import styles from './HomeHero.module.css';

gsap.registerPlugin(ScrollTrigger);

interface HomeHeroProps {
  intro: ReactNode;
  lede: ReactNode;
  actions: ReactNode;
  proof: ReactNode;
  band: ReactNode;
  cover: ReactNode;
}

/**
 * The home hero: copy, a giant earth and the regulators band, followed by the next section in normal
 * flow (nothing slides over it). As the hero scrolls away the earth turns and moves closer inside its
 * own canvas, and with a mouse the copy also lifts and fades. All of it follows the scroll position
 * (no timers), so it never jumps.
 */
export function HomeHero({ intro, lede, actions, proof, band, cover }: HomeHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const earthRef = useRef<HTMLDivElement>(null);
  const [progress] = useState(() => ({ current: 0 }));

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ fine: '(hover: hover) and (pointer: fine)', touch: '(hover: none), (pointer: coarse)' }, (context) => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
              progress.current = self.progress;
            },
          },
        });
        // Moving text against native touch scrolling can jitter, so on touch screens only the earth
        // (inside its canvas) responds.
        if (context.conditions?.fine) {
          tl.to('[data-hero-text]', { y: -70, duration: 1 }, 0)
            .to('[data-hero-text]', { autoAlpha: 0.08, duration: 0.7, ease: 'power1.in' }, 0.3)
            .to(earthRef.current, { yPercent: -8, duration: 1 }, 0);
        }
      });
    }, heroRef);
    return () => ctx.revert();
  }, [progress]);

  return (
    <>
      <section ref={heroRef} className={styles.hero} id="top">
        <GradientBg variant="hero" warm />
        <div className={`container ${styles.grid}`}>
          {/* On phones and tablets the earth sits in the first screen, between the actions and the intro */}
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
            <div className={styles.earthSlot}>
              <div ref={earthRef} className={styles.earth}>
                <Globe variant="hero" progress={progress} />
              </div>
            </div>
            <div className={`${styles.part} ${styles.proof}`} data-hero-text="">
              {proof}
            </div>
          </div>
        </div>
        <div className={styles.band}>{band}</div>
      </section>
      {cover}
    </>
  );
}
