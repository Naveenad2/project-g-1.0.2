import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { GradientBg } from '@/components/ui/GradientBg';
import { Rise } from '@/components/ui/Rise';
import { Showcase } from '@/components/ui/Showcase';
import { routes } from '@/lib/routes';
import styles from './PageHero.module.css';

interface PageHeroProps {
  /** Trail after "Home", e.g. "Product" or "Solutions · By role". Omit to hide the breadcrumb. */
  crumb?: string;
  eyebrow: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  /** Extra content under the lede (regulator tags, filters, search…). */
  extra?: ReactNode;
  visual?: ReactNode;
  caption?: ReactNode;
  /** Present the visual without the glass plate. */
  flatVisual?: boolean;
  /** Narrow the heading measure on single-column heroes. */
  titleWidth?: 'narrow' | 'medium' | 'wide';
  tone?: 'mint' | 'peach' | 'plain';
  compact?: boolean;
  children?: ReactNode;
}

const delay = (ms: number) => ({ '--d': ms }) as CSSProperties;

export function PageHero({
  crumb,
  eyebrow,
  title,
  lede,
  actions,
  extra,
  visual,
  caption,
  flatVisual,
  titleWidth = 'medium',
  tone = 'mint',
  compact,
  children,
}: PageHeroProps) {
  const split = Boolean(visual);
  return (
    <section className={styles.hero}>
      <div className={[styles.panel, compact ? styles.compact : '', split ? styles.split : ''].filter(Boolean).join(' ')}>
        <GradientBg variant="hero" warm={tone === 'peach'} horizon />
        <div className={`container ${styles.grid}`}>
          <div className={styles.copy}>
            {crumb && (
              <nav aria-label="Breadcrumb" className={`${styles.crumb} load-in`} style={delay(40)}>
                <ol>
                  <li>
                    <Link href={routes.home}>Home</Link>
                  </li>
                  <li aria-current="page">{crumb}</li>
                </ol>
              </nav>
            )}
            <p className="eyebrow load-in" style={delay(100)}>
              {eyebrow}
            </p>
            <h1 className={styles[`title_${titleWidth}`]}>
              <Rise>{title}</Rise>
            </h1>
            {lede && (
              <p className={`lede load-in ${styles.lede}`} style={delay(420)}>
                {lede}
              </p>
            )}
            {extra && (
              <div className={`${styles.extra} load-in`} style={delay(520)}>
                {extra}
              </div>
            )}
            {actions && (
              <div className={`actions load-in ${styles.actions}`} style={delay(600)}>
                {actions}
              </div>
            )}
          </div>
          {visual && (
            <figure className={`${styles.visual} load-in`} style={delay(380)}>
              <Showcase variant={flatVisual ? 'bare' : 'plate'}>{visual}</Showcase>
              {caption && <figcaption className="caption">{caption}</figcaption>}
            </figure>
          )}
        </div>
        {children && <div className={styles.after}>{children}</div>}
      </div>
    </section>
  );
}
