import type { Metadata } from 'next';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="section section--mint" style={{ minHeight: '60vh', display: 'grid', alignItems: 'center' }}>
        <div className="container">
          <p className="eyebrow">404</p>
          <h1 style={{ marginTop: 16, maxWidth: '16ch' }}>Page not found</h1>
          <div className="actions" style={{ marginTop: 32 }}>
            <ButtonLink href={routes.home} arrow>
              Gieom.cloud home
            </ButtonLink>
            <ButtonLink href={routes.contact} variant="secondary">
              Contact
            </ButtonLink>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
