import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { FeatureStep } from '@/components/blocks/FeatureStep';
import { PageHero } from '@/components/blocks/PageHero';
import { ProblemGrid } from '@/components/blocks/ProblemGrid';
import { Tiles } from '@/components/blocks/Tiles';
import { AckCard, AssistantCard, LifecycleRail, RegistryTable } from '@/components/mocks/policy';
import { ArrowLink, ButtonLink } from '@/components/ui/ButtonLink';
import { Screenshot, screenshots } from '@/components/ui/Screenshot';
import { Section, SectionHeader, SectionLabel } from '@/components/ui/Section';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Policy and procedure management',
  description:
    'Gieom.cloud gives compliance teams a single place to write, review, approve, publish and track acknowledgement of policies and procedures.',
};

export default function PolicyManagementPage() {
  return (
    <>
      <PageHero
        crumb="Product"
        eyebrow="Policy & procedure management"
        title="One system of record for every policy from first draft to last signature."
        lede="Gieom.cloud gives compliance teams a single place to write, review, approve, publish and track acknowledgement of policies and procedures. The regulation each clause satisfies is attached to the document itself."
        actions={
          <>
            <ButtonLink href={routes.trial} arrow>
              Start free trial
            </ButtonLink>
            <ButtonLink href={routes.demo} variant="secondary">
              Book a demo
            </ButtonLink>
            <ArrowLink href="#tour">Watch the tour</ArrowLink>
          </>
        }
        visual={<RegistryTable />}
        caption="The document registry: every policy and procedure with its version, owner and lifecycle status."
      />

      <ProblemGrid
        items={[
          {
            pain: 'Where did the current version go?',
            title: 'Policies scattered across drives and inboxes',
            body: 'Three copies of the same policy, none of them final. Staff follow whichever one they found first and the auditor finds the other two.',
          },
          {
            pain: 'Who approved this, and when?',
            title: 'Sign-offs chased through email',
            body: 'Approvals live in threads that nobody can reconstruct six months later. Board sign-off is a forwarded PDF with a thumbs-up.',
          },
          {
            pain: 'Did anyone actually read it?',
            title: 'No proof of acknowledgement',
            body: 'A policy that was published but never read is not a control. Without acknowledgement tracking, you cannot show it was.',
          },
        ]}
      />

      <Section id="lifecycle">
        <SectionHeader
          title="Every document moves through one defined path and the current stage is always visible."
          lede="Setup, draft, co-create, review, approve, optional board approval, publish, acknowledge. The same chain for policies and procedures, configurable to your governance structure."
        />
        <LifecycleRail />
        <div style={{ marginTop: 'clamp(40px, 5vw, 64px)' }}>
          <FeatureStep
            first
            num="01"
            label="Registry"
            title="A registry staff can actually find things in"
            bullets={[
              'Lifecycle tracking: Draft, Under review, Approved, Published, Archived',
              'Version history kept after every republish',
              'Dedicated read-only policy viewer, separate from the editor',
            ]}
            visual={<Screenshot src={screenshots.policyEditor} alt="The policy editor with the regulatory linkage panel open" />}
            caption="Authoring view with regulatory, control and risk links shown inline"
          >
            <p>
              Every policy and procedure is listed with its code, owner, version, review date and lifecycle status. Filter by stage, search
              by title or owner, and open the published version or the draft in one click. A separate &ldquo;Published to me&rdquo; view
              shows each person only what they are required to read and acknowledge.
            </p>
          </FeatureStep>
          <FeatureStep
            reverse
            num="02"
            label="Authoring"
            title="Drafts that already cite the rule"
            bullets={[
              'Co-creator invitations for collaborative drafting',
              'Structured review screen with threaded comments',
              'Consistency Check across the document set',
            ]}
            visual={<AssistantCard />}
            caption="The Document Assistant works inside the editor rather than in a separate chat window"
          >
            <p>
              Write in a rich document editor built for policy work. Select any sentence and link it to a regulatory clause, a control, a
              risk or another document. Ask the Magpie AI co-pilot to draft a section against a named standard, rephrase to your house
              style, or flag where a new clause contradicts an existing policy.
            </p>
          </FeatureStep>
          <FeatureStep
            num="03"
            label="Approval"
            title="Sign-off that leaves a trail"
            bullets={[
              'Role-based actions at every stage',
              'Execution history for every workflow run',
              'Version locked and previous version archived on publish',
            ]}
            visual={
              <Screenshot
                src={screenshots.workflow}
                alt="A governance workflow showing review and approval stages with participant status"
              />
            }
            caption="Workflow view: reviewers, approvers, due dates and decisions"
          >
            <p>
              Approval and board-approval screens record who signed, when, and with what comments. Deadlines are tracked, overdue stages are
              flagged, and reminders go out without anyone chasing. The optional board tier is a platform setting that organisations turn on
              once if they need it.
            </p>
          </FeatureStep>
          <FeatureStep
            reverse
            num="04"
            label="Acknowledgement"
            title="Proof that it was read as well as published"
            bullets={[
              '"Published to me" list for every staff member',
              'Acknowledgement status by person, team and document',
              'Optional MCQ assessments with scores recorded',
            ]}
            visual={<AckCard />}
            caption="Acknowledgement tracking by department (illustrative data)"
          >
            <p>
              Publishing starts acknowledgement tracking automatically. Owners see who has read and signed off and who has not, by
              department or role, and can send reminders or escalate. For procedures, an MCQ assessment can be attached, so you can show
              comprehension rather than a tick-box.
            </p>
          </FeatureStep>
        </div>
      </Section>

      <Section id="procedures" tone="deep">
        <SectionLabel>Procedures</SectionLabel>
        <SectionHeader
          title="Procedures drawn as flows that staff can follow on screen."
          lede="A procedure is not a policy with more steps. Gieom.cloud treats it as a flow: roles, decisions and hand-offs drawn in the SOP designer. A screen recording is attached to the step it belongs to and a short assessment closes it."
        />
        <Tiles
          columns={3}
          items={[
            {
              meta: 'SOP designer',
              title: 'Draw the procedure',
              body: 'Swim-lane roles, decision points and hand-offs on a canvas built for process work rather than general drawing.',
            },
            {
              meta: 'Video walkthroughs',
              title: 'Show the system',
              body: 'Attach a screen recording to any step. Staff see the action in the actual system instead of a paragraph describing it.',
            },
            {
              meta: 'Assessments',
              title: 'Check understanding',
              body: 'Close with an MCQ. Completion and scores are recorded against the procedure and the person.',
            },
          ]}
        />
      </Section>

      <Section id="tour">
        <SectionHeader title="See the policy lifecycle in two minutes." />
        <VideoPlayer href={`${routes.home}#tour`} image="/assets/doc_assistant.jpg" label="Play the feature tour" duration="2:10" />
      </Section>

      <Section tone="subtle" tight bordered>
        <Tiles
          columns={3}
          variant="cards"
          items={[
            {
              title: 'Compliance officers',
              body: 'Own the full policy set with an audit-ready history on demand and know who has and has not read what.',
              footer: <ArrowLink href={routes.solCompliance}>For compliance officers</ArrowLink>,
            },
            {
              title: 'Consultants',
              body: "Stand up a client's policy framework fast, pre-link the regulatory register, and hand over a working system.",
              footer: <ArrowLink href={routes.solConsultants}>For consultants</ArrowLink>,
            },
            {
              title: 'Internal audit',
              body: 'Independent visibility into which policies are current, approved and acknowledged, without asking anyone.',
              footer: <ArrowLink href={routes.solAudit}>For internal audit</ArrowLink>,
            },
          ]}
        />
      </Section>

      <CtaBand
        title="Put your policies in one place this week."
        lede="Start a free trial with sample policies loaded, or book a demo for a walkthrough on your own regulators."
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
