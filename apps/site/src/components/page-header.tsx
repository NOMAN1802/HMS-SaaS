// Page title band for inner pages: breadcrumb trail, the page's h1 and an optional intro line.
// Implements: T-WEB-07, FR-WEB-NAV-*.
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import { Container } from './container';

export interface Crumb {
  label: string;
  href: string;
}

export interface PageHeaderProps {
  title: string;
  intro?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
}

export function PageHeader({ title, intro, crumbs = [], children }: PageHeaderProps) {
  const t = useTranslations();
  return (
    <div className="border-b border-border bg-linear-to-b from-primary-soft to-bg">
      <Container className="py-10 sm:py-14">
        <nav aria-label={t('common.breadcrumb')}>
          <ol className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            {[{ label: t('common.home'), href: '/' }, ...crumbs].map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-2">
                <Link href={crumb.href} className="hover:text-primary hover:underline">
                  {crumb.label}
                </Link>
                <span aria-hidden="true">/</span>
              </li>
            ))}
            <li aria-current="page" className="text-text">
              {title}
            </li>
          </ol>
        </nav>
        <h1 className="mt-4 text-3xl font-semibold text-balance sm:text-4xl">{title}</h1>
        {intro ? <p className="mt-3 max-w-2xl text-lg text-text-muted">{intro}</p> : null}
        {children}
      </Container>
    </div>
  );
}
