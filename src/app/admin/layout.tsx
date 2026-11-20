import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Pricing admin',
  robots: { index: false, follow: false, nocache: true },
};

/** The pricing admin stands on its own: no site header, footer or navigation. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
