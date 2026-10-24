'use client';
// Button and IconButton. Implements: T-UI-01, ADR-022 sections 2, 13 and 14, NFR-ACC-001.
// Secondary is the outlined style (C-055). Press feedback is a 0.97 scale at 160 ms, removed
// for reduced motion. 44 px height on the large size for touch tiers (C-053).
import type { ButtonHTMLAttributes, Ref } from 'react';
import { Icon, type IconName } from '../icons/Icon.js';

import {
  buttonClassName,
  iconButtonClassName,
  type ButtonSize,
  type ButtonVariant,
} from './button-styles.js';

export type { ButtonSize, ButtonVariant } from './button-styles.js';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks presses while work is in progress. */
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  type = 'button',
  disabled,
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassName(variant, size, className)}
      {...rest}
    >
      {loading ? <Icon name="spinner" size={18} className="motion-safe:animate-spin" /> : null}
      {children}
    </button>
  );
}

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label'
> {
  icon: IconName;
  /** Required: an icon alone has no accessible name. */
  label: string;
  variant?: Exclude<ButtonVariant, 'primary'>;
  ref?: Ref<HTMLButtonElement>;
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  type = 'button',
  className,
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={iconButtonClassName(variant, className)}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}
