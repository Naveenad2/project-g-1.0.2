import styles from './GradientBg.module.css';

export type GradientVariant = 'hero' | 'deep' | 'soft' | 'cta' | 'vivid';

interface GradientBgProps {
  variant?: GradientVariant;
  /** Lean the field towards tangerine. */
  warm?: boolean;
  /** Soft tangerine-to-teal light along the lower edge (heroes). */
  horizon?: boolean;
  className?: string;
}

/**
 * Animated brand gradient: layered tangerine, teal and mint light that flows slowly on the compositor
 * (transform only, no filters, so it never repaints or flickers), finished with a fine film grain.
 * Purely decorative and text-free. The parent must be `position: relative` with `isolation: isolate`.
 */
export function GradientBg({ variant = 'hero', warm, horizon, className }: GradientBgProps) {
  return (
    <div aria-hidden="true" className={[styles.root, styles[variant], warm ? styles.warm : '', className].filter(Boolean).join(' ')}>
      <span className={`${styles.blob} ${styles.b1}`} />
      <span className={`${styles.blob} ${styles.b2}`} />
      <span className={`${styles.blob} ${styles.b3}`} />
      <span className={`${styles.blob} ${styles.b4}`} />
      <span className={`${styles.blob} ${styles.b5}`} />
      {horizon && <span className={styles.horizon} />}
      <span className={styles.grain} />
    </div>
  );
}
