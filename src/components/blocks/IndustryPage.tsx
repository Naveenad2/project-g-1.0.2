import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Section, SectionHeader } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import styles from '@/styles/page.module.css';
import { CtaBand } from './CtaBand';
import { FeatureStep } from './FeatureStep';
import { PageHero } from './PageHero';
import { ProblemGrid, type Problem } from './ProblemGrid';
import { Tiles } from './Tiles';

interface Usage {
  label: string;
  title: string;
  body: ReactNode;
  bullets: string[];
  visual: ReactNode;
  caption: string;
}

type Action = { label: string; href: string };

export interface IndustryPageProps {
  eyebrow: string;
  title: string;
  lede: string;
  regulators: string[];
  primary: Action;
  secondary: Action;
  heroVisual: ReactNode;
  heroCaption: string;
  problems: Problem[];
  usage: [Usage, Usage];
  setTitle: string;
  setLede?: string;
  set: [string, string][];
  cta: { title: string; lede: string; primary: Action; secondary: Action };
}

export function IndustryPage(p: IndustryPageProps) {
  return (
    <>
      <PageHero
        crumb="Solutions · By industry"
        eyebrow={p.eyebrow}
        title={p.title}
        lede={p.lede}
        extra={
          <div className={styles.regs} aria-label="Regulators and standards">
            {p.regulators.map((r) => (
              <span key={r}>{r}</span>
            ))}
          </div>
        }
        actions={
          <>
            <ButtonLink href={p.primary.href} arrow>
              {p.primary.label}
            </ButtonLink>
            <ButtonLink href={p.secondary.href} variant="secondary">
              {p.secondary.label}
            </ButtonLink>
          </>
        }
        visual={p.heroVisual}
        caption={p.heroCaption}
      />

      <ProblemGrid items={p.problems} />

      <Section>
        {p.usage.map((u, i) => (
          <FeatureStep
            key={u.label}
            first={i === 0}
            reverse={i === 1}
            label={u.label}
            title={u.title}
            bullets={u.bullets}
            visual={u.visual}
            caption={u.caption}
          >
            <p>{u.body}</p>
          </FeatureStep>
        ))}
      </Section>

      <Section tone="deep">
        <SectionHeader title={p.setTitle} lede={p.setLede} />
        <Tiles columns={4} items={p.set.map(([title, body]) => ({ title, body }))} />
      </Section>

      <CtaBand
        title={p.cta.title}
        lede={p.cta.lede}
        actions={
          <>
            <ButtonLink href={p.cta.primary.href} arrow>
              {p.cta.primary.label}
            </ButtonLink>
            <ButtonLink href={p.cta.secondary.href} variant="secondary">
              {p.cta.secondary.label}
            </ButtonLink>
          </>
        }
      />
    </>
  );
}

export const trialAction: Action = { label: 'Start free trial', href: routes.trial };
export const demoAction: Action = { label: 'Book a demo', href: routes.demo };
