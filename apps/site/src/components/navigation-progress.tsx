'use client';
// Thin teal bar across the top of the window while the next page loads after a link click, so a
// slow connection never looks like a dead click. Pages stay static HTML (no route loading screens,
// which would hide every page's content behind a script swap). Shown only when a change takes
// longer than SHOW_AFTER_MS, so instant, prefetched changes never flash it. Implements: T-WEB-15.
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from '../i18n/navigation';

const SHOW_AFTER_MS = 150;
const FADE_MS = 400;

type ProgressState = 'idle' | 'pending' | 'done';

/** True for a plain click on a link to another page of this site. */
function startsPageChange(event: MouseEvent): boolean {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  const link = (event.target as Element | null)?.closest?.('a[href]');
  if (!(link instanceof HTMLAnchorElement)) return false;
  if ((link.target && link.target !== '_self') || link.hasAttribute('download')) return false;
  const url = new URL(link.href);
  if (url.origin !== window.location.origin) return false;
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

export function NavigationProgress() {
  const t = useTranslations();
  const pathname = usePathname();
  const [state, setState] = useState<ProgressState>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Capture phase: runs before the link's own handler takes over the navigation.
    const onClick = (event: MouseEvent) => {
      if (!startsPageChange(event)) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setState('pending'), SHOW_AFTER_MS);
    };
    window.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('click', onClick, true);
      window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    // The new page is on screen: finish the bar, then fade it out.
    window.clearTimeout(timer.current);
    setState((current) => (current === 'pending' ? 'done' : 'idle'));
    timer.current = window.setTimeout(() => setState('idle'), FADE_MS);
  }, [pathname]);

  if (state === 'idle') return null;
  return (
    <div
      role="progressbar"
      aria-label={t('common.loading')}
      aria-busy={state === 'pending'}
      data-testid="nav-progress"
      data-state={state}
      className="nav-progress fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-primary"
    />
  );
}
