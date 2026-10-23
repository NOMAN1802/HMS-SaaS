'use client';
// Native select styled with tokens. The native control is the most usable choice list on phones
// and for screen readers; apps may not use a raw `select` (ADR-022 section 9), so it lives here.
// Pairs with Field for label, hint and error wiring. Implements: T-WEB-06, P-031.
import type { Ref, SelectHTMLAttributes } from 'react';
import { Icon } from '../icons/Icon.js';
import { cx } from '../utils/cx.js';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: readonly SelectOption[];
  invalid?: boolean;
  ref?: Ref<HTMLSelectElement>;
}

export function Select({ options, invalid = false, className, ref, ...rest }: SelectProps) {
  return (
    <span className={cx('relative block', className)}>
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cx(
          'h-10 w-full appearance-none rounded-control border bg-surface ps-3 pe-9 font-ui text-text disabled:cursor-not-allowed disabled:bg-bg disabled:text-text-muted',
          invalid ? 'border-danger' : 'border-border-strong',
        )}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="caret-down"
        size={16}
        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
    </span>
  );
}
