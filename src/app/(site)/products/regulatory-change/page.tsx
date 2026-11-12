import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { FeatureStep } from '@/components/blocks/FeatureStep';
import { PageHero } from '@/components/blocks/PageHero';
import { ProblemGrid } from '@/components/blocks/ProblemGrid';
import { Tiles } from '@/components/blocks/Tiles';
import { ChangeEvents, CoverageLibrary } from '@/components/mocks/regulatory';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Screenshot, screenshots } from '@/components/ui/Screenshot';
import { Section, SectionHeader } from '@/components/ui/Section';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Regulatory change tracking',
  description: 'Know which policies a regulation touches, down to the clause.',
};

export default function RegulatoryPage() {
  return (
    <>
      <PageHero
        crumb="Product"
        eyebrow="Regulatory change tracking"
        title="Know which policies a regulation touches, down to the clause."
        lede="The Regulations Library holds the obligations you answer to. Each one is linked clause by clause to the policies and controls that satisfy it. When a regulator issues a change you can see exactly what needs to move."
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
        visual={<CoverageLibrary />}
        caption="Coverage per regulation: how many clauses are satisfied by a published policy (illustrative)"
      />

      <ProblemGrid
        items={[
          {
            pain: 'The circular arrived on Tuesday',
            title: 'Changes land faster than teams can map them',
            body: 'A new circular means reading every policy that might be affected. Most teams do it by memory and a search box and miss the procedure nobody thought of.',
          },
          {
            pain: '"We comply" is not evidence',
            title: 'Obligations without a trail to the clause',
            body: 'Auditors ask which clause satisfies which requirement. A spreadsheet of regulation names does not answer that.',
          },
          {
            pain: 'Two jurisdictions, one policy set',
            title: 'Overlapping regulators',
            body: 'An institution reporting to RBI and CBUAE, or to DFSA and ADGM, needs one policy to satisfy several rulebooks at once, and to prove each one separately.',
          },
        ]}
      />

      <Section>
        <FeatureStep
          first
          num="01"
          label="Regulations Library"
          title="Your obligations structured to the clause"
          bullets={[
            'Registers for RBI, SEBI, IRDAI, CBUAE, DFSA, ADGM, FATF and more',
            'Clause-level entries with effective dates and jurisdiction',
            'Admin-managed with full history on every change',
          ]}
          visual={
            <Screenshot src={screenshots.policyEditor} alt="The policy editor with a linked regulatory clause shown in the side panel" />
          }
          caption="A clause linked to CBUAE AML Circular 2023 with the regulation text in the side panel"
        >
          <p>
            Each regulation is held as a set of clauses with a source, a jurisdiction and an effective date. Gieom.cloud ships with
            registers for the regulators you report against; your team adds internal standards and group policies alongside them. Each entry
            follows the same Draft to Published lifecycle as a policy so that the library itself is governed.
          </p>
        </FeatureStep>
        <FeatureStep
          reverse
          num="02"
          label="Change tracking"
          title="When a clause changes, the affected documents are already listed"
          bullets={[
            'Affected documents and controls listed automatically',
            'Re-review workflows started from the change',
            'Coverage reported per regulation and per document',
          ]}
          visual={<ChangeEvents />}
          caption="A single clause change traced to the documents and controls that cite it"
        >
          <p>
            Because every policy clause is linked to the regulatory clause it satisfies, a change in the library surfaces the documents,
            procedures and controls that cite it. Owners are notified, a review workflow starts, and the coverage report shows the gap until
            the policy is republished.
          </p>
        </FeatureStep>
        <FeatureStep
          num="03"
          label="Linkage and coverage"
          title="Prove coverage and see where it is thin"
          bullets={[
            'Coverage per regulation, per document, per clause',
            'Consistency Check for unlinked clauses in both directions',
            'Exportable as evidence',
          ]}
          visual={<Screenshot src={screenshots.docAssistant} alt="The Document Assistant drafting a clause that references a regulation" />}
          caption="The Document Assistant drafts against a named regulatory standard"
        >
          <p>
            The Linkages view answers the auditor&apos;s question directly: for this regulation, which clauses are satisfied, by which
            policy, in which version. The Consistency Check reports clauses in your policies with no regulatory basis and regulatory clauses
            with no policy. Both are the lists you would otherwise build by hand before an inspection.
          </p>
        </FeatureStep>
      </Section>

      <Section tone="peach" bordered>
        <SectionHeader
          title="Registers for the regulators you report against."
          lede="India and the GCC first with international standards alongside. Additional frameworks are added by request."
        />
        <Tiles
          columns={4}
          items={[
            { title: 'RBI', body: 'Master Directions on KYC, outsourcing, IT governance and more.' },
            { title: 'SEBI', body: 'LODR and intermediary regulations.' },
            { title: 'IRDAI', body: 'Insurance regulations and circulars.' },
            { title: 'CBUAE', body: 'AML, consumer protection and prudential circulars.' },
            { title: 'DFSA', body: 'DIFC rulebook modules.' },
            { title: 'ADGM', body: 'FSRA rules and guidance.' },
            { title: 'FATF', body: 'The 40 Recommendations.' },
            { title: 'Your own', body: 'Group policies, internal standards and board-level mandates, held as governed entries.' },
          ]}
        />
      </Section>

      <CtaBand
        tone="plain"
        title="Map your policies to the rules in days rather than quarters."
        lede="Start with the registers already loaded, or book a demo and bring the regulation that worries you most."
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
