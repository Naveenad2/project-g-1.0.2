import os from 'node:os';
import type { NextConfig } from 'next';

/**
 * This machine's own network addresses. Next.js blocks its dev resources (live reload and the chunks it
 * loads on demand, such as the 3D scenes) for any host that is not localhost, so without these a phone
 * or tablet opening the dev server over the same Wi-Fi gets the page without its interactive parts.
 * Development only; production builds are static files.
 */
const lanHosts = Object.values(os.networkInterfaces())
  .flat()
  .filter((n): n is os.NetworkInterfaceInfo => !!n && n.family === 'IPv4' && !n.internal)
  .map((n) => n.address);

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
  allowedDevOrigins: [...lanHosts, '*.local'],
};

export default nextConfig;
