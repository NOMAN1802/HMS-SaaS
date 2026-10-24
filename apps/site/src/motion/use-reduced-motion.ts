// The visitor's reduced-motion setting, safe for prerendered pages: the server and the first
// client render both say "no preference", and React re-renders with the real setting right after
// hydration, so the HTML never mismatches (Motion's own hook reads the setting during the first
// render). Implements: T-WEB-15, C-085.
import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
