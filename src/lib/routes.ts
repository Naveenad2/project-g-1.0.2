/**
 * Single source of truth for every internal URL on the site.
 * Components import from here rather than hard-coding paths.
 */
export const routes = {
  home: '/',

  productPolicy: '/products/policy-management',
  productRegisters: '/products/risk-control-registers',
  productRegulatory: '/products/regulatory-change',
  productRcsa: '/products/rcsa',
  productWorkflow: '/products/workflow-automation',
  productReporting: '/products/reporting-dashboards',

  solCompliance: '/solutions/compliance-officers',
  solConsultants: '/solutions/consultants',
  solAudit: '/solutions/internal-audit',
  solFinancial: '/solutions/financial-services',
  solInsurance: '/solutions/insurance',
  solHealthcare: '/solutions/healthcare',
  solPublic: '/solutions/public-sector',

  trust: '/trust',
  pricing: '/pricing',
  contact: '/contact',
  demo: '/demo',
  trial: '/trial',
  login: '/login',

  about: '/about',
  customers: '/customers',
  partners: '/partners',
  careers: '/careers',

  blog: '/blog',
  guides: '/guides',
  webinars: '/webinars',
  help: '/help',
  glossary: '/glossary',

  status: '/status',
  privacy: '/privacy',
  terms: '/terms',
  dpa: '/dpa',
} as const;

export type RouteKey = keyof typeof routes;
