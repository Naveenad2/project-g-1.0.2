import type { ReactNode } from 'react';

type Tone = 'default' | 'subtle' | 'mint' | 'peach' | 'deep';

interface SectionProps {
  id?: string;
  tone?: Tone;
  tight?: boolean;
  bordered?: boolean;
  className?: string;
  containerClassName?: string;
  ariaLabel?: string;
  children: ReactNode;
}

export function Section({ id, tone = 'default', tight, bordered, className, containerClassName, ariaLabel, children }: SectionProps) {
  const cls = ['section', tone !== 'default' && `section--${tone}`, tight && 'section--tight', bordered && 'section--line', className]
    .filter(Boolean)
    .join(' ');
  return (
    <section id={id} className={cls} aria-label={ariaLabel}>
      <div className={['container', containerClassName].filter(Boolean).join(' ')}>{children}</div>
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label">{children}</p>;
}

interface SectionHeaderProps {
  title: ReactNode;
  lede?: ReactNode;
  split?: boolean;
  className?: string;
}

export function SectionHeader({ title, lede, split = true, className }: SectionHeaderProps) {
  return (
    <div className={['section-head', split && lede ? 'section-head--split' : '', 'reveal', className].filter(Boolean).join(' ')}>
      <h2>{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </div>
  );
}

/** Bracketed copy awaiting final content from the business. */
export function Ph({ children }: { children: ReactNode }) {
  return <span className="ph">{children}</span>;
}
