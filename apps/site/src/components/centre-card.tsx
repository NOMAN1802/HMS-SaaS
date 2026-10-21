// Centre of excellence card: image slot, name and summary, linking to the centre page.
// Implements: T-WEB-06, T-WEB-08, FR-WEB-DEP-003.
import type { Centre } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { localize } from '../content/localize';
import { Link } from '../i18n/navigation';
import { ImageSlot } from './image-slot';

export function CentreCard({ centre, locale }: { centre: Centre; locale: Locale }) {
  return (
    <Link
      href={`/centres/${centre.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-panel border border-border bg-surface transition-shadow hover:shadow-overlay"
    >
      <ImageSlot image={centre.image} locale={locale} icon="heartbeat" />
      <span className="flex flex-col gap-2 p-5">
        <span className="font-heading text-lg font-semibold text-heading group-hover:text-primary">
          {localize(centre.name, locale)}
        </span>
        <span className="text-sm text-text-muted">{localize(centre.summary, locale)}</span>
      </span>
    </Link>
  );
}
