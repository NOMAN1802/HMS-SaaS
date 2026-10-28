'use client';
// SCR-22 (roles): the hospital's roles with their permissions; new roles start from the product
// templates (T-ACC-05; FR-ACC-008; C-045). admin.role.manage; the API enforces it.
import type { AdminRole } from '@hms/contracts';
import { Alert, Button, PageLayout, Skeleton } from '@hms/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { adminApi } from '../../../../src/api/admin';
import { ROLES_QUERY_KEY, RoleDialog } from '../../../../src/components/admin/role-dialog';
import { useApiErrorMessage } from '../../../../src/i18n/use-api-error-message';

export default function RolesPage() {
  const t = useTranslations();
  const errorMessage = useApiErrorMessage();
  const roles = useQuery({ queryKey: ROLES_QUERY_KEY, queryFn: adminApi.roles });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminRole | null>(null);
  const templates = roles.data?.templates ?? [];

  return (
    <PageLayout
      title={t('admin.rolesTitle')}
      description={t('admin.rolesDescription')}
      actions={<Button onClick={() => setCreating(true)}>{t('admin.addRole')}</Button>}
    >
      {roles.error ? <Alert tone="danger">{errorMessage(roles.error)}</Alert> : null}
      {roles.isPending ? <Skeleton className="h-40" /> : null}
      <ul className="flex flex-col gap-3">
        {roles.data?.roles.map((role) => (
          <li
            key={role.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border bg-surface p-4"
          >
            <div>
              <p className="font-medium">
                {role.nameEn} <span className="font-mono text-sm text-text-muted">{role.code}</span>
              </p>
              <p className="text-sm text-text-muted">
                {t('admin.members', { count: role.memberCount })},{' '}
                {t('admin.permissionCount', { count: role.permissions.length })}
              </p>
            </div>
            <Button variant="secondary" onClick={() => setEditing(role)}>
              {t('admin.editPermissions')}
            </Button>
          </li>
        ))}
      </ul>
      {creating ? <RoleDialog templates={templates} open onOpenChange={setCreating} /> : null}
      {editing ? (
        <RoleDialog
          key={editing.id}
          role={editing}
          templates={templates}
          open
          onOpenChange={(open) => setEditing(open ? editing : null)}
        />
      ) : null}
    </PageLayout>
  );
}
