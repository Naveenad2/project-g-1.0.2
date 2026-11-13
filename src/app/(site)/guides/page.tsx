import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { PageHero } from '@/components/blocks/PageHero';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Icon } from '@/components/ui/Icon';
import { Section, SectionHeader, SectionLabel } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import r from '@/styles/resources.module.css';

export const metadata: Metadata = {
  title: 'Guides and templates',
  description: 'Playbooks for the work and templates you can use today.',
};

const guides: { title: string; pages: string; body: string; tone?: 'teal' | 'orange' }[] = [
  {
    title: 'The Policy Lifecycle Playbook',
    pages: '38 pages',
    body: 'Setup, drafting, co-creation, review, approval, board, publish, acknowledge: what each stage is for, who owns it, and the failure modes to design out.',
  },
  {
    title: 'The RCSA Field Guide',
    pages: '44 pages',
    tone: 'teal',
    body: 'Scoping from the registers, running the business through scoring without a workbook, resolving disagreements in writing, and producing the report the committee reads.',
  },
  {
    title: 'Regulatory Change Management',
    pages: '26 pages',
    tone: 'orange',
    body: 'Holding obligations at clause level, linking them to policies and controls, and turning a circular into a re-review list in an afternoon.',
  },
  {
    title: 'Acknowledgement that Holds Up',
    pages: '18 pages',
    body: 'What auditors and accreditors accept as evidence of dissemination and understanding, with a tiering model for which policies need an assessment.',
  },
  {
    title: "The Consultant's Multi-client Model",
    pages: '22 pages',
    tone: 'teal',
    body: 'Deployments, templates, consultant roles and handover for advisory firms running governance for many clients.',
  },
  {
    title: 'Procedures Staff Follow',
    pages: '20 pages',
    tone: 'orange',
    body: 'Drawing SOPs as flows, deciding which steps need a recording, and keeping assessments short enough that people complete them.',
  },
];

const templates: [string, string, string][] = [
  ['AML and Sanctions Policy', 'CBUAE, RBI and FATF clause map included', 'Download DOCX'],
  ['Know Your Customer Policy', 'With customer onboarding procedure', 'Download DOCX'],
  ['Data Protection and Privacy Policy', 'UAE PDPL and India DPDP aligned', 'Download DOCX'],
  ['Code of Conduct', 'With acknowledgement statement and five-question assessment', 'Download DOCX'],
  ['Outsourcing and Third-party Risk Policy', 'RBI outsourcing direction clause map', 'Download DOCX'],
  ['Information Security Policy', 'With incident response procedure flow', 'Download DOCX'],
  ['Business Continuity Policy', 'Annual review checklist included', 'Download DOCX'],
  ['Complaints Handling Procedure', 'Escalation matrix and timelines', 'Download DOCX'],
  ['RCSA Scoping Worksheet', 'For the first assessment before you have registers', 'Download XLSX'],
];

export default function GuidesPage() {
  return (
    <>
      <PageHero
        compact
        crumb="Resources · Guides & templates"
        eyebrow="Guides & templates"
        title="Playbooks for the work and templates you can use today."
        lede="The guides are longer reads for a work email. The templates are free, ungated, and yours to edit whether or not you ever use Gieom.cloud."
      />

      <Section>
        <SectionLabel>Guides</SectionLabel>
        <div className={r.guides}>
          {guides.map((g) => (
            <a key={g.title} href="#" className={`${r.guide} reveal`}>
              <div className={[r.cover, g.tone === 'teal' ? r.coverTeal : '', g.tone === 'orange' ? r.coverOrange : ''].join(' ')}>
                {g.title}
              </div>
              <p className={r.guideK}>
                <b>Guide</b> · {g.pages} · work email
              </p>
              <h3>{g.title}</h3>
              <p>{g.body}</p>
            </a>
          ))}
        </div>
      </Section>

      <Section tone="peach" bordered>
        <SectionLabel>Templates</SectionLabel>
        <SectionHeader
          title="Free policy and procedure templates. No form and no email."
          lede="Editable DOCX files written for regulated organisations in India and the GCC. Each one opens in Gieom.cloud with its regulatory links suggested, or in Word with nothing lost."
        />
        <div className={`${r.templates} reveal`}>
          {templates.map(([b, s, dl]) => (
            <a key={b} href="#" className={r.template}>
              <b>{b}</b>
              <span>{s}</span>
              <span className={r.dl}>
                {dl} <Icon name="download" size={15} strokeWidth={2} />
              </span>
            </a>
          ))}
        </div>
        <p className="note" style={{ marginTop: '1.4rem' }}>
          Templates are starting points rather than legal advice. Review them against your regulator&apos;s current requirements.
        </p>
      </Section>

      <CtaBand
        tone="plain"
        title="Open any template inside Gieom.cloud with its links suggested."
        lede="The trial loads the same templates as sample policies, already linked to the included registers."
        actions={
          <>
            <ButtonLink href={routes.trial} arrow>
              Start free trial
            </ButtonLink>
            <ButtonLink href={routes.productRegulatory} variant="secondary">
              How linkage works
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
