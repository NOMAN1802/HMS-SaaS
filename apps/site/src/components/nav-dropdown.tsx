'use client';
// Header dropdown for a menu item with children (Departments). Built on details/summary so the
// links are reachable without JavaScript; the script only closes it on Escape, an outside click
// or a link choice. Implements: T-WEB-05, FR-WEB-NAV-*.
import { Icon } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { Link } from '../i18n/navigation';
import type { NavLink } from './nav-types';

export function NavDropdown({ item }: { item: NavLink }) {
  const t = useTranslations();
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const close = () => details.removeAttribute('open');
    const onPointer = (event: PointerEvent) => {
      if (!details.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && details.open) {
        close();
        details.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const close = () => ref.current?.removeAttribute('open');

  return (
    <details ref={ref} className="group relative">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-1 rounded-control px-3 font-ui text-sm font-medium text-text hover:bg-primary-soft hover:text-primary [&::-webkit-details-marker]:hidden">
        {item.label}
        <Icon name="caret-down" size={16} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute top-full left-0 z-40 mt-2 w-[min(40rem,90vw)] rounded-panel border border-border bg-surface p-4 shadow-overlay">
        <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          {(item.children ?? []).map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={close}
                className="block rounded-control px-3 py-2 text-sm hover:bg-primary-soft hover:text-primary"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={item.href}
          onClick={close}
          className="mt-3 inline-flex items-center gap-1 px-3 font-ui text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('shell.allOf', { name: item.label })}
          <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    </details>
  );
}
