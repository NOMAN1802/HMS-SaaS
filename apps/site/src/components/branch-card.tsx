// Branch card: image slot, name, address, opening hours, phone and a 24-hour emergency badge.
// Implements: T-WEB-06, T-WEB-12, FR-WEB-INF-001.
import type { Branch } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { Icon } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { localize } from '../content/localize';
import { Link } from '../i18n/navigation';
import { ImageSlot } from './image-slot';

export function BranchCard({ branch, locale }: { branch: Branch; locale: Locale }) {
  const t = useTranslations();
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-panel border border-border bg-surface">
      <ImageSlot image={branch.image} locale={locale} ratio="wide" icon="hospital-building" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-semibold">
          <Link href={`/branches/${branch.slug}`} className="hover:text-primary">
            {localize(branch.name, locale)}
          </Link>
        </h3>
        {branch.emergency ? (
          <p className="inline-flex w-fit items-center gap-1 rounded-pill bg-status-problem-bg px-3 py-1 font-ui text-xs font-medium text-status-problem-text">
            <Icon name="siren" size={14} />
            {t('common.emergency24')}
          </p>
        ) : null}
        <p className="flex gap-2 text-sm text-text-muted">
          <Icon name="map-pin" size={18} className="mt-0.5 shrink-0" />
          {localize(branch.address, locale)}
        </p>
        <p className="flex gap-2 text-sm text-text-muted">
          <Icon name="clock" size={18} className="mt-0.5 shrink-0" />
          {localize(branch.hours, locale)}
        </p>
        <a
          href={`tel:${branch.phone.tel}`}
          className="mt-auto inline-flex items-center gap-2 pt-2 font-ui font-medium text-primary hover:underline"
        >
          <Icon name="phone" size={18} />
          {branch.phone.display}
        </a>
      </div>
    </article>
  );
}
