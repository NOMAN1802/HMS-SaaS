'use client';
// A stat number that counts up the first time it scrolls into view (C-083). The server renders
// the final value, so the number reads correctly without script, for search engines and for
// reduced motion. The count runs only for a stat still below the fold when the page loads, so a
// visible number never flashes back to zero. Frames write text directly, not React state.
// Implements: T-WEB-15, C-083.
import type { Locale } from '@hms/i18n';
import { useEffect, useRef } from 'react';
import { digits } from '../format';
import { countParts, countText } from '../motion/count';

const DURATION_MS = 1400;

export function CountUp({ value, locale }: { value: string; locale: Locale }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    const parts = countParts(value);
    if (!element || !parts) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    let frame = 0;
    element.textContent = countText(parts, 0, locale);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = (now - start) / DURATION_MS;
          element.textContent = countText(parts, progress, locale);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      element.textContent = digits(value, locale);
    };
  }, [value, locale]);

  return (
    <span ref={ref} className="tabular-nums">
      {digits(value, locale)}
    </span>
  );
}
