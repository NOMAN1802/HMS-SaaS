// robots.txt: while the site shows demo content nothing is indexed (FR-WEB-SEO-002, P-032); the
// staff app path is always excluded (P-045, FR-WEB-ROUTE-006). Implements: T-WEB-13.
import type { MetadataRoute } from 'next';
import { getSite } from '../src/content';
import { SITE_ORIGIN } from '../src/seo';

export default function robots(): MetadataRoute.Robots {
  const demo = getSite().notice.enabled;
  return {
    rules: demo
      ? { userAgent: '*', disallow: '/' }
      : { userAgent: '*', allow: '/', disallow: ['/staff', '/staff/'] },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
