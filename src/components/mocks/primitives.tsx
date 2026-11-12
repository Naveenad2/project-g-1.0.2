import type { CSSProperties, ReactNode } from 'react';
import { Severity, Status, type StatusTone } from '@/components/ui/Status';
import s from './Mocks.module.css';

export { s as mockStyles, Status, Severity };

export function Frame({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div className={['frame', s.mock, className].filter(Boolean).join(' ')} role={label ? 'group' : undefined} aria-label={label}>
      {children}
    </div>
  );
}

export function Bar({ title, children, meta }: { title: ReactNode; children?: ReactNode; meta?: ReactNode }) {
  return (
    <div className={s.bar}>
      <span className={s.barTitle}>{title}</span>
      {children}
      {meta && <span className={s.barMeta}>{meta}</span>}
    </div>
  );
}

export function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span className="avatar" style={{ background: color }}>
      {initials}
    </span>
  );
}

/** Segmented meter: track and fill share one mask, so segments always line up. */
export function Meter({ value, warn }: { value: number; warn?: boolean }) {
  return (
    <span className={[s.meter, warn ? s.meterWarn : ''].join(' ')} role="presentation">
      <i style={{ width: `${value}%` }} />
    </span>
  );
}

/** Grid-based table. Below `minWidth` it scrolls inside its card instead of squeezing columns. */
export function Table({ cols, minWidth = 460, children }: { cols: string; minWidth?: number; children: ReactNode }) {
  return (
    <div className={s.scroll}>
      <div className={s.table} style={{ '--cols': cols, minWidth } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}

export function Tr({ head, children, className }: { head?: boolean; children: ReactNode; className?: string }) {
  return <div className={[s.tr, head ? s.th : '', className].filter(Boolean).join(' ')}>{children}</div>;
}

interface LaneStep {
  title: string;
  sub: string;
  kind?: 'decision' | 'end';
}

function LaneIcon({ kind }: { kind?: LaneStep['kind'] }) {
  if (kind === 'decision')
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 1.6 14.4 8 8 14.4 1.6 8z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  if (kind === 'end')
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1.6" y="1.6" width="12.8" height="12.8" rx="2" fill="currentColor" />
        <path d="m4.8 8.2 2.2 2.2 4.2-4.4" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Process lane with shape-coded steps: task (square), decision (diamond), outcome (filled). */
export function Lane({ steps }: { steps: LaneStep[] }) {
  return (
    <ol className={s.lane}>
      {steps.map((step) => (
        <li key={step.title} className={s.laneStep} data-kind={step.kind ?? 'task'}>
          <span className={s.laneIcon}>
            <LaneIcon kind={step.kind} />
          </span>
          <span className={s.laneText}>
            <b>{step.title}</b>
            <small>{step.sub}</small>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Check({ on }: { on?: boolean }) {
  return (
    <span className={[s.box, on ? s.boxOn : ''].join(' ')} aria-hidden="true">
      {on && (
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          <path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

/** One-line notice led by a glyph instead of a tinted box. */
export function Alert({ tone = 'warning', children }: { tone?: Extract<StatusTone, 'warning' | 'info' | 'success'>; children: ReactNode }) {
  return (
    <p className={s.alert} data-tone={tone}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        {tone === 'warning' ? (
          <>
            <path d="M8 1.8 14.6 13.6H1.4z" fill="currentColor" />
            <path d="M8 6v3.4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.4" r="0.85" fill="#fff" />
          </>
        ) : tone === 'success' ? (
          <>
            <circle cx="8" cy="8" r="6.6" fill="currentColor" />
            <path d="m5 8.2 2 2 4-4.2" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <circle cx="8" cy="8" r="6.6" fill="currentColor" />
            <path d="M8 7.2v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="4.9" r="0.85" fill="#fff" />
          </>
        )}
      </svg>
      <span>{children}</span>
    </p>
  );
}

export type EntityKind = 'risk' | 'ctl' | 'pol' | 'other';

export function EntityGlyph({ kind }: { kind: EntityKind }) {
  switch (kind) {
    case 'risk':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 2 14.4 13.4H1.6z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'ctl':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M8 1.6 2.8 3.6v4c0 3.2 2.1 5.6 5.2 6.8 3.1-1.2 5.2-3.6 5.2-6.8v-4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'pol':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M3.4 1.6h6l3.2 3.2v9.6H3.4z M9.4 1.6v3.2h3.2 M5.6 8h4.8 M5.6 10.6h3.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2.2" y="2.2" width="11.6" height="11.6" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 8h6 M8 5v6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
  }
}

/** Register entity (risk, control, policy…) with a type glyph — no colour bars. */
export function Node({ kind, code, title, detail }: { kind: EntityKind; code: string; title: ReactNode; detail: ReactNode }) {
  return (
    <div className={s.node} data-kind={kind}>
      <span className={s.nodeGlyph}>
        <EntityGlyph kind={kind} />
      </span>
      <span className={s.nodeBody}>
        <span className={s.code}>{code}</span>
        <b>{title}</b>
        <small>{detail}</small>
      </span>
    </div>
  );
}

/** Small toggle switch glyph used to depict platform settings. */
export function Switch({ on }: { on?: boolean }) {
  return <span className={[s.switch, on ? s.switchOn : ''].join(' ')} aria-hidden="true" />;
}
