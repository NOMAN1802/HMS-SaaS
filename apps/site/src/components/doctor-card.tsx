// Doctor card: portrait slot, name, title, department and branches, with "View profile" and
// "Book" links, and a leave badge when the doctor is on leave today (FR-WEB-DOC-006).
// Presentational: it takes a DoctorSummary so the client-side directory can render it too.
// Implements: T-WEB-06, T-WEB-07, FR-WEB-DOC-001.
import type { Locale } from '@hms/i18n';
import { buttonClassName } from '@hms/ui';
import { useTranslations } from 'next-intl';
import type { DoctorSummary } from '../content/doctor-summary';
import { Link } from '../i18n/navigation';
import { ImageSlot } from './image-slot';

export function DoctorCard({ doctor, locale }: { doctor: DoctorSummary; locale: Locale }) {
  const t = useTranslations();
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-panel border border-border bg-surface">
      <div className="relative">
        <ImageSlot
          image={doctor.image}
          locale={locale}
          ratio="portrait"
          icon="user"
          sizes="(min-width: 1024px) 25vw, 50vw"
        />
        {doctor.onLeave ? (
          <span className="absolute start-3 top-3 rounded-pill bg-status-attention-bg px-3 py-1 font-ui text-xs font-medium text-status-attention-text">
            {t('common.onLeave')}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-lg font-semibold">
          <Link href={`/doctors/${doctor.slug}`} className="hover:text-primary">
            {doctor.name}
          </Link>
        </h3>
        <p className="text-sm text-text">{doctor.title}</p>
        {doctor.department ? (
          <p className="text-sm font-medium text-primary">{doctor.department}</p>
        ) : null}
        <p className="text-sm text-text-muted">{doctor.branches}</p>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Link
            href={`/doctors/${doctor.slug}`}
            className={buttonClassName('secondary', 'md', 'px-2 text-sm')}
          >
            {t('common.viewProfile')}
          </Link>
          <Link
            href={`/book-appointment?doctor=${doctor.slug}`}
            className={buttonClassName('primary', 'md', 'px-2 text-sm')}
          >
            {t('common.bookShort')}
          </Link>
        </div>
      </div>
    </article>
  );
}
