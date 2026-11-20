import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/blocks/PageHero';
import { Field, Input } from '@/components/forms/Field';
import { StaticForm } from '@/components/forms/StaticForm';
import { BlogList } from '@/components/resources/BlogList';
import { Icon } from '@/components/ui/Icon';
import { Section } from '@/components/ui/Section';
import { routes } from '@/lib/routes';
import styles from '@/styles/page.module.css';
import r from '@/styles/resources.module.css';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Regulatory news, product updates and GRC commentary.',
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Blog"
        title="Regulatory news, product updates and GRC commentary."
        lede="Written for compliance officers and the consultants who serve them. No press releases."
      />

      <Section tight>
        <a href="#" className={`${r.feature} reveal`}>
          <div className={r.featureCopy}>
            <p className={r.meta}>
              <b>Regulatory news</b>
              <span aria-hidden="true">·</span>
              <span>7 min read</span>
              <span aria-hidden="true">·</span>
              <span>Draft</span>
            </p>
            <h2 className={r.featureTitle}>What the amended CBUAE AML circular means for your transaction monitoring procedure</h2>
            <p>
              The filing window changed. Here is the list of documents a typical bank will need to re-review and how to find yours in an
              afternoon rather than a quarter.
            </p>
            <span className="link-arrow">
              Read the article <Icon name="arrowRight" size={15} strokeWidth={2} />
            </span>
          </div>
          <div className={r.featureVis} aria-hidden="true">
            <span>§7.2</span>
          </div>
        </a>
      </Section>

      <Section tight tone="subtle" bordered>
        <BlogList />
        <p className="note" style={{ marginTop: '2rem' }}>
          Titles and summaries above are editorial placeholders for the launch content plan.
        </p>
      </Section>

      <Section tone="peach" bordered>
        <div className={`${styles.split} ${styles.splitCenter}`}>
          <div className="reveal">
            <h2>A monthly note on regulatory change in India and the GCC.</h2>
            <p className="lede" style={{ marginTop: '1rem' }}>
              One email a month: the circulars that changed, the policies they touch, and nothing else.
            </p>
          </div>
          <div className={`${r.newsletter} reveal reveal--late`}>
            <StaticForm
              inline
              submitLabel="Subscribe"
              footer={
                <>
                  Unsubscribe in one click. See the <Link href={routes.privacy}>privacy policy</Link>.
                </>
              }
            >
              <Field id="nl-email" label="Work email">
                <Input id="nl-email" type="email" name="email" autoComplete="email" required />
              </Field>
            </StaticForm>
          </div>
        </div>
      </Section>
    </>
  );
}
