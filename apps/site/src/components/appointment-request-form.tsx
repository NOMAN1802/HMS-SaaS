'use client';
// "Request a call back" form (appointmentRequest section, X23): name, mobile, department and
// preferred date. In WEB-A it validates and shows a demo confirmation that says nothing was sent;
// no request leaves the page (FR-WEB-GEN-006, FR-WEB-GEN-009, AT-WEB-054). Implements: T-WEB-06.
import { Alert, Button, Field, Select, TextInput } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { contactErrors, type FieldError } from '../forms/validation';

export interface AppointmentRequestFormProps {
  departments: { value: string; label: string }[];
  department?: string;
}

export function AppointmentRequestForm({ departments, department }: AppointmentRequestFormProps) {
  const t = useTranslations();
  const [values, setValues] = useState({
    name: '',
    phone: '',
    department: department ?? '',
    date: '',
  });
  const [errors, setErrors] = useState<Partial<Record<'name' | 'phone', FieldError>>>({});
  const [sent, setSent] = useState(false);

  const messages: Record<FieldError, string> = {
    required: t('form.required'),
    invalidPhone: t('form.invalidPhone'),
  };
  const message = (error: FieldError | undefined) => (error ? messages[error] : undefined);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = contactErrors(values);
    setErrors(found);
    setSent(Object.keys(found).length === 0);
  }

  if (sent) {
    return (
      <Alert tone="success" title={t('form.demoTitle')}>
        <span data-testid="demo-confirmation">{t('form.demoBody')}</span>
      </Alert>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label={t('form.name')} required error={message(errors.name)}>
        {(control) => (
          <TextInput
            {...control}
            autoComplete="name"
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
          />
        )}
      </Field>
      <Field
        label={t('form.phone')}
        hint={t('form.phoneHint')}
        required
        error={message(errors.phone)}
      >
        {(control) => (
          <TextInput
            {...control}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => setValues({ ...values, phone: event.target.value })}
          />
        )}
      </Field>
      <Field label={t('form.department')}>
        {(control) => (
          <Select
            {...control}
            options={[{ value: '', label: t('form.anyDepartment') }, ...departments]}
            value={values.department}
            onChange={(event) => setValues({ ...values, department: event.target.value })}
          />
        )}
      </Field>
      <Field label={t('form.preferredDate')}>
        {(control) => (
          <TextInput
            {...control}
            type="date"
            value={values.date}
            onChange={(event) => setValues({ ...values, date: event.target.value })}
          />
        )}
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg">
          {t('form.requestCallBack')}
        </Button>
      </div>
    </form>
  );
}
