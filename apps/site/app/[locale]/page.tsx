// Home page placeholder for the scaffold. The real home page (hero, quick actions, sections from
// content data) replaces this in T-WEB-06. Implements: T-WEB-01.
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col justify-center gap-4 px-4">
      <h1 className="text-4xl font-semibold">{t('placeholder.heading')}</h1>
      <p className="text-lg text-text-muted">{t('placeholder.body')}</p>
    </div>
  );
}
