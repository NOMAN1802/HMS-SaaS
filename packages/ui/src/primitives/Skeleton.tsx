// Skeleton: a placeholder block in the shape of content that is still loading, so the layout does
// not jump when it arrives. Decorative only: the loading region around it carries the spoken
// status (role="status"). The shimmer stops for reduced motion. Implements: T-WEB-15, ADR-022
// section 13.
import type { CSSProperties } from 'react';

export interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
  /** A round placeholder, for avatars and icon chips. */
  circle?: boolean;
}

export function Skeleton({ className, style, circle = false }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      data-skeleton=""
      style={style}
      className={`skeleton block ${circle ? 'rounded-pill' : 'rounded-control'} ${className ?? ''}`}
    />
  );
}
