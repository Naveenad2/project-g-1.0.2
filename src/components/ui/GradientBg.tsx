import styles from './GradientBg.module.css';

export type GradientVariant = 'hero' | 'deep' | 'soft' | 'cta';

interface GradientBgProps {
  variant?: GradientVariant;
  /** Lean the field towards the warm orange. */
  warm?: boolean;
  /** Draw the luminous horizon along the lower edge (heroes). */
  horizon?: boolean;
  className?: string;
}

/**
 * Brand gradient field: layered radial light in navy, teal, mint and orange that drifts slowly,
 * with optional hairline arcs and a luminous horizon. Purely decorative and text-free.
 * The parent must be `position: relative` with `isolation: isolate`.
 */
export function GradientBg({ variant = 'hero', warm, horizon, className }: GradientBgProps) {
  return (
    <div aria-hidden="true" className={[styles.root, styles[variant], warm ? styles.warm : '', className].filter(Boolean).join(' ')}>
      <span className={`${styles.blob} ${styles.b1}`} />
      <span className={`${styles.blob} ${styles.b2}`} />
      <span className={`${styles.blob} ${styles.b3}`} />
      <span className={`${styles.blob} ${styles.b4}`} />
      <span className={`${styles.blob} ${styles.b5}`} />
      <svg className={styles.arcs} viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet">
        <circle cx="400" cy="400" r="160" />
        <circle cx="400" cy="400" r="250" />
        <circle cx="400" cy="400" r="340" strokeDasharray="2 8" />
        <circle cx="400" cy="400" r="398" />
      </svg>
      <span className={styles.dots} />
      {horizon && <span className={styles.horizon} />}
      <span className={styles.grain} />
    </div>
  );
}
