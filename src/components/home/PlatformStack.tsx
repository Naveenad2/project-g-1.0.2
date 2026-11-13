import s from './PlatformStack.module.css';

export interface PlatformModule {
  status: 'live' | 'platform' | 'design';
  title: string;
  body: string;
}

const statusLabel = { live: 'Launch focus', platform: 'On the platform', design: 'In design' } as const;

/** The platform as an editorial index: eight modules, numbered, each with where it stands today. */
export function PlatformStack({ modules }: { modules: PlatformModule[] }) {
  return (
    <ol className={s.list}>
      {modules.map((m, i) => (
        <li key={m.title} className={`${s.item} ${s[m.status]} reveal`} data-spotlight="">
          <span className={s.index} aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className={s.text}>
            <p className={s.state}>{statusLabel[m.status]}</p>
            <h3>{m.title}</h3>
            <p className={s.body}>{m.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
