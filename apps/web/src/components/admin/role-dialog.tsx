'use client';
// Create a role (usually from one of the nine product templates) or replace a role's
// permissions (T-ACC-05; FR-ACC-008; C-045). The API refuses removing user or role
// administration from a role the administrator holds.
import type { AdminRole, PermissionCode, RoleTemplateSummary } from '@hms/contracts';
import { Alert, Button, Dialog, Field, Select, TextInput, useToast } from '@hms/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { adminApi } from '../../api/admin';
import { useApiErrorMessage } from '../../i18n/use-api-error-message';
import { PermissionChecklist } from './permission-checklist';

export const ROLES_QUERY_KEY = ['admin', 'roles'] as const;

export function RoleDialog({
  role,
  templates,
  open,
  onOpenChange,
}: {
  /** Edit this role's permissions; omitted to create a new role. */
  role?: AdminRole;
  templates: readonly RoleTemplateSummary[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const toast = useToast();
  const errorMessage = useApiErrorMessage();
  const queryClient = useQueryClient();
  const [templateCode, setTemplateCode] = useState('');
  const [code, setCode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [permissions, setPermissions] = useState<Set<PermissionCode>>(
    new Set(role?.permissions ?? []),
  );

  const save = useMutation({
    mutationFn: () =>
      role
        ? adminApi.setPermissions(role.id, [...permissions])
        : adminApi.createRole({
            code,
            nameEn,
            ...(nameBn ? { nameBn } : {}),
            ...(templateCode ? { templateCode } : {}),
            permissions: [...permissions],
          }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      toast.show({ title: t('admin.saved'), tone: 'success' });
      onOpenChange(false);
    },
  });

  function chooseTemplate(value: string): void {
    setTemplateCode(value);
    const template = templates.find((item) => item.code === value);
    if (!template) return;
    setCode(template.code);
    setNameEn(template.nameEn);
    setPermissions(new Set(template.permissions));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      closeLabel={t('common.close')}
      title={role ? `${t('admin.editPermissions')}: ${role.code}` : t('admin.addRole')}
      footer={
        <Button loading={save.isPending} onClick={() => save.mutate()}>
          {role ? t('admin.savePermissions') : t('admin.create')}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {save.error ? <Alert tone="danger">{errorMessage(save.error)}</Alert> : null}
        {role ? null : (
          <>
            <Field label={t('admin.fromTemplate')}>
              {({ id, ...aria }) => (
                <Select
                  id={id}
                  value={templateCode}
                  onChange={(event) => chooseTemplate(event.target.value)}
                  options={[
                    { value: '', label: t('admin.noTemplate') },
                    ...templates.map((item) => ({ value: item.code, label: item.nameEn })),
                  ]}
                  {...aria}
                />
              )}
            </Field>
            <Field label={t('admin.roleCode')} hint={t('admin.roleCodeHint')} required>
              {({ id, invalid, required, ...aria }) => (
                <TextInput
                  id={id}
                  value={code}
                  invalid={invalid}
                  required={required}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  {...aria}
                />
              )}
            </Field>
            <Field label={t('admin.roleName')} required>
              {({ id, invalid, required, ...aria }) => (
                <TextInput
                  id={id}
                  value={nameEn}
                  invalid={invalid}
                  required={required}
                  onChange={(event) => setNameEn(event.target.value)}
                  {...aria}
                />
              )}
            </Field>
            <Field label={t('admin.roleNameBn')}>
              {({ id, ...aria }) => (
                <TextInput
                  id={id}
                  value={nameBn}
                  onChange={(event) => setNameBn(event.target.value)}
                  {...aria}
                />
              )}
            </Field>
          </>
        )}
        <PermissionChecklist
          label={t('admin.permissions')}
          selected={permissions}
          onChange={setPermissions}
        />
      </div>
    </Dialog>
  );
}
