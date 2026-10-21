'use client';
// Phone-only bar fixed to the bottom of the screen with "Hotline" and "Book", the two things most
// visitors come for (F section 3, phone layout). Hidden from the medium breakpoint up, and on the
// booking page, where it would compete with the wizard's own buttons (critique 2026-10-21).
// Implements: T-WEB-05, T-WEB-15, FR-WEB-GEN-005.
import type { Site } from '@hms/contracts';
import { buttonClassName, Icon } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '../i18n/navigation';

export function PhoneActionBar({ site }: { site: Site }) {
  const t = useTranslations();
  const pathname = usePathname();
  if (pathname === site.navigation.headerCta.href) return null;
  return (
    <div
      data-testid="phone-action-bar"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-border bg-surface p-2 md:hidden"
    >
      <a
        href={`tel:${site.settings.contacts.hotline.tel}`}
        className={buttonClassName('secondary', 'lg')}
      >
        <Icon name="phone" size={18} />
        {t('shell.callHotline')}
      </a>
      <Link href={site.navigation.headerCta.href} className={buttonClassName('primary', 'lg')}>
        <Icon name="calendar" size={18} />
        {t('shell.book')}
      </Link>
    </div>
  );
}
