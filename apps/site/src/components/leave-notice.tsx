'use client';
// Leave notice on a doctor's profile: shown while the doctor is on leave and before a leave that
// is coming up, with the hospital's own message or the dates (X19, FR-WEB-DOC-006). Whether a
// leave has ended depends on today, so the notice is chosen in the browser; the built HTML would
// otherwise keep showing a leave that ended after the build. Implements: T-WEB-06, T-WEB-15.
import type { Locale } from '@hms/i18n';
import { Alert } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { currentOrNextLeave, type LeavePeriod } from '../content/availability';
import { formatLongDate } from '../i18n/clock';
import { useToday } from '../i18n/use-today';

export interface LeaveEntry extends LeavePeriod {
  /** The hospital's message, already in the page language. */
  message?: string;
}

export function LeaveNotice({ leave, locale }: { leave: LeaveEntry[]; locale: Locale }) {
  const t = useTranslations();
  const today = useToday();
  const current = today ? currentOrNextLeave({ leave }, today) : undefined;
  if (!current) return null;
  return (
    <div data-testid="leave-notice">
      <Alert tone="warning" title={t('doctor.leaveTitle')}>
        {current.message ??
          t('doctor.leaveDates', {
            from: formatLongDate(t, current.from, locale),
            to: formatLongDate(t, current.to, locale),
          })}
      </Alert>
    </div>
  );
}
