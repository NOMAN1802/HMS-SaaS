'use client';
// Multi-line text input with the same border and focus rules as TextInput. Apps may not use a raw
// `textarea` (ADR-022 section 9). Pairs with Field. Implements: T-WEB-06, P-031.
import type { Ref, TextareaHTMLAttributes } from 'react';
import { cx } from '../utils/cx.js';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({ invalid = false, className, rows = 4, ref, ...rest }: TextAreaProps) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cx(
        'w-full rounded-control border bg-surface px-3 py-2 font-ui text-text placeholder:text-text-muted disabled:cursor-not-allowed disabled:bg-bg',
        invalid ? 'border-danger' : 'border-border-strong',
        className,
      )}
      {...rest}
    />
  );
}
