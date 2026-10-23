// One link component for content hrefs: site paths get the locale prefix through next-intl, phone
// and mail links stay plain, and https links open in a new tab with a spoken hint. Content hrefs
// are already limited to these forms by `hrefSchema` (C-080). Implements: T-WEB-05.
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Link } from '../i18n/navigation';

export interface SiteLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-current'?: 'page';
  'aria-label'?: string;
}

export function SiteLink({ href, children, ...rest }: SiteLinkProps) {
  const t = useTranslations();
  if (href.startsWith('/')) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  if (href.startsWith('https://')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <span className="sr-only"> {t('shell.opensInNewTab')}</span>
      </a>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
