import type { ReactNode } from 'react';
import styles from './CtaBand.module.css';

interface CtaBandProps {
  title: ReactNode;
  lede?: ReactNode;
  actions: ReactNode;
  /** 'peach' leans the light behind the copy warmer. */
  tone?: 'peach' | 'plain' | 'deep';
}

/** Closing call to action, open to the page: centred copy on tangerine and teal light that fades into it. */
export function CtaBand({ title, lede, actions, tone = 'peach' }: CtaBandProps) {
  return (
    <section className={`section ${styles.band} ${tone === 'peach' ? styles.warm : ''}`}>
      <div className={`container ${styles.inner}`}>
        <div className={`${styles.copy} reveal`}>
          <h2>{title}</h2>
          {lede && <p className="lede">{lede}</p>}
          <div className={`actions ${styles.actions}`}>{actions}</div>
        </div>
      </div>
    </section>
  );
}
