'use client';
// Services strip (C-085): the hospital's services and facilities drift slowly across the page
// under the hero, in a loop, using react-fast-marquee. The moving copy is decorative (the
// marquee repeats its items to fill the width), so screen readers get one plain list instead.
// It pauses under the pointer; with reduced motion the same chips sit still in wrapped rows. Both
// versions are in the HTML and CSS picks one, so there is no flash when the page hydrates.
// Implements: T-WEB-15, C-085.
import { Icon, type IconName } from '@hms/ui';
import Marquee from 'react-fast-marquee';

export interface ServiceStripItem {
  icon: IconName;
  label: string;
}

function Chip({ item }: { item: ServiceStripItem }) {
  return (
    <span className="mx-2 inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 font-ui text-sm font-medium whitespace-nowrap text-heading">
      <Icon name={item.icon} size={18} className="text-primary" />
      {item.label}
    </span>
  );
}

export function ServiceStrip({ label, items }: { label: string; items: ServiceStripItem[] }) {
  return (
    <section aria-label={label} className="py-6 sm:py-8" data-testid="service-strip">
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item.label}>{item.label}</li>
        ))}
      </ul>
      <div
        aria-hidden="true"
        className="motion-reduce:hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
      >
        <Marquee speed={28} pauseOnHover autoFill>
          {items.map((item) => (
            <Chip key={item.label} item={item} />
          ))}
        </Marquee>
      </div>
      <div
        aria-hidden="true"
        className="mx-auto hidden max-w-7xl flex-wrap justify-center gap-y-3 px-4 motion-reduce:flex"
      >
        {items.map((item) => (
          <Chip key={item.label} item={item} />
        ))}
      </div>
    </section>
  );
}
