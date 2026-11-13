import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { CoverageDemo } from '@/components/home/CoverageDemo';
import { DraftDemo } from '@/components/home/DraftDemo';
import { CtaBand } from '@/components/blocks/CtaBand';
import { FeatureTabs, type FeatureTab } from '@/components/home/FeatureTabs';
import { GovernDemo } from '@/components/home/GovernDemo';
import { LinkDemo } from '@/components/home/LinkDemo';
import { CapabilityStory } from '@/components/home/CapabilityStory';
import { HomeHero } from '@/components/home/HomeHero';
import { PlatformStack, type PlatformModule } from '@/components/home/PlatformStack';
import { SopDemo } from '@/components/home/SopDemo';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { GradientBg } from '@/components/ui/GradientBg';
import { Icon } from '@/components/ui/Icon';
import { Rise } from '@/components/ui/Rise';
import { Section, SectionHeader } from '@/components/ui/Section';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { routes } from '@/lib/routes';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Gieom.cloud — Policy and procedure management' },
};

const modules: PlatformModule[] = [
  {
    status: 'live',
    title: 'Policies',
    body: 'Regulatory-linked documents with AI drafting, versioning, acknowledgement tracking and audit trail.',
  },
  { status: 'live', title: 'Procedures', body: 'SOP designer for drawing flows with embedded video walkthroughs and MCQ assessments.' },
  {
    status: 'platform',
    title: 'Risk and control registers',
    body: 'Catalogue risks, map controls against them, trace impact across linked items.',
  },
  {
    status: 'platform',
    title: 'Regulations library',
    body: 'Applicable requirements linked at clause level to the documents that satisfy them.',
  },
  {
    status: 'platform',
    title: 'Risk and control self-assessment',
    body: 'Checklists, risk scoring, threaded review and generated PDF reports.',
  },
  {
    status: 'platform',
    title: 'Workflow and form builder',
    body: 'No-code process design with access control per step, escalations and a test runner.',
  },
  {
    status: 'platform',
    title: 'Reporting and dashboards',
    body: 'Configurable widgets, a report designer and execution history across every process.',
  },
  {
    status: 'design',
    title: 'Learning hub',
    body: 'Courses assembled from published policies, procedures and risk-control pairs so that training stays in sync.',
  },
];

const features: { title: string; items: string[] }[] = [
  {
    title: 'Policy and procedure management',
    items: [
      'Document registry with version, status and owner on every item',
      '"Published to me": each person\'s own list of what to read and sign',
      'Lifecycle tracking: Draft, Under review, Approved, Published, Archived',
      'Acknowledgement tracking: who has read and signed, who has not',
      'Version history and a dedicated read-only policy viewer',
    ],
  },
  {
    title: 'Authoring and review',
    items: [
      'Rich document editor with regulatory, control and risk linkage',
      'Magpie AI co-pilot inside drafting, workflow and form setup',
      'Co-creator invitations, structured review and approval screens',
      'Optional board-approval tier for documents that need it',
      'Publish step that starts acknowledgement tracking automatically',
    ],
  },
  {
    title: 'Procedures and SOPs',
    items: [
      'SOP designer for drawing procedures with roles, decisions and hand-offs',
      'Video walkthroughs embedded in the step they belong to',
      'MCQ assessments with completion and comprehension tracking',
      'Procedures follow the same review, approval and publish chain',
      'Execution history for every run of a tracked process',
    ],
  },
  {
    title: 'Governance registers',
    items: [
      'Risk register and control registry, mapped to each other',
      'Regulations library with clause-level linkage to documents',
      'Impact Analyzer: see what else a change affects before you make it',
      'Risk and control self-assessments with scoring, threaded comments and PDF reports',
    ],
  },
  {
    title: 'Organisation and discovery',
    items: [
      'Hierarchical tagging and admin-managed tag pools',
      'Global search across documents and registers',
      'Linked items keep related policies, risks and controls together',
      'Library view across the wider content collection',
    ],
  },
  {
    title: 'Workflow, reporting and administration',
    items: [
      'No-code workflow builder with escalation matrix and test runner',
      'Form builder and role-specific task inboxes',
      'Configurable dashboards, widget builder and report designer',
      'Branding presets, platform settings and role-based access',
    ],
  },
];

const regulators: [string, string][] = [
  ['RBI', 'Reserve Bank of India'],
  ['SEBI', 'Securities and Exchange Board of India'],
  ['IRDAI', 'Insurance Regulatory and Development Authority'],
  ['CBUAE', 'Central Bank of the UAE'],
  ['DFSA', 'Dubai Financial Services Authority'],
  ['ADGM', 'Abu Dhabi Global Market'],
  ['FATF', 'Financial Action Task Force'],
  ['SAMA', 'Saudi Central Bank'],
  ['CBB', 'Central Bank of Bahrain'],
  ['QFCRA', 'Qatar Financial Centre Regulatory Authority'],
];

const steps: FeatureTab[] = [
  {
    label: 'Draft',
    title: 'The first draft already cites the rule',
    pain: 'The problem: drafting first and back-fitting the rule later',
    bullets: [
      'Drafts cite the specific regulatory clause',
      'Contradictions with existing policies are flagged as you write',
      'Three editors in one document and no version emails',
    ],
    visual: <DraftDemo />,
    caption: 'Document Assistant · draft for §4.1 CDD, inserted with its regulatory link',
    body: (
      <p>
        Tell the Document Assistant what a section must cover. It drafts clause text that already cites the right circular, matches your
        house style, and drops into the document with its links attached.
      </p>
    ),
  },
  {
    label: 'Link',
    title: 'See which rule every clause satisfies and where coverage is missing',
    pain: 'The problem: a mapping spreadsheet nobody fully trusts',
    bullets: [
      'Regulatory, control, risk and cross-document links',
      'Registers for India and the GCC that stay current',
      'Coverage and gaps reported per document and per regulator',
    ],
    visual: <CoverageDemo />,
    body: (
      <p>
        Select a sentence and link it to a clause in the register. Reviewers and auditors see the link inline. The Consistency Check tells
        you what is still uncovered before anyone outside the team does.
      </p>
    ),
  },
  {
    label: 'Govern',
    title: 'Approvals that run themselves and keep the trail',
    pain: 'The problem: sign-offs chased through email',
    bullets: ['Role-based actions at each stage', 'Due dates, overdue flags, reminders', 'Full version history and side-by-side compare'],
    visual: <GovernDemo />,
    caption: 'Workflow wf-005 · review, approval and publish',
    body: (
      <p>
        Set the stages your governance structure needs: co-creation, review, approval, board. Gieom.cloud routes the document, chases the
        deadlines, records every decision and locks the version on publish.
      </p>
    ),
  },
  {
    label: 'Procedures',
    title: 'Procedures drawn as flows that staff can follow on screen',
    pain: 'The problem: SOPs that describe the system instead of showing it',
    bullets: [
      'Flowchart SOP designer with swim-lane roles and decision points',
      'Screen-capture videos embedded in the exact step',
      'MCQ assessments with completion and comprehension tracking',
    ],
    visual: <SopDemo />,
    caption: 'SOP designer · onboarding flow with a screen recording on the sanctions step',
    body: (
      <p>
        Draw the procedure as a flow with roles, decisions and hand-offs in the SOP designer. Attach a screen recording to the step it
        belongs to and close with a short assessment. Staff see the action; you can prove they understood it.
      </p>
    ),
  },
];

const delay = (ms: number) => ({ '--d': ms }) as CSSProperties;

export default function HomePage() {
  return (
    <>
      <HomeHero
        intro={
          <>
            <p className={`${styles.kicker} load-in`} style={delay(60)}>
              <b>Gieom.cloud</b>
              <span>Policy &amp; procedure management for regulated industries</span>
            </p>
            <h1 className={styles.heroTitle}>
              <Rise>AI-powered policies and procedures.</Rise>{' '}
              <span className={styles.heroSub}>
                <Rise offset={4}>Always</Rise>{' '}
                <span className={styles.nowrap}>
                  <Rise offset={5}>audit-ready.</Rise>
                </span>
              </span>
            </h1>
          </>
        }
        lede={
          <p className={`lede load-in ${styles.heroLede}`} style={delay(560)}>
            Compliance teams lose weeks matching policies to regulators&apos; circulars by hand. Gieom.cloud ties every policy clause to the
            rule it meets, turns procedures into flows staff can follow, runs the approvals and keeps the evidence. The next audit becomes a
            walkthrough rather than a scramble.
          </p>
        }
        actions={
          <div className={`actions load-in ${styles.heroActions}`} style={delay(720)}>
            <ButtonLink href={routes.trial} arrow>
              Start free trial
            </ButtonLink>
            <ButtonLink href={routes.demo} variant="secondary">
              Book a demo
            </ButtonLink>
            <Link href={`${routes.productPolicy}#tour`} className={styles.tourLink}>
              <span className={styles.tourIcon} aria-hidden="true">
                <Icon name="play" size={12} />
              </span>
              Watch the 2-minute tour
            </Link>
          </div>
        }
        proof={
          <ul className={`${styles.proof} load-in`} style={delay(900)} aria-label="What the platform records for every clause">
            <li>
              <b>Clause</b>
              <span>the rule it meets</span>
            </li>
            <li>
              <b>Version</b>
              <span>who approved it</span>
            </li>
            <li>
              <b>Policy</b>
              <span>who has read it</span>
            </li>
            <li>
              <b>Change</b>
              <span>what it affects</span>
            </li>
          </ul>
        }
        band={
          <section className={`${styles.regsBand} load-in`} style={delay(1100)} aria-label="Regulatory frameworks covered">
            <h2 className={`container ${styles.regsTitle}`}>Included regulatory frameworks</h2>
            <div className={styles.marquee}>
              {[0, 1].map((copy) => (
                <ul key={copy} className={styles.regs} aria-hidden={copy === 1 ? true : undefined}>
                  {regulators.map(([abbr, name]) => (
                    <li key={abbr}>
                      <b>{abbr}</b>
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </section>
        }
        cover={
          <div className={styles.cover}>
            <GradientBg variant="vivid" warm />
            <svg className={styles.streams} viewBox="0 0 1600 760" preserveAspectRatio="none" aria-hidden="true">
              <path d="M1620 140 C 1380 140, 1300 290, 1080 330" />
              <path d="M1620 390 C 1400 390, 1300 370, 1080 382" />
              <path d="M1620 640 C 1360 640, 1290 470, 1080 432" />
            </svg>
            <div className={`container ${styles.layer} ${styles.coverGrid}`}>
              <div className={`${styles.coverCopy} reveal`}>
                <h2 className={styles.coverTitle}>Link a clause to the rule it meets, right in the document.</h2>
                <p className={styles.coverText}>
                  Select a sentence, add a linkage and choose the regulatory clauses it satisfies. Reviewers and auditors see the link
                  inline, with the regulator&apos;s text one click away.
                </p>
                <Link href={routes.productRegisters} className="link-arrow">
                  Registers &amp; linked items
                  <Icon name="arrowRight" size={15} strokeWidth={2} />
                </Link>
              </div>
              <div id="linkdemo" className={`${styles.demo} reveal`}>
                <LinkDemo />
              </div>
            </div>
          </div>
        }
      />

      {/* How it works: one document, ten capabilities, told as you scroll */}
      <section id="how" className={`section ${styles.how}`}>
        <GradientBg variant="soft" />
        <div id="map" className={`${styles.layer} ${styles.mapWrap}`}>
          <CapabilityStory
            intro={
              <SectionHeader
                split={false}
                title="Gieom.cloud brings all of it together."
                lede="Policies live in Word. The regulatory mapping lives in a spreadsheet. Procedures live in slide decks nobody opens. Approvals live in email. Gieom.cloud puts all of it in one place and the document itself carries the proof."
              />
            }
          />
        </div>
      </section>

      <section className={`section section--mint ${styles.steps}`}>
        <div className={`container ${styles.layer}`}>
          <FeatureTabs items={steps} />
        </div>
      </section>

      {/* Platform */}
      <Section id="platform" tone="deep">
        <SectionHeader
          title="Start with policies and procedures. The rest of the GRC lifecycle is already underneath."
          lede="Gieom.cloud launches as a policy and procedure platform built on registers, workflow automation and reporting that already support the wider governance, risk and compliance lifecycle. Extend into them as your needs grow without migrating anything."
        />
        <PlatformStack modules={modules} />
      </Section>

      {/* Feature tour */}
      <Section id="tour" className={styles.tour}>
        <div className={styles.tourGrid}>
          <div className={styles.tourCopy}>
            <SectionHeader
              split={false}
              title="See how Gieom.cloud saves your team hours every week."
              lede="A two-minute tour of the policy lifecycle from the first draft to the last acknowledgement. Then shorter clips on each feature."
            />
            <div className={`${styles.tourMeta} reveal`}>
              <b>Gieom.cloud, start to finish</b>
              <span>Registry · drafting · linkage · approvals · acknowledgement</span>
            </div>
            <Link href={`${routes.productPolicy}#tour`} className={`link-arrow ${styles.tourCta}`}>
              Open the feature tour
              <Icon name="arrowRight" size={15} strokeWidth={2} />
            </Link>
          </div>
          <div className={`${styles.tourStage} reveal`}>
            <VideoPlayer href={`${routes.productPolicy}#tour`} image="/assets/policy_editor.jpg" label="Open the feature tour" />
          </div>
        </div>
      </Section>

      {/* Who it's for */}
      <Section id="who" tone="mint">
        <h2 className={styles.whoTitle} data-split="">
          For the people who get the call when the auditor arrives.
        </h2>
        <div className={styles.audiences}>
          <article className={`${styles.audience} reveal`} data-spotlight="">
            <p className="eyebrow">Consultants</p>
            <h3>Hand clients a working framework instead of a folder of Word files</h3>
            <p>
              Configure the governance structure and pre-link the regulatory register for a client, then hand over an environment that works
              on day one. Your framework stays visible and in use long after the engagement ends.
            </p>
            <ul className="checklist">
              <li>Reuse one regulatory register across engagements</li>
              <li>Show auditors live readiness instead of a binder</li>
              <li>Handover in hours rather than weeks</li>
            </ul>
            <ButtonLink href={routes.solConsultants} variant="secondary" arrow>
              For consultants
            </ButtonLink>
          </article>
          <article className={`is-dark ${styles.audience} ${styles.audienceDark} reveal`} data-spotlight="">
            <GradientBg variant="cta" />
            <p className="eyebrow">In-house compliance</p>
            <h3>Know what is due and what is covered before anyone asks</h3>
            <p>
              One system where every document is tied to its regulatory basis, every revision is logged and every approval is tracked. The
              answer to &ldquo;show me&rdquo; is a click rather than a week.
            </p>
            <ul className="checklist">
              <li>See what is due for review, and by whom</li>
              <li>Find regulatory gaps before the audit does</li>
              <li>Prove staff read and understood each procedure</li>
            </ul>
            <ButtonLink href={routes.solCompliance} variant="secondary" arrow>
              For compliance officers
            </ButtonLink>
          </article>
        </div>
      </Section>

      {/* Features */}
      <section id="features" className={`section ${styles.featuresSection}`}>
        <GradientBg variant="soft" warm />
        <div className={`container ${styles.layer}`}>
          <SectionHeader
            title="One system of record for everything the policy and procedure lifecycle needs."
            lede="From the first draft to the last acknowledgement with the governance registers, workflow engine and reporting underneath."
          />
          <div className={styles.features}>
            {features.map((f, i) => (
              <article key={f.title} className={`${styles.featureCard} reveal`} data-spotlight="">
                <span className={styles.featureIndex} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{f.title}</h3>
                <ul className="checklist">
                  {f.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className={`actions ${styles.featureActions}`}>
            <ButtonLink href={routes.trial} arrow>
              Start free trial
            </ButtonLink>
            <ButtonLink href={routes.productPolicy} variant="secondary">
              Explore the product
            </ButtonLink>
          </div>
        </div>
      </section>

      <CtaBand
        tone="deep"
        title="Show an auditor which rule every clause satisfies."
        lede="Who approved it and who read it come with the answer."
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
