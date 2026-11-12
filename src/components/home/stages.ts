import { routes } from '@/lib/routes';

export interface Stage {
  label: string;
  aria: string;
  sub: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}

/** The ten connected capabilities shown in the platform constellation. */
export const STAGES: Stage[] = [
  {
    label: 'Registries',
    aria: 'Registries',
    sub: 'regulations, risks, controls and more',
    title: 'Every register on one platform',
    body: 'Regulations, risks, controls, policies and procedures are registries with the same Draft to Published lifecycle. Regulations are held to the clause. Create a registry of your own for anything else and set a workflow on it.',
    href: routes.productRegisters,
    cta: 'Registries',
  },
  {
    label: 'Magpie AI',
    aria: 'Magpie AI co-pilot',
    sub: 'drafts, links, checks, rates',
    title: 'Magpie AI works inside every screen',
    body: 'It drafts clause text that cites the regulation. It suggests links to the regulations, risks and controls a paragraph touches. The Consistency Check flags contradictions with existing policies. It proposes risk ratings in an assessment and generates workflow steps and form fields from a description.',
    href: routes.productPolicy,
    cta: 'Magpie AI',
  },
  {
    label: 'Linked items',
    aria: 'Linked items',
    sub: 'policy, risk, control, regulation',
    title: 'Linked items keep governance connected',
    body: 'A policy references the regulations it satisfies and the risks and controls it governs. Reviewers and auditors see the links inline. The Impact Analyser and the coverage reports run on the same links.',
    href: routes.productRegisters,
    cta: 'Registers & linked items',
  },
  {
    label: 'Procedures',
    aria: 'Procedure designer',
    sub: 'drawn as flows',
    title: 'Procedures drawn as flows',
    body: 'Design the SOP as a flow with roles, decisions and hand-offs. Attach a screen simulation to the step it belongs to and publish the procedure as screens staff can follow.',
    href: routes.productWorkflow,
    cta: 'Procedures',
  },
  {
    label: 'Workflow builder',
    aria: 'Workflow builder',
    sub: 'no-code with forms',
    title: 'A no-code workflow builder',
    body: 'Define approvals, reviews and escalations on a visual canvas with access control per step and an escalation matrix. Forms collect the data each step needs. Magpie AI can draft a workflow from a description.',
    href: routes.productWorkflow,
    cta: 'Workflow builder',
  },
  {
    label: 'Lifecycle',
    aria: 'Document lifecycle: review and approval',
    sub: 'draft to published',
    title: 'One lifecycle for every document',
    body: 'Every policy moves from Draft to Under Review to Approved to Published to Archived. The review and approval screens record each decision and lock the version on publish. An optional board approval tier is available for documents that need it.',
    href: routes.productPolicy,
    cta: 'Review & approval',
  },
  {
    label: 'Acknowledgement',
    aria: 'Acknowledgement tracking',
    sub: 'who has read what',
    title: 'Proof that the policy was read',
    body: 'Published to me shows each person what they must read and sign. Owners see who has acknowledged a document and who has not. An MCQ assessment can be attached to show understanding rather than a tick.',
    href: routes.productPolicy,
    cta: 'Acknowledgement',
  },
  {
    label: 'Risk assessment',
    aria: 'Risk and control self-assessment',
    sub: 'RCSA with scoring and comments',
    title: 'RCSA runs on the registers',
    body: 'Checklist and risk scoring tabs structure each assessment. Reviewers and clients discuss specific risks in threaded comments on the assessment itself. A PDF report is generated per assessment and a management view spans all of them.',
    href: routes.productRcsa,
    cta: 'Risk assessment',
  },
  {
    label: 'Impact analyser',
    aria: 'Impact analyser',
    sub: 'what a change touches',
    title: 'See what a change touches before you touch it',
    body: 'Pick a policy, a risk or a control. The analyser traces the downstream effect across every linked item so that the owner sees what else is affected. Click the analyser to run it on § 4.2.',
    href: routes.productRegulatory,
    cta: 'Impact analyser',
  },
  {
    label: 'Reports & dashboards',
    aria: 'Reports and dashboards',
    sub: 'configured by role',
    title: 'Dashboards and reports you configure yourself',
    body: 'A home screen built from widgets by role. A Report Designer for custom reports against platform data. An execution history of every workflow run with its status and timing.',
    href: routes.productReporting,
    cta: 'Reporting',
  },
];

export const IMPACT_STAGE = 8;
