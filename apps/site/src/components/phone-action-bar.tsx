// Phone-only bar fixed to the bottom of the screen with "Call" and "Book", the two things most
// visitors come for (F section 3, phone layout). Hidden from the medium breakpoint up.
// Implements: T-WEB-05, FR-WEB-GEN-005.
import type { Site } from '@hms/contracts';
import { buttonClassName, Icon } from '@hms/ui';
import { getTranslations } from 'next-intl/server';
import { Link } from '../i18n/navigation';

export async function PhoneActionBar({ site }: { site: Site }) {
  const t = await getTranslations();
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
        {t('shell.call')}
      </a>
      <Link href={site.navigation.headerCta.href} className={buttonClassName('primary', 'lg')}>
        <Icon name="calendar" size={18} />
        {t('shell.book')}
      </Link>
    </div>
  );
}
