import { describe, expect, it } from 'vitest';
import {
  currentOrNextLeave,
  getDoctor,
  getPackage,
  leaveOn,
  listDepartments,
  listDoctors,
  listTests,
  normalizeQuery,
  packageSaving,
  relatedDoctors,
} from './index';
import { buildContent, rawContent, type RawContent } from './load';

const clone = (): RawContent => structuredClone(rawContent);

describe('mock content (AT-WEB-003)', () => {
  it('passes every schema and reference check', () => {
    expect(() => buildContent(rawContent)).not.toThrow();
  });

  it('fails on a dangling slug', () => {
    const raw = clone();
    (raw.doctors as { department: string }[])[0]!.department = 'no-such-department';
    expect(() => buildContent(raw)).toThrow(/unknown departments entry "no-such-department"/);
  });

  it('fails on an unknown section type (FR-WEB-GEN-008)', () => {
    const raw = clone();
    (raw.pages.home as { sections: { type: string }[] }).sections[0]!.type = 'html';
    expect(() => buildContent(raw)).toThrow(/pages\/home.json/);
  });

  it('fails on an unknown icon', () => {
    const raw = clone();
    (raw.departments as { icon: string }[])[0]!.icon = 'no-such-icon';
    expect(() => buildContent(raw)).toThrow(/unknown icon/);
  });

  it('has Bangla and English names for every department', () => {
    for (const department of listDepartments()) {
      expect(department.name.bn).not.toBe('');
      expect(department.name.en).not.toBe('');
    }
  });
});

describe('doctor directory (AT-WEB-010, AT-WEB-013)', () => {
  it('finds doctors by name, department and interest in both languages', () => {
    expect(listDoctors({ query: 'farhana' }).map((d) => d.slug)).toEqual(['farhana-rahman']);
    expect(listDoctors({ query: 'cardio' }).every((d) => d.department === 'cardiology')).toBe(true);
    expect(listDoctors({ query: 'কার্ডিও' })).toHaveLength(2);
    expect(listDoctors({ query: 'migraine' }).map((d) => d.department)).toContain('neurology');
  });

  it('combines department and branch filters', () => {
    const result = listDoctors({ department: 'cardiology', branch: 'dhanmondi' });
    expect(result.map((d) => d.slug)).toEqual(['farhana-rahman']);
  });

  it('returns nothing for an unknown query', () => {
    expect(listDoctors({ query: 'zzzz' })).toEqual([]);
  });
});

describe('related doctors and leave (AT-WEB-050, AT-WEB-051)', () => {
  it('lists at most four, same department first, never the doctor', () => {
    const related = relatedDoctors(getDoctor('farhana-rahman')!);
    expect(related.length).toBeLessThanOrEqual(4);
    expect(related.map((d) => d.slug)).not.toContain('farhana-rahman');
    expect(related[0]?.department).toBe('cardiology');
  });

  it('finds leave covering a date and the next leave', () => {
    const doctor = getDoctor('tanvir-ahmed')!;
    expect(leaveOn(doctor, '2026-10-25')).toBeDefined();
    expect(leaveOn(doctor, '2026-10-31')).toBeUndefined();
    expect(currentOrNextLeave(getDoctor('imran-hossain')!, '2026-10-21')?.from).toBe('2026-11-05');
  });
});

describe('prices (AT-WEB-053, AT-WEB-022)', () => {
  it('computes the package saving exactly', () => {
    expect(packageSaving(getPackage('basic-health-check')!)).toBe('1100.00');
    expect(packageSaving(getPackage('executive-health-check')!)).toBe('4150.00');
  });

  it('searches tests by code and name, with Bangla digits', () => {
    expect(listTests({ query: 'lab-cbc' }).map((t) => t.code)).toEqual(['LAB-CBC']);
    expect(listTests({ query: 'ft৪' }).map((t) => t.code)).toEqual(['BIO-FT4']);
    expect(listTests({ category: 'cardiology' })).toHaveLength(4);
  });

  it('normalizes queries', () => {
    expect(normalizeQuery('  Card  ১২ ')).toBe('card 12');
  });
});
