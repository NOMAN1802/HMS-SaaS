// Contact: hotlines inside and outside Dhaka, email, each branch's phone and address, and the
// contact form (FR-WEB-INF-002, FR-WEB-GEN-010, AT-WEB-055). Implements: T-WEB-12.
import { isLocale } from '@hms/i18n';
import { Icon } from '@hms/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '../../../src/components/contact-form';
import { Container } from '../../../src/components/container';
import { PageHeader } from '../../../src/components/page-header';
import { getSite, listBranches, localize } from '../../../src/content';
import { Link } from '../../../src/i18n/navigation';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('contact.title'), description: t('contact.intro') };
}

export default async function ContactPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const { contacts } = getSite().settings;
  const branches = listBranches();
  const phones = [
    { label: t('shell.emergency'), phone: contacts.emergency },
    { label: t('contact.ambulance'), phone: contacts.ambulance },
    { label: t('shell.hotline'), phone: contacts.hotline },
    { label: t('shell.outsideDhaka'), phone: contacts.hotlineOutsideDhaka },
  ];

  return (
    <>
      <PageHeader title={t('contact.title')} intro={t('contact.intro')} />
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-6">
          <section
            aria-labelledby="phones-heading"
            className="rounded-panel border border-border bg-surface p-5"
          >
            <h2 id="phones-heading" className="mb-3 text-xl font-semibold">
              {t('contact.phones')}
            </h2>
            <ul className="flex flex-col gap-3" data-testid="contact-phones">
              {phones.map(({ label, phone }) => (
                <li key={label} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-text-muted">{label}</span>
                  <a
                    href={`tel:${phone.tel}`}
                    className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    <Icon name="phone" size={18} />
                    {phone.display}
                  </a>
                </li>
              ))}
              <li className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-text-muted">{t('shell.email')}</span>
                <a
                  href={`mailto:${contacts.email}`}
                  className="font-medium text-primary hover:underline"
                >
                  {contacts.email}
                </a>
              </li>
            </ul>
          </section>
          <section aria-labelledby="branches-heading">
            <h2 id="branches-heading" className="mb-3 text-xl font-semibold">
              {t('branches.title')}
            </h2>
            <ul className="flex flex-col gap-3">
              {branches.map((branch) => (
                <li key={branch.slug} className="rounded-panel border border-border bg-surface p-4">
                  <Link
                    href={`/branches/${branch.slug}`}
                    className="font-medium hover:text-primary"
                  >
                    {localize(branch.name, locale)}
                  </Link>
                  <p className="text-sm text-text-muted">{localize(branch.address, locale)}</p>
                  <a
                    href={`tel:${branch.phone.tel}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {branch.phone.display}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <section
          aria-labelledby="form-heading"
          className="rounded-panel border border-border bg-surface p-6 sm:p-8"
        >
          <h2 id="form-heading" className="mb-6 text-2xl font-semibold">
            {t('contact.formHeading')}
          </h2>
          <ContactForm
            branches={branches.map((b) => ({ value: b.slug, label: localize(b.area, locale) }))}
          />
        </section>
      </Container>
    </>
  );
}
