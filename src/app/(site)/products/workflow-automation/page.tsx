import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { FeatureStep } from '@/components/blocks/FeatureStep';
import { PageHero } from '@/components/blocks/PageHero';
import { ProblemGrid } from '@/components/blocks/ProblemGrid';
import { Tiles } from '@/components/blocks/Tiles';
import { FormBuilder, Inbox, WorkflowLane } from '@/components/mocks/workflow';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Screenshot, screenshots } from '@/components/ui/Screenshot';
import { Section, SectionHeader } from '@/components/ui/Section';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Workflow automation',
  description: 'The engine behind every approval, review and escalation without writing code.',
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

export default function WorkflowPage() {
  return (
    <>
      <PageHero
        eyebrow="Workflow automation"
        title="The engine behind every approval, review and escalation without writing code."
        lede="Every lifecycle in Gieom.cloud runs on the same workflow engine. Define a process on a visual canvas, set who can act at each step, add an escalation matrix, test it, and watch every run in the execution log."
        actions={actions}
        visual={<WorkflowLane />}
        caption="A workflow on the builder canvas with its escalation rule"
      />

      <ProblemGrid
        items={[
          {
            pain: '"Just email it to Priya"',
            title: "Processes that live in people's heads",
            body: 'The approval path exists, but only as habit. When the person who knows it is on leave, the process stops.',
          },
          {
            pain: 'A ticket to IT for every change',
            title: 'Workflows that need developers',
            body: 'Tools that can automate approvals usually need engineering to change a step. Compliance waits in the backlog.',
          },
          {
            pain: 'Nobody knows what is stuck',
            title: 'No execution record',
            body: 'Which approvals are overdue, where they are stuck and for how long is a question answered by asking around.',
          },
        ]}
      />

      <Section>
        <FeatureStep
          first
          num="01"
          label="Workflow builder"
          title="Design the process on a canvas rather than in a ticket"
          bullets={[
            'Approvals, reviews, escalations, parallel and conditional steps',
            'Access control per step, by role',
            'Test runner and execution log on every workflow',
          ]}
          visual={<Screenshot src={screenshots.workflow} alt="A running workflow showing each stage, its participants and their status" />}
          caption="A live run: each stage, who acted, when, and what is overdue"
        >
          <p>
            Add steps, assign roles, set access per step, define deadlines and the escalation matrix. Describe the process in a sentence and
            Magpie AI generates a starting workflow to edit. The test runner walks the workflow with sample data before it goes live.
          </p>
        </FeatureStep>
        <FeatureStep
          reverse
          num="02"
          label="Form builder"
          title="Collect the data each step needs, in a form built the same way"
          bullets={['AI-assisted field generation', 'Choices sourced from admin-managed Masters', 'Per-field visibility by role']}
          visual={<FormBuilder />}
          caption="The three-panel form builder with a field selected"
        >
          <p>
            Workflows collect information through forms designed in a three-panel builder: a field palette, the form, and the properties of
            the selected field. Choice fields draw from org-wide Masters so the options stay consistent. Magpie AI can generate the fields
            from a description of what the step needs.
          </p>
        </FeatureStep>
        <FeatureStep
          num="03"
          label="Inboxes and history"
          title="Everyone sees only their work; you see all of it"
          bullets={[
            'Role-specific task queues',
            'Execution history across every process',
            'Overdue flags, reminders and escalations recorded',
          ]}
          visual={<Inbox />}
          caption="An approver's inbox (illustrative)"
        >
          <p>
            Task inboxes are role-specific: authors see their requests, managers see what to delegate, assessors see assessment tasks.
            Execution History shows every workflow run across the platform, searchable by status and timing. &ldquo;What is stuck and
            where&rdquo; becomes a filter rather than a meeting.
          </p>
        </FeatureStep>
      </Section>

      <Section tone="peach" bordered>
        <SectionHeader
          title="One engine, every lifecycle."
          lede="The same builder runs policy approvals, procedure publishing, register changes, RCSA stages, incident escalations and anything else you design."
        />
        <Tiles
          columns={4}
          items={[
            { title: 'Policies', body: 'Draft, review, approve, board, publish.' },
            { title: 'Registers', body: 'Proposed changes to risks and controls go through review before they are published.' },
            { title: 'RCSA', body: 'Scope, respond, review and report with reminders to the business.' },
            {
              title: 'Your processes',
              body: 'Exception approvals, incident handling, vendor onboarding and anything else that needs a defined path and a record.',
            },
          ]}
        />
      </Section>

      <CtaBand
        tone="plain"
        title="Turn the process in people's heads into one that runs itself."
        lede="The trial includes the standard policy approval workflow ready to edit on the canvas."
        actions={actions}
      />
    </>
  );
}
