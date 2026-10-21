'use client';
// Contact form (FR-WEB-INF-002): name, mobile, optional email, branch and message. In WEB-A it
// validates and shows a demo confirmation; nothing leaves the page (FR-WEB-GEN-006, AT-WEB-033).
// Implements: T-WEB-12.
import { Alert, Button, Field, Select, TextArea, TextInput } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { contactErrors, isFilled, type FieldError } from '../forms/validation';

type Errors = Partial<Record<'name' | 'phone' | 'message', FieldError>>;

export function ContactForm({ branches }: { branches: { value: string; label: string }[] }) {
  const t = useTranslations();
  const [values, setValues] = useState({ name: '', phone: '', email: '', branch: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const messages: Record<FieldError, string> = {
    required: t('form.required'),
    invalidPhone: t('form.invalidPhone'),
  };
  const message = (error: FieldError | undefined) => (error ? messages[error] : undefined);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Errors = { ...contactErrors(values) };
    if (!isFilled(values.message)) found.message = 'required';
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
      <Field label={t('form.email')}>
        {(control) => (
          <TextInput
            {...control}
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setValues({ ...values, email: event.target.value })}
          />
        )}
      </Field>
      <Field label={t('form.branch')}>
        {(control) => (
          <Select
            {...control}
            options={[{ value: '', label: t('form.anyBranch') }, ...branches]}
            value={values.branch}
            onChange={(event) => setValues({ ...values, branch: event.target.value })}
          />
        )}
      </Field>
      <Field
        label={t('form.message')}
        required
        error={message(errors.message)}
        className="sm:col-span-2"
      >
        {(control) => (
          <TextArea
            {...control}
            rows={5}
            value={values.message}
            onChange={(event) => setValues({ ...values, message: event.target.value })}
          />
        )}
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg">
          {t('form.send')}
        </Button>
      </div>
    </form>
  );
}
