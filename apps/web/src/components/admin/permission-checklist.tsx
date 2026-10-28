'use client';
// Permission picker for a role (T-ACC-05; FR-ACC-008; C00 section 8 catalogue), grouped by
// module. Codes are shown as they are in the catalogue: they are the administrator's shared
// vocabulary with the product documentation.
import { moduleCodes, moduleOf, type PermissionCode, permissionCodes } from '@hms/contracts';
import { Checkbox } from '@hms/ui';

const BY_MODULE = moduleCodes
  .map((module) => ({ module, codes: permissionCodes.filter((code) => moduleOf(code) === module) }))
  .filter((group) => group.codes.length > 0);

export function PermissionChecklist({
  selected,
  onChange,
  label,
}: {
  selected: ReadonlySet<PermissionCode>;
  onChange: (next: Set<PermissionCode>) => void;
  label: string;
}) {
  function toggle(code: PermissionCode): void {
    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    onChange(next);
  }

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-2 font-medium">{label}</legend>
      {BY_MODULE.map((group) => (
        <div key={group.module}>
          <p className="mb-1 text-sm font-medium text-text-muted">{group.module}</p>
          <div className="grid gap-1 sm:grid-cols-2">
            {group.codes.map((code) => (
              <Checkbox
                key={code}
                className="font-mono text-sm"
                label={code}
                checked={selected.has(code)}
                onChange={() => toggle(code)}
              />
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
