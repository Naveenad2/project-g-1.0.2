import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand } from '@/components/blocks/CtaBand';
import { PageHero } from '@/components/blocks/PageHero';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Section } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import r from '@/styles/resources.module.css';

export const metadata: Metadata = {
  title: 'GRC glossary',
  description: 'GRC terms explained in a paragraph each.',
};

interface Term {
  term: string;
  aside?: string;
  body: string;
  link?: [string, string];
}

const glossary: Record<string, Term[]> = {
  A: [
    {
      term: 'Acknowledgement tracking',
      body: 'Recording which people have read and confirmed a published policy or procedure, and which have not. Distinct from training: acknowledgement proves dissemination; an assessment proves understanding.',
      link: [routes.productPolicy, 'In Gieom.cloud →'],
    },
    {
      term: 'Approval tier',
      body: 'A level of sign-off in a document’s lifecycle. Most organisations use one (a function head); some add a board or committee tier for policies that require it.',
    },
  ],
  B: [
    {
      term: 'Board approval',
      body: 'Formal sign-off of a policy by the board or a delegated committee, usually required for risk appetite, AML, outsourcing and similar policies in regulated financial institutions.',
    },
  ],
  C: [
    {
      term: 'Control',
      body: 'An activity, system or rule that reduces a risk. Controls have an owner, a frequency, a type (preventive, detective, corrective; manual or automated) and a test history.',
      link: [routes.productRegisters, 'Control registry →'],
    },
    {
      term: 'Control testing',
      body: 'Checking that a control operates as designed, by inspection, re-performance or sampling, and recording the result with evidence. Usually done in an RCSA or by internal audit.',
    },
    {
      term: 'Coverage',
      body: 'The proportion of a regulation’s clauses that are satisfied by a published policy clause. Reported per regulation and per document.',
      link: [routes.productRegulatory, 'Regulatory tracking →'],
    },
  ],
  E: [
    {
      term: 'Execution history',
      body: 'The log of every run of a workflow: who acted at each step, when, and with what outcome. The evidence that a process was followed.',
    },
  ],
  I: [
    {
      term: 'Impact analysis',
      body: 'Tracing what else is affected when a policy, risk, control or regulation changes, through the links between them.',
      link: [routes.productRegisters, 'Impact Analyzer →'],
    },
    {
      term: 'Inherent and residual risk',
      body: 'Inherent risk is the exposure before controls; residual risk is what remains after controls operate. RCSAs score both and compare residual risk to appetite.',
    },
  ],
  L: [
    {
      term: 'Lifecycle status',
      body: 'Where a governed item is in its life: Draft, Under review, Approved, Published, Archived. Applies to policies, procedures and register entries alike.',
    },
    {
      term: 'Linkage',
      body: 'A recorded relationship between a clause and the regulatory clause, control, risk or other document it relates to. Linkage is what makes coverage and impact analysis possible.',
    },
  ],
  M: [
    {
      term: 'Masters',
      body: 'Organisation-wide reference datasets (business units, tag pools, regulators) maintained by administrators so every document and form draws from the same lists.',
    },
  ],
  P: [
    {
      term: 'Policy',
      body: 'A statement of what an organisation requires and why, approved by the appropriate authority. Policies set the rule; procedures say how it is carried out.',
    },
    {
      term: 'Procedure',
      aside: 'SOP',
      body: 'The steps, roles and decisions by which a policy is carried out in practice. Best expressed as a flow with system steps shown rather than described.',
      link: [`${routes.productPolicy}#procedures`, 'Procedures →'],
    },
  ],
  R: [
    {
      term: 'RCSA',
      aside: 'Risk and control self-assessment',
      body: 'A structured exercise in which the business rates its own risks and the effectiveness of its controls, reviewed by the second line, with a report to management.',
      link: [routes.productRcsa, 'RCSA →'],
    },
    {
      term: 'Regulatory register',
      body: 'A structured list of the obligations an organisation must meet, held at clause level with source and effective date, from which policies are linked.',
    },
    {
      term: 'Risk appetite',
      body: 'The level of residual risk an organisation is willing to accept, set by the board. Assessments compare scored risk against it.',
    },
    {
      term: 'Risk register',
      body: 'The catalogue of identified risks with owners, categories and scores, maintained with the same lifecycle as a policy.',
      link: [routes.productRegisters, 'Risk register →'],
    },
  ],
  S: [
    {
      term: 'Second line',
      body: 'Risk and compliance functions that oversee the business (the first line). Internal audit is the third line, independent of both.',
    },
    {
      term: 'Sub-processor',
      body: 'A third party a vendor uses to process customer data on its behalf, listed in the DPA.',
      link: [routes.dpa, 'DPA →'],
    },
  ],
  T: [
    {
      term: 'Three lines model',
      body: 'The structure of first line (operations), second line (risk and compliance) and third line (internal audit), each with a distinct role in governance.',
    },
  ],
  V: [
    {
      term: 'Version history',
      body: 'The retained record of every published version of a document, with who changed what and when. Required for audit and for understanding what rule applied on a given date.',
    },
  ],
  W: [
    {
      term: 'Workflow',
      body: 'A defined sequence of steps, roles and decisions that an item moves through, such as draft, review, approve, publish.',
      link: [routes.productWorkflow, 'Workflow automation →'],
    },
  ],
};

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVW'.split('');

export default function GlossaryPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Glossary"
        title="GRC terms explained in a paragraph each."
        lede="Short definitions of the words used across governance, risk and compliance work, with a pointer to where each one shows up in Gieom.cloud."
        extra={
          <nav aria-label="Jump to letter" className={r.az}>
            {alphabet.map((l) =>
              glossary[l] ? (
                <a key={l} href={`#${l}`}>
                  {l}
                </a>
              ) : (
                <span key={l} aria-disabled="true">
                  {l}
                </span>
              ),
            )}
          </nav>
        }
      />

      <Section tight>
        {Object.entries(glossary).map(([letter, terms]) => (
          <div key={letter} id={letter} className={r.letterGroup}>
            <p className={r.letter} aria-hidden="true">
              {letter}
            </p>
            <div className={r.terms}>
              {terms.map((t) => (
                <article key={t.term} className={r.term}>
                  <h2>
                    {t.term}
                    {t.aside && <small>{t.aside}</small>}
                  </h2>
                  <p>
                    {t.body}
                    {t.link && (
                      <>
                        {' '}
                        <Link href={t.link[0]}>{t.link[1]}</Link>
                      </>
                    )}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <CtaBand
        title="See the terms in use."
        lede="The trial comes with sample registers, linked policies and an assessment in progress."
        actions={
          <ButtonLink href={routes.trial} arrow>
            Start free trial
          </ButtonLink>
        }
      />
    </>
  );
}
