'use client';

import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/ui/Icon';
import { applyTheme, readTheme, type Theme } from '@/lib/theme';
import styles from './ThemeToggle.module.css';

function subscribe(onChange: () => void) {
  window.addEventListener('themechange', onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener('themechange', onChange);
    window.removeEventListener('storage', onChange);
  };
}

const getServerSnapshot = (): Theme => 'light';

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerSnapshot);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={[styles.toggle, className].filter(Boolean).join(' ')}
      onClick={() => applyTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb}>
          <Icon name={isDark ? 'moon' : 'sun'} size={13} strokeWidth={2} />
        </span>
      </span>
    </button>
  );
}
