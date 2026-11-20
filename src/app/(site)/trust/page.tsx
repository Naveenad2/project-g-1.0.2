import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Tiles } from '@/components/blocks/Tiles';
import { Field, FormCard, Input, Select, Textarea } from '@/components/forms/Field';
import { StaticForm } from '@/components/forms/StaticForm';
import { Table, Tr, mockStyles as m } from '@/components/mocks/primitives';
import { ArrowLink } from '@/components/ui/ButtonLink';
import { Section, SectionHeader, SectionLabel } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import styles from '@/styles/page.module.css';
import t from './trust.module.css';

export const metadata: Metadata = {
  title: 'Trust and security',
  description:
    'How Gieom.cloud protects your data: certifications, data handling, access control, availability, sub-processors and the DPA.',
};

const toc = [
  ['#certs', 'Certifications'],
  ['#data', 'Data handling'],
  ['#access', 'Access control'],
  ['#avail', 'Availability'],
  ['#subs', 'Sub-processors and DPA'],
  ['#docs', 'Documents'],
];

const kv: [string, React.ReactNode][] = [
  ['Single sign-on (planned)', 'Sign-in through your own identity provider using SAML 2.0 or OIDC is on our roadmap.'],
  ['Password security', 'Passwords are stored using industry-standard adaptive hashing.'],
  ['Role-based access', 'Permissions are checked on the server for every action, including read-only roles for audit.'],
  [
    'Audit logs',
    'Changes, approvals and exports are logged with user, time and source. Audit records are kept for the life of your subscription and can be exported on request.',
  ],
  ['Session controls', 'Sessions expire after a period of inactivity, and each user can have only one active session at a time.'],
  [
    'Internal access',
    'Access to production by Gieom staff is limited to named administrators, logged, and used only to operate and support the service.',
  ],
];

export default function TrustPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust & Security"
        title="Security built for risk and compliance teams."
        titleWidth="wide"
        lede="This page is written to stand alone. Forward it to your IT security team, your legal counsel or your client's compliance officer, and it should answer “is this safe to put our risk data in” without the rest of the site."
        extra={
          <nav aria-label="On this page" className={t.toc}>
            {toc.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
        }
      />

      <Section id="certs">
        <SectionLabel>Certifications</SectionLabel>
        <SectionHeader
          title="Independently assessed."
          lede="Reports are available to customers and prospects under NDA through the request form below."
        />
        <Tiles
          columns={2}
          variant="cards"
          items={[
            {
              title: 'ISO/IEC 27001',
              body: 'Our information security management system is certified to ISO/IEC 27001:2022.',
              footer: <ArrowLink href="#docs">Request the certificate</ArrowLink>,
            },
            {
              title: 'ISO 22301',
              body: 'Our business continuity management system is certified to ISO 22301:2019.',
              footer: <ArrowLink href="#docs">Request the certificate</ArrowLink>,
            },
          ]}
        />
      </Section>

      <Section id="data" tone="deep">
        <SectionLabel>Data handling</SectionLabel>
        <SectionHeader title="Where your data lives, and how it is protected." />
        <Tiles
          columns={3}
          items={[
            {
              title: 'Hosting regions',
              body: 'Customer data is hosted on Microsoft Azure in the United States. The hosting location does not change without your written agreement.',
            },
            {
              title: 'Data residency',
              body: 'Customer data and its backups stay in the United States. Organisations that need data kept in their own country can deploy Blueprint+ in their own environment.',
            },
            {
              title: 'Encryption',
              body: 'TLS 1.2 or higher in transit; AES-256 at rest for all stored data and backups, with encryption keys managed by the cloud provider.',
            },
            {
              title: 'Tenant isolation',
              body: 'Each customer is a separate tenant with logically isolated data.',
            },
            {
              title: 'Backups and retention',
              body: 'Daily encrypted backups, kept for up to 12 months. Recovery is tested through regular disaster-recovery drills.',
            },
            {
              title: 'Data export and deletion',
              body: 'You can request an export of your documents, registers and histories in standard formats at any time. After termination, data is deleted from the live service within 30 days, removed from backups as they expire, and deletion is confirmed in writing.',
            },
          ]}
        />
      </Section>

      <Section id="access">
        <SectionLabel>Access control</SectionLabel>
        <div className={styles.split}>
          <div className={`${styles.stickyHead} reveal`}>
            <h2>Every action has an actor and every actor has a role.</h2>
            <p className="lede" style={{ marginTop: '1rem' }}>
              Gieom.cloud enforces role-based permissions on the server for every action. The audit trail compliance teams use for their own
              evidence also records who did what, and when.
            </p>
          </div>
          <dl className={`${t.kv} reveal reveal--late`}>
            {kv.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section id="avail" tone="subtle" tight bordered>
        <Tiles
          columns={3}
          items={[
            {
              title: 'Uptime',
              body: 'We target 99.5% monthly availability, excluding scheduled maintenance announced in advance.',
            },
            {
              title: 'Vulnerability management',
              body: 'Independent penetration testing at least annually, continuous code and dependency scanning, and patching timelines set by severity.',
            },
            {
              title: 'Incident response',
              body: 'A documented incident response process. We notify you without undue delay, and within 72 hours, of a confirmed incident affecting your data.',
            },
            {
              title: 'Business continuity',
              body: 'Backups are stored across multiple data-centre zones, and our disaster-recovery plan, with defined recovery objectives, is tested through regular drills.',
            },
            {
              title: 'Secure development',
              body: 'Code review, automated testing and security checks on every change; separation of production from development environments.',
            },
            {
              title: 'AI co-pilot data use',
              body: 'Magpie AI processes your content to produce drafts and suggestions for you, using AI services hosted on Microsoft Azure in the United States. Your data is not used to train AI models. The co-pilot can be disabled per tenant.',
            },
          ]}
        />
      </Section>

      <Section id="subs">
        <SectionLabel>Sub-processors and DPA</SectionLabel>
        <div className={`${styles.split} ${styles.splitCenter}`}>
          <div className="reveal">
            <h2>Who else touches the data and under what terms.</h2>
            <p className="lede" style={{ marginTop: '1rem' }}>
              Our Data Processing Agreement is available to every customer with the current sub-processor list. Changes are notified 30 days
              in advance. <ArrowLink href={routes.dpa}>Read the DPA and the full list</ArrowLink>
            </p>
          </div>
          <div className="frame reveal reveal--late">
            <Table cols="minmax(0,1.1fr) minmax(0,1.2fr) minmax(0,0.7fr)" minWidth={440}>
              <Tr head>
                <span>Sub-processor</span>
                <span>Purpose</span>
                <span>Location</span>
              </Tr>
              {[
                ['Microsoft Azure', 'Hosting, storage, backups', 'United States'],
                ['Microsoft (Azure Communication Services)', 'Transactional email', 'United States'],
                ['Microsoft (Azure OpenAI, Azure AI Document Intelligence)', 'Magpie AI features', 'United States'],
              ].map(([who, what, where]) => (
                <Tr key={who}>
                  <span className={m.ink}>{who}</span>
                  <span className={m.ink}>{what}</span>
                  <span>{where}</span>
                </Tr>
              ))}
            </Table>
          </div>
        </div>
      </Section>

      <Section id="docs" tone="peach" bordered>
        <SectionLabel>Documents</SectionLabel>
        <div className={styles.split}>
          <div className="reveal">
            <h2>Request the security pack.</h2>
            <p className="lede" style={{ marginTop: '1rem' }}>
              Our ISO certificates, penetration-test summary, security whitepaper and completed security questionnaires are shared under
              NDA. Tell us who you are and what you need.
            </p>
            <ul className="checklist" style={{ marginTop: '1.5rem' }}>
              <li>ISO 22301 certificate</li>
              <li>ISO/IEC 27001 certificate and statement of applicability</li>
              <li>Penetration-test executive summary</li>
              <li>Security whitepaper</li>
              <li>Completed SIG Lite or CAIQ</li>
              <li>DPA and sub-processor list</li>
            </ul>
          </div>
          <FormCard className="reveal reveal--late">
            <StaticForm submitLabel="Request documents" footer="We reply within two business days with an NDA where required.">
              <Field id="tr-name" label="Full name">
                <Input id="tr-name" type="text" name="name" autoComplete="name" required />
              </Field>
              <Field id="tr-email" label="Work email">
                <Input id="tr-email" type="email" name="email" autoComplete="email" required />
              </Field>
              <Field id="tr-org" label="Organisation">
                <Input id="tr-org" type="text" name="org" autoComplete="organization" />
              </Field>
              <Field id="tr-role" label="Your role">
                <Select
                  id="tr-role"
                  name="role"
                  options={['Compliance or risk', 'IT security', 'Legal or procurement', 'Consultant evaluating for a client', 'Other']}
                />
              </Field>
              <Field id="tr-need" label="What do you need?">
                <Textarea id="tr-need" name="need" />
              </Field>
            </StaticForm>
          </FormCard>
        </div>
      </Section>
    </>
  );
}
