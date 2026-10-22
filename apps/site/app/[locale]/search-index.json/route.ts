// The site-wide search index as a static JSON file per language (/bn/search-index.json), built at
// build time. The header search fetches it the first time it opens, so pages do not carry the
// index in their HTML. Implements: T-WEB-17, FR-WEB-SRCH-001.
import { isLocale } from '@hms/i18n';
import { buildSearchIndex } from '../../../src/content/search-index';
import { routing } from '../../../src/i18n/routing';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response(null, { status: 404 });
  return Response.json(buildSearchIndex(locale));
}
