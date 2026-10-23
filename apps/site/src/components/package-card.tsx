// Health package card: name, code, audience, package price against the separate total and the
// saving, every price labelled as a sample (FR-WEB-PKG-003, FR-WEB-PKG-004, Q-078).
// Implements: T-WEB-06, T-WEB-09.
import type { HealthPackage } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { useTranslations } from 'next-intl';
import { localize, packageSaving } from '../content';
import { money } from '../format';
import { Link } from '../i18n/navigation';
import { ImageSlot } from './image-slot';

export function PackageCard({ item, locale }: { item: HealthPackage; locale: Locale }) {
  const t = useTranslations();
  return (
    <article className="lift flex h-full flex-col overflow-hidden rounded-panel border border-border bg-surface">
      <ImageSlot
        image={item.image}
        locale={locale}
        ratio="wide"
        icon="package"
        className="zoom-media"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-semibold">
          <Link href={`/packages/${item.slug}`} className="hover:text-primary">
            {localize(item.name, locale)}
          </Link>
        </h3>
        <p className="text-sm text-text-muted">{localize(item.audience, locale)}</p>
        <div className="mt-auto pt-3">
          <p className="flex flex-wrap items-baseline gap-x-3">
            <span
              className="font-heading text-2xl font-semibold text-heading"
              data-testid="package-price"
            >
              {money(item.price, locale)}
            </span>
            <span className="text-sm text-text-muted line-through">
              <span className="sr-only">{t('common.separatePrice')} </span>
              {money(item.separatePrice, locale)}
            </span>
          </p>
          <p className="text-sm font-medium text-primary">
            {t('common.youSave', { amount: money(packageSaving(item), locale) })}
          </p>
          <p className="mt-1 font-ui text-xs text-text-muted">{t('common.samplePrice')}</p>
        </div>
      </div>
    </article>
  );
}
