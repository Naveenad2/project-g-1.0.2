import type { ReactNode } from 'react';
import styles from './Timeline.module.css';

export interface TimelineItem {
  when: ReactNode;
  title: ReactNode;
  body: ReactNode;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className={`${styles.timeline} reveal`} style={{ '--count': items.length } as React.CSSProperties}>
      {items.map((item, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.marker} aria-hidden="true" />
          <p className={styles.when}>{item.when}</p>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.body}>{item.body}</p>
        </li>
      ))}
    </ol>
  );
}
