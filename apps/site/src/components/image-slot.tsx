// A named image slot (C-065). With `src` it shows the image; without it, a token-colored
// placeholder with an icon, so pages look finished before photography or AI images exist
// (F section 6). A photo shimmers until it loads (T-WEB-15). The alt text is always spoken.
// Implements: T-WEB-06, T-WEB-14, T-WEB-15.
import type { ImageRef } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { Icon, type IconName } from '@hms/ui';
import { localize } from '../content/localize';
import { LoadingImage } from './loading-image';

const RATIOS = {
  wide: 'aspect-[16/9]',
  feature: 'aspect-[2/1]',
  card: 'aspect-[4/3]',
  photo: 'aspect-[3/2]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
} as const;

export interface ImageSlotProps {
  image: ImageRef;
  locale: Locale;
  ratio?: keyof typeof RATIOS;
  icon?: IconName;
  className?: string;
  priority?: boolean;
  sizes?: string;
  iconSize?: number;
  /** A dark band needs a placeholder that does not glare (critique 2026-10-21). */
  tone?: 'light' | 'dark';
}

export function ImageSlot({
  image,
  locale,
  ratio = 'card',
  icon = 'hospital-building',
  className,
  priority = false,
  sizes = '(min-width: 1024px) 33vw, 100vw',
  iconSize = 56,
  tone = 'light',
}: ImageSlotProps) {
  const alt = localize(image.alt, locale);
  const frame = `relative overflow-hidden ${RATIOS[ratio]} ${className ?? ''}`;
  if (image.src) {
    return (
      <div className={frame}>
        <LoadingImage
          src={image.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      data-slot={image.slot}
      className={`${frame} flex items-center justify-center bg-linear-to-br ${
        tone === 'dark'
          ? 'from-primary-strong to-heading text-on-primary'
          : 'from-primary-soft via-surface to-accent-soft text-primary'
      }`}
    >
      <Icon name={icon} size={iconSize} className="opacity-60" />
    </div>
  );
}
