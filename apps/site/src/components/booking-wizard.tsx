'use client';
// Four-step mock booking: doctor, date and time, patient details, review (FR-WEB-BOOK-001..004).
// A doctor in the URL (?doctor=) is preselected and the wizard starts at step 2 (AT-WEB-030).
// Dates and times come from the doctor's schedule; leave days are not offered. Confirming shows a
// demo message and sends nothing (FR-WEB-GEN-006, AT-WEB-032). Implements: T-WEB-10.
import type { Locale } from '@hms/i18n';
import { Alert, Button, Field, Select, TextArea, TextInput } from '@hms/ui';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type FormEvent } from 'react';
import {
  bookableDates,
  slotsOn,
  weekdayOf,
  type BookableDoctor,
  type Slot,
} from '../booking/slots';
import { contactErrors, type FieldError } from '../forms/validation';
import { digits, todayInDhaka } from '../format';
import { formatClock, formatDayMonth } from '../i18n/clock';
import { useSiteLocale } from '../i18n/locale';
import { weekdayKey } from '../i18n/labels';

export interface BookingDoctor extends BookableDoctor {
  slug: string;
  name: string;
  title: string;
  departmentSlug: string;
  departmentName: string;
}

interface Option {
  value: string;
  label: string;
}

const STEPS = [
  'booking.steps.doctor',
  'booking.steps.date',
  'booking.steps.details',
  'booking.steps.review',
] as const;

type Step = 0 | 1 | 2 | 3;
type Errors = Partial<Record<'doctor' | 'time' | 'name' | 'phone', FieldError>>;
interface Details {
  name: string;
  phone: string;
  note: string;
}

/** What blocks leaving a step; an empty object means the step is complete. */
function stepErrors(
  step: Step,
  state: { doctor?: BookingDoctor; slot?: Slot; details: Details },
): Errors {
  if (step === 0 && !state.doctor) return { doctor: 'required' };
  if (step === 1 && !state.slot) return { time: 'required' };
  if (step === 2) return contactErrors(state.details);
  return {};
}

function useDateLabel() {
  const t = useTranslations();
  const locale = useSiteLocale();
  return (isoDate: string) =>
    `${t(weekdayKey[weekdayOf(isoDate)])}, ${formatDayMonth(t, isoDate, locale)}`;
}

function StepIndicator({ step }: { step: Step }) {
  const t = useTranslations();
  const locale = useSiteLocale();
  return (
    <ol className="mb-8 grid grid-cols-4 gap-2" aria-label={t('booking.progress')}>
      {STEPS.map((key, index) => (
        <li
          key={key}
          aria-current={index === step ? 'step' : undefined}
          className={`flex flex-col gap-1 border-t-4 pt-2 font-ui text-sm ${
            index <= step ? 'border-primary text-text' : 'border-border text-text-muted'
          }`}
        >
          <span className="text-xs">{digits(index + 1, locale)}</span>
          <span className="font-medium">{t(key)}</span>
        </li>
      ))}
    </ol>
  );
}

function DoctorStep(props: {
  departments: Option[];
  doctors: BookingDoctor[];
  department: string;
  doctorSlug: string;
  invalid: boolean;
  onDepartment: (value: string) => void;
  onDoctor: (value: string) => void;
}) {
  const t = useTranslations();
  const choices = props.doctors.filter(
    (item) => !props.department || item.departmentSlug === props.department,
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={t('doctors.department')}>
        {(control) => (
          <Select
            {...control}
            options={[{ value: '', label: t('doctors.allDepartments') }, ...props.departments]}
            value={props.department}
            onChange={(event) => props.onDepartment(event.target.value)}
          />
        )}
      </Field>
      <Field
        label={t('booking.doctor')}
        required
        error={props.invalid ? t('booking.chooseDoctor') : undefined}
      >
        {(control) => (
          <Select
            {...control}
            options={[
              { value: '', label: t('booking.chooseDoctor') },
              ...choices.map((item) => ({
                value: item.slug,
                label: `${item.name} (${item.departmentName})`,
              })),
            ]}
            value={props.doctorSlug}
            onChange={(event) => props.onDoctor(event.target.value)}
          />
        )}
      </Field>
    </div>
  );
}

function DateTimeStep(props: {
  doctor: BookingDoctor;
  dates: string[];
  slots: Slot[];
  date: string;
  time: string;
  invalid: boolean;
  onDate: (value: string) => void;
  onTime: (value: string) => void;
}) {
  const t = useTranslations();
  const locale = useSiteLocale();
  const dateLabel = useDateLabel();
  return (
    <div className="flex flex-col gap-6">
      <p className="text-text-muted">
        {props.doctor.name}, {props.doctor.title}, {props.doctor.departmentName}
      </p>
      <fieldset>
        <legend className="mb-3 font-medium">{t('booking.date')}</legend>
        {props.dates.length === 0 ? (
          <p className="text-text-muted">{t('booking.noDates')}</p>
        ) : (
          <ul className="flex flex-wrap gap-2" data-testid="booking-dates">
            {props.dates.map((item) => (
              <li key={item}>
                <Button
                  variant={item === props.date ? 'primary' : 'secondary'}
                  aria-pressed={item === props.date}
                  onClick={() => props.onDate(item)}
                >
                  {dateLabel(item)}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
      <fieldset>
        <legend className="mb-3 font-medium">{t('booking.time')}</legend>
        {props.date ? (
          <ul className="flex flex-wrap gap-2" data-testid="booking-times">
            {props.slots.map((item) => (
              <li key={item.time}>
                <Button
                  variant={item.time === props.time ? 'primary' : 'secondary'}
                  aria-pressed={item.time === props.time}
                  onClick={() => props.onTime(item.time)}
                >
                  {formatClock(t, item.time, locale)}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">{t('booking.chooseDateFirst')}</p>
        )}
        {props.invalid ? (
          <p className="mt-2 text-sm font-medium text-danger">{t('booking.chooseTime')}</p>
        ) : null}
      </fieldset>
    </div>
  );
}

function DetailsStep(props: {
  details: Details;
  errors: Errors;
  onChange: (details: Details) => void;
}) {
  const t = useTranslations();
  const messages: Record<FieldError, string> = {
    required: t('form.required'),
    invalidPhone: t('form.invalidPhone'),
  };
  const { details, errors, onChange } = props;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field
        label={t('form.name')}
        required
        error={errors.name ? messages[errors.name] : undefined}
      >
        {(control) => (
          <TextInput
            {...control}
            autoComplete="name"
            value={details.name}
            onChange={(event) => onChange({ ...details, name: event.target.value })}
          />
        )}
      </Field>
      <Field
        label={t('form.phone')}
        hint={t('form.phoneHint')}
        required
        error={errors.phone ? messages[errors.phone] : undefined}
      >
        {(control) => (
          <TextInput
            {...control}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={details.phone}
            onChange={(event) => onChange({ ...details, phone: event.target.value })}
          />
        )}
      </Field>
      <Field label={t('booking.note')} className="md:col-span-2">
        {(control) => (
          <TextArea
            {...control}
            rows={3}
            value={details.note}
            onChange={(event) => onChange({ ...details, note: event.target.value })}
          />
        )}
      </Field>
    </div>
  );
}

function ReviewStep(props: {
  doctor: BookingDoctor;
  date: string;
  slot: Slot;
  details: Details;
  locale: Locale;
}) {
  const t = useTranslations();
  const dateLabel = useDateLabel();
  return (
    <dl
      className="grid gap-x-6 gap-y-3 rounded-panel border border-border bg-surface p-5 sm:grid-cols-[auto_1fr]"
      data-testid="booking-review"
    >
      <dt className="text-text-muted">{t('booking.doctor')}</dt>
      <dd className="font-medium">
        {props.doctor.name}, {props.doctor.departmentName}
      </dd>
      <dt className="text-text-muted">{t('booking.date')}</dt>
      <dd className="font-medium">
        {dateLabel(props.date)}, {formatClock(t, props.slot.time, props.locale)}
      </dd>
      <dt className="text-text-muted">{t('booking.place')}</dt>
      <dd className="font-medium">{props.slot.place}</dd>
      <dt className="text-text-muted">{t('form.name')}</dt>
      <dd className="font-medium">{props.details.name}</dd>
      <dt className="text-text-muted">{t('form.phone')}</dt>
      <dd className="font-medium">{props.details.phone}</dd>
    </dl>
  );
}

const EMPTY_DETAILS: Details = { name: '', phone: '', note: '' };

export function BookingWizard({
  doctors,
  departments,
}: {
  doctors: BookingDoctor[];
  departments: Option[];
}) {
  const t = useTranslations();
  const locale = useSiteLocale();
  const params = useSearchParams();
  const preselected = doctors.find((doctor) => doctor.slug === params.get('doctor'));

  const [step, setStep] = useState<Step>(preselected ? 1 : 0);
  const [department, setDepartment] = useState(preselected?.departmentSlug ?? '');
  const [doctorSlug, setDoctorSlug] = useState(preselected?.slug ?? '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmed, setConfirmed] = useState(false);

  const doctor = doctors.find((item) => item.slug === doctorSlug);
  const dates = useMemo(() => (doctor ? bookableDates(doctor, todayInDhaka()) : []), [doctor]);
  const slots = useMemo(() => (doctor && date ? slotsOn(doctor, date) : []), [doctor, date]);
  const slot = slots.find((item) => item.time === time);

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = stepErrors(step, { doctor, slot, details });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (step === 3) setConfirmed(true);
    else setStep((step + 1) as Step);
  }

  function restart() {
    setConfirmed(false);
    setStep(0);
    setDate('');
    setTime('');
    setDetails(EMPTY_DETAILS);
  }

  if (confirmed) {
    return (
      <div className="flex flex-col gap-6" data-testid="booking-confirmation">
        <Alert tone="success" title={t('booking.confirmedTitle')}>
          {t('booking.confirmedBody')}
        </Alert>
        <Button variant="secondary" className="w-fit" onClick={restart}>
          {t('booking.again')}
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={next} className="flex flex-col gap-6">
      <StepIndicator step={step} />
      <h2 className="text-2xl font-semibold">{t(STEPS[step])}</h2>
      {step === 0 ? (
        <DoctorStep
          departments={departments}
          doctors={doctors}
          department={department}
          doctorSlug={doctorSlug}
          invalid={Boolean(errors.doctor)}
          onDepartment={(value) => {
            setDepartment(value);
            setDoctorSlug('');
          }}
          onDoctor={(value) => {
            setDoctorSlug(value);
            setDate('');
            setTime('');
          }}
        />
      ) : null}
      {step === 1 && doctor ? (
        <DateTimeStep
          doctor={doctor}
          dates={dates}
          slots={slots}
          date={date}
          time={time}
          invalid={Boolean(errors.time)}
          onDate={(value) => {
            setDate(value);
            setTime('');
          }}
          onTime={setTime}
        />
      ) : null}
      {step === 2 ? <DetailsStep details={details} errors={errors} onChange={setDetails} /> : null}
      {step === 3 && doctor && slot ? (
        <ReviewStep doctor={doctor} date={date} slot={slot} details={details} locale={locale} />
      ) : null}
      <div className="flex flex-wrap gap-3">
        {step > 0 ? (
          <Button variant="secondary" size="lg" onClick={() => setStep((step - 1) as Step)}>
            {t('booking.back')}
          </Button>
        ) : null}
        <Button type="submit" size="lg">
          {step === 3 ? t('booking.confirm') : t('booking.next')}
        </Button>
      </div>
    </form>
  );
}
