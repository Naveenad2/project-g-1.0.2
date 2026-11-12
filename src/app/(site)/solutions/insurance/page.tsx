import type { Metadata } from 'next';
import { IndustryPage, demoAction, trialAction } from '@/components/blocks/IndustryPage';
import { ClaimFlow } from '@/components/mocks/solutions';
import { Screenshot, screenshots } from '@/components/ui/Screenshot';

export const metadata: Metadata = {
  title: 'Gieom.cloud for insurance',
  description: 'Procedures every branch follows the same way.',
};

export default function InsurancePage() {
  return (
    <IndustryPage
      eyebrow="Insurance"
      title="Procedures every branch follows the same way."
      lede="Insurers run on procedures: how a claim is assessed, how a policy is underwritten, how an agent is onboarded. Gieom.cloud draws them as flows, puts a screen recording on the system step, and links the policy behind each to IRDAI or the Central Bank's insurance rules."
      regulators={['IRDAI', 'CBUAE Insurance', 'SAMA Insurance', 'DFSA', 'FATF']}
      primary={trialAction}
      secondary={demoAction}
      heroVisual={<ClaimFlow />}
      heroCaption="A claims procedure drawn in the SOP designer with the recording on the system step"
      problems={[
        {
          pain: 'Forty branches, forty ways to do it',
          title: 'Procedures drift by office',
          body: 'Claims and underwriting steps are taught by whoever trained you. Drawn flows with recorded screens make the procedure the same in every branch.',
        },
        {
          pain: 'Agents who never read the conduct policy',
          title: 'A large, distributed, high-turnover workforce',
          body: 'Distribution staff and agents must acknowledge conduct, mis-selling and AML policies. Acknowledgement tracking with MCQ shows regulators it was understood.',
        },
        {
          pain: 'IRDAI circulars keep coming',
          title: 'Regulatory change on a steady cadence',
          body: 'Each circular is logged in the Regulations Library; the policies and procedures it touches are listed and sent for re-review.',
        },
      ]}
      usage={[
        {
          label: 'Operations',
          title: 'Claims and underwriting as drawn, recorded, assessed procedures',
          body: 'Draw the claims procedure with roles for the claims desk, assessor, surveyor and finance. Attach a screen recording of the core system to the assessment step. Close with a short MCQ. New assessors follow the flow; managers see completion and scores.',
          bullets: ['SOP designer with roles and decision points', 'Video walkthroughs on the exact step', 'MCQ assessments per procedure'],
          visual: <Screenshot src={screenshots.docAssistant} alt="The Document Assistant drafting policy text" />,
          caption: 'Drafting a policy section against a named regulatory standard',
        },
        {
          label: 'Compliance',
          title: 'Conduct, AML and product policies linked to IRDAI and Central Bank rules',
          body: 'Link each clause of the market conduct, AML and product governance policies to the IRDAI regulation or Central Bank insurance rule it satisfies. Route product policies through actuarial, underwriting and compliance review with board sign-off where required. Track acknowledgement across employees and tied agents.',
          bullets: [
            'IRDAI, CBUAE and SAMA insurance registers included',
            'Acknowledgement across employees and agents',
            'Coverage reporting per regulation',
          ],
          visual: <Screenshot src={screenshots.workflow} alt="An approval workflow with reviewers and approvers" />,
          caption: 'Policy approval through underwriting, compliance and the board',
        },
      ]}
      setTitle="Sample policies and procedures in the insurance trial."
      set={[
        ['Market Conduct Policy', 'IRDAI linkage · agent acknowledgement with MCQ'],
        ['Claims Assessment Procedure', 'Motor and property flows with recordings'],
        ['Underwriting Guidelines', 'Decision points by risk class'],
        ['AML for Insurers', 'CBUAE and FATF linkage'],
        ['Product Governance', 'Actuarial, underwriting and board approval'],
        ['Agent Onboarding Procedure', 'Distribution with licence checks'],
        ['Complaints Handling', 'Escalation workflow with deadlines'],
        ['Data Protection', 'Policyholder data handling'],
      ]}
      cta={{
        title: 'Draw your claims procedure with us in thirty minutes.',
        lede: 'Book a demo and bring the procedure that varies most between branches.',
        primary: demoAction,
        secondary: trialAction,
      }}
    />
  );
}
