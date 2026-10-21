'use client';
// Site-wide notice band from site settings; in WEB-A it says the content is demo content (P-032,
// FR-WEB-GEN-004). Hiding it lasts for this page view only: the site stores nothing in the
// browser (NFR-WEB-SEC-001). Implements: T-WEB-05.
import { Icon, IconButton } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function DemoNotice({ text }: { text: string }) {
  const t = useTranslations();
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div
      role="region"
      aria-label={t('shell.notice')}
      className="border-b border-border bg-accent-soft"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1 sm:px-6 lg:px-8">
        <Icon name="info" size={18} className="shrink-0 text-accent" />
        <p className="flex-1 text-sm text-text" data-testid="demo-notice">
          {text}
        </p>
        <IconButton icon="close" label={t('shell.hideNotice')} onClick={() => setVisible(false)} />
      </div>
    </div>
  );
}
