import type { NextConfig } from 'next';
import { securityHeaders } from '@hms/ui/security';
import { API_BASE_URL } from './src/config';

// Next.js renders the staff UI only. Business writes go through the NestJS API (ADR-002).
// Every staff screen lives under /staff (C-076, P-043): on the shared host nginx sends /staff to
// this app and everything else to the public site, and `basePath` moves pages, links, router
// targets and /_next assets under it with no page changes. Staff screens are never indexed
// (P-045) and send the same enforced security headers as the site, with the API host allowed
// for fetch (P-047). Implements: T-UI-02, T-WEB-18, FR-WEB-ROUTE-002, FR-WEB-ROUTE-006.
const STAFF_BASE_PATH = '/staff';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  basePath: STAFF_BASE_PATH,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          ...securityHeaders({
            development: process.env.NODE_ENV !== 'production',
            connectSources: [new URL(API_BASE_URL).origin],
          }),
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
