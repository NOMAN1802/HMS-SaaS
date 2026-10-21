// Doctor card built around how patients choose: who, which department, the next chamber (day,
// time, branch) and the fee, with one booking action. A doctor on leave says when they are back;
// the booking wizard offers no leave days (FR-WEB-DOC-006). Compact and horizontal so a phone
// shows several doctors per screen (critique 2026-10-21 P1). Presentational: it takes a
// DoctorSummary so the client-side directory can render it too.
// Implements: T-WEB-06, T-WEB-07, T-WEB-15, FR-WEB-DOC-001.
import type { Locale } from '@hms/i18n';
import { buttonClassName, Icon } from '@hms/ui';
import { useTranslations } from 'next-intl';
import type { DoctorSummary } from '../content/doctor-summary';
import { formatClock, formatDayMonth } from '../i18n/clock';
import { weekdayKey } from '../i18n/labels';
import { Link } from '../i18n/navigation';
import { ImageSlot } from './image-slot';

const RELATIVE_KEY = { today: 'common.today', tomorrow: 'common.tomorrow' } as const;

function useChamberLabel() {
  const t = useTranslations();
  return (doctor: DoctorSummary, locale: Locale) => {
    const chamber = doctor.nextChamber;
    if (!chamber) return null;
    const day = chamber.relative ? t(RELATIVE_KEY[chamber.relative]) : t(weekdayKey[chamber.day]);
    return `${day}, ${formatClock(t, chamber.start, locale)}, ${chamber.branch}`;
  };
}

export function DoctorCard({ doctor, locale }: { doctor: DoctorSummary; locale: Locale }) {
  const t = useTranslations();
  const chamberLabel = useChamberLabel()(doctor, locale);
  return (
    <article className="flex h-full flex-col gap-4 rounded-panel border border-border bg-surface p-4">
      <div className="flex gap-4">
        <ImageSlot
          image={doctor.image}
          locale={locale}
          ratio="square"
          icon="user"
          iconSize={32}
          sizes="80px"
          className="w-20 shrink-0 rounded-control"
        />
        <div className="flex min-w-0 flex-col">
          <h3 className="text-lg leading-snug font-semibold">
            <Link href={`/doctors/${doctor.slug}`} className="hover:text-primary">
              {doctor.name}
            </Link>
          </h3>
          <p className="text-sm text-text">{doctor.title}</p>
          {doctor.department ? (
            <p className="text-sm font-medium text-primary">{doctor.department}</p>
          ) : null}
        </div>
      </div>
      <dl className="flex flex-col gap-1.5 text-sm">
        {chamberLabel ? (
          <div className="flex items-start gap-2">
            <Icon name="calendar" size={18} className="mt-0.5 shrink-0 text-primary" />
            <dt className="sr-only">{t('common.nextChamber')}</dt>
            <dd>{chamberLabel}</dd>
          </div>
        ) : null}
        {doctor.fee ? (
          <div className="flex items-start gap-2">
            <Icon name="file-text" size={18} className="mt-0.5 shrink-0 text-text-muted" />
            <dt className="sr-only">{t('doctor.fee')}</dt>
            <dd className="text-text-muted">{t('common.fee', { amount: doctor.fee })}</dd>
          </div>
        ) : null}
      </dl>
      {doctor.backOn ? (
        <p className="w-fit rounded-pill bg-status-attention-bg px-3 py-1 font-ui text-xs font-medium text-status-attention-text">
          {t('common.backOn', { date: formatDayMonth(t, doctor.backOn, locale) })}
        </p>
      ) : null}
      <Link
        href={`/book-appointment?doctor=${doctor.slug}`}
        className={buttonClassName('primary', 'md', 'mt-auto w-full')}
      >
        {t('common.bookShort')}
      </Link>
    </article>
  );
}
