import Link from 'next/link';
import type { ReactNode } from 'react';
import { GradientBg } from '@/components/ui/GradientBg';
import { Rise } from '@/components/ui/Rise';
import { Showcase } from '@/components/ui/Showcase';
import { routes } from '@/lib/routes';
import { DocStack } from './DocStack';
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
  /** Show the document stack beside heroes that have no visual (desktop only). */
  art?: boolean;
  /** Narrow the heading measure on single-column heroes. */
  titleWidth?: 'narrow' | 'medium' | 'wide';
  tone?: 'mint' | 'peach' | 'plain';
  compact?: boolean;
  children?: ReactNode;
}

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
  art = true,
  titleWidth = 'medium',
  tone = 'mint',
  compact,
  children,
}: PageHeroProps) {
  const split = Boolean(visual);
  const showArt = !visual && art;
  return (
    <section className={styles.hero}>
      <div
        className={['is-dark', styles.panel, compact ? styles.compact : '', split ? styles.split : '', showArt ? styles.withArt : '']
          .filter(Boolean)
          .join(' ')}
      >
        <GradientBg variant="hero" warm={tone === 'peach'} horizon />
        <div className={`container ${styles.grid}`}>
          <div className={styles.copy}>
            {crumb && (
              <nav aria-label="Breadcrumb" className={styles.crumb}>
                <ol>
                  <li>
                    <Link href={routes.home}>Home</Link>
                  </li>
                  <li aria-current="page">{crumb}</li>
                </ol>
              </nav>
            )}
            <p className="eyebrow">{eyebrow}</p>
            <h1 className={styles[`title_${titleWidth}`]}>
              <Rise>{title}</Rise>
            </h1>
            {lede && <p className={`lede ${styles.lede}`}>{lede}</p>}
            {extra && <div className={styles.extra}>{extra}</div>}
            {actions && <div className={`actions ${styles.actions}`}>{actions}</div>}
          </div>
          {showArt && (
            <div className={styles.art} aria-hidden="true">
              <DocStack />
            </div>
          )}
          {visual && (
            <figure className={styles.visual}>
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
