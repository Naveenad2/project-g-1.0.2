import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { PageHero } from '@/components/blocks/PageHero';
import { Tiles } from '@/components/blocks/Tiles';
import { EvidencePack } from '@/components/mocks/solutions';
import { ArrowLink, ButtonLink } from '@/components/ui/ButtonLink';
import { Section } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import styles from '@/styles/page.module.css';

export const metadata: Metadata = {
  title: 'For compliance officers',
  description: 'Answer the auditor\'s "show me" with one click.',
};

const before: [string, string, string][] = [
  ['Mon', 'Chase three approvers by email', 'Two reply. One is on leave; the policy misses its review date.'],
  ['Tue', 'A new circular arrives', 'Read every policy that might be affected. Find four. Miss the procedure.'],
  ['Wed', 'HR asks who has read the new code of conduct', 'Export the LMS, match names in a spreadsheet, estimate.'],
  ['Thu', 'Audit request: evidence for 12 controls', 'Open the mapping workbook. It is six months old.'],
  ['Fri', 'Build the quarterly governance deck', 'Collect status by email. Paste. Chart. Repeat next quarter.'],
];

const after: [string, string, string][] = [
  ['Mon', 'Open the approvals inbox', 'One overdue approval, already escalated to the CCO by the workflow.'],
  [
    'Tue',
    'The circular is logged in the Regulations Library',
    'The five documents citing the amended clause are listed; re-review workflows have started.',
  ],
  ['Wed', 'Acknowledgement dashboard by department', '71% acknowledged and reminders scheduled. Send HR the link.'],
  ['Thu', 'Filter the Linkages view by the 12 controls', 'Export. Done before lunch.'],
  ['Fri', 'Open the saved board report', 'It ran this morning.'],
];

function DayList({ title, tone, days }: { title: string; tone: 'before' | 'after'; days: [string, string, string][] }) {
  return (
    <div className={`${styles.dayCol} reveal`}>
      <p className={`${styles.dayHead} ${styles[tone]}`}>{title}</p>
      <ul>
        {days.map(([d, t, p]) => (
          <li key={d} className={styles.day}>
            <span className={styles.dayName}>{d}</span>
            <div>
              <b>{t}</b>
              <p>{p}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ComplianceOfficersPage() {
  return (
    <>
      <PageHero
        eyebrow="For compliance officers"
        title={<>Answer the auditor&apos;s &ldquo;show me&rdquo; with one click.</>}
        lede="You own dozens of policies across several regulators and you have to justify every purchase internally. Gieom.cloud gives you the one thing a shared drive never will: proof. Which policy, which version, who approved it, who read it, which rule it satisfies."
        actions={
          <>
            <ButtonLink href={routes.trial} arrow>
              Start free trial
            </ButtonLink>
            <ButtonLink href={routes.trust} variant="secondary">
              Read the security page
            </ButtonLink>
          </>
        }
        visual={<EvidencePack />}
        caption="What you can hand an auditor for any document on demand (illustrative)"
      />

      <Section>
        <div className={styles.days}>
          <DayList title="Before" tone="before" days={before} />
          <DayList title="After" tone="after" days={after} />
        </div>
      </Section>

      <Section tone="deep">
        <Tiles
          columns={3}
          items={[
            {
              title: 'Audit-ready history on demand',
              body: (
                <>
                  Every version, approval and acknowledgement is recorded as it happens. The evidence pack is the system itself.{' '}
                  <ArrowLink href={routes.productPolicy}>Policy management</ArrowLink>
                </>
              ),
            },
            {
              title: 'Acknowledgement you can prove',
              body: 'Who has read and signed and who has not by department. Reminders run themselves and MCQ scores show comprehension where you need it.',
            },
            {
              title: 'Regulatory gaps found first',
              body: (
                <>
                  The Consistency Check reports clauses with no regulatory basis and regulations with no policy, before the inspection does.{' '}
                  <ArrowLink href={routes.productRegulatory}>Regulatory tracking</ArrowLink>
                </>
              ),
            },
            {
              title: 'A board view that is always current',
              body: (
                <>
                  Dashboards and scheduled reports built from live data rather than a deck assembled by hand.{' '}
                  <ArrowLink href={routes.productReporting}>Reporting</ArrowLink>
                </>
              ),
            },
            {
              title: 'Security you can defend internally',
              body: (
                <>
                  Role-based access, SSO, audit logs on every action, and a Trust page you can forward to IT security.{' '}
                  <ArrowLink href={routes.trust}>Trust &amp; Security</ArrowLink>
                </>
              ),
            },
            {
              title: 'Procedures staff can follow',
              body: 'Flows with screen recordings on the step that needs them and assessments that show it was understood.',
            },
          ]}
        />
      </Section>

      <Section>
        <div className={styles.split}>
          <div className={`${styles.stickyHead} reveal`}>
            <h2>What to tell procurement, IT and the board.</h2>
            <p className="lede" style={{ marginTop: '1rem' }}>
              You will be asked three questions. Here are the pages that answer them.
            </p>
          </div>
          <ul className={`${styles.questions} reveal reveal--late`}>
            <li>
              <b>&ldquo;Is it secure enough for our risk data?&rdquo;</b>
              <span>Certifications, hosting regions, encryption, SSO, audit logs and the DPA on one page you can forward.</span>
              <ArrowLink href={routes.trust}>Trust &amp; Security</ArrowLink>
            </li>
            <li>
              <b>&ldquo;What does it cost and how do we buy it?&rdquo;</b>
              <span>Three tiers, a comparison table and the procurement FAQ: data export, contract terms, SSO by tier.</span>
              <ArrowLink href={routes.pricing}>Pricing</ArrowLink>
            </li>
            <li>
              <b>&ldquo;Does it actually handle our lifecycle?&rdquo;</b>
              <span>Start a trial with sample policies loaded and run one of yours through review, approval and acknowledgement.</span>
              <ArrowLink href={routes.trial}>Start free trial</ArrowLink>
            </li>
          </ul>
        </div>
      </Section>

      <CtaBand
        title="Walk one of your own policies through it this week."
        lede="Work email and no card. Sample policies loaded so day one shows the product doing something."
        actions={
          <>
            <ButtonLink href={routes.trial} arrow>
              Start free trial
            </ButtonLink>
            <ButtonLink href={routes.demo} variant="secondary">
              Book a demo
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
