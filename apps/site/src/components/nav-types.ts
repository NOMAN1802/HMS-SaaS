// Navigation items with the text already in the page language, so client components (mobile
// menu, dropdown) receive plain strings instead of the whole content set. Implements: T-WEB-05.
import type { MenuItem } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { localize } from '../content';

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export function toNavLinks(items: readonly MenuItem[], locale: Locale): NavLink[] {
  return items.map((item) => {
    const link: NavLink = { label: localize(item.label, locale), href: item.href };
    if (item.children?.length) link.children = toNavLinks(item.children, locale);
    return link;
  });
}
