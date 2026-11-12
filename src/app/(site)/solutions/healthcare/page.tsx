import type { Metadata } from 'next';
import { IndustryPage, demoAction, trialAction } from '@/components/blocks/IndustryPage';
import { ReviewCycle } from '@/components/mocks/solutions';
import { Screenshot, screenshots } from '@/components/ui/Screenshot';

export const metadata: Metadata = {
  title: 'Gieom.cloud for healthcare',
  description: 'Proof that every ward has read the policy.',
};

export default function HealthcarePage() {
  return (
    <IndustryPage
      eyebrow="Healthcare"
      title="Proof that every ward has read the policy."
      lede="Hospitals and healthcare groups carry hundreds of policies across clinical governance, patient data, infection control and HR, reviewed on fixed cycles and inspected by accreditors. Gieom.cloud keeps the cycle running and the evidence ready."
      regulators={['DHA', 'DoH Abu Dhabi', 'MoHAP', 'NABH', 'JCI', 'DPDP / PDPL', 'HIPAA']}
      primary={trialAction}
      secondary={demoAction}
      heroVisual={<ReviewCycle />}
      heroCaption="Review cycles, acknowledgement and coverage in one view (illustrative)"
      problems={[
        {
          pain: 'The accreditor asks for "evidence of dissemination"',
          title: 'Proof that staff read the policy',
          body: 'Acknowledgement by ward, department and role answers the question the surveyor actually asks. MCQ scores cover the clinical procedures.',
        },
        {
          pain: 'Hundreds of policies on two- and three-year cycles',
          title: 'Review dates that slip',
          body: 'Every document carries a review date; overdue reviews are flagged on the dashboard and reminded automatically and the workflow is started for the owner.',
        },
        {
          pain: 'Clinical staff do not read eight-page PDFs',
          title: 'Procedures that need to be followed, not filed',
          body: 'Draw the procedure as a flow, attach a recording of the EMR step, and keep the assessment short. Nurses follow the flow; the system records the acknowledgement.',
        },
      ]}
      usage={[
        {
          label: 'Clinical governance',
          title: 'Policies on a cycle, reviewed by the right committee',
          body: 'Configure the approval chain per policy type: nursing policies through the nursing council, medication policies through pharmacy and therapeutics, patient-safety policies through the quality committee. Review dates drive reminders; the committee sees what is due in the next quarter on one dashboard.',
          bullets: [
            'Committee-specific approval workflows',
            'Review-date tracking with reminders and escalation',
            'Version history for every revision cycle',
          ],
          visual: <Screenshot src={screenshots.workflow} alt="An approval workflow with reviewers and approvers" />,
          caption: 'A policy routed through review, committee approval and publication',
        },
        {
          label: 'Patient data and accreditation',
          title: 'Link clauses to the standard, show coverage to the surveyor',
          body: 'Hold NABH or JCI standards, DHA and DoH regulations and data-protection law in the Regulations Library, and link each policy clause to the standard it meets. Coverage per standard shows the quality team where the gaps are before the survey and gives the surveyor the trail from the standard to the policy to the acknowledgement.',
          bullets: [
            'Accreditation standards held as clause-level registers',
            'Coverage report per standard',
            'Acknowledgement and MCQ records as evidence',
          ],
          visual: <Screenshot src={screenshots.policyEditor} alt="The policy editor with a linked clause in the side panel" />,
          caption: 'A patient-data clause linked to the data protection requirement it satisfies',
        },
      ]}
      setTitle="Sample policies and procedures in the healthcare trial."
      set={[
        ['Infection Prevention and Control', 'Nursing council approval · ward acknowledgement'],
        ['Medication Management', 'Pharmacy and therapeutics review'],
        ['Patient Identification Procedure', 'Flow with EMR recording and MCQ'],
        ['Consent for Treatment', 'Legal and clinical review'],
        ['Patient Data Handling', 'DPDP, PDPL, HIPAA linkage'],
        ['Incident and Near-miss Reporting', 'Form and escalation workflow'],
        ['Credentialing and Privileging', 'Medical staff office procedure'],
        ['Code of Conduct', 'All-staff acknowledgement'],
      ]}
      cta={{
        title: 'Be survey-ready all year rather than the month before.',
        lede: 'Book a demo with your quality team, or start a trial and bring one of your own policies.',
        primary: demoAction,
        secondary: trialAction,
      }}
    />
  );
}
