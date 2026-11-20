import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand } from '@/components/blocks/CtaBand';
import { Faq } from '@/components/blocks/Faq';
import { PageHero } from '@/components/blocks/PageHero';
import { PricingTiers } from '@/components/pricing/PricingTiers';
import p from '@/components/pricing/Pricing.module.css';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Ph, Section } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import styles from '@/styles/page.module.css';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Three tiers. Starter and Professional are self-serve with a 14-day free trial; Enterprise comes with a security review and custom SSO.',
};

type Cell = string | { ok: string } | '—';

const rows: [string, Cell, Cell, Cell][] = [
  ['Policy and procedure lifecycle, registry, viewer', { ok: 'Included' }, { ok: 'Included' }, { ok: 'Included' }],
  ['Acknowledgement tracking and MCQ assessments', { ok: 'Included' }, { ok: 'Included' }, { ok: 'Included' }],
  ['SOP designer and video walkthroughs', { ok: 'Included' }, { ok: 'Included' }, { ok: 'Included' }],
  ['Magpie AI co-pilot', 'Fair-use quota', 'Higher quota', 'Custom quota that can be disabled'],
  ['Regulatory registers and clause linkage', 'Your jurisdiction', { ok: 'All included registers' }, { ok: 'All plus custom registers' }],
  ['Risk and control registers, Impact Analyzer', '—', { ok: 'Included' }, { ok: 'Included' }],
  ['RCSA', '—', { ok: 'Included' }, { ok: 'Included' }],
  ['Workflow and form builder', 'Standard templates', { ok: 'Custom' }, { ok: 'Custom with custom stages' }],
  ['Reporting', 'Dashboard', { ok: 'Report Designer' }, { ok: 'Report Designer, scheduled exports, audit log export' }],
  ['Client deployments (consulting)', '—', 'Partner pricing', { ok: 'Partner pricing and white-label' }],
  ['SSO / SAML', '—', { ok: 'Included' }, { ok: 'Enforced SSO, SCIM' }],
  ['Data residency', 'Default region', 'Default region', { ok: 'Choice of region' }],
  ['Support', 'Email, help center', 'Email and chat, business hours', { ok: 'Named support, SLA' }],
  ['Contract', 'Monthly or annual, online', 'Monthly or annual, online or invoice', 'Annual MSA'],
];

/** A tier's cell; on phones the tier's name shows above its value (data-tier). */
function renderCell(c: Cell, tier: string) {
  if (c === '—')
    return (
      <td role="cell" className={p.dash} data-tier={tier}>
        —
      </td>
    );
  if (typeof c === 'object')
    return (
      <td role="cell" className={p.ok} data-tier={tier}>
        {c.ok}
      </td>
    );
  return (
    <td role="cell" data-tier={tier}>
      {c}
    </td>
  );
}

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Start with one team. Grow to the whole organisation, or to every client."
        titleWidth="wide"
        lede="Three tiers. Starter and Professional are self-serve with a 14-day free trial; Enterprise comes with a security review, custom SSO and a contract your procurement team will recognise."
      >
        <div className="container">
          <PricingTiers />
        </div>
      </PageHero>

      <Section>
        <div className={`${p.tableWrap} reveal`}>
          {/* the roles keep it a table for screen readers when phones lay it out as rows of three */}
          <table className={`${p.table} ${p.compare}`} role="table">
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">
                  Capability
                </th>
                <th scope="col" role="columnheader">
                  Starter
                </th>
                <th scope="col" role="columnheader">
                  Professional
                </th>
                <th scope="col" role="columnheader">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {rows.map(([cap, a, b, c]) => (
                <tr key={cap} role="row">
                  <th scope="row" role="rowheader">
                    {cap}
                  </th>
                  {renderCell(a, 'Starter')}
                  {renderCell(b, 'Professional')}
                  {renderCell(c, 'Enterprise')}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="peach" bordered>
        <div className={styles.split}>
          <div className={`${styles.stickyHead} reveal`}>
            <h2>The questions procurement asks before signing.</h2>
            <p className="lede" style={{ marginTop: '1rem' }}>
              If yours is not here, <Link href={routes.contact}>ask us</Link> and we will add it.
            </p>
          </div>
          <Faq
            items={[
              {
                q: 'Can we export our data if we leave?',
                a: (
                  <>
                    Yes. Documents, registers, assessments and audit histories export in standard formats (DOCX, PDF, CSV, JSON) at any time
                    from the admin console on every tier. On termination you have <Ph>[period]</Ph> to export before deletion.
                  </>
                ),
              },
              {
                q: 'What are the contract terms?',
                a: 'Starter and Professional are month-to-month or annual, cancellable from the admin console. Enterprise is an annual master services agreement with the DPA attached; we accept reasonable redlines.',
              },
              {
                q: 'Is SSO available on every tier?',
                a: 'SSO with SAML or OIDC is included from Professional. Enterprise adds enforced SSO and SCIM provisioning. Starter uses email and password with MFA.',
              },
              {
                q: 'How are users counted?',
                a: (
                  <>
                    A user is anyone who logs in. Staff who only acknowledge policies through &ldquo;Published to me&rdquo; count as{' '}
                    <Ph>[reader seats, priced separately / included]</Ph>. Consultants&apos; client users are counted within the
                    client&apos;s deployment.
                  </>
                ),
              },
              {
                q: 'Where is the data hosted?',
                a: (
                  <>
                    In <Ph>[default region]</Ph> by default. Enterprise customers choose their region. Details on the{' '}
                    <Link href={routes.trust}>Trust &amp; Security</Link> page.
                  </>
                ),
              },
              {
                q: 'Can we pay by invoice or purchase order?',
                a: 'Yes, for annual Professional and all Enterprise contracts. Monthly Starter and Professional are card-billed.',
              },
              {
                q: 'Do you offer discounts for non-profits or public bodies?',
                a: (
                  <>
                    <Ph>[Policy]</Ph>. Ask on the demo call.
                  </>
                ),
              },
              {
                q: 'What happens at the end of the trial?',
                a: (
                  <>
                    Nothing automatic. Your trial workspace stays readable for <Ph>[period]</Ph>; choose a tier to keep it with everything
                    you built carried over.
                  </>
                ),
              },
            ]}
          />
        </div>
      </Section>

      <CtaBand
        tone="plain"
        title="Not sure which tier? Start the trial on Professional."
        lede="You can move down to Starter at checkout, or talk to sales about Enterprise any time during the trial."
        actions={
          <>
            <ButtonLink href={routes.trial} arrow>
              Start free trial
            </ButtonLink>
            <ButtonLink href={routes.demo} variant="secondary">
              Contact sales
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
