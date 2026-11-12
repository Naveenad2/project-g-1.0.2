export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'gieom-theme';

/**
 * Runs in <head> before first paint. The site defaults to light regardless of
 * the operating-system preference; dark is applied only when the visitor has
 * chosen it with the toggle.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function applyTheme(next: Theme) {
  const root = document.documentElement;
  const commit = () => {
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode): theme still applies for this page view */
    }
    window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!reduce && typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(commit);
  } else {
    commit();
  }
}
