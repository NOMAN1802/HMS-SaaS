'use client';
// Scroll reveal (C-085, replaces the CSS scroll-timeline reveal of C-083): every section of the
// page below the first screen fades and rises in the first time it scrolls into view, and the
// cards of a list follow one after another. Motion's `inView` and `animate` run it, so it works in
// every browser, not only those with scroll-driven animations.
// The page is never hidden by the server: only after hydration, and only parts still below the
// fold, are made transparent, so a reader without JavaScript, a search engine or a printout sees
// everything, and nothing already on screen blinks. Reduced motion skips all of it.
// Implements: T-WEB-15, C-085.
import { animate, inView, stagger } from 'motion';
import { useEffect } from 'react';
import { usePathname } from '../i18n/navigation';

const BLOCKS = 'section, [data-section], .reveal';
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
// Marks a part waiting to be revealed; motion.css shows it anyway in print.
const PENDING = 'data-reveal-pending';

function belowFold(element: Element): boolean {
  return element.getBoundingClientRect().top > window.innerHeight * 0.92;
}

/** The outermost matches only, so a section and the heading inside it do not both animate. */
function outermost(elements: Element[]): Element[] {
  return elements.filter(
    (element) => !elements.some((other) => other !== element && other.contains(element)),
  );
}

function hide(elements: readonly Element[], rise: number) {
  for (const element of elements) {
    if (!(element instanceof HTMLElement)) continue;
    element.setAttribute(PENDING, '');
    element.style.opacity = '0';
    element.style.transform = `translateY(${rise}px)`;
  }
}

/** Clears the inline styles once shown, so no transform is left to trap a dropdown's stacking. */
function release(elements: readonly Element[]) {
  for (const element of elements) {
    if (!(element instanceof HTMLElement)) continue;
    element.removeAttribute(PENDING);
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
  }
}

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const main = document.getElementById('main');
    if (!main) return;
    const stops: (() => void)[] = [];

    const blocks = outermost([...main.querySelectorAll(BLOCKS)]).filter(belowFold);
    hide(blocks, 28);
    for (const block of blocks) {
      stops.push(
        inView(
          block,
          () => {
            void animate(
              block,
              { opacity: [0, 1], transform: ['translateY(28px)', 'translateY(0px)'] },
              { duration: 0.7, ease: EASE_OUT },
            ).then(() => release([block]));
          },
          { amount: 0.12 },
        ),
      );
    }

    const lists = [...main.querySelectorAll('.reveal-list')].filter(belowFold);
    for (const list of lists) {
      const items = [...list.children];
      hide(items, 18);
      stops.push(
        inView(
          list,
          () => {
            void animate(
              items,
              { opacity: [0, 1], transform: ['translateY(18px)', 'translateY(0px)'] },
              { duration: 0.55, ease: EASE_OUT, delay: stagger(0.07, { startDelay: 0.15 }) },
            ).then(() => release(items));
          },
          { amount: 0.1 },
        ),
      );
    }

    return () => {
      for (const stop of stops) stop();
      release([...main.querySelectorAll(`[${PENDING}]`)]);
    };
  }, [pathname]);

  return null;
}
