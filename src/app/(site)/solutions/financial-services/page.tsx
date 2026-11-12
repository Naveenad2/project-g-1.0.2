import type { Metadata } from 'next';
import { IndustryPage, demoAction, trialAction } from '@/components/blocks/IndustryPage';
import { PolicyExcerpt } from '@/components/mocks/solutions';
import { Screenshot, screenshots } from '@/components/ui/Screenshot';

export const metadata: Metadata = {
  title: 'Gieom.cloud for financial services',
  description: 'Built for banks and NBFCs that answer to more than one regulator.',
};

export default function FinancialServicesPage() {
  return (
    <IndustryPage
      eyebrow="Financial services"
      title="Built for banks and NBFCs that answer to more than one regulator."
      lede="Banking is where Gieom.cloud started. The registers for RBI, CBUAE, DFSA, ADGM and FATF are loaded, the board-approval tier is a setting, and the sample policies in the trial are the ones a bank actually has."
      regulators={['RBI', 'SEBI', 'CBUAE', 'DFSA', 'ADGM', 'SAMA', 'FATF']}
      primary={trialAction}
      secondary={demoAction}
      heroVisual={<PolicyExcerpt />}
      heroCaption="Banking policies cite the circular, the control and the risk in the same sentence"
      problems={[
        {
          pain: 'RBI on Monday, CBUAE on Tuesday',
          title: 'One policy set for several regulators',
          body: 'Group entities in India and the GCC need one AML policy that satisfies two rulebooks and proves each separately. Clause-level linkage to both registers does exactly that.',
        },
        {
          pain: 'The board wants to sign it',
          title: 'Board-level approval is routine',
          body: 'Risk, AML, outsourcing and IT governance policies need committee sign-off. The board tier is a platform setting with its own screen, deadlines and record.',
        },
        {
          pain: 'The circular changes the window',
          title: 'Changes with operational consequences',
          body: 'A shortened STR filing window touches the policy, the procedure, the control and the RCSA. The Impact Analyzer lists all four.',
        },
      ]}
      usage={[
        {
          label: 'Compliance',
          title: 'AML, KYC, sanctions and conduct policies with the regulation attached',
          body: 'Draft against RBI Master Directions or CBUAE circulars with the Magpie co-pilot, link each clause to its basis, and run the standard bank approval chain with the board tier on. Acknowledgement tracking covers branch staff, digital channels and outsourced teams.',
          bullets: [
            'Registers for RBI, SEBI, CBUAE, DFSA, ADGM, SAMA and FATF',
            'Board-approval tier with its own deadlines and record',
            'Acknowledgement by department, branch or role',
          ],
          visual: <Screenshot src={screenshots.policyEditor} alt="An AML policy in the editor with a CBUAE clause linked" />,
          caption: 'AML and Sanctions Policy with a CBUAE AML Circular 2023 clause linked',
        },
        {
          label: 'Risk and operations',
          title: 'Operational risk registers and RCSAs that the business actually completes',
          body: 'Scope quarterly RCSAs per business unit from the risk and control registers, send them to branch and operations respondents, resolve questions in threads, and generate the report for the risk committee. Procedures for account opening, cash handling and incident response are drawn as flows with screen recordings on the system steps.',
          bullets: [
            'RCSA per business unit, per quarter',
            'Procedures with video walkthroughs of core banking screens',
            'Operational risk dashboard for the risk committee',
          ],
          visual: <Screenshot src={screenshots.workflow} alt="A risk policy's approval workflow with reviewers and approvers" />,
          caption: 'Risk Management Policy at the approval stage, with an overdue flag',
        },
      ]}
      setTitle="The trial comes loaded with the policies a bank has."
      setLede="Illustrative sample content linked to the included registers so that the first login shows the product on real-shaped work."
      set={[
        ['AML and Sanctions', 'CBUAE, RBI, FATF linkage · board tier'],
        ['Account Opening and KYC', 'Policy plus onboarding procedure with video steps'],
        ['Credit Risk Management', 'Risk register and controls mapped'],
        ['Outsourcing', 'RBI outsourcing direction linkage'],
        ['IT Security and Incident Response', 'Procedure flow with escalation'],
        ['Data Protection and Privacy', 'UAE PDPL and DPDP linkage'],
        ['Business Continuity', 'Annual review workflow'],
        ['Code of Conduct', 'Acknowledgement with MCQ'],
      ]}
      cta={{
        title: 'Bring your AML policy. We will link it live.',
        lede: 'Book a demo on your own regulators, or start a trial with the sample workspace loaded.',
        primary: trialAction,
        secondary: demoAction,
      }}
    />
  );
}
