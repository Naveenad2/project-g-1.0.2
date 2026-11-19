import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { CoverageDemo } from '@/components/home/CoverageDemo';
import { DraftDemo } from '@/components/home/DraftDemo';
import { CtaBand } from '@/components/blocks/CtaBand';
import { GovernDemo } from '@/components/home/GovernDemo';
import { LinkDemo } from '@/components/home/LinkDemo';
import { CapabilityStory } from '@/components/home/CapabilityStory';
import { HomeHero } from '@/components/home/HomeHero';
import { PlatformStack, type PlatformModule } from '@/components/home/PlatformStack';
import { ProofDemo } from '@/components/home/ProofDemo';
import { SopDemo } from '@/components/home/SopDemo';
import { WeekStory, type WeekChapter } from '@/components/home/WeekStory';
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

/** Every compliance week, from the circular to the auditor (copy from Gieom's design). */
const week: WeekChapter[] = [
  {
    title: 'A new circular lands on Friday evening.',
    answer: 'Gieom.cloud shows you before you ask.',
    body: 'Select a sentence in a policy and link it to the clause it satisfies. Reviewers and auditors see the link inline. The Consistency Check tells you what is still uncovered before anyone outside the team does.',
    bullets: [
      'Regulatory, control, risk and cross-document links',
      'Registers for India and the GCC that stay current',
      'Coverage and gaps reported per document and per regulator',
    ],
    visual: <CoverageDemo />,
  },
  {
    title: 'On Monday that policy has to be rewritten.',
    answer: 'The first draft already cites the rule.',
    body: 'Tell the Document Assistant what a section must cover. It drafts clause text that already cites the right circular, matches your house style and drops into the document with its links attached.',
    bullets: [
      'Drafts cite the specific regulatory clause',
      'Contradictions with existing policies are flagged as you write',
      'Three editors in one document and no version emails',
    ],
    visual: <DraftDemo />,
  },
  {
    title: 'Then it goes round for approval.',
    answer: 'Approvals run themselves and keep the trail.',
    body: 'Set the stages your governance structure needs: co-creation, review, approval, board. Gieom.cloud routes the document, chases the deadlines, records every decision and locks the version on publish.',
    bullets: ['Role-based actions at each stage', 'Due dates, overdue flags, reminders', 'Full version history and side-by-side compare'],
    visual: <GovernDemo />,
  },
  {
    title: 'Staff still have to follow it.',
    answer: 'Procedures drawn as flows, with proof that staff read them.',
    body: 'Draw the procedure in the SOP designer with roles, decisions and handoffs. Attach a screen recording to the step it belongs to and close with a short assessment. Publishing starts acknowledgement tracking.',
    bullets: [
      'Flowchart SOP designer with swim-lane roles and decision points',
      'Screen-capture videos embedded in the exact step',
      'MCQ assessments with completion and comprehension tracking',
    ],
    visual: <SopDemo />,
  },
  {
    title: 'Thursday arrives and the auditor asks for proof.',
    answer: 'Each answer is a click.',
    body: 'Coverage per document and per regulator, the approval trail and the acknowledgement record sit in one place. The document itself carries the proof.',
    bullets: [
      'Impact Analyzer: see what else a change affects before you make it',
      'Risk and control self-assessments with scoring, threaded comments',
      'Configurable dashboards, widget builder and report designer',
    ],
    visual: <ProofDemo />,
  },
];

const delay = (ms: number) => ({ '--d': ms }) as CSSProperties;

export default function HomePage() {
  return (
    <>
      <HomeHero
        intro={
          <h1 className={styles.heroTitle}>
            <Rise>AI-powered policies and procedures.</Rise>{' '}
            <span className={styles.heroSub}>
              <Rise offset={4}>Always</Rise>{' '}
              <span className={styles.nowrap}>
                <Rise offset={5}>audit-ready.</Rise>
              </span>
            </span>
          </h1>
        }
        lede={
          <p className={`lede load-in ${styles.heroLede}`} style={delay(560)}>
            Gieom.cloud ties every policy clause to the rule it meets, turns procedures into flows staff can follow, runs the approvals and
            keeps the evidence.
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
          </div>
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

      {/* Every compliance week: the story from the circular to the auditor, under one heading with the calls to action */}
      <section id="week" className={`section ${styles.week}`}>
        <GradientBg variant="soft" warm />
        <div className={`container ${styles.layer}`}>
          <WeekStory
            title="Every compliance week tells the same story."
            lede="It begins with a circular and ends with an auditor. Here is how the week usually goes and how it can go with Gieom.cloud."
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
            chapters={week}
          />
        </div>
      </section>

      {/* How it works: the ten capabilities around one document, explored in 3D */}
      <section id="how" className={styles.how}>
        <div id="map" className={`${styles.layer} ${styles.mapWrap}`}>
          <CapabilityStory
            backdrop={<GradientBg variant="soft" />}
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
