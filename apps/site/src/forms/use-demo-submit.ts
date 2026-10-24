// Pending state for the demo forms. Nothing is sent in WEB-A (P-032), so a short pause stands in
// for the network request WEB-B adds; the button shows its spinner and "Sending..." and the form
// is marked busy, exactly as it will be against the real API. Implements: T-WEB-15.
import { useEffect, useRef, useState } from 'react';

/** Long enough to see the pending state, short enough not to feel slow. */
export const DEMO_SUBMIT_MS = 700;

export function useDemoSubmit() {
  const [pending, setPending] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  /** Shows the pending state, then runs `done` (for example, showing the confirmation). */
  function run(done: () => void) {
    setPending(true);
    timer.current = window.setTimeout(() => {
      setPending(false);
      done();
    }, DEMO_SUBMIT_MS);
  }

  return { pending, run };
}
