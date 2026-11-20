import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLayout } from '@/components/blocks/LegalLayout';
import { PageHero } from '@/components/blocks/PageHero';
import { Ph } from '@/components/ui/Section';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'The terms for self-serve Starter and Professional subscriptions and for the free trial.',
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Legal"
        title="Terms of service"
        lede={
          <>
            The terms for self-serve Starter and Professional subscriptions and for the free trial. Enterprise customers are governed by
            their master services agreement. Last updated <Ph>[date]</Ph>.
          </>
        }
      />
      <LegalLayout
        toc={[
          ['s1', '1. The agreement'],
          ['s2', '2. Accounts and users'],
          ['s3', '3. Free trial'],
          ['s4', '4. Subscriptions and payment'],
          ['s5', '5. Your content'],
          ['s6', '6. Acceptable use'],
          ['s7', '7. AI co-pilot'],
          ['s8', '8. Availability and support'],
          ['s9', '9. Confidentiality and data protection'],
          ['s10', '10. Intellectual property'],
          ['s11', '11. Warranties and liability'],
          ['s12', '12. Term and termination'],
          ['s13', '13. General'],
        ]}
        notice="Draft structure for legal review. Bracketed items are to be completed by counsel; governing law and dispute resolution to be set per the contracting entity."
      >
        <h2 id="s1">1. The agreement</h2>
        <p>
          These terms are between <Ph>[Gieom legal entity]</Ph> (&ldquo;Gieom&rdquo;) and the organisation on whose behalf you create an
          account (&ldquo;Customer&rdquo;). By starting a trial or subscription you confirm you are authorised to bind the Customer.
        </p>

        <h2 id="s2">2. Accounts and users</h2>
        <p>
          The Customer is responsible for its users, their credentials and their use of the service. Users must be employees, contractors
          or, for consulting partners, client personnel the Customer has authorised. Roles and permissions are set by the Customer&apos;s
          administrators.
        </p>

        <h2 id="s3">3. Free trial</h2>
        <p>
          The trial is free for fourteen days, requires no payment details, and provides a working account with sample content. At the end
          of the trial the account becomes read-only for <Ph>[period]</Ph>, after which it is deleted unless a subscription is purchased.
          Trial accounts are provided as-is.
        </p>

        <h2 id="s4">4. Subscriptions and payment</h2>
        <p>
          Starter and Professional are billed monthly or annually per user, in advance, by card or (annual Professional) by invoice. Prices
          are shown on the <Link href={routes.pricing}>pricing page</Link> and may change with <Ph>[notice period]</Ph> notice before the
          next renewal. Subscriptions renew automatically unless cancelled from the admin console before the renewal date. Taxes are added
          where applicable.
        </p>

        <h2 id="s5">5. Your content</h2>
        <p>
          The Customer owns the documents, registers, assessments and other content it places in the service. Gieom processes it only to
          provide the service, as described in the <Link href={routes.privacy}>privacy policy</Link> and the{' '}
          <Link href={routes.dpa}>DPA</Link>. The Customer can export its content at any time and for <Ph>[period]</Ph> after termination.
        </p>

        <h2 id="s6">6. Acceptable use</h2>
        <p>
          The Customer will not use the service to store or transmit unlawful material, attempt to gain unauthorised access, interfere with
          other customers&apos; use, resell the service except under a partner agreement, or use it to build a competing product.
        </p>

        <h2 id="s7">7. AI co-pilot</h2>
        <p>
          Magpie AI produces drafts and suggestions from the Customer&apos;s content and prompts. Output is a starting point for the
          Customer&apos;s own review and approval; it is not legal or regulatory advice, and the Customer remains responsible for the
          content it publishes. The co-pilot can be disabled per tenant by an administrator.
        </p>

        <h2 id="s8">8. Availability and support</h2>
        <p>
          Gieom aims for the availability described on the <Link href={routes.trust}>Trust &amp; Security</Link> page and publishes status
          at the <Link href={routes.status}>status page</Link>. Support is provided by email and in-app chat during business hours in GST
          and IST. Service levels with credits are available under an Enterprise agreement.
        </p>

        <h2 id="s9">9. Confidentiality and data protection</h2>
        <p>
          Each party will keep the other&apos;s confidential information confidential. Processing of personal data is governed by the{' '}
          <Link href={routes.dpa}>Data Processing Agreement</Link>, which forms part of these terms.
        </p>

        <h2 id="s10">10. Intellectual property</h2>
        <p>
          Gieom owns the service, including the regulatory registers it maintains and the templates it provides; the Customer receives a
          licence to use them within the service for the term. The Customer&apos;s modifications to templates are the Customer&apos;s.
        </p>

        <h2 id="s11">11. Warranties and liability</h2>
        <p>
          Gieom warrants that the service will perform materially as described. Except as stated, the service is provided without other
          warranties. Neither party is liable for indirect or consequential loss. Each party&apos;s total liability is limited to{' '}
          <Ph>[the fees paid in the twelve months before the claim]</Ph>, except for breaches of confidentiality, data protection or
          intellectual property, and liabilities that cannot be limited by law.
        </p>

        <h2 id="s12">12. Term and termination</h2>
        <p>
          The subscription continues until cancelled. Either party may terminate for material breach not cured within <Ph>[period]</Ph>. On
          termination the Customer may export its content for <Ph>[period]</Ph>, after which it is deleted.
        </p>

        <h2 id="s13">13. General</h2>
        <p>
          Governing law and courts: <Ph>[jurisdiction per contracting entity]</Ph>. Notices to <Ph>[legal email]</Ph>. These terms, the
          privacy policy and the DPA are the whole agreement for self-serve subscriptions.
        </p>
      </LegalLayout>
    </>
  );
}
