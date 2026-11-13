'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
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
 * The home hero is a sticky stage: copy, a giant dotted earth and the regulators band. The next
 * sheet slides up over it, and while it does the camera dollies into the earth, the copy drifts up
 * and the stage dims. Everything is driven by scroll position (no timers), so it never jumps.
 */
export function HomeHero({ intro, lede, actions, proof, band, cover }: HomeHeroProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const earthRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLSpanElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const [progress] = useState(() => ({ current: 0 }));

  // A hero taller than the viewport sticks by its lower edge, so all of it can be read first. Only the
  // hero's own height is measured; the viewport side is CSS `svh`, which does not change when a phone's
  // address bar shows or hides, so the stage never jumps.
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const set = () => hero.style.setProperty('--hero-h', `${hero.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(hero);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ fine: '(hover: hover) and (pointer: fine)', touch: '(hover: none), (pointer: coarse)' }, (context) => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: coverRef.current,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
            onUpdate: (self) => {
              progress.current = self.progress;
            },
          },
        });
        tl.to(shadeRef.current, { opacity: 1, duration: 1 }, 0);
        // Moving text against native touch scrolling can jitter, so on touch screens only light changes.
        if (context.conditions?.fine) {
          tl.to('[data-hero-text]', { y: -70, duration: 1 }, 0)
            .to('[data-hero-text]', { autoAlpha: 0.08, duration: 0.7, ease: 'power1.in' }, 0.3)
            .to(earthRef.current, { yPercent: -8, duration: 1 }, 0);
        }
      });
    }, wrapRef);
    return () => ctx.revert();
  }, [progress]);

  return (
    <div ref={wrapRef} className={styles.wrap}>
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
        <span ref={shadeRef} className={styles.shade} aria-hidden="true" />
      </section>
      <div ref={coverRef} className={styles.cover}>
        {cover}
      </div>
    </div>
  );
}
