import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { FeatureStep } from '@/components/blocks/FeatureStep';
import { PageHero } from '@/components/blocks/PageHero';
import { ProblemGrid } from '@/components/blocks/ProblemGrid';
import { Tiles } from '@/components/blocks/Tiles';
import { AssessmentCard, RcsaReports, RcsaSummary } from '@/components/mocks/rcsa';
import { ArrowLink, ButtonLink } from '@/components/ui/ButtonLink';
import { Screenshot, screenshots } from '@/components/ui/Screenshot';
import { Section, SectionLabel } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import styles from '@/styles/page.module.css';

export const metadata: Metadata = {
  title: 'Risk and control self-assessment',
  description: 'Run an RCSA in days with the discussion and the report in the same place.',
};

const actions = (
  <>
    <ButtonLink href={routes.trial} arrow>
      Start free trial
    </ButtonLink>
    <ButtonLink href={routes.demo} variant="secondary">
      Book a demo
    </ButtonLink>
  </>
);

export default function RcsaPage() {
  return (
    <>
      <PageHero
        eyebrow="Risk & control self-assessment"
        title="Run an RCSA in days with the discussion and the report in the same place."
        lede="Assessments run directly on the risk and control registers. Checklists, scoring, threaded review with the business, and a generated PDF report, without the spreadsheet that usually goes back and forth eleven times."
        actions={actions}
        visual={<AssessmentCard />}
        caption="An assessment with checklist, control ratings and the review thread (illustrative)"
      />

      <ProblemGrid
        items={[
          {
            pain: 'Version 11 of the workbook',
            title: 'RCSAs run on spreadsheets',
            body: 'The assessment lives in a workbook emailed between the second line and the business. By the end nobody is sure which copy has the latest scores.',
          },
          {
            pain: 'Comments in a separate thread',
            title: 'Discussion detached from the risk',
            body: 'Questions about a specific control are answered in email, Teams or a meeting, and the reasoning never makes it into the record.',
          },
          {
            pain: 'Weeks to produce the report',
            title: 'Reporting as a second project',
            body: 'Once the scores are in, someone rebuilds them into a management report by hand, and does it again for the next business unit.',
          },
        ]}
      />

      <Section>
        <FeatureStep
          first
          num="01"
          label="Assessment hub"
          title="Every assessment you own in one queue"
          bullets={[
            'Scope an assessment from the risk and control registers',
            'Assign owners, reviewers and the business respondents',
            'Role-specific task inboxes show each person their work',
          ]}
          visual={<Screenshot src={screenshots.workflow} alt="A workflow timeline showing reviewers and approvers with status" />}
          caption="Assessment stages run on the same workflow engine as policy approvals"
        >
          <p>
            Consultants and second-line teams open the Assessment hub to find the assessments assigned to them by client or business unit
            with status and due date. Each assessment is scoped to a set of risks and controls from the registers so that there is nothing
            to re-key.
          </p>
        </FeatureStep>
        <FeatureStep
          reverse
          num="02"
          label="Checklist, scoring, comments"
          title="Rate the control, score the risk, discuss it on the spot"
          bullets={[
            'Control effectiveness ratings with evidence attached',
            'Inherent and residual scoring on configurable scales',
            'Threads on each risk, visible to the client and the reviewer',
          ]}
          visual={<RcsaSummary />}
          caption="The management summary generated from the assessment (illustrative)"
        >
          <p>
            The Checklist tab walks through each control; the Risk scoring tab records inherent and residual ratings on your scale. Threaded
            comments attach to the specific risk or control with unread tracking and jump-to-risk navigation. The second line and the
            business resolve questions where the evidence is.
          </p>
        </FeatureStep>
        <FeatureStep
          num="03"
          label="Reports"
          title="The report writes itself, and the next one too"
          bullets={[
            'One PDF per assessment, generated on demand',
            'Cross-assessment management view',
            'Actions tracked through to closure',
          ]}
          visual={<RcsaReports />}
          caption="The cross-assessment view for management"
        >
          <p>
            Each assessment generates a PDF report with scope, ratings, residual risk against appetite and the actions raised. RCSA Reports
            gives management the view across all assessments, searchable and filterable by status, business unit or client. For consulting
            firms, reports carry the client&apos;s branding.
          </p>
        </FeatureStep>
      </Section>

      <Section tone="deep">
        <SectionLabel>For consulting firms</SectionLabel>
        <div className={styles.split}>
          <div className="reveal">
            <h2>Run assessments for every client you serve.</h2>
            <p className="lede" style={{ marginTop: '1rem' }}>
              Each client runs in its own deployment with its own registers, respondents and branding. Your consultants work inside each one
              with a consultant role; your clients see only their own.{' '}
              <ArrowLink href={routes.solConsultants}>The consultant page explains the model</ArrowLink>
            </p>
          </div>
          <Tiles
            columns={2}
            items={[
              {
                title: 'Per-client deployments',
                body: 'Separate data and sign-ins for each client and one set of templates you carry between them.',
              },
              { title: 'White-label reports', body: "Reports carry the client's logo and colours rather than yours." },
              { title: 'Engagement in days', body: 'Scope from the registers, invite respondents, start.' },
              { title: 'Evidence retained', body: 'Threads, ratings and documents stay with the assessment.' },
            ]}
          />
        </div>
      </Section>

      <CtaBand
        tone="plain"
        title="Retire the RCSA workbook."
        lede="The trial includes one in-progress assessment so that you can see scoring, comments and the report on day one."
        actions={actions}
      />
    </>
  );
}
