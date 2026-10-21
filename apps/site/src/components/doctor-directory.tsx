'use client';
// Find a doctor: search by name, speciality or interest, filter by department and branch, with
// the filters kept in the URL so a shared link restores them (FR-WEB-DOC-001..003, AT-WEB-010,
// AT-WEB-011, AT-WEB-014). The full list is rendered on the server as the no-JavaScript fallback.
// Implements: T-WEB-07.
import { Button, Field, Select, TextInput } from '@hms/ui';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import type { DoctorSummary } from '../content/doctor-summary';
import { normalizeQuery } from '../content/normalize';
import { usePathname, useRouter } from '../i18n/navigation';
import { useSiteLocale } from '../i18n/locale';
import { DoctorCard } from './doctor-card';

export interface Option {
  value: string;
  label: string;
}

export interface DoctorDirectoryProps {
  doctors: DoctorSummary[];
  departments: Option[];
  branches: Option[];
}

export function DoctorGrid({ doctors }: { doctors: DoctorSummary[] }) {
  const locale = useSiteLocale();
  return (
    <ul
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      data-testid="doctor-results"
    >
      {doctors.map((doctor) => (
        <li key={doctor.slug}>
          <DoctorCard doctor={doctor} locale={locale} />
        </li>
      ))}
    </ul>
  );
}

export function DoctorDirectory({ doctors, departments, branches }: DoctorDirectoryProps) {
  const t = useTranslations();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Filters live in state and are mirrored to the URL; reading them back from the URL would lose
  // a change made before the previous URL update finished.
  const [filters, setFilters] = useState({
    q: params.get('q') ?? '',
    department: params.get('department') ?? '',
    branch: params.get('branch') ?? '',
  });
  const { q: query, department, branch } = filters;

  function update(next: typeof filters) {
    setFilters(next);
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) if (value) search.set(key, value);
    const suffix = search.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
  }

  const results = useMemo(() => {
    const normalized = normalizeQuery(query);
    return doctors.filter(
      (doctor) =>
        (!department || doctor.departmentSlug === department) &&
        (!branch || doctor.branchSlugs.includes(branch)) &&
        (!normalized || doctor.terms.includes(normalized)),
    );
  }, [doctors, query, department, branch]);

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className={`grid gap-4 rounded-panel border border-border bg-surface p-4 ${
          branches.length > 0 ? 'md:grid-cols-[2fr_1fr_1fr]' : 'md:grid-cols-[2fr_1fr]'
        }`}
      >
        <Field label={t('doctors.searchLabel')}>
          {(control) => (
            <TextInput
              {...control}
              type="search"
              value={query}
              onChange={(event) => update({ ...filters, q: event.target.value })}
            />
          )}
        </Field>
        <Field label={t('doctors.department')}>
          {(control) => (
            <Select
              {...control}
              options={[{ value: '', label: t('doctors.allDepartments') }, ...departments]}
              value={department}
              onChange={(event) => update({ ...filters, department: event.target.value })}
            />
          )}
        </Field>
        {/* A branch page passes its own doctors and no branch options (X21). */}
        {branches.length > 0 ? (
          <Field label={t('doctors.branch')}>
            {(control) => (
              <Select
                {...control}
                options={[{ value: '', label: t('doctors.allBranches') }, ...branches]}
                value={branch}
                onChange={(event) => update({ ...filters, branch: event.target.value })}
              />
            )}
          </Field>
        ) : null}
      </form>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="font-ui font-medium" data-testid="doctor-count">
          {t('doctors.count', { count: results.length })}
        </p>
        {query || department || branch ? (
          <Button variant="ghost" onClick={() => update({ q: '', department: '', branch: '' })}>
            {t('doctors.clear')}
          </Button>
        ) : null}
      </div>
      {results.length > 0 ? (
        <DoctorGrid doctors={results} />
      ) : (
        <p className="rounded-panel border border-dashed border-border-strong p-10 text-center text-text-muted">
          {t('doctors.empty')}
        </p>
      )}
    </div>
  );
}
