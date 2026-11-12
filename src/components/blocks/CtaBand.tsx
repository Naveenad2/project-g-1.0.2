import type { ReactNode } from 'react';
import { GradientBg } from '@/components/ui/GradientBg';
import { DocStack } from './DocStack';
import styles from './CtaBand.module.css';

interface CtaBandProps {
  title: ReactNode;
  lede?: ReactNode;
  actions: ReactNode;
  /** 'peach' leans the gradient warm; 'deep' and 'plain' use the teal field. */
  tone?: 'peach' | 'plain' | 'deep';
}

export function CtaBand({ title, lede, actions, tone = 'peach' }: CtaBandProps) {
  return (
    <section className={`section section--tight ${styles.band}`}>
      <div className="container">
        <div className={`is-dark ${styles.card} reveal`}>
          <GradientBg variant="cta" warm={tone === 'peach'} />
          <div className={styles.inner}>
            <div className={styles.copy}>
              <h2>{title}</h2>
              {lede && <p className="lede">{lede}</p>}
              <div className={`actions ${styles.actions}`}>{actions}</div>
            </div>
            <div className={styles.art}>
              <DocStack />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
