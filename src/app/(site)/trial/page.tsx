import type { Metadata } from 'next';
import { Tiles } from '@/components/blocks/Tiles';
import { TrialForm } from '@/components/forms/TrialForm';
import { Section } from '@/components/ui/Section';
import l from '@/styles/lead.module.css';
import { GradientBg } from '@/components/ui/GradientBg';

export const metadata: Metadata = {
  title: 'Start your free trial',
  description: 'Fourteen days. Work email only. No card.',
};

const steps: [string, string][] = [
  ['Create your account', 'Work email, name, organisation and your role. Nothing else is asked for.'],
  [
    'Your workspace is ready',
    'The same sample workspace for everyone: policies linked to the included registers, a risk and control register, a running approval workflow and an RCSA mid-flight.',
  ],
  [
    'Bring your own policy',
    'Upload one of yours and run it through review, approval and acknowledgement. Guided tasks walk you through it.',
  ],
  [
    'Book a demo any time',
    'A banner in the app offers a demo throughout the trial for procurement, a security review or a multi-client conversation.',
  ],
];

export default function TrialPage() {
  return (
    <>
      <section className={l.lead}>
        <div className={`is-dark ${l.panel}`}>
          <GradientBg variant="hero" horizon />
          <div className={`container ${l.grid}`}>
            <div>
              <p className="eyebrow">Free trial</p>
              <h1 className={l.title}>Fourteen days. Work email only. No card.</h1>
              <p className={`lede ${l.lede}`}>
                You land in a working account with one sample workspace already loaded: policies, risks, controls and an in-progress
                assessment. The first thing you see is the product doing something rather than an empty screen.
              </p>
              <ol className={l.steps}>
                {steps.map(([b, p], i) => (
                  <li key={b}>
                    <span className={l.stepNum}>{i + 1}</span>
                    <div>
                      <b>{b}</b>
                      <p>{p}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className={`is-light ${l.formCol}`}>
              <TrialForm />
            </div>
          </div>
        </div>
      </section>

      <Section>
        <Tiles
          columns={3}
          items={[
            {
              title: 'One sample workspace',
              body: 'Eight policies and three procedures from a sample financial institution, each linked to the included regulatory registers and routed through a working approval chain.',
            },
            {
              title: 'Registers and an RCSA',
              body: 'A risk register, a control registry mapped to it, and one assessment in progress with scores, a thread and a generated report.',
            },
            {
              title: 'Guided tasks',
              body: 'In-app tasks walk you through linking a clause, running an approval, tracking acknowledgement and drawing a procedure.',
            },
            {
              title: 'Magpie AI co-pilot',
              body: 'Enabled with a trial quota so that you can draft against a regulation and see the Consistency Check at work.',
            },
            {
              title: 'Your own documents',
              body: 'Upload your policies; they stay yours. Export everything at any time, during or after the trial.',
            },
            {
              title: 'Help when you want it',
              body: 'Help center, short videos on every feature, and a Book a demo banner for a human walkthrough.',
            },
          ]}
        />
      </Section>
    </>
  );
}
