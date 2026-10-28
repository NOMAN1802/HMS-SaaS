'use client';
// Checkbox list of the hospital's roles, for assigning roles to a user (T-ACC-05, FR-ACC-008).
import type { RoleSummary } from '@hms/contracts';
import { Checkbox } from '@hms/ui';
import { useLocale } from 'next-intl';

export function RoleChoices({
  roles,
  selected,
  onChange,
  label,
  emptyLabel,
}: {
  roles: readonly RoleSummary[];
  selected: ReadonlySet<string>;
  onChange: (next: Set<string>) => void;
  label: string;
  emptyLabel: string;
}) {
  const locale = useLocale();

  function toggle(roleId: string): void {
    const next = new Set(selected);
    if (next.has(roleId)) next.delete(roleId);
    else next.add(roleId);
    onChange(next);
  }

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-2 font-medium">{label}</legend>
      {roles.length === 0 ? <p className="text-text-muted">{emptyLabel}</p> : null}
      {roles.map((role) => (
        <Checkbox
          key={role.id}
          checked={selected.has(role.id)}
          onChange={() => toggle(role.id)}
          label={
            <>
              {(locale === 'bn-BD' && role.nameBn) || role.nameEn}{' '}
              <span className="font-mono text-sm text-text-muted">{role.code}</span>
            </>
          }
        />
      ))}
    </fieldset>
  );
}
