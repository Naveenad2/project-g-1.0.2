import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { PlaceholderLinkGuard } from '@/components/layout/PlaceholderLinkGuard';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { SpotlightController } from '@/components/layout/SpotlightController';
import { themeInitScript } from '@/lib/theme';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gieom.cloud'),
  title: {
    default: 'Gieom.cloud — Policy and procedure management',
    template: '%s — Gieom.cloud',
  },
  description:
    'Gieom.cloud ties every policy clause to the rule it meets, turns procedures into flows staff can follow, runs the approvals and keeps the evidence.',
  applicationName: 'Gieom.cloud',
  openGraph: {
    type: 'website',
    siteName: 'Gieom.cloud',
    locale: 'en',
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fdfdfd',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <PlaceholderLinkGuard />
        <SpotlightController />
        <MotionProvider />
      </body>
    </html>
  );
}
