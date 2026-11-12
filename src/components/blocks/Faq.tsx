import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import styles from './Faq.module.css';

export function Faq({ items }: { items: { q: ReactNode; a: ReactNode }[] }) {
  return (
    <div className={`${styles.faq} reveal reveal--late`}>
      {items.map((item, i) => (
        <details key={i} className={styles.item} name="faq">
          <summary className={styles.q}>
            <span>{item.q}</span>
            <span className={styles.icon} aria-hidden="true">
              <Icon name="chevronDown" size={18} />
            </span>
          </summary>
          <div className={styles.a}>
            <p>{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
