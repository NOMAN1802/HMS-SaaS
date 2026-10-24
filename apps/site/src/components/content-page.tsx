// A page built entirely from stored sections (about, patient guide, emergency, portal): title band
// from the page title, then the sections through the registry, so the CMS owns the whole page
// (C-072, P-040). Implements: T-WEB-12.
import type { Locale } from '@hms/i18n';
import type { Metadata } from 'next';
import { getPage, localize, type PageName } from '../content';
import { SectionList } from '../sections/registry';
import { PageHeader } from './page-header';

export function contentPageMetadata(name: PageName, locale: Locale): Metadata {
  const { seo } = getPage(name);
  return { title: localize(seo.title, locale), description: localize(seo.description, locale) };
}

export function ContentPage({ name, locale }: { name: PageName; locale: Locale }) {
  const page = getPage(name);
  return (
    <>
      <PageHeader title={localize(page.title, locale)} />
      <SectionList sections={page.sections} locale={locale} />
    </>
  );
}
