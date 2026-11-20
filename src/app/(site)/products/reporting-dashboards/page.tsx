import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { FeatureStep } from '@/components/blocks/FeatureStep';
import { PageHero } from '@/components/blocks/PageHero';
import { ProblemGrid } from '@/components/blocks/ProblemGrid';
import { Dashboard, PlatformSettings, ReportDesigner } from '@/components/mocks/reporting';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Screenshot, screenshots } from '@/components/ui/Screenshot';
import { Section } from '@/components/ui/Section';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Reporting and dashboards',
  description: 'Board reporting without the slide-building.',
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

export default function ReportingPage() {
  return (
    <>
      <PageHero
        eyebrow="Reporting & dashboards"
        title="Board reporting without the slide-building."
        lede="A configurable dashboard for every role, a report designer that works on platform data, and an execution history across every process. The numbers come from the registers and workflows themselves so that they are current the moment you open them."
        actions={actions}
        visual={<Dashboard />}
        caption="A compliance officer's dashboard, assembled from the widget registry (illustrative data)"
      />

      <ProblemGrid
        items={[
          {
            pain: 'The quarterly deck',
            title: 'Reporting as manual labour',
            body: 'Status is collected by email, pasted into a spreadsheet, turned into charts, and is out of date before the meeting starts.',
          },
          {
            pain: 'One dashboard for everyone',
            title: 'Views that fit nobody',
            body: 'The CCO, a policy owner and an auditor need different numbers. A single fixed dashboard shows each of them mostly noise.',
          },
          {
            pain: '"Can you pull that for me?"',
            title: 'Custom questions need a developer',
            body: 'Any report not already built means a request to IT and a wait.',
          },
        ]}
      />

      <Section>
        <FeatureStep
          first
          num="01"
          label="Dashboard"
          title="A home screen built from widgets by role"
          bullets={[
            'Configurable per user and per role',
            'Widgets read live from registers and workflows',
            'Widget Builder for organisation-specific measures',
          ]}
          visual={<Screenshot src={screenshots.workflow} alt="A workflow execution view with stages and timing" />}
          caption="Execution history: every run, its stages and timing"
        >
          <p>
            Every user&apos;s dashboard is assembled from a widget registry: acknowledgement rates, policies due for review, overdue
            approvals, regulatory coverage, open RCSA actions. Users add, remove and rearrange widgets; administrators define new ones in
            the Widget Builder.
          </p>
        </FeatureStep>
        <FeatureStep
          reverse
          num="02"
          label="Report Designer"
          title="Build your own reports without a developer"
          bullets={['Any platform entity as a source', 'Scheduled runs and exports', 'Saved reports shared by role']}
          visual={<ReportDesigner />}
          caption="The Report Designer: pick a source, shape the table, schedule it"
        >
          <p>
            The Report Designer works directly on platform data: documents, acknowledgements, workflow runs, risks, controls, regulations
            and assessments. Choose the source, filter and group, and save the report to run on a schedule or export as PDF or CSV. Board
            packs and regulator submissions stop being a copy-and-paste exercise.
          </p>
        </FeatureStep>
        <FeatureStep
          num="03"
          label="Administration"
          title="Configure once and apply everywhere"
          bullets={[
            'Masters and TagPools for consistent categorisation',
            'Branding: logo and colour presets, applied live',
            'Platform and feature toggles per deployment',
          ]}
          visual={<PlatformSettings />}
          caption="Organisation-wide toggles live in one place"
        >
          <p>
            The Admin Dashboard is the entry point to every configuration tool: Masters for org-wide reference data such as business units
            and tag pools; registry administration for risks, controls, regulations; branding presets that apply live across the platform;
            platform settings such as enabling Magpie AI or the board-approval tier; and role-based access control.
          </p>
        </FeatureStep>
      </Section>

      <CtaBand
        title="Open the board pack instead of building it."
        lede="See the dashboard with sample data loaded and then point it at your own."
        actions={actions}
      />
    </>
  );
}
