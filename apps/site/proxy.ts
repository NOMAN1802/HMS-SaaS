// Locale routing for the public site (P-023): `/` and unprefixed paths redirect to `/bn`
// (Bangla first; browser-language detection is off, see routing.ts). Next 16 "proxy" file
// convention (formerly middleware). Implements: T-WEB-01, T-WEB-13, FR-WEB-GEN-001, FR-WEB-ROUTE-006.
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Everything except Next internals, files with an extension (images, fonts, robots.txt) and the
  // staff app under /staff, which nginx routes to apps/web on the shared host (P-045, C-076).
  matcher: '/((?!_next|staff(?:/|$)|.*\\..*).*)',
};
