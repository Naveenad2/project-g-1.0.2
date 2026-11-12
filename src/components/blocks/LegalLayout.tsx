import type { ReactNode } from 'react';
import { Section } from '@/components/ui/Section';
import r from '@/styles/resources.module.css';

interface LegalLayoutProps {
  toc: [id: string, label: string][];
  notice: ReactNode;
  children: ReactNode;
}

/** Two-column legal document: sticky contents on the left, article on the right. */
export function LegalLayout({ toc, notice, children }: LegalLayoutProps) {
  return (
    <Section>
      <div className={r.legal}>
        <nav className={r.toc} aria-label="Sections">
          <b>Contents</b>
          {toc.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <article className={r.article}>
          <div className={r.notice}>{notice}</div>
          {children}
        </article>
      </div>
    </Section>
  );
}
