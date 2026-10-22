'use client';
// Wraps a loading placeholder: tells screen readers the page is loading, in the page language,
// while the skeleton inside stays silent. Client-side so it needs no locale on
// the server. Implements: T-WEB-15.
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export function LoadingRegion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const t = useTranslations();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="loading"
      className={className}
    >
      <span className="sr-only">{t('common.loading')}</span>
      {children}
    </div>
  );
}
