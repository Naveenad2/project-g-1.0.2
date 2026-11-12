import type { Metadata } from 'next';
import { IndustryPage, demoAction } from '@/components/blocks/IndustryPage';
import { Cascade } from '@/components/mocks/solutions';
import { Screenshot, screenshots } from '@/components/ui/Screenshot';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Gieom.cloud for the public sector',
  description: 'Policies that trace from statute to desk.',
};

export default function PublicSectorPage() {
  return (
    <IndustryPage
      eyebrow="Public sector"
      title="Policies that trace from statute to desk."
      lede="Government entities, regulators and public enterprises hold policies that derive from legislation and cascade through directorates. Gieom.cloud links each clause to its legal basis, routes approvals through the right authority, and keeps the record an audit office expects."
      regulators={[
        'Federal and emirate law',
        'Central and state acts',
        'Audit office requirements',
        'Data protection',
        'Procurement rules',
      ]}
      primary={demoAction}
      secondary={{ label: 'Hosting and data residency', href: routes.trust }}
      heroVisual={<Cascade />}
      heroCaption="Statute to policy to procedure, each level linked to the one above (illustrative)"
      problems={[
        {
          pain: '"Under which article?"',
          title: 'Policies must trace to legislation',
          body: "Every policy clause links to the article of law or regulation it implements. The audit office's question has a one-click answer.",
        },
        {
          pain: 'Six directorates, one policy',
          title: 'Approval through a hierarchy',
          body: "Configure the chain from the drafting unit through legal review to the director general or minister's office with delegated authority recorded at each step.",
        },
        {
          pain: 'Where is the data held?',
          title: 'Residency and access requirements',
          body: 'Hosting region and data residency options, role-based access and an audit log on every action, documented on the Trust page for your IT and legal review.',
        },
      ]}
      usage={[
        {
          label: 'Policy and legal',
          title: 'From statute to policy with the trail intact',
          body: 'Hold the relevant laws and executive regulations in the Regulations Library as clause-level entries. Draft entity policies with the Magpie co-pilot against the article they implement, link each clause, and run approval through legal affairs and the executive office with the board or council tier where required.',
          bullets: [
            'Legislation held as clause-level registers',
            'Multi-level approval with delegated authority',
            'Coverage per statute for the audit office',
          ],
          visual: <Screenshot src={screenshots.policyEditor} alt="The policy editor with a linked clause in the side panel" />,
          caption: 'A policy clause linked to its statutory basis',
        },
        {
          label: 'Operations and service delivery',
          title: 'Procedures front-line staff can follow in the system they use',
          body: 'Service procedures, procurement steps and HR processes are drawn as flows with recordings of the actual government system step. Staff across offices follow the same procedure; acknowledgement and MCQ records show the directorate that they have.',
          bullets: [
            'SOP designer with directorate swim lanes',
            'Recordings of e-services and ERP steps',
            'Acknowledgement by directorate and grade',
          ],
          visual: <Screenshot src={screenshots.workflow} alt="An approval workflow with reviewers and approvers" />,
          caption: 'Approval routed through directorate, legal review and executive sign-off',
        },
      ]}
      setTitle="Sample policies and procedures for a public entity."
      set={[
        ['Procurement Policy', 'Linked to procurement law · tender procedure'],
        ['Delegation of Authority', 'Approval matrix as a workflow'],
        ['Information Security Policy', 'National standard linkage'],
        ['Personal Data Protection', 'PDPL and DPDP linkage'],
        ['Customer Service Charter', 'Service procedure flows'],
        ['HR Policies', 'Leave, conduct, grievance with acknowledgement'],
        ['Records Management', 'Retention schedule as a register'],
        ['Business Continuity', 'Annual review workflow'],
      ]}
      cta={{
        title: 'Talk to us about hosting, residency and procurement.',
        lede: 'Public-sector engagements usually start with a security and legal review. The demo call covers both.',
        primary: demoAction,
        secondary: { label: 'Trust & Security', href: routes.trust },
      }}
    />
  );
}
