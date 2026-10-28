'use client';
// SCR-22 (users): the hospital's staff accounts with their roles and access state; add a user
// with a temporary password, and manage one (T-ACC-05; FR-ACC-007, FR-ACC-008, FR-ACC-010).
// admin.user.manage; the API enforces it.
import type { AdminUser } from '@hms/contracts';
import { Alert, Button, PageLayout, Skeleton, StatusBadge, type StatusKind } from '@hms/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { adminApi } from '../../../../src/api/admin';
import {
  USERS_QUERY_KEY,
  UserCreateDialog,
} from '../../../../src/components/admin/user-create-dialog';
import { UserManageDialog } from '../../../../src/components/admin/user-manage-dialog';
import { useApiErrorMessage } from '../../../../src/i18n/use-api-error-message';

// Full catalog keys as literals, so the unused-key check can see them.
const MEMBERSHIP_BADGE = {
  ACTIVE: { status: 'active', labelKey: 'admin.membershipActive' },
  SUSPENDED: { status: 'attention', labelKey: 'admin.membershipSuspended' },
  REVOKED: { status: 'problem', labelKey: 'admin.membershipRevoked' },
  INVITED: { status: 'idle', labelKey: 'admin.membershipInvited' },
} as const satisfies Record<
  AdminUser['membershipStatus'],
  { status: StatusKind; labelKey: string }
>;

export default function UsersPage() {
  const t = useTranslations();
  const errorMessage = useApiErrorMessage();
  const users = useQuery({ queryKey: USERS_QUERY_KEY, queryFn: adminApi.users });
  const [creating, setCreating] = useState(false);
  const [managingId, setManagingId] = useState<string | null>(null);
  const roles = users.data?.roles ?? [];
  const managing = users.data?.users.find((user) => user.userId === managingId);

  return (
    <PageLayout
      title={t('admin.usersTitle')}
      description={t('admin.usersDescription')}
      actions={<Button onClick={() => setCreating(true)}>{t('admin.addUser')}</Button>}
    >
      {users.error ? <Alert tone="danger">{errorMessage(users.error)}</Alert> : null}
      {users.isPending ? <Skeleton className="h-40" /> : null}
      <ul className="flex flex-col gap-3">
        {users.data?.users.map((user) => {
          const badge = MEMBERSHIP_BADGE[user.membershipStatus];
          const locked = user.accountStatus !== 'ACTIVE' && user.accountStatus !== 'DISABLED';
          return (
            <li
              key={user.userId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border bg-surface p-4"
            >
              <div className="flex flex-col gap-1">
                <p className="font-medium">
                  {user.displayName}{' '}
                  <span className="font-mono text-sm text-text-muted">{user.username}</span>
                </p>
                <p className="text-sm text-text-muted">
                  {user.roles.length > 0
                    ? user.roles.map((role) => role.code).join(', ')
                    : t('admin.noRoles')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={badge.status} label={t(badge.labelKey)} />
                  {locked ? <StatusBadge status="problem" label={t('admin.locked')} /> : null}
                  {user.mfaEnrolled ? <StatusBadge status="done" label={t('admin.mfaOn')} /> : null}
                  {user.mustChangePassword ? (
                    <StatusBadge status="review" label={t('admin.mustChange')} />
                  ) : null}
                </div>
              </div>
              <Button variant="secondary" onClick={() => setManagingId(user.userId)}>
                {t('admin.manage')}
              </Button>
            </li>
          );
        })}
      </ul>
      {creating ? <UserCreateDialog roles={roles} onOpenChange={setCreating} /> : null}
      {managing ? (
        <UserManageDialog
          key={managing.userId}
          user={managing}
          roles={roles}
          onOpenChange={(open) => setManagingId(open ? managing.userId : null)}
        />
      ) : null}
    </PageLayout>
  );
}
