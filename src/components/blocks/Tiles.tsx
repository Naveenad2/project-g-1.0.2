import type { ReactNode } from 'react';
import styles from './Tiles.module.css';

export interface TileItem {
  title: ReactNode;
  body?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
}

interface TilesProps {
  items: TileItem[];
  columns?: 2 | 3 | 4;
  /** "grid" = editorial columns under a top rule; "cards" = raised cards lit by the cursor. */
  variant?: 'cards' | 'grid';
  className?: string;
}

export function Tiles({ items, columns = 3, variant = 'grid', className }: TilesProps) {
  const cards = variant === 'cards';
  return (
    <div className={[styles.tiles, styles[`cols${columns}`], styles[variant], className].filter(Boolean).join(' ')}>
      {items.map((item, i) => (
        <div key={i} className={`${styles.slot} reveal`}>
          <article className={styles.tile} data-spotlight={cards ? '' : undefined}>
            {item.meta && <div className={styles.meta}>{item.meta}</div>}
            <h3 className={styles.title}>{item.title}</h3>
            {item.body && <div className={styles.body}>{item.body}</div>}
            {item.footer && <div className={styles.footer}>{item.footer}</div>}
          </article>
        </div>
      ))}
    </div>
  );
}
