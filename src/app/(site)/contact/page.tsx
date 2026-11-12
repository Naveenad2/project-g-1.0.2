import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/forms/ContactForm';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Ph } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import l from '@/styles/lead.module.css';
import { GradientBg } from '@/components/ui/GradientBg';

export const metadata: Metadata = {
  title: 'Contact Gieom',
  description: 'Sales, support, partnerships, press or security. We reply within two business days.',
};

const ways: { icon: IconName; title: string; body: React.ReactNode }[] = [
  {
    icon: 'calendar',
    title: 'Sales and demos',
    body: (
      <>
        For pricing, procurement and a walkthrough on your regulators. <Link href={routes.demo}>Book a demo →</Link>
      </>
    ),
  },
  {
    icon: 'lifebuoy',
    title: 'Support',
    body: (
      <>
        Existing customers: in-app chat, the help center, or <Ph>[support email]</Ph>. Business hours in GST and IST; Enterprise customers
        have a named contact.
      </>
    ),
  },
  {
    icon: 'shield',
    title: 'Security',
    body: (
      <>
        Report a vulnerability or request the security pack: <Ph>[security email]</Ph>. See{' '}
        <Link href={routes.trust}>Trust &amp; Security</Link>.
      </>
    ),
  },
  {
    icon: 'users',
    title: 'Partnerships',
    body: (
      <>
        Consulting and advisory firms: <Link href={routes.partners}>the partner programme</Link>, or write to <Ph>[partners email]</Ph>.
      </>
    ),
  },
  {
    icon: 'pin',
    title: 'Offices',
    body: (
      <>
        <Ph>[Address, City, India]</Ph> · <Ph>[Address, City, UAE]</Ph>
      </>
    ),
  },
];

export default function ContactPage() {
  return (
    <section className={l.lead}>
      <div className={`is-dark ${l.panel}`}>
        <GradientBg variant="hero" horizon />
        <div className={`container ${l.grid}`}>
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className={l.title}>Talk to a person.</h1>
            <p className={`lede ${l.lede}`}>
              Sales, support, partnerships, press or security. Pick the route and we will reply within two business days and usually sooner.
            </p>
            <ul className={l.ways}>
              {ways.map((w) => (
                <li key={w.title}>
                  <span className={l.ic} aria-hidden="true">
                    <Icon name={w.icon} size={20} />
                  </span>
                  <div>
                    <b>{w.title}</b>
                    <p>{w.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className={`is-light ${l.formCol}`}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
