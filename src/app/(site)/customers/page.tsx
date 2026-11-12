import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { PageHero } from '@/components/blocks/PageHero';
import { CaseStudies } from '@/components/resources/CaseStudies';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Icon } from '@/components/ui/Icon';
import { Ph, Section, SectionLabel } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import c from './customers.module.css';

export const metadata: Metadata = {
  title: 'Customers',
  description: 'Compliance teams and consulting firms in their own words.',
};

const quotes = [
  ['[Quote from a compliance head about the evidence pack at inspection]', '[Name, title, organisation]'],
  ['[Quote from a consulting partner about repeatable engagements]', '[Name, title, firm]'],
  ['[Quote from an internal audit lead about live access]', '[Name, title, organisation]'],
];

export default function CustomersPage() {
  return (
    <>
      <PageHero
        compact
        crumb="Customers"
        eyebrow="Customers"
        title="Compliance teams and consulting firms in their own words."
        lede="Case studies filterable by industry and by role so that a consultant can find consultant-specific proof and a bank can find a bank."
      />

      <Section tight>
        <ul className={`${c.logos} reveal`}>
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>[Customer logo]</li>
          ))}
        </ul>
        <p className="note" style={{ marginTop: '1rem' }}>
          Logo strip reserved for launch customers who have agreed to be named.
        </p>
      </Section>

      <Section tone="subtle" bordered>
        <SectionLabel>Case studies</SectionLabel>
        <CaseStudies />
        <p className="note" style={{ marginTop: '1.6rem' }}>
          Case studies are structured placeholders for launch references; names and figures are to be supplied by the customers once agreed.
        </p>
      </Section>

      <Section tone="deep">
        <div className={c.quotes}>
          {quotes.map(([q, who]) => (
            <figure key={q} className={`${c.quote} reveal`}>
              <Icon name="quote" size={28} />
              <blockquote>
                &ldquo;<Ph>{q}</Ph>&rdquo;
              </blockquote>
              <figcaption>
                <Ph>{who}</Ph>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <CtaBand
        tone="plain"
        title="Be the next case study, or just get the work done."
        lede="Either way, start with the trial or a demo on your own regulators."
        actions={
          <>
            <ButtonLink href={routes.trial} arrow>
              Start free trial
            </ButtonLink>
            <ButtonLink href={routes.demo} variant="secondary">
              Book a demo
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
