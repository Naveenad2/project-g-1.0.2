import { routes } from './routes';

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  heading: string;
  links: NavLink[];
}

export interface NavMenu {
  id: string;
  label: string;
  /** Flat list of links, rendered as a grid of title + description. */
  links?: NavLink[];
  /** Grouped columns, rendered side by side. */
  groups?: NavGroup[];
  layout?: 'grid' | 'list' | 'columns';
}

export type NavItem = NavMenu | NavLink;

export const isMenu = (item: NavItem): item is NavMenu => 'id' in item;

export const productLinks: NavLink[] = [
  { label: 'Policy & procedure management', href: routes.productPolicy, description: 'Registry, authoring, approvals, acknowledgement' },
  { label: 'Risk & control registers', href: routes.productRegisters, description: 'Risks mapped to the controls that treat them' },
  { label: 'Regulatory change tracking', href: routes.productRegulatory, description: 'Obligations linked to policies and controls' },
  { label: 'RCSA', href: routes.productRcsa, description: 'Self-assessments, scoring, generated reports' },
  { label: 'Workflow automation', href: routes.productWorkflow, description: 'No-code workflow and form builder' },
  { label: 'Reporting & dashboards', href: routes.productReporting, description: 'Widgets, report designer, execution history' },
];

export const solutionGroups: NavGroup[] = [
  {
    heading: 'By role',
    links: [
      { label: 'Compliance officers', href: routes.solCompliance },
      { label: 'Risk & GRC consultants', href: routes.solConsultants },
      { label: 'Internal audit teams', href: routes.solAudit },
    ],
  },
];

export const resourceLinks: NavLink[] = [
  { label: 'Blog', href: routes.blog, description: 'Regulatory news, product updates, GRC commentary' },
  { label: 'Guides & templates', href: routes.guides, description: 'Playbooks, field guides and free policy templates' },
  { label: 'Webinars', href: routes.webinars, description: 'Live and recorded sessions' },
  { label: 'Help center', href: routes.help, description: 'Product documentation and support' },
  { label: 'Glossary', href: routes.glossary, description: 'GRC terms explained in a paragraph each' },
];

export const primaryNav: NavItem[] = [
  { id: 'product', label: 'Product', links: productLinks, layout: 'grid' },
  { id: 'solutions', label: 'Solutions', groups: solutionGroups, layout: 'columns' },
  { label: 'Trust & Security', href: routes.trust },
  { id: 'resources', label: 'Resources', links: resourceLinks, layout: 'list' },
  { label: 'Pricing', href: routes.pricing },
  { label: 'Contact', href: routes.contact },
];

export const footerColumns: NavGroup[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Policy management', href: routes.productPolicy },
      { label: 'Risk & control registers', href: routes.productRegisters },
      { label: 'Regulatory tracking', href: routes.productRegulatory },
      { label: 'RCSA', href: routes.productRcsa },
      { label: 'Workflow automation', href: routes.productWorkflow },
      { label: 'Reporting', href: routes.productReporting },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { label: 'Compliance officers', href: routes.solCompliance },
      { label: 'Consultants', href: routes.solConsultants },
      { label: 'Internal audit', href: routes.solAudit },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog', href: routes.blog },
      { label: 'Guides & templates', href: routes.guides },
      { label: 'Webinars', href: routes.webinars },
      { label: 'Help center', href: routes.help },
      { label: 'Glossary', href: routes.glossary },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About us', href: routes.about },
      { label: 'Customers', href: routes.customers },
      { label: 'Partners', href: routes.partners },
      { label: 'Careers', href: routes.careers },
      { label: 'Contact', href: routes.contact },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy', href: routes.privacy },
      { label: 'Terms of service', href: routes.terms },
      { label: 'Security', href: routes.trust },
      { label: 'DPA & subprocessors', href: routes.dpa },
      { label: 'Status page', href: routes.status },
    ],
  },
];
