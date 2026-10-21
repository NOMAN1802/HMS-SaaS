import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { securityHeaders } from './src/security/headers';

// Public hospital website (EP-31). Pages are static and read only content data; there are no
// Server Actions and no backend calls in WEB-A (C-063, P-028). Implements: T-WEB-01, P-029.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders(process.env.NODE_ENV !== 'production') }];
  },
};

export default withNextIntl(nextConfig);
