'use client';
// Phone and tablet navigation: a menu button opens a dialog with every header link, the call to
// action and the language switch. Closes when a link is chosen. Implements: T-WEB-05,
// FR-WEB-NAV-*, AT-WEB-034 (keyboard open and close).
import { buttonClassName, Dialog, Icon, IconButton } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
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
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={t('shell.menu')}
        closeLabel={t('shell.closeMenu')}
      >
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
      </Dialog>
    </>
  );
}
