import type { Metadata } from 'next';
import { Tiles } from '@/components/blocks/Tiles';
import { DemoForm } from '@/components/forms/DemoForm';
import { ArrowLink } from '@/components/ui/ButtonLink';
import { Section } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import l from '@/styles/lead.module.css';
import { GradientBg } from '@/components/ui/GradientBg';

export const metadata: Metadata = {
  title: 'Book a demo',
  description: 'Thirty minutes on your regulators with your questions.',
};

const agenda: [string, string, string][] = [
  ['0–5 min', 'Your situation', 'Which regulators, how many policies, who approves what today.'],
  [
    '5–20 min',
    'The lifecycle on your content',
    'Draft, link, approve and acknowledge a policy you bring, against the registers you report to.',
  ],
  [
    '20–25 min',
    'Registers, RCSA or multi-client',
    "Whichever matters to you: risk and controls, an assessment, or the consultant's model and white-label output.",
  ],
  [
    '25–30 min',
    'Security, pricing, next steps',
    'The Trust pack, the tier that fits, and a trial workspace set up for you if you want one.',
  ],
];

export default function DemoPage() {
  return (
    <>
      <section className={l.lead}>
        <div className={l.panel}>
          <GradientBg variant="hero" warm horizon />
          <div className={`container ${l.grid}`}>
            <div>
              <p className="eyebrow">Book a demo</p>
              <h1 className={l.title}>Thirty minutes on your regulators with your questions.</h1>
              <p className={`lede ${l.lede}`}>
                For anyone who needs procurement, a security review or a multi-seat or multi-client conversation before committing. Bring a
                policy; we will link it live.
              </p>
              <ol className={l.agenda}>
                {agenda.map(([t, b, p]) => (
                  <li key={t}>
                    <span className={l.time}>{t}</span>
                    <div>
                      <b>{b}</b>
                      <p>{p}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className={`is-light ${l.formCol}`}>
              <DemoForm />
            </div>
          </div>
        </div>
      </section>

      <Section tight>
        <Tiles
          columns={3}
          variant="cards"
          items={[
            {
              title: 'For your security team',
              body: 'The Trust page stands alone and covers certifications, hosting, access control and the DPA.',
              footer: <ArrowLink href={routes.trust}>Trust &amp; Security</ArrowLink>,
            },
            {
              title: 'For procurement',
              body: 'Tiers, the comparison table and the procurement FAQ.',
              footer: <ArrowLink href={routes.pricing}>Pricing</ArrowLink>,
            },
            {
              title: 'For you',
              body: 'The two-minute tour and the short feature videos so that the demo can go straight to your questions.',
              footer: <ArrowLink href={`${routes.home}#tour`}>Watch the tour</ArrowLink>,
            },
          ]}
        />
      </Section>
    </>
  );
}
