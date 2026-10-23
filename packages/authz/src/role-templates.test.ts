import { isPermissionCode, moduleOf } from '@hms/contracts';
import { describe, expect, it } from 'vitest';
import { roleTemplateCodes, roleTemplates } from './role-templates.js';

describe('role templates (C-045)', () => {
  it('lists every template once, keyed by its own code', () => {
    for (const code of roleTemplateCodes) {
      expect(roleTemplates[code].code).toBe(code);
    }
  });

  it('uses only catalogue codes, without duplicates', () => {
    for (const template of Object.values(roleTemplates)) {
      expect(template.permissions.every(isPermissionCode)).toBe(true);
      expect(new Set(template.permissions).size).toBe(template.permissions.length);
    }
  });

  it('gives the cashier both invoice issue and payment record (C-042)', () => {
    expect(roleTemplates.CSH.permissions).toEqual(
      expect.arrayContaining(['billing.invoice.issue', 'billing.payment.record']),
    );
  });

  it('keeps payment recording away from doctors (C-009)', () => {
    expect(roleTemplates.DOC.permissions).not.toContain('billing.payment.record');
  });

  it('gives the administrator no clinical actions (C01 section 5)', () => {
    const clinical = roleTemplates.ADM.permissions.filter((code) => moduleOf(code) === 'clinical');
    expect(clinical).toEqual([]);
    expect(roleTemplates.ADM.permissions).not.toContain('lab.result.release');
  });

  it('keeps lab verification and release out of the lab technologist template', () => {
    expect(roleTemplates.LBT.permissions).not.toContain('lab.result.verify');
    expect(roleTemplates.LBT.permissions).not.toContain('lab.result.release');
  });

  it('grants the disabled emergency override to nobody (Q-005)', () => {
    for (const template of Object.values(roleTemplates)) {
      expect(template.permissions).not.toContain('billing.eligibility.override');
    }
  });
});
