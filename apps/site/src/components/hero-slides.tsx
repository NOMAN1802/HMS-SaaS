'use client';
// Home hero slideshow (C-085): the hero pictures cross-fade every few seconds, each with a slow
// zoom and a link chip to the service it shows. The pictures are rendered on the server and passed
// in, so the first one is in the HTML and is the page's largest paint. Motion drives the fades.
// Accessibility (WCAG 2.2.2, APG carousel): a pause button, and the show also pauses while the
// pointer or keyboard focus is on it and while the tab is hidden; with reduced motion it never
// plays by itself and nothing zooms. Implements: T-WEB-15, C-085.
import { formatNumber, type Locale } from '@hms/i18n';
import { IconButton } from '@hms/ui';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from '../i18n/navigation';
import { usePrefersReducedMotion } from '../motion/use-reduced-motion';

export interface HeroSlide {
  media: ReactNode;
  link?: { label: string; href: string };
}

const INTERVAL_MS = 6000;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function HeroSlides({ slides, locale }: { slides: HeroSlide[]; locale: Locale }) {
  const t = useTranslations();
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [hidden, setHidden] = useState(false);
  const total = slides.length;
  const playing = total > 1 && !reduced && !paused && !held && !hidden;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % total),
      INTERVAL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [playing, active, total]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const go = (step: number) => setActive((current) => (current + step + total) % total);
  const position = (index: number) =>
    t('common.carousel.slide', {
      index: formatNumber(String(index + 1), locale),
      total: formatNumber(String(total), locale),
    });
  const link = slides[active]?.link;

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-roledescription={t('common.carousel.name')}
        aria-label={t('hero.slideshow')}
        className="relative"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false);
        }}
        data-testid="hero-slides"
      >
        <div
          aria-live={playing ? 'off' : 'polite'}
          className="relative isolate aspect-[4/3] overflow-hidden rounded-panel bg-primary-soft shadow-overlay"
        >
          {slides.map((slide, index) => {
            const current = index === active;
            return (
              <motion.div
                key={index}
                role="group"
                aria-roledescription={t('common.carousel.slideName')}
                aria-label={position(index)}
                aria-hidden={!current}
                inert={!current}
                initial={false}
                animate={{ opacity: current ? 1 : 0, scale: current || reduced ? 1 : 1.06 }}
                transition={{
                  opacity: { duration: 0.9, ease: EASE_OUT },
                  // The picture drifts in slowly while shown; the reset happens once it is hidden.
                  scale: current
                    ? { duration: INTERVAL_MS / 1000 + 1, ease: 'linear' }
                    : { duration: 0, delay: 0.9 },
                }}
                className="absolute inset-0"
                data-active={current || undefined}
              >
                {slide.media}
              </motion.div>
            );
          })}
          <AnimatePresence mode="wait" initial={false}>
            {link ? (
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, delay: 0.3, ease: EASE_OUT },
                }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.2 } }}
                className="absolute start-4 bottom-4 z-10"
              >
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-pill bg-surface/95 px-4 py-2 font-ui text-sm font-semibold text-heading shadow-overlay backdrop-blur transition-colors duration-200 hover:text-primary"
                >
                  {link.label}
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {playing ? (
            <motion.span
              key={`progress-${active}`}
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
              className="absolute inset-x-0 bottom-0 z-10 h-1 origin-left bg-primary/80 rtl:origin-right"
            />
          ) : null}
        </div>
        {total > 1 ? (
          <div className="mt-3 flex items-center justify-end gap-2">
            <span
              className="me-auto font-ui text-sm text-text-muted tabular-nums"
              aria-hidden="true"
            >
              {position(active)}
            </span>
            <IconButton
              icon="caret-left"
              label={t('common.carousel.previous')}
              variant="secondary"
              onClick={() => go(-1)}
            />
            {reduced ? null : (
              <IconButton
                icon={paused ? 'play' : 'pause'}
                label={paused ? t('hero.play') : t('hero.pause')}
                variant="secondary"
                aria-pressed={paused}
                onClick={() => setPaused((current) => !current)}
                data-testid="hero-slides-pause"
              />
            )}
            <IconButton
              icon="caret-right"
              label={t('common.carousel.next')}
              variant="secondary"
              onClick={() => go(1)}
            />
          </div>
        ) : null}
      </section>
    </MotionConfig>
  );
}
