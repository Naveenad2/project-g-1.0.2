'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Icon } from '@/components/ui/Icon';
import { DEFAULT_SAVING, formatPercent, formatPrice, subscribePricing, type Pricing } from '@/lib/pricing';
import { routes } from '@/lib/routes';
import styles from './Pricing.module.css';

type Feature = [text: string, included: boolean];

interface Tier {
  name: string;
  /** Where the tier's live prices are kept (`/pricing/<key>` in the Realtime Database). */
  key?: 'starter' | 'professional';
  fits: string;
  /** Placeholder shown until prices are published. */
  price: string | null;
  customNote?: string;
  cta: { label: string; href: string; variant: 'primary' | 'secondary' | 'dark' };
  features: Feature[];
  /** The line at the foot of the card; Starter's carries the user limit. */
  note: ReactNode | ((seats: ReactNode) => ReactNode);
  recommended?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Starter',
    key: 'starter',
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
    note: (seats) => <>Self-serve checkout · up to {seats} users</>,
  },
  {
    name: 'Professional',
    key: 'professional',
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

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Roll the prices in: up from below (annual or a new price) or down from above (monthly). */
function rollPrices(root: HTMLElement | null, dir: 1 | -1) {
  root?.querySelectorAll<HTMLElement>('[data-price]').forEach((el, i) => {
    el.getAnimations().forEach((a) => a.cancel());
    el.animate(
      [
        { opacity: 0, transform: `translateY(${12 * dir}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 520, delay: i * 60, easing: EASE, fill: 'backwards' },
    );
  });
}

/** How long to wait for prices before showing the placeholders instead (slow or no connection). */
const WAIT_MS = 8000;

/**
 * The three tiers under a billing switch. The switch's pill slides under the chosen period and turns from
 * teal (monthly) to tangerine (annual) along the brand gradient. The cards follow it: a band of the new colour
 * sweeps across each one in turn (in the direction the pill moved), each card settles, its light, rim and
 * ticks turn teal or tangerine, and the prices roll over to the new period (down for annual, up for monthly).
 * Without script the chosen option is simply filled, and with reduced motion the colours change at once.
 *
 * The prices are live: they come from the Realtime Database (`/pricing`, edited in the pricing admin at /admin)
 * and change on the page the moment new ones are published. While they load, each price is a quiet
 * placeholder bar of the same size, so nothing moves; with no prices published, or no connection, the page
 * shows the bracketed placeholders.
 */
export function PricingTiers() {
  const [yearly, setYearly] = useState(true);
  const billing = yearly ? ', billed annually' : ', billed monthly';
  const period = yearly ? 'annual' : 'monthly';
  const toggleRef = useRef<HTMLDivElement>(null);
  const tiersRef = useRef<HTMLDivElement>(null);
  const changed = useRef(false);
  const [live, setLive] = useState<{ loading: boolean; pricing: Pricing | null }>({ loading: true, pricing: null });
  const { loading, pricing } = live;

  // Follow the published prices.
  useEffect(() => {
    let heard = false;
    const timer = window.setTimeout(() => {
      if (!heard) setLive((cur) => (cur.pricing ? cur : { loading: false, pricing: null }));
    }, WAIT_MS);
    const stop = subscribePricing(
      (next) => {
        heard = true;
        window.clearTimeout(timer);
        setLive({ loading: false, pricing: next });
      },
      () => {
        heard = true;
        window.clearTimeout(timer);
        setLive((cur) => (cur.pricing ? { ...cur, loading: false } : { loading: false, pricing: null }));
      },
    );
    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, []);

  // New prices (the first ones, or a change published while the page is open) roll in.
  const signature = pricing ? JSON.stringify([pricing.currency, pricing.starter, pricing.professional]) : '';
  useEffect(() => {
    if (!signature || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    rollPrices(tiersRef.current, 1);
  }, [signature]);

  const saving = formatPercent(pricing?.annualSaving ?? DEFAULT_SAVING);
  const skeleton = (wide: boolean) => (
    <>
      <span className={`${styles.skel} ${wide ? '' : styles.skelSmall}`} aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </>
  );
  // while loading, the placeholder text is in the page too (hidden), for browsers without script
  const waiting = (wide: boolean, text: string) => (
    <>
      {skeleton(wide)}
      <span className={`ph ${styles.fallback}`}>{text}</span>
    </>
  );
  const priceOf = (tier: Tier) => {
    if (pricing && tier.key) return <span className={styles.amount}>{formatPrice(pricing[tier.key][period], pricing.currency)}</span>;
    if (loading) return waiting(true, tier.price ?? '');
    return <span className="ph">{tier.price}</span>;
  };
  const seats = pricing ? (
    pricing.starter.seatCap.toLocaleString('en-US')
  ) : loading ? (
    waiting(false, '[seat cap]')
  ) : (
    <span className="ph">[seat cap]</span>
  );

  // The pill is measured to the chosen option, so it fits each label exactly at any width.
  useLayoutEffect(() => {
    const el = toggleRef.current;
    if (!el) return;
    const place = () => {
      const on = el.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
      if (!on) return;
      el.style.setProperty('--x', `${on.offsetLeft}px`);
      el.style.setProperty('--w', `${on.offsetWidth}px`);
    };
    place();
    // first placement: show the pill where it belongs, then let it move from the next change on
    let raf = 0;
    if (el.dataset.ready === undefined) raf = requestAnimationFrame(() => (el.dataset.ready = ''));
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [yearly]);

  // The cards take the change in turn: a sweep of the new colour, a small settle, and the prices roll over.
  useEffect(() => {
    if (!changed.current) {
      changed.current = true;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dir = yearly ? 1 : -1;
    const cards = Array.from(tiersRef.current?.querySelectorAll<HTMLElement>('[data-tier]') ?? []);
    // the sweep runs the way the pill moved: left to right for annual, right to left for monthly
    const order = yearly ? cards : [...cards].reverse();
    order.forEach((card, i) => {
      card.getAnimations().forEach((a) => a.cancel());
      card.animate([{ transform: 'translateY(10px)' }, { transform: 'none' }], {
        duration: 700,
        delay: i * 90,
        easing: EASE,
        fill: 'backwards',
      });
      const sweep = card.querySelector<HTMLElement>('[data-sweep]');
      if (!sweep) return;
      sweep.getAnimations().forEach((a) => a.cancel());
      sweep.animate(
        [
          { opacity: 0, transform: `translateX(${-110 * dir}%)` },
          { opacity: 1, offset: 0.25 },
          { opacity: 1, offset: 0.7 },
          { opacity: 0, transform: `translateX(${110 * dir}%)` },
        ],
        { duration: 1000, delay: i * 90, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' },
      );
    });
    rollPrices(tiersRef.current, dir);
  }, [yearly]);

  return (
    <div className={styles.wrap} data-period={period}>
      <noscript>
        <style>{`.${styles.skel}{display:none!important}.${styles.fallback}{display:inline!important}`}</style>
      </noscript>
      <div ref={toggleRef} className={styles.toggle} role="group" aria-label="Billing period">
        <span className={styles.thumb} aria-hidden="true" />
        <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>
          Monthly
        </button>
        <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>
          Annual · <span className={styles.save}>save {saving}%</span>
        </button>
      </div>

      <div ref={tiersRef} className={styles.tiers}>
        {tiers.map((tier) => (
          <article key={tier.name} className={`${styles.tier} ${tier.recommended ? styles.rec : ''}`} data-tier="">
            {/* the card's light: teal for monthly, tangerine for annual, and the sweep that carries the change */}
            <span className={styles.light} aria-hidden="true">
              <span className={styles.washTeal} />
              <span className={styles.washWarm} />
              <span className={styles.sweep} data-sweep="" />
            </span>
            {tier.recommended && <span className={styles.tag}>Most chosen</span>}
            <h2 className={styles.name}>{tier.name}</h2>
            <p className={styles.fits}>{tier.fits}</p>
            <div className={styles.price}>
              {tier.price ? (
                <p data-price="" aria-live="polite">
                  {priceOf(tier)} <small>/ user / month{billing}</small>
                </p>
              ) : (
                <p>
                  Custom <small>{tier.customNote?.trim()}</small>
                </p>
              )}
            </div>
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
            <p className={styles.note}>{typeof tier.note === 'function' ? tier.note(seats) : tier.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
