import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/blocks/PageHero';
import { Tiles } from '@/components/blocks/Tiles';
import { Icon } from '@/components/ui/Icon';
import { Ph, Section } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import c from './careers.module.css';

export const metadata: Metadata = {
  title: 'Careers at Gieom',
  description: 'Build the software that regulated organisations trust with their rulebook.',
};

const teams: { team: string; roles: { title: string; where: React.ReactNode }[] }[] = [
  {
    team: 'Engineering',
    roles: [
      {
        title: 'Senior full-stack engineer',
        where: (
          <>
            <Ph>[City]</Ph> or remote in India · Full time
          </>
        ),
      },
      {
        title: 'Backend engineer, workflow engine',
        where: (
          <>
            <Ph>[City]</Ph> · Full time
          </>
        ),
      },
    ],
  },
  {
    team: 'Product and design',
    roles: [
      {
        title: 'Product designer',
        where: (
          <>
            <Ph>[City]</Ph> or remote · Full time
          </>
        ),
      },
      { title: 'Product manager, registers and regulatory content', where: 'Dubai · Full time' },
    ],
  },
  {
    team: 'Customers and go-to-market',
    roles: [
      { title: 'Customer success manager, GCC', where: 'Dubai · Full time' },
      {
        title: 'Partner manager, consulting firms',
        where: (
          <>
            Dubai or <Ph>[City, India]</Ph> · Full time
          </>
        ),
      },
      {
        title: 'Regulatory content analyst',
        where: (
          <>
            <Ph>[City, India]</Ph> · Full time
          </>
        ),
      },
    ],
  },
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        crumb="Company · Careers"
        eyebrow="Careers"
        title="Build the software that regulated organisations trust with their rulebook."
        titleWidth="wide"
        lede="A small team across India and the UAE, working on a product where correctness matters more than novelty and the users are specialists who notice."
      />

      <Section>
        <Tiles
          columns={3}
          items={[
            {
              title: 'Problems with consequences',
              body: 'A bug in a consumer app is an annoyance. A bug in a policy approval chain is an audit finding. The work rewards care.',
            },
            {
              title: 'Expert users',
              body: 'Our users are compliance officers, risk managers and auditors. They know their domain, they tell us plainly when we get it wrong, and they notice when we get it right.',
            },
            {
              title: 'Two regions, one team',
              body: (
                <>
                  Offices in <Ph>[City, India]</Ph> and <Ph>[City, UAE]</Ph>, with customers across both. Hybrid working; travel between the
                  two when it helps.
                </>
              ),
            },
            {
              title: 'Depth over sprawl',
              body: 'One platform built deliberately: registers, workflow, documents, reporting. We would rather make linkage excellent than ship a feature nobody asked for.',
            },
            {
              title: 'Design is a first-class discipline',
              body: 'Information-dense screens for specialists need real design. We hire for it and we listen to it.',
            },
            {
              title: 'Benefits',
              body: <Ph>[Health cover, leave, learning budget, equipment, and anything else Gieom offers]</Ph>,
            },
          ]}
        />
      </Section>

      <Section tone="peach" bordered>
        <div className={c.roles}>
          {teams.map((t) => (
            <div key={t.team} className={`${c.team} reveal`}>
              <h2 className={c.teamName}>{t.team}</h2>
              <ul>
                {t.roles.map((r) => (
                  <li key={r.title}>
                    <a href="#" className={c.job}>
                      <span>
                        <b>{r.title}</b>
                        <span className={c.where}>{r.where}</span>
                      </span>
                      <span className={c.go}>
                        View role <Icon name="arrowRight" size={15} strokeWidth={2} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="note" style={{ marginTop: '1.6rem' }}>
          Roles above are placeholders for the launch hiring plan. Nothing that fits? <Link href={routes.contact}>Write to us anyway.</Link>
        </p>
      </Section>
    </>
  );
}
