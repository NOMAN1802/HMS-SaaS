// Button classes as a plain function, outside the client-only Button module, so a server
// component can style a link as a button (a navigation link stays a link). Button and IconButton
// use the same constants. Implements: T-UI-01, T-WEB-02, P-031.
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

/** Square icon-only button classes; the label is supplied separately as aria-label. */
export function iconButtonClassName(
  variant: Exclude<ButtonVariant, 'primary'> = 'ghost',
  className?: string,
): string {
  return cx(BASE, VARIANTS[variant], 'size-10 shrink-0 p-0', className);
}
