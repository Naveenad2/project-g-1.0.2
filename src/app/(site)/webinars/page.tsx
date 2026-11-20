import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand } from '@/components/blocks/CtaBand';
import { PageHero } from '@/components/blocks/PageHero';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Icon } from '@/components/ui/Icon';
import { Ph, Section, SectionLabel } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import r from '@/styles/resources.module.css';

export const metadata: Metadata = {
  title: 'Webinars',
  description: 'Forty-five minutes with people who do this work.',
};

const recordings: { label: string; dur: string; title: string; sub: string; host: string }[] = [
  {
    label: 'RCSA',
    dur: '47:12',
    title: 'Running an RCSA without the workbook',
    sub: 'Scoping, scoring, threads and the report, start to finish',
    host: 'Gieom · 42 attendees',
  },
  {
    label: 'Ack',
    dur: '38:40',
    title: 'Acknowledgement that auditors accept',
    sub: 'With an internal audit lead from an Indian NBFC',
    host: 'Gieom with a partner firm',
  },
  {
    label: 'SOP',
    dur: '41:05',
    title: 'Drawing procedures people actually follow',
    sub: 'SOP designer, recordings and short assessments',
    host: 'Gieom',
  },
  {
    label: '×10',
    dur: '52:30',
    title: "Ten clients: the consultant's model",
    sub: 'Deployments, templates, white-label reports, handover',
    host: 'Gieom with a partner firm',
  },
  {
    label: 'Board',
    dur: '35:18',
    title: 'Board approval tiers: what needs the committee',
    sub: 'A practical split from GCC banking governance',
    host: 'Gieom',
  },
  {
    label: 'Trust',
    dur: '44:00',
    title: 'Security review for a GRC platform: what to ask',
    sub: 'For IT security teams evaluating any vendor',
    host: 'Gieom',
  },
];

export default function WebinarsPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Webinars"
        title="Forty-five minutes with people who do this work."
        lede="Live sessions co-hosted with a consulting partner on the practical side of policy, risk and regulatory change. Recordings stay up."
      />

      <Section tight>
        <article className={`${r.live} reveal`}>
          <div className={r.liveCopy}>
            <div className={r.when}>
              <div className={r.date}>
                <b>26</b>
                <span>Nov</span>
              </div>
              <div>
                <b className={r.whenLine}>Thursday, 11:00 GST · 12:30 IST</b>
                <span className="muted" style={{ fontSize: 14 }}>
                  45 minutes with live Q&amp;A
                </span>
              </div>
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)' }}>
              Turning a circular into a re-review list in one afternoon
            </h2>
            <p className="lede" style={{ margin: '0.8rem 0 1.2rem', fontSize: '1.05rem' }}>
              A walkthrough of regulatory change tracking on a real amendment, from logging the clause to the documents it touches, with a
              compliance head from a GCC bank on the panel.
            </p>
            <p className={r.host}>
              <i aria-hidden="true" />
              <span>
                Hosted by Gieom with <Ph>[partner firm]</Ph>
              </span>
            </p>
            <div className="actions" style={{ marginTop: '1.4rem' }}>
              <a href="#" className="btn btn--primary">
                Register
              </a>
              <a href="#" className="btn btn--secondary">
                Add to calendar
              </a>
            </div>
          </div>
          <div className={r.liveVis} aria-hidden="true">
            <span className={r.pb}>
              <Icon name="play" size={28} />
            </span>
          </div>
        </article>
      </Section>

      <Section tone="subtle" bordered>
        <SectionLabel>Recordings</SectionLabel>
        <div className={r.recs}>
          {recordings.map((rec) => (
            <a key={rec.title} href="#" className={`${r.rec} reveal`}>
              <span className={r.thumb}>
                <span>{rec.label}</span>
                <span className={r.thumbPlay} aria-hidden="true">
                  <Icon name="play" size={14} />
                </span>
                <span className={r.thumbDur}>{rec.dur}</span>
              </span>
              <b>{rec.title}</b>
              <span className={r.recSub}>{rec.sub}</span>
              <span className={r.host}>
                <i aria-hidden="true" />
                {rec.host}
              </span>
            </a>
          ))}
        </div>
        <p className="note" style={{ marginTop: '2rem' }}>
          Session titles above are the launch content plan; recordings are added as sessions run.
        </p>
      </Section>

      <CtaBand
        title="Want to co-host a session?"
        lede={
          <>
            Consulting partners run sessions with us for their clients and prospects.{' '}
            <Link href={routes.partners}>See the partner programme.</Link>
          </>
        }
        actions={
          <ButtonLink href={routes.contact} arrow>
            Propose a session
          </ButtonLink>
        }
      />
    </>
  );
}
