'use client';

import { useState, type CSSProperties } from 'react';
import { Status } from '@/components/ui/Status';
import s from './PlatformStack.module.css';

export interface PlatformModule {
  status: 'live' | 'platform' | 'design';
  title: string;
  body: string;
}

const statusLabel = { live: 'Launch focus', platform: 'On the platform', design: 'In design' } as const;
const statusTone = { live: 'warning', platform: 'primary', design: 'neutral' } as const;

/** The platform as a bento: an isometric stack of layers beside the module tiles. Hovering a tile lifts its layer. */
export function PlatformStack({ modules }: { modules: PlatformModule[] }) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className={s.bento}>
      <div className={s.visual} aria-hidden="true">
        <span className={s.glow} />
        <div className={s.stack}>
          {modules.map((m, i) => (
            <div key={m.title} className={s.slot} style={{ '--i': i } as CSSProperties}>
              <div className={[s.slab, s[m.status], hover === i ? s.on : ''].filter(Boolean).join(' ')} />
            </div>
          ))}
        </div>
      </div>
      {modules.map((m, i) => (
        <article
          key={m.title}
          className={[s.item, s[`item_${m.status}`], hover === i ? s.itemOn : '', 'reveal'].filter(Boolean).join(' ')}
          data-spotlight=""
          onPointerEnter={() => setHover(i)}
          onPointerLeave={() => setHover(null)}
        >
          <span className={s.index} aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <Status tone={statusTone[m.status]}>{statusLabel[m.status]}</Status>
          <h3>{m.title}</h3>
          <p>{m.body}</p>
        </article>
      ))}
    </div>
  );
}
