'use client';
// Animated success tick (C-085): a ring draws itself and a tick follows, played once when a form
// is sent or a booking is confirmed. The animation is a hand-made Lottie file
// (src/motion/success-tick.json) played by lottie-web's light SVG player, which runs no `eval`
// and so fits the site's content security policy. The player is loaded only when a tick is
// shown. With reduced motion, or before the player loads, the finished tick is drawn as a still.
// `FormSuccess` pairs the tick with the success message. Implements: T-WEB-15, C-085.
import { Alert } from '@hms/ui';
import { useEffect, useRef, type ReactNode } from 'react';
import tick from '../motion/success-tick.json';

const SIZE = 72;

export function SuccessTick() {
  const box = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = box.current;
    if (!container) return;
    let stopped = false;
    let destroy: (() => void) | undefined;
    void import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (stopped) return;
      container.replaceChildren();
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const animation = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: false,
        autoplay: !still,
        animationData: tick,
      });
      if (still) animation.goToAndStop(tick.op - 1, true);
      destroy = () => animation.destroy();
    });
    return () => {
      stopped = true;
      destroy?.();
    };
  }, []);

  return (
    <span
      ref={box}
      aria-hidden="true"
      className="block shrink-0"
      style={{ width: SIZE, height: SIZE }}
      data-testid="success-tick"
    >
      {/* The finished tick, shown until the player takes over (and without JavaScript). */}
      <svg viewBox="0 0 96 96" width={SIZE} height={SIZE}>
        <circle
          cx="48"
          cy="48"
          r="42"
          className="fill-primary-soft stroke-primary"
          strokeWidth="5"
        />
        <path
          d="M31 49 43 61 67 36"
          fill="none"
          className="stroke-primary"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function FormSuccess({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <SuccessTick />
      <Alert tone="success" title={title} className="w-full">
        {children}
      </Alert>
    </div>
  );
}
