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

/**
 * Open a new page at its top, or at its #anchor when the link had one, at once: the jump is never animated
 * through the new page (the page fades in instead), and a smooth-scroll glide still running from the
 * previous page is cancelled so it cannot carry the new page down with it.
 */
export function startPage() {
  const lenis = scrollState.lenis;
  let id = '';
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    /* malformed hash: treat as none */
  }
  if (id && document.getElementById(id)) {
    // The router brings the anchor into view itself; only stop the glide wherever it put the page.
    lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    return;
  }
  const html = document.documentElement;
  const behavior = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  html.style.scrollBehavior = behavior;
  lenis?.scrollTo(0, { immediate: true, force: true });
}

/** Glide back to the top of the current page (for links to the page you are already on). */
export function scrollToTop() {
  const lenis = scrollState.lenis;
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.2, force: true });
    return;
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
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
