import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { FeatureStep } from '@/components/blocks/FeatureStep';
import { PageHero } from '@/components/blocks/PageHero';
import { ProblemGrid } from '@/components/blocks/ProblemGrid';
import { AuditLog, ControlTesting } from '@/components/mocks/solutions';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Screenshot, screenshots } from '@/components/ui/Screenshot';
import { Section } from '@/components/ui/Section';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'For internal audit teams',
  description: 'Independent visibility without asking anyone.',
};

export default function InternalAuditPage() {
  return (
    <>
      <PageHero
        eyebrow="For internal audit teams"
        title="Independent visibility without asking anyone."
        lede="The third line should not depend on the second line's spreadsheet. Gieom.cloud gives internal audit read access to the same registers, assessments and approval histories the business works in with an audit log on every action."
        actions={
          <>
            <ButtonLink href={routes.demo} arrow>
              Book a demo
            </ButtonLink>
            <ButtonLink href={routes.trial} variant="secondary">
              Start free trial
            </ButtonLink>
          </>
        }
        visual={<ControlTesting />}
        caption="Control testing status across assessments as audit sees it (illustrative)"
      />

      <ProblemGrid
        items={[
          {
            pain: '"Send me the latest register"',
            title: 'Evidence that arrives by email',
            body: 'Audit works from exports the business prepares. By the time fieldwork starts, the export is a snapshot of a moment that has passed.',
          },
          {
            pain: 'Was the control tested or just ticked?',
            title: 'No trail behind the rating',
            body: 'A control rated effective in a workbook carries no evidence, no reviewer and no date. Audit has to re-perform the test to trust it.',
          },
          {
            pain: 'Policy says one thing, the system another',
            title: 'Documents detached from controls',
            body: 'Checking that a policy clause has a working control behind it means two teams and three files.',
          },
        ]}
      />

      <Section>
        <FeatureStep
          first
          num="01"
          label="Read access everywhere"
          title="The same registers the business uses in real time"
          bullets={[
            'Role-based access with read-only audit roles',
            'Live data, not exports',
            'Filter by business unit, period or regulator',
          ]}
          visual={<Screenshot src={screenshots.workflow} alt="A workflow timeline showing who approved what and when" />}
          caption="Approval histories show who acted, when, and with what comments"
        >
          <p>
            An audit role sees the Risk Register, Control Registry, Regulations Library, every policy&apos;s version history and every
            assessment&apos;s scores and threads without the ability to change them. Independence is a permission rather than a courtesy.
          </p>
        </FeatureStep>
        <FeatureStep
          reverse
          num="02"
          label="Audit log"
          title="Every rating has a person, a date and evidence behind it"
          bullets={[
            'Audit log on every action in the platform',
            'Evidence attached to control ratings',
            'Threads preserved with the assessment',
          ]}
          visual={<AuditLog />}
          caption="The audit log: every action, actor and timestamp (illustrative)"
        >
          <p>
            Control ratings, approvals, publications and register changes are logged as they happen with the actor, the time and the
            attached evidence. Audit can trace a rating back to the test, the tester and the thread where it was challenged.
          </p>
        </FeatureStep>
        <FeatureStep
          num="03"
          label="Policy to control to test"
          title="Follow the thread from the clause to the evidence"
          bullets={[
            'Linked items in both directions',
            'Impact Analyzer for findings and remediation',
            'Export the trace as working papers',
          ]}
          visual={<Screenshot src={screenshots.policyEditor} alt="A policy clause with regulatory and control references inline" />}
          caption="Regulation, control and risk references inline in the clause"
        >
          <p>
            From any policy clause, open the control that makes it real, the risk it treats and the most recent assessment that tested it.
            From any control, see the clauses that depend on it. The Impact Analyzer shows what a finding affects so that recommendations
            land on the right documents.
          </p>
        </FeatureStep>
      </Section>

      <CtaBand
        title="See what the second line sees as it happens."
        lede="Book a demo and bring a recent finding. We will show you the trail from the clause to the test."
        actions={
          <>
            <ButtonLink href={routes.demo} arrow>
              Book a demo
            </ButtonLink>
            <ButtonLink href={routes.trust} variant="secondary">
              Trust &amp; Security
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
