'use client';
// Label, hint and error wiring for one control: label above, error and then hint below (F section
// 7.1, no placeholder-as-label). The hint sits under the control so that, in a row of fields,
// the controls and their errors line up whether or not a field has a hint; it is still read out
// with the control through aria-describedby. The control receives its id and described-by through a render
// function, so any input-like primitive can sit inside. Implements: T-UI-01, NFR-ACC-001.
import { type ReactNode, useId } from 'react';
import { cx } from '../utils/cx.js';

export interface FieldControlProps {
  id: string;
  'aria-describedby': string | undefined;
  invalid: boolean;
  required: boolean;
}

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

export function Field({ label, hint, error, required = false, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="font-ui text-sm font-medium text-text">
        {label}
        {required ? (
          <span aria-hidden="true" className="ms-0.5 text-danger">
            *
          </span>
        ) : null}
      </label>
      {children({
        id,
        'aria-describedby': describedBy || undefined,
        invalid: Boolean(error),
        required,
      })}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
