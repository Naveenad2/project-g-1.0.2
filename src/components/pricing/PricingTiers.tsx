'use client';

import { useState } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Icon } from '@/components/ui/Icon';
import { routes } from '@/lib/routes';
import styles from './Pricing.module.css';

type Feature = [text: string, included: boolean];

interface Tier {
  name: string;
  fits: string;
  price: string | null;
  customNote?: string;
  cta: { label: string; href: string; variant: 'primary' | 'secondary' | 'dark' };
  features: Feature[];
  note: React.ReactNode;
  recommended?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Starter',
    fits: 'A single team piloting policy management.',
    price: '[Starter price]',
    cta: { label: 'Start free trial', href: routes.trial, variant: 'secondary' },
    features: [
      ['Policies and procedures with full lifecycle', true],
      ['Document registry and "Published to me"', true],
      ['Acknowledgement tracking', true],
      ['Standard approval workflow', true],
      ['Regulatory registers for your jurisdiction', true],
      ['Magpie AI co-pilot (fair-use quota)', true],
      ['Risk and control registers', false],
      ['RCSA', false],
      ['Custom workflows and forms', false],
      ['SSO / SAML', false],
    ],
    note: (
      <>
        Self-serve checkout · up to <span className="ph">[seat cap]</span> users
      </>
    ),
  },
  {
    name: 'Professional',
    fits: "The full policy lifecycle plus RCSA for several departments or a consultant's first clients.",
    price: '[Pro price]',
    recommended: true,
    cta: { label: 'Start free trial', href: routes.trial, variant: 'primary' },
    features: [
      ['Everything in Starter', true],
      ['Risk and control registers, Impact Analyzer', true],
      ['Regulatory change tracking and coverage reports', true],
      ['RCSA with threaded review and PDF reports', true],
      ['Custom workflows and form builder', true],
      ['Report Designer and configurable dashboards', true],
      ["Partner pricing for consulting firms' client deployments", true],
      ['SSO / SAML', true],
      ['Custom data residency', false],
      ['Dedicated support and SLA', false],
    ],
    note: 'Self-serve trial and then checkout or invoice',
  },
  {
    name: 'Enterprise',
    fits: 'Org-wide rollout, consulting firms, custom SSO and a security review.',
    price: null,
    customNote: ' · annual contract',
    cta: { label: 'Contact sales', href: routes.demo, variant: 'dark' },
    features: [
      ['Everything in Professional', true],
      ['Partner terms per client deployment and white-label reporting', true],
      ['Data residency and hosting region options', true],
      ['Enforced SSO, SCIM provisioning, audit log export', true],
      ['Board-approval tier and custom lifecycle stages', true],
      ['Dedicated customer success and named support', true],
      ['Uptime SLA with service credits', true],
      ['Security review, DPA negotiation, custom terms', true],
      ['Onboarding and migration services', true],
      ['Learning hub early access', true],
    ],
    note: 'Procurement-ready: MSA, DPA, security pack',
  },
];

export function PricingTiers() {
  const [yearly, setYearly] = useState(true);
  const billing = yearly ? ', billed annually' : ', billed monthly';

  return (
    <div className={styles.wrap}>
      <div className={styles.toggle} role="group" aria-label="Billing period">
        <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>
          Monthly
        </button>
        <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>
          Annual · save 15%
        </button>
      </div>

      <div className={styles.tiers}>
        {tiers.map((tier) => (
          <article key={tier.name} className={`${styles.tier} ${tier.recommended ? styles.rec : ''}`}>
            {tier.recommended && <span className={styles.tag}>Most chosen</span>}
            <h2 className={styles.name}>{tier.name}</h2>
            <p className={styles.fits}>{tier.fits}</p>
            <p className={styles.price}>
              {tier.price ? (
                <>
                  <span className="ph">{tier.price}</span>
                  <small> / user / month{billing}</small>
                </>
              ) : (
                <>
                  Custom<small>{tier.customNote}</small>
                </>
              )}
            </p>
            <ButtonLink href={tier.cta.href} variant={tier.cta.variant} block>
              {tier.cta.label}
            </ButtonLink>
            <ul className={styles.features}>
              {tier.features.map(([text, ok]) => (
                <li key={text} className={ok ? undefined : styles.no}>
                  <Icon name={ok ? 'check' : 'close'} size={15} strokeWidth={2.2} />
                  <span>
                    {!ok && <span className="sr-only">Not included: </span>}
                    {text}
                  </span>
                </li>
              ))}
            </ul>
            <p className={styles.note}>{tier.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
