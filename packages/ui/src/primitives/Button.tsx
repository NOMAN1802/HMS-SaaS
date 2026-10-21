'use client';
// Button and IconButton. Implements: T-UI-01, ADR-022 sections 2, 13 and 14, NFR-ACC-001.
// Secondary is the outlined style (C-055). Press feedback is a 0.97 scale at 160 ms, removed
// for reduced motion. 44 px height on the large size for touch tiers (C-053).
import type { ButtonHTMLAttributes, Ref } from 'react';
import { Icon, type IconName } from '../icons/Icon.js';
import { cx } from '../utils/cx.js';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-control font-ui font-medium whitespace-nowrap select-none transition-[transform,background-color,filter] duration-(--motion-press) ease-out motion-safe:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-strong',
  secondary: 'bg-surface text-text border border-border-strong hover:bg-surface-hover',
  danger: 'bg-danger text-on-danger hover:brightness-90',
  ghost: 'bg-transparent text-primary hover:bg-primary-soft',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'h-10 px-4 text-base',
  lg: 'h-11 px-5 text-base',
};

/**
 * Button styling for an element that is not a button, such as a navigation link that should
 * look like a call to action. Navigation stays a link so it works without JavaScript and keeps
 * link semantics for screen readers (EP-31 public site, T-WEB-02, P-031).
 */
export function buttonClassName(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cx(BASE, VARIANTS[variant], SIZES[size], className);
}

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
      className={cx(BASE, VARIANTS[variant], 'size-10 shrink-0 p-0', className)}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}
