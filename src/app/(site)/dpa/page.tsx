import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/blocks/PageHero';
import { Tiles } from '@/components/blocks/Tiles';
import p from '@/components/pricing/Pricing.module.css';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Icon } from '@/components/ui/Icon';
import { Ph, Section, SectionLabel } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import r from '@/styles/resources.module.css';

export const metadata: Metadata = {
  title: 'Data processing agreement and sub-processors',
  description: 'The DPA applies to every customer and forms part of the terms. Current sub-processor list.',
};

const subs: [string, string, string, string][] = [
  ['[Cloud infrastructure provider]', 'Hosting, storage, backups, key management', 'All customer content and account data', '[Region(s)]'],
  ['[Transactional email provider]', 'Sign-in links, notifications, reminders', 'Names, email addresses, notification content', '[Region]'],
  ['[AI model provider]', 'Magpie AI drafting and suggestions', 'Prompts and the document content submitted to the co-pilot', '[Region]'],
  ['[Support and ticketing tool]', 'Customer support', 'Names, email addresses, support correspondence', '[Region]'],
  ['[Product analytics tool]', 'Aggregated usage analytics', 'Pseudonymous usage events', '[Region]'],
  ['[Error monitoring tool]', 'Reliability monitoring', 'Technical error data, which may include identifiers', '[Region]'],
];

export default function DpaPage() {
  return (
    <>
      <PageHero
        compact
        crumb="Legal · DPA"
        eyebrow="Legal"
        title="Data processing agreement and sub-processors"
        lede={
          <>
            The DPA applies to every customer and forms part of the terms. The sub-processor list below is current as of <Ph>[date]</Ph>;
            changes are notified <Ph>[notice period]</Ph> in advance to account administrators.
          </>
        }
        actions={
          <>
            <a href="#" className="btn btn--dark">
              <Icon name="download" size={16} strokeWidth={2} />
              Download the DPA (PDF)
            </a>
            <ButtonLink href={`${routes.trust}#docs`} variant="secondary">
              Request the signed version
            </ButtonLink>
          </>
        }
      />

      <Section>
        <SectionLabel>Sub-processors</SectionLabel>
        <div className={r.notice} style={{ marginBottom: 24 }}>
          Placeholder list for legal and security review. Replace with the actual providers, purposes and locations before publication.
        </div>
        <div className={`${p.tableWrap} reveal`}>
          <table className={p.table}>
            <thead>
              <tr>
                <th scope="col">Sub-processor</th>
                <th scope="col">Purpose</th>
                <th scope="col">Data processed</th>
                <th scope="col">Location</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(([who, purpose, data, loc]) => (
                <tr key={who}>
                  <th scope="row">
                    <Ph>{who}</Ph>
                  </th>
                  <td>{purpose}</td>
                  <td>{data}</td>
                  <td>
                    <Ph>{loc}</Ph>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tight tone="subtle" bordered>
        <Tiles
          columns={3}
          items={[
            {
              title: 'Roles',
              body: "The Customer is the controller of content it places in Gieom.cloud; Gieom is the processor and acts only on the Customer's documented instructions.",
            },
            {
              title: 'Security measures',
              body: (
                <>
                  The technical and organisational measures described on the <Link href={routes.trust}>Trust &amp; Security</Link> page,
                  annexed to the DPA.
                </>
              ),
            },
            {
              title: 'Sub-processing',
              body: 'General authorisation with advance notice of changes and a right to object. Sub-processors are bound by equivalent obligations.',
            },
            {
              title: 'International transfers',
              body: (
                <>
                  Transfers outside the hosting region are covered by <Ph>[mechanism]</Ph>, with the applicable clauses annexed.
                </>
              ),
            },
            {
              title: 'Assistance and audits',
              body: (
                <>
                  Support for data subject requests, impact assessments and breach notification within <Ph>[period]</Ph>; audit rights with
                  reasonable notice, or reliance on the SOC 2 report.
                </>
              ),
            },
            {
              title: 'Return and deletion',
              body: (
                <>
                  Export at any time; deletion within <Ph>[period]</Ph> of termination with written confirmation.
                </>
              ),
            },
          ]}
        />
      </Section>
    </>
  );
}
