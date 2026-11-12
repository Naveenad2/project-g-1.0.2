import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/blocks/PageHero';
import { Ph, Section, SectionLabel } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import r from '@/styles/resources.module.css';

export const metadata: Metadata = {
  title: 'Service status',
  description: 'Live service status and incident history for Gieom.cloud.',
};

const components: React.ReactNode[] = [
  'Web application',
  'API',
  'Authentication and SSO',
  'Document editor and collaboration',
  'Workflow engine and notifications',
  'Magpie AI co-pilot',
  'Reports and exports',
  <>
    Region: <Ph>[UAE]</Ph>
  </>,
  <>
    Region: <Ph>[India]</Ph>
  </>,
];

export default function StatusPage() {
  return (
    <>
      <PageHero
        compact
        crumb="Status"
        eyebrow="Service status"
        title="Gieom.cloud status"
        extra={
          <div className={r.okBanner} role="status">
            <i aria-hidden="true" />
            <b>All systems operational</b>
            <span>
              Updated <Ph>[time]</Ph> · live feed to be connected
            </span>
          </div>
        }
      />

      <Section>
        <ul className={`${r.components} reveal`}>
          {components.map((c, i) => (
            <li key={i} className={r.component}>
              <b>{c}</b>
              <span>Operational</span>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 'clamp(40px, 5vw, 56px)' }}>
          <SectionLabel>Last 90 days</SectionLabel>
          <div className={`${r.history} reveal`} role="img" aria-label="Uptime history, 90 days">
            {Array.from({ length: 90 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <div className={r.historyLegend}>
            <span>90 days ago</span>
            <span>
              <Ph>[99.9x]</Ph>% uptime
            </span>
            <span>Today</span>
          </div>
        </div>
      </Section>

      <Section tight tone="subtle" bordered>
        <div className={r.incident}>
          <b>No incidents reported</b>
          <small>History will appear here once the live status feed is connected.</small>
          <p>
            Subscribe to updates by email or RSS from the live status page, and see our incident notification commitments on the{' '}
            <Link href={routes.trust}>Trust &amp; Security</Link> page.
          </p>
        </div>
      </Section>
    </>
  );
}
