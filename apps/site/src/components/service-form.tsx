'use client';
// One mock form for the patient service pages (report lookup, home sample collection, feedback).
// The page passes translated labels and a field list; the form validates required fields and
// mobile numbers (Bangla digits accepted) and ends in a demo message. Nothing is sent
// (FR-WEB-GEN-006, AT-WEB-033). Implements: T-WEB-11.
import { Button, Field, Select, TextArea, TextInput, type FieldControlProps } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { isFilled, isMobileNumber, type FieldError } from '../forms/validation';
import { useDemoSubmit } from '../forms/use-demo-submit';
import { FormSuccess } from './success-tick';
import { dayOptions } from '../i18n/clock';
import { useSiteLocale } from '../i18n/locale';
import { useToday } from '../i18n/use-today';

export interface ServiceField {
  name: string;
  label: string;
  kind: 'text' | 'tel' | 'date' | 'textarea' | 'select';
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  /** Full width on wide screens. */
  wide?: boolean;
}

export interface ServiceFormProps {
  fields: ServiceField[];
  submitLabel: string;
  demoTitle: string;
  demoBody: string;
}

function fieldError(field: ServiceField, value: string): FieldError | undefined {
  if (!isFilled(value)) return field.required ? 'required' : undefined;
  if (field.kind === 'tel' && !isMobileNumber(value)) return 'invalidPhone';
  return undefined;
}

function Control({
  field,
  value,
  onChange,
  control,
}: {
  field: ServiceField;
  value: string;
  onChange: (value: string) => void;
  control: FieldControlProps;
}) {
  const t = useTranslations();
  const locale = useSiteLocale();
  const chooseLabel = t('form.chooseDate');
  // Day choices appear once the browser knows today (see use-today.ts).
  const today = useToday();
  if (field.kind === 'textarea') {
    return (
      <TextArea
        {...control}
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  if (field.kind === 'date') {
    return (
      <Select
        {...control}
        options={[
          { value: '', label: chooseLabel },
          ...(today ? dayOptions(t, locale, today) : []),
        ]}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  if (field.kind === 'select') {
    return (
      <Select
        {...control}
        options={field.options ?? []}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  return (
    <TextInput
      {...control}
      type={field.kind}
      inputMode={field.kind === 'tel' ? 'tel' : undefined}
      autoComplete={field.kind === 'tel' ? 'tel' : undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function ServiceForm({ fields, submitLabel, demoTitle, demoBody }: ServiceFormProps) {
  const t = useTranslations();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, field.options?.[0]?.value ?? ''])),
  );
  const [errors, setErrors] = useState<Record<string, FieldError>>({});
  const [sent, setSent] = useState(false);
  const submitting = useDemoSubmit();
  const messages: Record<FieldError, string> = {
    required: t('form.required'),
    invalidPhone: t('form.invalidPhone'),
  };

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Record<string, FieldError> = {};
    for (const field of fields) {
      const error = fieldError(field, values[field.name] ?? '');
      if (error) found[field.name] = error;
    }
    setErrors(found);
    if (Object.keys(found).length === 0) submitting.run(() => setSent(true));
  }

  if (sent) {
    return (
      <FormSuccess title={demoTitle}>
        <span data-testid="demo-confirmation">{demoBody}</span>
      </FormSuccess>
    );
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-busy={submitting.pending || undefined}
      className="grid gap-4 sm:grid-cols-2"
    >
      {fields.map((field) => {
        const error = errors[field.name];
        return (
          <Field
            key={field.name}
            label={field.label}
            hint={field.hint}
            required={field.required ?? false}
            error={error ? messages[error] : undefined}
            className={field.wide || field.kind === 'textarea' ? 'sm:col-span-2' : undefined}
          >
            {(control) => (
              <Control
                field={field}
                control={control}
                value={values[field.name] ?? ''}
                onChange={(value) => setValues({ ...values, [field.name]: value })}
              />
            )}
          </Field>
        );
      })}
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" loading={submitting.pending}>
          {submitting.pending ? t('form.sending') : submitLabel}
        </Button>
      </div>
    </form>
  );
}
