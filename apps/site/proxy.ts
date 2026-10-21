// Locale routing for the public site (P-023): `/` and unprefixed paths redirect to `/bn`
// (Bangla first; browser-language detection is off, see routing.ts). Next 16 "proxy" file
// convention (formerly middleware). Implements: T-WEB-01, FR-WEB-GEN-001.
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Everything except Next internals and files with an extension (images, fonts, robots.txt).
  matcher: '/((?!_next|.*\\..*).*)',
};
