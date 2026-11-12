import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLayout } from '@/components/blocks/LegalLayout';
import { PageHero } from '@/components/blocks/PageHero';
import { Ph } from '@/components/ui/Section';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How Gieom collects, uses and protects personal data on this website and in the Gieom.cloud platform.',
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        compact
        crumb="Legal · Privacy"
        eyebrow="Legal"
        title="Privacy policy"
        lede={
          <>
            How Gieom collects, uses and protects personal data on this website and in the Gieom.cloud platform. Last updated{' '}
            <Ph>[date]</Ph>.
          </>
        }
      />
      <LegalLayout
        toc={[
          ['who', '1. Who we are'],
          ['what', '2. What we collect'],
          ['why', '3. Why we use it'],
          ['share', '4. Who we share it with'],
          ['where', '5. Where it is stored'],
          ['keep', '6. How long we keep it'],
          ['rights', '7. Your rights'],
          ['cookies', '8. Cookies'],
          ['changes', '9. Changes'],
          ['contact', '10. Contact'],
        ]}
        notice="Draft structure for legal review. Bracketed items are to be completed by counsel for the applicable laws (UAE PDPL, India DPDP Act, and any other jurisdiction in which Gieom offers the service)."
      >
        <h2 id="who">1. Who we are</h2>
        <p>
          <Ph>[Gieom legal entity name]</Ph>, <Ph>[registered address]</Ph>, is the controller of personal data collected through this
          website and, for customer account data, in Gieom.cloud. For content customers put into Gieom.cloud (policies, registers,
          assessments), the customer is the controller and Gieom is the processor under the{' '}
          <Link href={routes.dpa}>Data Processing Agreement</Link>.
        </p>

        <h2 id="what">2. What we collect</h2>
        <p>
          <strong>Website visitors:</strong> pages visited, device and browser information, approximate location from IP address, and
          anything you submit in a form (name, work email, organisation, role, message).
        </p>
        <p>
          <strong>Trial and customer users:</strong> name, work email, organisation, role, sign-in records, actions taken in the product
          (which form the product&apos;s audit log), and support correspondence.
        </p>
        <p>
          <strong>Customer content:</strong> documents, registers, assessments and other material customers place in Gieom.cloud. We process
          it only to provide the service.
        </p>

        <h2 id="why">3. Why we use it</h2>
        <ul>
          <li>To provide and secure the service, including authentication, audit logging and support.</li>
          <li>To respond to requests for demos, documents or partnership.</li>
          <li>To send product and regulatory updates you have opted into; you can unsubscribe at any time.</li>
          <li>To improve the website and product using aggregated usage data.</li>
          <li>To meet legal obligations.</li>
        </ul>
        <p>
          Legal bases, where required: performance of a contract, legitimate interests in operating and securing the service, consent for
          marketing, and legal obligation.
        </p>

        <h2 id="share">4. Who we share it with</h2>
        <p>
          Sub-processors who help us run the service (hosting, email, AI drafting, support tooling), listed with their locations in the{' '}
          <Link href={routes.dpa}>DPA</Link>. Professional advisers and authorities where the law requires. We do not sell personal data.
        </p>
        <p>
          Content you place in the Magpie AI co-pilot is processed to produce drafts and suggestions for you. It is not used to train models
          shared with other customers.
        </p>

        <h2 id="where">5. Where it is stored</h2>
        <p>
          Customer content is hosted in the region chosen at provisioning: <Ph>[regions]</Ph>. Website and account data may be processed in{' '}
          <Ph>[regions]</Ph>. Transfers between jurisdictions are covered by{' '}
          <Ph>[mechanism, e.g. standard contractual clauses or adequacy]</Ph>. See <Link href={routes.trust}>Trust &amp; Security</Link>.
        </p>

        <h2 id="keep">6. How long we keep it</h2>
        <p>
          Account data for the life of the account plus <Ph>[period]</Ph>. Customer content until the customer deletes it or the contract
          ends, after which it is deleted within <Ph>[period]</Ph>. Website form submissions for <Ph>[period]</Ph>. Audit logs for{' '}
          <Ph>[period]</Ph>.
        </p>

        <h2 id="rights">7. Your rights</h2>
        <p>
          Depending on your jurisdiction you may have the right to access, correct, delete or export your personal data, to object to or
          restrict processing, and to withdraw consent. Write to <Ph>[privacy email]</Ph>. If you are a user of a customer&apos;s
          Gieom.cloud account, we may direct your request to that customer as controller.
        </p>

        <h2 id="cookies">8. Cookies</h2>
        <p>
          The website uses strictly necessary cookies for the site to work, and analytics cookies only with your consent. Gieom.cloud uses
          session cookies for authentication. <Ph>[Link to cookie settings]</Ph>.
        </p>

        <h2 id="changes">9. Changes</h2>
        <p>We will post changes here and, for material changes affecting customers, notify account administrators by email.</p>

        <h2 id="contact">10. Contact</h2>
        <p>
          Privacy questions: <Ph>[privacy email]</Ph>. Data protection officer, where appointed: <Ph>[name and contact]</Ph>.
        </p>
      </LegalLayout>
    </>
  );
}
