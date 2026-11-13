import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/blocks/PageHero';
import { Tiles } from '@/components/blocks/Tiles';
import { Field, FormCard, Input, Select, Textarea } from '@/components/forms/Field';
import { StaticForm } from '@/components/forms/StaticForm';
import { Table, Tr, mockStyles as m } from '@/components/mocks/primitives';
import { ArrowLink } from '@/components/ui/ButtonLink';
import { Ph, Section, SectionHeader, SectionLabel } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import styles from '@/styles/page.module.css';
import t from './trust.module.css';

export const metadata: Metadata = {
  title: 'Trust and security',
  description:
    'Security held to the standard of a bank. Certifications, data handling, access control, availability, sub-processors and the DPA.',
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
  [
    'Single sign-on',
    'SAML 2.0 and OIDC with your identity provider (Microsoft Entra ID, Okta, Google Workspace and others). Enforced SSO available per tenant.',
  ],
  ['Multi-factor authentication', 'Enforced through your identity provider, or natively for accounts without SSO.'],
  ['Role-based access', 'Roles at tenant, workspace, document and workflow-step level, including read-only roles for audit.'],
  [
    'Audit logs',
    <>
      Every create, read, update, approval and export is logged with actor, time and source. Logs are retained for <Ph>[period]</Ph> and
      exportable to your SIEM.
    </>,
  ],
  ['Session controls', 'Configurable session timeouts and concurrent-session limits.'],
  ['Internal access', 'Gieom staff access to customer data is restricted, logged, and granted only for support with your approval.'],
];

export default function TrustPage() {
  return (
    <>
      <PageHero
        crumb="Trust & Security"
        eyebrow="Trust & Security"
        title="Security held to the standard of a bank."
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
          columns={3}
          variant="cards"
          items={[
            {
              title: 'SOC 2 Type II',
              body: (
                <>
                  Security, availability and confidentiality trust services criteria. <Ph>[Report period and auditor]</Ph>
                </>
              ),
              footer: <ArrowLink href="#docs">Request the report</ArrowLink>,
            },
            {
              title: 'ISO/IEC 27001',
              body: (
                <>
                  Information security management system. <Ph>[Certificate number, scope and expiry]</Ph>
                </>
              ),
              footer: <ArrowLink href="#docs">Request the certificate</ArrowLink>,
            },
            {
              title: 'Regional assessments',
              body: (
                <>
                  Alignment with regulator cloud and outsourcing guidance for India and the GCC.{' '}
                  <Ph>[List applicable assessments, e.g. RBI outsourcing, CBUAE cloud guidance, UAE IAS]</Ph>
                </>
              ),
              footer: <ArrowLink href="#docs">Request the mapping</ArrowLink>,
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
              body: (
                <>
                  Customer data is hosted in <Ph>[region, e.g. UAE (Dubai) and India (Mumbai)]</Ph>. The region is chosen at provisioning
                  and does not change without your written instruction.
                </>
              ),
            },
            {
              title: 'Data residency',
              body: 'Residency options for customers with regulatory or contractual requirements. Backups stay within the same region.',
            },
            {
              title: 'Encryption',
              body: "TLS 1.2 or higher in transit; AES-256 at rest for databases, file storage and backups. Keys managed through the cloud provider's key management service.",
            },
            {
              title: 'Tenant isolation',
              body: "Each customer is a separate tenant with logically isolated data. A consulting firm's clients each run in their own deployment, isolated from one another.",
            },
            {
              title: 'Backups and retention',
              body: (
                <>
                  Daily encrypted backups with <Ph>[retention period]</Ph> retention; point-in-time restore tested <Ph>[frequency]</Ph>.
                </>
              ),
            },
            {
              title: 'Data export and deletion',
              body: (
                <>
                  Export your documents, registers and histories at any time in standard formats. On termination, data is deleted within{' '}
                  <Ph>[period]</Ph> and confirmed in writing.
                </>
              ),
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
              Gieom.cloud is built on role-based access from the document down to the workflow step. The audit log that compliance teams use
              for their own evidence is the same log that records access.
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
              body: (
                <>
                  Service level objective of <Ph>[99.9%]</Ph> monthly availability with service credits defined in the enterprise agreement.
                  Live and historical status at <Link href={routes.status}>the status page</Link>.
                </>
              ),
            },
            {
              title: 'Vulnerability management',
              body: (
                <>
                  Annual third-party penetration testing, continuous dependency scanning, and a defined patch window by severity.{' '}
                  <Ph>[Last test date]</Ph>.
                </>
              ),
            },
            {
              title: 'Incident response',
              body: (
                <>
                  A documented incident response process with customer notification within <Ph>[period]</Ph> of a confirmed incident
                  affecting your data.
                </>
              ),
            },
            {
              title: 'Business continuity',
              body: 'Multi-zone deployment within the region and a tested disaster-recovery plan with defined RPO and RTO.',
            },
            {
              title: 'Secure development',
              body: 'Code review, automated testing and security checks on every change; separation of production from development environments.',
            },
            {
              title: 'AI co-pilot data use',
              body: 'Magpie AI processes your content to produce drafts and suggestions for you. Your data is not used to train models shared with other customers. The co-pilot can be disabled per tenant.',
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
              Our Data Processing Agreement is available to every customer with the current sub-processor list. Changes are notified{' '}
              <Ph>[notice period]</Ph> in advance. <ArrowLink href={routes.dpa}>Read the DPA and the full list</ArrowLink>
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
                ['[Cloud provider]', 'Hosting, storage, backups'],
                ['[Email provider]', 'Transactional email'],
                ['[AI model provider]', 'Magpie AI drafting'],
                ['[Support tooling]', 'Customer support'],
              ].map(([who, what]) => (
                <Tr key={who}>
                  <span>
                    <Ph>{who}</Ph>
                  </span>
                  <span className={m.ink}>{what}</span>
                  <span>
                    <Ph>[Region]</Ph>
                  </span>
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
              The SOC 2 report, ISO certificate, penetration-test summary, security whitepaper and completed questionnaires (SIG, CAIQ) are
              shared under NDA. Tell us who you are and what you need.
            </p>
            <ul className="checklist" style={{ marginTop: '1.5rem' }}>
              <li>SOC 2 Type II report</li>
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
