import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { FeatureStep } from '@/components/blocks/FeatureStep';
import { PageHero } from '@/components/blocks/PageHero';
import { ProblemGrid } from '@/components/blocks/ProblemGrid';
import { Tiles } from '@/components/blocks/Tiles';
import { Timeline } from '@/components/blocks/Timeline';
import { EngagementHub, WhiteLabelCovers } from '@/components/mocks/solutions';
import { ArrowLink, ButtonLink } from '@/components/ui/ButtonLink';
import { Section, SectionHeader } from '@/components/ui/Section';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'For risk and GRC consultants',
  description: 'Hand every client a working system.',
};

export default function ConsultantsPage() {
  return (
    <>
      <PageHero
        crumb="Solutions · By role"
        eyebrow="For risk & GRC consultants"
        title="Hand every client a working system."
        lede="Each client runs in its own Gieom.cloud deployment with its own login, registers, respondents and branding. Your consultants work inside it with a consultant role, carry templates from one engagement to the next, and the reports go out under the client's name."
        actions={
          <>
            <ButtonLink href={routes.trial} arrow>
              Start free trial
            </ButtonLink>
            <ButtonLink href={routes.partners} variant="secondary">
              Partner programme
            </ButtonLink>
          </>
        }
        visual={<EngagementHub />}
        caption="An engagement checklist inside one client's deployment (client name illustrative)"
      />

      <ProblemGrid
        items={[
          {
            pain: '"Where does each client\'s data live?"',
            title: 'In its own deployment',
            body: "Each client runs in a separate deployment with its own sign-in. Their data never mixes with another client's. Your consultants are given a consultant role inside each deployment they work on.",
          },
          {
            pain: '"Will the reports look like mine or theirs?"',
            title: 'Theirs',
            body: "Each deployment carries the client's branding preset. The RCSA report, the acknowledgement report and the policy viewer all show the client's logo and colours.",
          },
          {
            pain: '"How fast can I stand up an engagement?"',
            title: 'Days rather than weeks',
            body: 'Reuse your policy, register and workflow templates from one deployment to the next. Scope the RCSA from the registers, invite respondents and start.',
          },
        ]}
      />

      <Section>
        <SectionHeader
          title="From kick-off to a client who keeps using it."
          lede="The deliverable is no longer a folder of Word documents and a workbook. It is a working environment the client logs into after you leave."
        />
        <Timeline
          items={[
            {
              when: 'Week 1',
              title: 'Set up the deployment',
              body: "Create the client's deployment, apply their branding, load the regulators they report to from the included registers and add your consultants.",
            },
            {
              when: 'Week 1–2',
              title: 'Build the framework',
              body: 'Import or draft policies with the Magpie co-pilot, link clauses to the regulatory register, configure the approval chain to their governance structure.',
            },
            {
              when: 'Week 2–3',
              title: 'Run the assessment',
              body: 'Scope the RCSA from the risk and control registers, invite the business as respondents, review in threads, generate the report.',
            },
            {
              when: 'Handover',
              title: 'Leave a system behind',
              body: "Transfer ownership of the deployment. The client's compliance officer runs it; you stay on as a reviewer or step away entirely.",
            },
          ]}
        />
      </Section>

      <Section tone="deep">
        <FeatureStep
          first
          label="White-label reporting"
          title="Your work on their letterhead"
          bullets={[
            'Logo and colour presets per deployment',
            'Reports, viewer and notifications all follow the preset',
            '"Prepared by" line optional',
          ]}
          flat
          visual={<WhiteLabelCovers />}
          caption="Two clients, two report covers, one template"
        >
          <p>
            Every generated report, from the RCSA PDF to the acknowledgement summary, uses the deployment&apos;s branding preset. The
            firm&apos;s name appears where you choose: nowhere, in the footer, or as &ldquo;prepared by&rdquo;.
          </p>
        </FeatureStep>
      </Section>

      <Section>
        <Tiles
          columns={3}
          variant="cards"
          items={[
            {
              title: 'Repeatable engagements',
              body: 'Registers, workflow templates and policy templates carry from one client to the next. The second engagement is faster than the first; the tenth is a process.',
            },
            {
              title: 'A retained relationship',
              body: 'A client who runs their governance in a system you set up keeps you as reviewer, advisor or annual assessor. A folder of documents does not call you back.',
            },
            {
              title: 'A channel as well as a customer',
              body: (
                <>
                  Consulting partners earn referral and resale terms, co-marketing and early access.{' '}
                  <ArrowLink href={routes.partners}>See the partner programme</ArrowLink>
                </>
              ),
            },
          ]}
        />
      </Section>

      <CtaBand
        title="See the consultant's model on day one."
        lede="The trial includes the RCSA, the templates and white-label reporting so that you can see how an engagement runs before you bring a client in."
        actions={
          <>
            <ButtonLink href={routes.trial} arrow>
              Start free trial
            </ButtonLink>
            <ButtonLink href={routes.demo} variant="secondary">
              Talk to us about your firm
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
