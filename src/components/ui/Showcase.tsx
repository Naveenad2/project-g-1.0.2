import type { ReactNode } from 'react';
import styles from './Showcase.module.css';

interface ShowcaseProps {
  children: ReactNode;
  /** 'plate' frames the visual on a gradient plate (glass on dark backgrounds); 'bare' only adds the glow. */
  variant?: 'plate' | 'bare';
  className?: string;
}

/**
 * Presentation frame for product visuals. Depth comes from layered light, glass and shadow rather than
 * 3D rotation, so the UI inside always renders pixel-sharp.
 */
export function Showcase({ children, variant = 'plate', className }: ShowcaseProps) {
  return (
    <div className={[styles.showcase, styles[variant], className].filter(Boolean).join(' ')}>
      <span className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
