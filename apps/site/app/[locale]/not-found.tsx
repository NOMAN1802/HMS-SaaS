// Not found, in the page language, with links to the main sections (FR-WEB-INF-005, AT-WEB-042).
// Implements: T-WEB-12.
import { buttonClassName } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { Container } from '../../src/components/container';
import { Link } from '../../src/i18n/navigation';

export default function NotFound() {
  const t = useTranslations();
  const links = [
    { href: '/doctors', label: t('doctors.title') },
    { href: '/departments', label: t('departments.title') },
    { href: '/packages', label: t('packages.title') },
    { href: '/contact', label: t('contact.title') },
  ];
  return (
    <Container className="flex min-h-[50vh] flex-col items-start justify-center gap-6 py-16">
      <p className="font-ui text-sm font-medium text-primary">404</p>
      <h1 className="text-4xl font-semibold">{t('notFound.title')}</h1>
      <p className="max-w-xl text-lg text-text-muted">{t('notFound.body')}</p>
      <Link href="/" className={buttonClassName('primary', 'lg')}>
        {t('notFound.home')}
      </Link>
      <nav aria-label={t('notFound.helpful')}>
        <ul className="flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-primary underline-offset-4 hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  );
}
