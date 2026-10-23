import { describe, expect, it } from 'vitest';
import {
  coreModules,
  isPermissionCode,
  moduleCodes,
  moduleOf,
  permissionCodeSchema,
  permissionCodes,
} from './permissions.js';

describe('permission catalogue', () => {
  it('uses lower-case dotted codes (C00 section 8)', () => {
    for (const code of permissionCodes) {
      expect(code).toMatch(/^[a-z_]+(\.[a-z_]+)+$/);
    }
  });

  it('assigns every code to a known module', () => {
    for (const code of permissionCodes) {
      expect(moduleCodes).toContain(moduleOf(code));
    }
  });

  it('keeps administration in the core module, which needs no entitlement', () => {
    expect(moduleOf('admin.role.manage')).toBe('core');
    expect(coreModules.has('core')).toBe(true);
    expect(coreModules.has('billing')).toBe(false);
  });

  it('rejects codes outside the catalogue', () => {
    expect(isPermissionCode('billing.payment.record')).toBe(true);
    expect(isPermissionCode('billing.payment.steal')).toBe(false);
    expect(isPermissionCode('toString')).toBe(false);
    expect(permissionCodeSchema.safeParse('billing.payment.steal').success).toBe(false);
  });
});
