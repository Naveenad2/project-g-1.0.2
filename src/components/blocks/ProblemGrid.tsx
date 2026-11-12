import type { ReactNode } from 'react';
import { Section, SectionLabel } from '@/components/ui/Section';
import styles from './ProblemGrid.module.css';

export interface Problem {
  pain: ReactNode;
  title: ReactNode;
  body: ReactNode;
}

interface ProblemGridProps {
  label?: string;
  items: Problem[];
}

export function ProblemGrid({ label, items }: ProblemGridProps) {
  const total = String(items.length).padStart(2, '0');
  return (
    <Section tight tone="mint">
      {label && <SectionLabel>{label}</SectionLabel>}
      <div className={styles.grid}>
        {items.map((item, i) => (
          <article key={i} className={`${styles.card} reveal`} data-spotlight="">
            <span className={styles.index} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
              <i>/ {total}</i>
            </span>
            <p className={styles.pain}>{item.pain}</p>
            <span className={styles.rule} aria-hidden="true" />
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.body}>{item.body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
