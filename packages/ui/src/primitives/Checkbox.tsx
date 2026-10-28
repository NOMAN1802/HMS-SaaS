'use client';
// Checkbox with its label as one click target (T-ACC-05 role and permission pickers). Native
// input, so keyboard (Space) and screen readers work without extra code; the box uses the
// primary colour token when checked. F section 7.1: the label is always visible text.
import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../utils/cx.js';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function Checkbox({ label, className, ref, ...rest }: CheckboxProps) {
  return (
    <label className={cx('flex min-h-8 cursor-pointer items-center gap-2', className)}>
      <input
        ref={ref}
        type="checkbox"
        className="size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}
