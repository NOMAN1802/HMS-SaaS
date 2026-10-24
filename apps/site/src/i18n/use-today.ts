'use client';
// Today's date in Dhaka, read in the browser. The site is built ahead of time, so a date worked
// out during the build is wrong from the next day on: anything that depends on "today" (date
// choices, a doctor's next chamber, a leave notice) asks this hook instead. It is null on the
// server and while the page hydrates, so the built HTML never carries the build day and React
// sees no mismatch; it moves on when the visitor returns to a tab left open past midnight.
// Implements: T-WEB-15 (review fix 2026-10-22).
import { useSyncExternalStore } from 'react';
import { todayInDhaka } from '../format';

const CHECK_MS = 60_000;

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, CHECK_MS);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', onChange);
  };
}

const browserToday = () => todayInDhaka();
const serverToday = () => null;

export function useToday(): string | null {
  return useSyncExternalStore(subscribe, browserToday, serverToday);
}
