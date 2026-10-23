'use client';
// Share button for doctor profiles and articles (C-085). On a phone it opens the system share
// sheet; elsewhere it copies the page link and confirms with a Sonner toast, so the visitor knows
// the click worked without a dialog in the way. `SiteToaster` is the one toast region of the
// site, placed above the phone action bar. Implements: T-WEB-15, C-085.
import { Button, Icon } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { toast, Toaster } from 'sonner';

export function ShareButton({ title, className }: { title: string; className?: string }) {
  const t = useTranslations();

  async function share() {
    const url = window.location.href;
    const phone = window.matchMedia('(pointer: coarse)').matches;
    if (phone && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // The visitor closed the share sheet: nothing to report.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('share.copied'));
    } catch {
      toast.error(t('share.failed'));
    }
  }

  return (
    <Button
      variant="secondary"
      size="lg"
      className={className}
      onClick={() => void share()}
      data-testid="share-button"
    >
      <Icon name="share" size={20} />
      {t('share.button')}
    </Button>
  );
}

export function SiteToaster() {
  return (
    <Toaster
      position="bottom-center"
      offset={24}
      // Clears the phone action bar (phone-action-bar.tsx) at the bottom of small screens.
      mobileOffset={{ bottom: 88 }}
      toastOptions={{
        className: 'font-ui',
        style: {
          borderRadius: 'var(--radius-panel)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          background: 'var(--color-surface)',
        },
      }}
    />
  );
}
