'use client';
// Phone and tablet navigation: a menu button opens a bottom sheet (Vaul drawer, C-085) with every
// header link, the call to action and the language switch. The sheet follows the finger and can
// be dragged down to close; Escape, the close button, the backdrop or a chosen link close it too.
// Vaul builds on the Radix dialog, so focus stays inside and returns to the menu button.
// Implements: T-WEB-05, T-WEB-15, FR-WEB-NAV-*, AT-WEB-034 (keyboard open and close).
import { buttonClassName, Icon, IconButton } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Drawer } from 'vaul';
import { Link } from '../i18n/navigation';
import { LanguageLinks } from './language-links';
import type { NavLink } from './nav-types';

export interface MobileMenuProps {
  items: NavLink[];
  cta: NavLink;
}

export function MobileMenu({ items, cta }: MobileMenuProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <IconButton
        icon="menu"
        label={t('shell.menu')}
        variant="secondary"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      />
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-heading/40" />
          <Drawer.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-panel bg-surface shadow-overlay outline-none"
            data-testid="mobile-menu"
          >
            <div
              aria-hidden="true"
              className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-pill bg-border"
            />
            <div className="flex items-center justify-between px-4 pt-2 pb-3">
              <Drawer.Title className="text-lg font-semibold text-heading">
                {t('shell.menu')}
              </Drawer.Title>
              <Drawer.Close asChild>
                <IconButton icon="close" label={t('shell.closeMenu')} />
              </Drawer.Close>
            </div>
            <div className="overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <nav aria-label={t('shell.mainNavigation')}>
                <ul className="flex flex-col gap-1">
                  {items.map((item) => (
                    <li key={item.href}>
                      {item.children ? (
                        <details className="disclosure group">
                          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-control px-3 font-medium hover:bg-primary-soft [&::-webkit-details-marker]:hidden">
                            {item.label}
                            <Icon
                              name="caret-down"
                              size={16}
                              className="transition-transform duration-200 group-open:rotate-180"
                            />
                          </summary>
                          <ul className="ms-3 border-s border-border ps-2">
                            {[
                              ...item.children,
                              { label: t('shell.allOf', { name: item.label }), href: item.href },
                            ].map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={close}
                                  className="flex min-h-11 items-center rounded-control px-3 text-sm hover:bg-primary-soft"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={close}
                          className="flex min-h-11 items-center rounded-control px-3 font-medium hover:bg-primary-soft"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
                <Link
                  href={cta.href}
                  onClick={close}
                  className={buttonClassName('primary', 'lg', 'mt-4 w-full')}
                >
                  {cta.label}
                </Link>
              </nav>
              <div className="mt-4 rounded-control bg-heading p-2 text-on-primary">
                <LanguageLinks />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
