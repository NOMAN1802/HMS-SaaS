'use client';
// The signed-in frame: the shared AppShell with the hospital brand, permission-filtered
// navigation, language switch, account menu and the session expiry guard. Screens inside it
// write none of this (ADR-022 section 9). Implements: T-UI-02, F section 2.1.
import type { SessionResponse } from '@hms/contracts';
import { AppShell, type NavItem, type ShellLinkProps } from '@hms/ui';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { type ComponentType, type ReactNode, useMemo } from 'react';
import { activeNavigationId, NAVIGATION, visibleNavigation } from '../navigation';
import { Brand } from './brand';
import { LanguageControl } from './language-control';
import { SessionExpiryGuard } from './session-expiry-guard';
import { UserMenu } from './user-menu';

const ShellLink: ComponentType<ShellLinkProps> = (props) => <Link {...props} />;

export function tenantName(session: SessionResponse, locale: string): string {
  const active = session.memberships.find((m) => m.id === session.activeMembershipId);
  if (!active) return '';
  const names =
    locale === 'bn-BD'
      ? [active.tenantNameBn, active.tenantNameEn]
      : [active.tenantNameEn, active.tenantNameBn];
  return names.find((name) => name) ?? '';
}

export function AppFrame({ session, children }: { session: SessionResponse; children: ReactNode }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const nav: NavItem[] = useMemo(
    () =>
      visibleNavigation(NAVIGATION, new Set(session.permissions)).map((item) => ({
        id: item.id,
        label: t(item.labelKey),
        href: item.href,
        icon: item.icon,
      })),
    [t, session.permissions],
  );

  return (
    <>
      <AppShell
        brand={<Brand name={tenantName(session, locale)} />}
        nav={nav}
        activeId={activeNavigationId(NAVIGATION, pathname) ?? ''}
        linkComponent={ShellLink}
        onNavigate={(href) => router.push(href)}
        topBarEnd={
          <>
            <LanguageControl />
            <UserMenu session={session} />
          </>
        }
        navLabel={t('nav.label')}
        skipLabel={t('app.skipToContent')}
        collapseLabel={t('shell.collapseMenu')}
        expandLabel={t('shell.expandMenu')}
        moreLabel={t('nav.more')}
      >
        {children}
      </AppShell>
      <SessionExpiryGuard session={session} />
    </>
  );
}
