import styles from './DocStack.module.css';

/**
 * Signature 3D object: an isometric stack of policy sheets. The top sheet carries
 * linkage marks and an approval seal; the stack fans open on hover. Decorative.
 */
export function DocStack({ className }: { className?: string }) {
  return (
    <div className={[styles.scene, className].filter(Boolean).join(' ')} aria-hidden="true">
      <div className={styles.stack}>
        <span className={`${styles.sheet} ${styles.s4}`} />
        <span className={`${styles.sheet} ${styles.s3}`} />
        <span className={`${styles.sheet} ${styles.s2}`} />
        <span className={`${styles.sheet} ${styles.s1}`}>
          <i className={styles.lineH} />
          <i className={styles.line} style={{ width: '78%' }} />
          <i className={styles.line} style={{ width: '64%' }} />
          <i className={`${styles.line} ${styles.linked}`} style={{ width: '70%' }} />
          <i className={styles.line} style={{ width: '56%' }} />
          <i className={styles.line} style={{ width: '72%' }} />
          <span className={styles.seal}>
            <svg viewBox="0 0 24 24">
              <path
                d="m6.5 12.4 3.6 3.6 7.4-7.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </div>
    </div>
  );
}
