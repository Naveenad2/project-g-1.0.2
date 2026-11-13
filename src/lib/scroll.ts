import type Lenis from 'lenis';

/** The page's smooth-scroll instance, when motion is allowed. */
export const scrollState: { lenis: Lenis | null } = { lenis: null };

/** Pause or resume smooth scrolling (for example while the mobile menu is open). */
export function lockScroll(lock: boolean) {
  const lenis = scrollState.lenis;
  if (!lenis) return;
  if (lock) lenis.stop();
  else lenis.start();
}

/** Scroll to an element through Lenis when it is running, natively otherwise. */
export function scrollToElement(el: HTMLElement, offset = 0) {
  const lenis = scrollState.lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.3 });
    return;
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
}
