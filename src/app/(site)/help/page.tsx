import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Tiles } from '@/components/blocks/Tiles';
import { Input } from '@/components/forms/Field';
import { StaticForm } from '@/components/forms/StaticForm';
import { ArrowLink } from '@/components/ui/ButtonLink';
import { Icon } from '@/components/ui/Icon';
import { Section } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import r from '@/styles/resources.module.css';

export const metadata: Metadata = {
  title: 'Help center',
  description: 'Product documentation and support for Gieom.cloud.',
};

const topics: { title: string; links: string[]; more: string }[] = [
  {
    title: 'Getting started',
    links: [
      'Your first week in Gieom.cloud',
      'Inviting your team and assigning roles',
      'Importing existing policies from Word',
      'Choosing regulatory registers',
      'Guided tasks in the trial',
    ],
    more: 'All 14 articles',
  },
  {
    title: 'Policies and procedures',
    links: [
      'Document setup: metadata, owner, workflow',
      'Linking clauses to regulations, controls and risks',
      'Using the Magpie AI co-pilot',
      'Review, approval and board screens',
      'Publishing and version history',
    ],
    more: 'All 22 articles',
  },
  {
    title: 'Acknowledgement and assessments',
    links: [
      'How "Published to me" works',
      'Reminders and escalation',
      'Adding an MCQ assessment to a procedure',
      'Acknowledgement reports by department',
    ],
    more: 'All 9 articles',
  },
  {
    title: 'Registers and RCSA',
    links: [
      'Creating risks and controls',
      'Mapping controls to risks and clauses',
      'Using the Impact Analyzer',
      'Scoping and running an assessment',
      'Generating the RCSA report',
    ],
    more: 'All 17 articles',
  },
  {
    title: 'Workflows and forms',
    links: [
      'Building a workflow on the canvas',
      'Escalation matrix and deadlines',
      'Testing a workflow before go-live',
      'Form builder and Masters',
    ],
    more: 'All 11 articles',
  },
  {
    title: 'Administration and security',
    links: [
      'SAML and OIDC single sign-on',
      'Roles and permissions reference',
      'Branding presets',
      'Audit log export',
      'Data export and deletion',
    ],
    more: 'All 15 articles',
  },
];

export default function HelpPage() {
  return (
    <>
      <PageHero
        compact
        crumb="Resources · Help center"
        eyebrow="Help center"
        title="How do I…"
        titleWidth="narrow"
        extra={
          <>
            <div className={r.search}>
              <StaticForm inline submitLabel="Search" submitVariant="dark" ariaLabel="Search the help center">
                <div>
                  <label htmlFor="hc-q">Search the help center</label>
                  <Input id="hc-q" type="search" name="q" placeholder="link a clause to a regulation, set up SSO, export a report" />
                </div>
              </StaticForm>
            </div>
            <p className={r.popular}>
              Popular:
              <a href="#">Link a clause to a regulatory clause</a>
              <a href="#">Configure the board approval tier</a>
              <a href="#">Set up SAML SSO</a>
              <a href="#">Export acknowledgement report</a>
            </p>
          </>
        }
      />

      <Section>
        <div className={r.topics}>
          {topics.map((t) => (
            <div key={t.title} className={`${r.topic} reveal`}>
              <h2>{t.title}</h2>
              <ul>
                {t.links.map((l) => (
                  <li key={l}>
                    <a href="#">{l}</a>
                  </li>
                ))}
              </ul>
              <a href="#" className={`link-arrow ${r.more}`}>
                {t.more} <Icon name="arrowRight" size={15} strokeWidth={2} />
              </a>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="peach" tight bordered>
        <Tiles
          columns={3}
          variant="cards"
          items={[
            {
              title: 'Short videos',
              body: 'Every feature has a clip under two minutes.',
              footer: <ArrowLink href={`${routes.home}#tour`}>Watch the tour</ArrowLink>,
            },
            {
              title: 'Contact support',
              body: 'Email and in-app chat, business hours in GST and IST. Enterprise customers have a named contact.',
              footer: <ArrowLink href={routes.contact}>Contact</ArrowLink>,
            },
            {
              title: 'Status',
              body: 'Live service status and incident history.',
              footer: <ArrowLink href={routes.status}>Status page</ArrowLink>,
            },
          ]}
        />
      </Section>
    </>
  );
}
