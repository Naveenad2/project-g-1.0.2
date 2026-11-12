import type { NextConfig } from 'next';

/**
 * Static export: `next build` writes a fully static site to `out/`,
 * deployable to Cloudflare Pages, Netlify, S3 or any static host.
 * Legacy `.html` URLs are redirected via `public/_redirects`.
 */
const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
