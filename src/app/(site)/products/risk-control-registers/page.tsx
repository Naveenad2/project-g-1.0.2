import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { FeatureStep } from '@/components/blocks/FeatureStep';
import { PageHero } from '@/components/blocks/PageHero';
import { ProblemGrid } from '@/components/blocks/ProblemGrid';
import { Tiles } from '@/components/blocks/Tiles';
import { ImpactTrace, RiskControlPolicyMap, RiskScoreList } from '@/components/mocks/registers';
import { ArrowLink, ButtonLink } from '@/components/ui/ButtonLink';
import { Screenshot, screenshots } from '@/components/ui/Screenshot';
import { Section } from '@/components/ui/Section';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Risk and control registers',
  description: 'The Risk Register and Control Registry sit beside your document library and follow the same lifecycle.',
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

export default function RegistersPage() {
  return (
    <>
      <PageHero
        crumb="Product"
        eyebrow="Risk & control registers"
        title="Every risk linked to its control and its policy."
        lede="The Risk Register and Control Registry sit beside your document library and follow the same lifecycle. Link them to each other and to policy clauses. The Impact Analyzer shows what else moves when one of them changes."
        actions={actions}
        visual={<RiskControlPolicyMap />}
        caption="Risks map to controls, controls map to the clauses that mandate them"
      />

      <ProblemGrid
        items={[
          {
            pain: 'Three spreadsheets, three answers',
            title: 'Registers that drift apart',
            body: 'The risk register, the control list and the policy index are maintained by different people in different files. They agree on the day of the audit and on no other day.',
          },
          {
            pain: '"What happens if we change this?"',
            title: 'No way to see downstream impact',
            body: 'Retiring a control or rewriting a clause touches risks and documents nobody remembered. The impact is discovered later by someone else.',
          },
          {
            pain: 'Controls nobody can evidence',
            title: 'Mapping without proof',
            body: 'A control that is listed but not linked to the policy that mandates it, or the risk it treats, is a line in a spreadsheet, not a control.',
          },
        ]}
      />

      <Section>
        <FeatureStep
          first
          num="01"
          label="Risk Register"
          title="A catalogue of risks that behaves like a document"
          bullets={[
            'Hierarchical tagging and org-wide tag pools',
            'Scores and ratings with configurable scales',
            'Full version history on every entry',
          ]}
          visual={<RiskScoreList />}
          caption="Residual ratings after controls (illustrative)"
        >
          <p>
            Each risk has an owner, a category, inherent and residual scores, and a lifecycle: Draft, Under review, Approved, Published,
            Archived. Changes are reviewed and approved the same way a policy is. The register you show the board is the register that was
            signed off.
          </p>
        </FeatureStep>
        <FeatureStep
          reverse
          num="02"
          label="Control Registry"
          title="Controls mapped to the risks they treat and the clauses that require them"
          bullets={[
            'Linked items keep risks, controls and documents connected',
            'Control references appear as chips in the policy text',
            'Registry administration with the same Draft to Published lifecycle',
          ]}
          visual={<Screenshot src={screenshots.policyEditor} alt="A policy clause with a control reference chip and a risk flag inline" />}
          caption="Controls and risks referenced inline in the policy text"
        >
          <p>
            Every control records its type, frequency, owner and testing cadence, and links to the risks it mitigates and the policy or
            procedure clauses that mandate it. From a control you can see every document that depends on it; from a clause you can see which
            control makes it real.
          </p>
        </FeatureStep>
        <FeatureStep
          num="03"
          label="Impact Analyzer"
          title="See what else is affected before you change anything"
          bullets={[
            'Trace from any entity across the whole graph',
            'Flag documents due for re-review after a change',
            'Export the trace as evidence',
          ]}
          visual={<ImpactTrace />}
          caption="Downstream trace from a single control"
        >
          <p>
            Select a policy, a risk or a control and the Impact Analyzer traces every linked item downstream: the clauses that cite it, the
            controls that depend on it, the assessments that scored it. Owners see the blast radius before they edit rather than after the
            audit finding.
          </p>
        </FeatureStep>
      </Section>

      <Section tone="deep">
        <Tiles
          columns={3}
          items={[
            {
              title: 'One graph instead of three lists',
              body: 'Risks, controls, regulations and documents are entities in one system, linked both ways. Change one and the others know.',
            },
            {
              title: 'Built for RCSA',
              body: (
                <>
                  Self-assessments run on these registers directly so that scores land on the real risk and the real control.{' '}
                  <ArrowLink href={routes.productRcsa}>See RCSA</ArrowLink>
                </>
              ),
            },
            {
              title: 'Audit-ready by construction',
              body: 'Every entry has a lifecycle, an owner and a history. The evidence is the register itself.',
            },
          ]}
        />
      </Section>

      <CtaBand
        tone="plain"
        title="Bring the risk register out of the spreadsheet."
        lede="The trial comes with sample risks and controls already linked to sample policies."
        actions={actions}
      />
    </>
  );
}
