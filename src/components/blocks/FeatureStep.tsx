import type { ReactNode } from 'react';
import { Showcase } from '@/components/ui/Showcase';
import styles from './FeatureStep.module.css';

interface FeatureStepProps {
  num?: string;
  label: ReactNode;
  title: ReactNode;
  pain?: ReactNode;
  children: ReactNode;
  bullets?: ReactNode[];
  visual: ReactNode;
  caption?: ReactNode;
  /** Kept for API compatibility: the bento grid now decides placement. */
  reverse?: boolean;
  first?: boolean;
  /** Present the visual without the gradient plate. */
  flat?: boolean;
  /** Kept for API compatibility. */
  depth?: boolean;
}

const PROBLEM_PREFIX = 'The problem:';

function Pain({ children }: { children: ReactNode }) {
  if (typeof children === 'string' && children.startsWith(PROBLEM_PREFIX)) {
    return (
      <p className={styles.pain}>
        <span className={styles.painKey}>{PROBLEM_PREFIX}</span> {children.slice(PROBLEM_PREFIX.length).trim()}
      </p>
    );
  }
  return <p className={styles.pain}>{children}</p>;
}

export function FeatureStep({ num, label, title, pain, children, bullets, visual, caption, flat }: FeatureStepProps) {
  return (
    <article className={`feature-card ${styles.card} reveal`} data-spotlight="">
      <p className={styles.meta}>
        {num && <span className={styles.num}>{num}</span>}
        <span className={styles.label}>{label}</span>
      </p>
      <h3 className={styles.title}>{title}</h3>
      {pain && <Pain>{pain}</Pain>}
      <div className={styles.body}>{children}</div>
      {bullets && bullets.length > 0 && (
        <ul className={`checklist ${styles.bullets}`}>
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      <figure className={styles.visual}>
        <Showcase variant={flat ? 'bare' : 'plate'} className={styles.show}>
          {visual}
        </Showcase>
        {caption && <figcaption className="caption">{caption}</figcaption>}
      </figure>
    </article>
  );
}
