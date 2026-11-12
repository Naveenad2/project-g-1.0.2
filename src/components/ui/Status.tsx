import type { ReactNode } from 'react';
import styles from './Status.module.css';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';

function Glyph({ tone }: { tone: StatusTone }) {
  switch (tone) {
    case 'success':
      return (
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="6" fill="currentColor" />
          <path d="M4.3 7.2 6.1 9l3.6-3.8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'warning':
      return (
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 3.4a3.6 3.6 0 0 1 0 7.2z" fill="currentColor" />
        </svg>
      );
    case 'info':
      return (
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 7V3.4a3.6 3.6 0 1 1-3.6 3.6z" fill="currentColor" />
        </svg>
      );
    case 'danger':
      return (
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <path d="M7 .9 13.2 7 7 13.1.8 7z" fill="currentColor" />
          <path d="M7 4.2v3.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="7" cy="9.7" r="0.95" fill="#fff" />
        </svg>
      );
    case 'primary':
      return (
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="7" cy="7" r="2.4" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.3 2.1" />
        </svg>
      );
  }
}

interface StatusProps {
  tone?: StatusTone;
  children: ReactNode;
  /** Colour the label as well as the glyph. */
  strong?: boolean;
  className?: string;
}

/** Workflow / lifecycle state: a product-style glyph plus a plain label. */
export function Status({ tone = 'neutral', children, strong, className }: StatusProps) {
  return (
    <span className={[styles.status, styles[tone], strong ? styles.strong : '', className].filter(Boolean).join(' ')}>
      <Glyph tone={tone} />
      <span>{children}</span>
    </span>
  );
}

/** Risk severity as signal bars: High fills three, Medium two, Low one. */
export function Severity({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const filled = level === 'High' ? 3 : level === 'Medium' ? 2 : 1;
  const tone = level === 'High' ? styles.danger : level === 'Medium' ? styles.warning : styles.success;
  return (
    <span className={`${styles.status} ${tone}`}>
      <svg viewBox="0 0 14 14" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={1.5 + i * 4.2}
            y={9 - i * 3.2}
            width="3"
            height={4 + i * 3.2}
            rx="0.6"
            fill={i < filled ? 'currentColor' : 'var(--line-strong)'}
          />
        ))}
      </svg>
      <span>{level}</span>
    </span>
  );
}
