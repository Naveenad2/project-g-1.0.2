import type { Metadata } from 'next';
import { PageHero } from '@/components/blocks/PageHero';
import { Tiles } from '@/components/blocks/Tiles';
import { Field, FormCard, Input, Select, formStyles as f } from '@/components/forms/Field';
import { StaticForm } from '@/components/forms/StaticForm';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Ph, Section, SectionLabel } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import styles from '@/styles/page.module.css';
import pt from './partners.module.css';

export const metadata: Metadata = {
  title: 'Partner programme',
  description: 'Consultants are how governance gets built. We built the programme around that.',
};

const tiers: { name: string; fits: string; items: React.ReactNode[]; cta: string; rec?: boolean }[] = [
  {
    name: 'Referral',
    fits: 'For firms that recommend tools but do not deliver them.',
    items: [
      <>
        Referral fee of <Ph>[x]</Ph>% on first-year subscription
      </>,
      'Partner portal for registering leads',
      'Sales and demo support from Gieom',
      'Partner directory listing',
    ],
    cta: 'Apply',
  },
  {
    name: 'Delivery partner',
    fits: 'For firms running policy, RCSA and regulatory work for clients.',
    rec: true,
    items: [
      'Partner terms for every client deployment',
      'White-label reporting and client branding presets',
      'Partner pricing on client subscriptions',
      'Certification training for your consultants',
      'Shared templates and registers across clients',
      'Co-hosted webinars and case studies',
    ],
    cta: 'Apply',
  },
  {
    name: 'Strategic',
    fits: 'For firms with a GRC practice across several markets.',
    items: [
      'Everything in Delivery',
      'Resale with your own paper and pricing',
      'Joint go-to-market plan and named partner manager',
      'Early access to modules and the roadmap',
      'Input into the registers roadmap',
    ],
    cta: 'Talk to us',
  },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partner programme"
        title="Consultants are how governance gets built. We built the programme around that."
        lede="Advisory, audit and GRC consulting firms refer, resell and deliver Gieom.cloud for their clients. The programme gives you the platform, the commercial terms and the marketing to go with it."
        actions={
          <>
            <ButtonLink href="#apply" arrow>
              Apply to partner
            </ButtonLink>
            <ButtonLink href={routes.solConsultants} variant="secondary">
              The consultant model
            </ButtonLink>
          </>
        }
        visual={
          <Tiles
            columns={2}
            variant="cards"
            className={pt.heroTiles}
            items={[
              {
                title: 'Refer',
                body: 'Introduce a client, we run the sale and the onboarding. You earn a referral fee on the first year.',
              },
              {
                title: 'Resell',
                body: 'Sell Gieom.cloud as part of your engagement at partner pricing. You own the relationship and the invoice.',
              },
              {
                title: 'Deliver',
                body: "Run clients' governance on your partner account: workspaces, templates, white-label reports.",
              },
              { title: 'Co-market', body: "Joint webinars, guides and case studies with your firm's name beside ours." },
            ]}
          />
        }
      />

      <Section>
        <div className={pt.tiers}>
          {tiers.map((t) => (
            <article key={t.name} className={`${pt.tier} ${t.rec ? pt.rec : ''} reveal`}>
              <h3>{t.name}</h3>
              <p className={pt.fits}>{t.fits}</p>
              <ul>
                {t.items.map((it, i) => (
                  <li key={i}>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink href="#apply" variant={t.rec ? 'primary' : 'secondary'} block>
                {t.cta}
              </ButtonLink>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="deep">
        <Tiles
          columns={3}
          items={[
            {
              title: 'A platform built for client work',
              body: "A separate deployment for each client and one set of templates you carry between them. The product was designed around the consultant's week.",
            },
            {
              title: 'Certification',
              body: 'A short programme for your consultants on the lifecycle, linkage, RCSA and workflow builder with a credential you can show clients.',
            },
            {
              title: 'A retained relationship',
              body: 'Clients who run their governance on a system you set up keep you as reviewer, assessor or advisor after the engagement.',
            },
            {
              title: 'Marketing with you in it',
              body: 'Webinars, guides and case studies co-branded with your firm, aimed at your prospects.',
            },
            { title: 'Sales support', body: 'Demos, security packs and pricing conversations handled with you rather than around you.' },
            {
              title: 'A roadmap you can see',
              body: 'Delivery and strategic partners see what is coming and tell us which registers and modules matter.',
            },
          ]}
        />
      </Section>

      <Section id="apply" tone="subtle" bordered>
        <SectionLabel>Apply</SectionLabel>
        <div className={styles.split}>
          <div className={`${styles.stickyHead} reveal`}>
            <h2>Tell us about your practice.</h2>
            <p className="lede" style={{ marginTop: '1rem' }}>
              We reply within two business days with the programme guide and a call to work out the right tier.
            </p>
          </div>
          <FormCard className="reveal reveal--late">
            <StaticForm submitLabel="Apply to partner">
              <Field id="p-firm" label="Firm">
                <Input id="p-firm" type="text" name="firm" autoComplete="organization" required />
              </Field>
              <div className={f.row2}>
                <Field id="p-name" label="Your name">
                  <Input id="p-name" type="text" name="name" autoComplete="name" required />
                </Field>
                <Field id="p-email" label="Work email">
                  <Input id="p-email" type="email" name="email" autoComplete="email" required />
                </Field>
              </div>
              <Field id="p-markets" label="Markets you serve">
                <Input id="p-markets" type="text" name="markets" placeholder="e.g. UAE, India, Saudi Arabia" />
              </Field>
              <Field id="p-clients" label="Clients in regulated industries">
                <Select id="p-clients" name="clients" options={['1 to 5', '6 to 20', '21 to 50', 'More than 50']} />
              </Field>
              <Field label="Interested in" group>
                <div className={f.choices}>
                  <label className={f.choice}>
                    <input type="checkbox" name="i" value="refer" />
                    Referral
                  </label>
                  <label className={f.choice}>
                    <input type="checkbox" name="i" value="deliver" />
                    Delivery
                  </label>
                  <label className={f.choice}>
                    <input type="checkbox" name="i" value="resell" />
                    Resale
                  </label>
                </div>
              </Field>
            </StaticForm>
          </FormCard>
        </div>
      </Section>
    </>
  );
}
