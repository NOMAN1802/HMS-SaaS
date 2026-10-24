'use client';
// Slider for a short row of cards on the home page (featured doctors, health packages), built on
// Embla (C-084): swipe or drag, previous and next buttons, snapping a screenful at a time. Never
// auto-plays. Before the script runs it is a plain horizontal scroll row, so every card stays
// reachable. Keyboard focus moving to a card off screen slides that card into view, and reduced
// motion jumps instead of sliding. Follows the APG carousel pattern (region, labelled slides).
// Implements: T-WEB-15, C-084, FR-WEB-HOME-*.
import { IconButton } from '@hms/ui';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslations } from 'next-intl';
import { Children, useEffect, useState, type FocusEvent, type ReactNode } from 'react';
import { digits } from '../format';
import { useSiteLocale } from '../i18n/locale';

export interface CarouselProps {
  children: ReactNode;
  /** id of the heading that names the slider. */
  labelledBy: string;
  /** Width of one slide per breakpoint, as Tailwind basis classes. */
  slideClassName: string;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Carousel({ children, labelledBy, slideClassName }: CarouselProps) {
  const t = useTranslations();
  const locale = useSiteLocale();
  const [viewportRef, api] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 'auto',
    // Focus is handled below, so reduced motion is respected.
    watchFocus: false,
  });
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const slides = Children.toArray(children);
  const total = digits(slides.length, locale);

  useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanPrevious(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    update();
    api.on('select', update).on('reInit', update);
    return () => {
      api.off('select', update).off('reInit', update);
    };
  }, [api]);

  // Focus inside a hidden slide: Embla moves the track, so the viewport itself must not scroll.
  // `scrollTo` takes a snap (a screenful of slides), not a slide, so find the slide's snap.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    event.currentTarget.scrollLeft = 0;
    if (!api) return;
    const slide = (event.target as HTMLElement).closest('[data-slide]');
    const index = api.slideNodes().indexOf(slide as HTMLElement);
    const snap = api.internalEngine().slideRegistry.findIndex((group) => group.includes(index));
    if (snap >= 0 && snap !== api.selectedScrollSnap()) api.scrollTo(snap, prefersReducedMotion());
  };

  return (
    <div
      role="region"
      aria-roledescription={t('common.carousel.name')}
      aria-labelledby={labelledBy}
      className="flex flex-col gap-4"
    >
      <div
        ref={viewportRef}
        onFocus={onFocus}
        // Positioned, so screen-reader-only labels inside cards stay clipped; without it the
        // page scrolls sideways on phones.
        className={`relative ${
          api ? 'overflow-hidden' : 'snap-x snap-mandatory overflow-x-auto overscroll-x-contain'
        }`}
      >
        <div className="-ms-4 flex touch-pan-y">
          {slides.map((slide, index) => (
            <div
              key={index}
              data-slide
              role="group"
              aria-roledescription={t('common.carousel.slideName')}
              aria-label={t('common.carousel.slide', {
                index: digits(index + 1, locale),
                total,
              })}
              className={`min-w-0 shrink-0 snap-start ps-4 ${slideClassName}`}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
      {canPrevious || canNext ? (
        <div className="flex justify-end gap-2">
          <IconButton
            icon="arrow-left"
            variant="secondary"
            label={t('common.carousel.previous')}
            disabled={!canPrevious}
            onClick={() => api?.scrollPrev(prefersReducedMotion())}
          />
          <IconButton
            icon="arrow-right"
            variant="secondary"
            label={t('common.carousel.next')}
            disabled={!canNext}
            onClick={() => api?.scrollNext(prefersReducedMotion())}
          />
        </div>
      ) : null}
    </div>
  );
}
