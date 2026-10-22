'use client';
// Home hero slideshow (C-085): the hero pictures change every few seconds with a morph: the next
// picture grows out of a soft rounded shape into the full frame, sharpening from a blur, while the
// current one blurs and sinks away behind it. Each picture after the first carries a link chip to
// the service it shows. No controls, by the owner's choice (2026-10-22): the show pauses while the
// pointer is over it, while keyboard focus is inside it (the chip) and while the tab is hidden;
// with reduced motion it stays on the first picture. The pictures are rendered on the server and
// passed in, so the first one is in the HTML and is the page's largest paint.
// Implements: T-WEB-15, C-085.
import { formatNumber, type Locale } from '@hms/i18n';
import { motion, MotionConfig } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from '../i18n/navigation';
import { usePrefersReducedMotion } from '../motion/use-reduced-motion';

export interface HeroSlide {
  media: ReactNode;
  link?: { label: string; href: string };
}

const INTERVAL_MS = 6000;
const MORPH_S = 1.3;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
// The incoming picture starts as a soft blob near the centre and opens into the frame.
const SHAPE_START = 'inset(24% 20% 24% 20% round 48%)';
const SHAPE_END = 'inset(0% 0% 0% 0% round 0%)';

type Role = 'active' | 'leaving' | 'idle';

function frameFor(role: Role) {
  if (role === 'active') {
    return {
      opacity: 1,
      clipPath: [SHAPE_START, SHAPE_END],
      filter: ['blur(14px)', 'blur(0px)'],
      scale: [1.14, 1],
      zIndex: 2,
    };
  }
  if (role === 'leaving') {
    return { opacity: [1, 1, 0], filter: 'blur(10px)', scale: 0.96, zIndex: 1 };
  }
  return { opacity: 0, zIndex: 0 };
}

export function HeroSlides({ slides, locale }: { slides: HeroSlide[]; locale: Locale }) {
  const t = useTranslations();
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [held, setHeld] = useState(false);
  const [hidden, setHidden] = useState(false);
  const total = slides.length;
  const playing = total > 1 && !reduced && !held && !hidden;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setLeaving(active);
      setActive((active + 1) % total);
    }, INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [playing, active, total]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const position = (index: number) =>
    t('common.carousel.slide', {
      index: formatNumber(String(index + 1), locale),
      total: formatNumber(String(total), locale),
    });

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-roledescription={t('common.carousel.name')}
        aria-label={t('hero.slideshow')}
        className="relative isolate aspect-[4/3] overflow-hidden rounded-panel bg-primary-soft shadow-overlay"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false);
        }}
        data-testid="hero-slides"
        data-playing={playing || undefined}
      >
        {slides.map((slide, index) => {
          let role: Role = 'idle';
          if (index === active) role = 'active';
          else if (index === leaving) role = 'leaving';
          return (
            <motion.div
              key={index}
              role="group"
              aria-roledescription={t('common.carousel.slideName')}
              aria-label={position(index)}
              aria-hidden={role !== 'active'}
              inert={role !== 'active'}
              // The first picture is already in place when the page loads.
              initial={false}
              animate={frameFor(role)}
              transition={{ duration: MORPH_S, ease: EASE_OUT }}
              className="absolute inset-0 will-change-[clip-path,filter]"
              data-active={role === 'active' || undefined}
            >
              {slide.media}
              {slide.link ? (
                <Link
                  href={slide.link.href}
                  className="absolute start-4 bottom-4 inline-flex items-center gap-2 rounded-pill bg-surface/95 px-4 py-2 font-ui text-sm font-semibold text-heading shadow-overlay backdrop-blur transition-colors duration-200 hover:text-primary"
                >
                  {slide.link.label}
                </Link>
              ) : null}
            </motion.div>
          );
        })}
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
      </section>
    </MotionConfig>
  );
}
