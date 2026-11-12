import type { Metadata } from 'next';
import { CtaBand } from '@/components/blocks/CtaBand';
import { PageHero } from '@/components/blocks/PageHero';
import { Tiles } from '@/components/blocks/Tiles';
import { Timeline } from '@/components/blocks/Timeline';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Icon } from '@/components/ui/Icon';
import { Ph, Section } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import styles from '@/styles/page.module.css';
import a from './about.module.css';

export const metadata: Metadata = {
  title: 'About Gieom',
  description: 'We build the systems regulated organisations run their governance on.',
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumb="Company · About"
        eyebrow="About Gieom"
        title="We build the systems regulated organisations run their governance on."
        titleWidth="wide"
        lede={
          <>
            Gieom has worked with banks, insurers and regulators across India and the Middle East for <Ph>[years]</Ph>, on the unglamorous
            work of policies, procedures, risk and compliance. Gieom.cloud is that experience turned into a cloud platform.
          </>
        }
      />

      <Section>
        <div className={styles.split}>
          <h2 className={`${styles.stickyHead} reveal`}>
            The spreadsheet was never the problem. The gap between the policy and the proof was.
          </h2>
          <div className={`${styles.article} reveal reveal--late`}>
            <p>
              Every compliance team we have worked with has the same three files: the policies, the regulatory mapping, and the approval
              emails. They live apart, they drift apart, and the week before an inspection someone reconciles them by hand.
            </p>
            <p>
              Gieom.cloud started from one question: what if the link between a clause and the rule it satisfies was part of the document
              itself, visible to the reviewer, the approver and the auditor? Everything else on the platform, the registers, the workflow
              engine, the assessments, the reporting, follows from making that link real and keeping it current.
            </p>
            <p>
              We built it for the regulators we know, RBI, SEBI, IRDAI, CBUAE, DFSA, ADGM, and for the two people who carry the work: the
              compliance officer who has to prove it, and the consultant who has to set it up for many clients at once.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="deep">
        <Timeline
          items={[
            {
              when: <Ph>[Year]</Ph>,
              title: 'Gieom founded',
              body: <Ph>[One line on the founding and first work with regulated clients]</Ph>,
            },
            {
              when: <Ph>[Year]</Ph>,
              title: 'On-premise governance platform',
              body: 'Policy and procedure management deployed inside banks and insurers, with screen simulations for training.',
            },
            {
              when: <Ph>[Year]</Ph>,
              title: 'Risk, controls and RCSA',
              body: 'Registers and self-assessment added on the same workflow engine.',
            },
            {
              when: '2026',
              title: 'Gieom.cloud on gieom.cloud',
              body: 'The platform rebuilt for the cloud. It launches with policy and procedure management and the wider GRC lifecycle underneath.',
            },
          ]}
        />
      </Section>

      <Section>
        <Tiles
          columns={3}
          items={[
            {
              title: 'Evidence over assertion',
              body: 'A control that cannot be shown is not a control. We build so that the record is produced by doing the work rather than by writing it up afterwards.',
            },
            {
              title: "The region's regulators, specifically",
              body: 'We maintain the registers for India and the GCC ourselves. Generic GRC tools treat them as an import; we treat them as the product.',
            },
            {
              title: 'Consultants as partners',
              body: "Advisory firms are a channel and an audience. We build the consultant's model with them rather than around them.",
            },
          ]}
        />
      </Section>

      <Section tone="subtle" tight bordered>
        <ul className={a.people}>
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className={`${a.person} reveal`}>
              <div className={a.photo}>
                <Icon name="user" size={28} strokeWidth={1.4} />
                <span>[Photo]</span>
              </div>
              <b>
                <Ph>[Name]</Ph>
              </b>
              <span>
                <Ph>[Title]</Ph>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section tight>
        <ul className={a.offices}>
          <li className="reveal">
            <Icon name="pin" size={18} />
            <b>
              <Ph>[City, India]</Ph>
            </b>
            <span>
              <Ph>[Address line]</Ph>
            </span>
          </li>
          <li className="reveal">
            <Icon name="pin" size={18} />
            <b>
              <Ph>[City, UAE]</Ph>
            </b>
            <span>
              <Ph>[Address line]</Ph>
            </span>
          </li>
          <li className="reveal">
            <Icon name="layers" size={18} />
            <b>Working across</b>
            <span>India, UAE, Saudi Arabia, Bahrain, Qatar, Kuwait, Oman</span>
          </li>
        </ul>
      </Section>

      <CtaBand
        title="Work with us, or work for us."
        lede="Partner firms, open roles and a contact form are one click away."
        actions={
          <>
            <ButtonLink href={routes.partners} arrow>
              Partner programme
            </ButtonLink>
            <ButtonLink href={routes.careers} variant="secondary">
              Careers
            </ButtonLink>
            <ButtonLink href={routes.contact} variant="secondary">
              Contact
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
