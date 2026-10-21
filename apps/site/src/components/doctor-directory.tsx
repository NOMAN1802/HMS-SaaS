'use client';
// Find a doctor: search by name, speciality or interest, filter by department and branch, with
// the filters kept in the URL so a shared link restores them (FR-WEB-DOC-001..003, AT-WEB-010,
// AT-WEB-011, AT-WEB-014). The full list is rendered on the server as the no-JavaScript fallback.
// Implements: T-WEB-07.
import type { Phone } from '@hms/contracts';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Button, buttonClassName, Field, Icon, Select, TextInput } from '@hms/ui';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import type { DoctorSummary } from '../content/doctor-summary';
import { normalizeQuery } from '../content/normalize';
import { Link, usePathname, useRouter } from '../i18n/navigation';
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
  /** Numbers offered when a search finds nobody, so a symptom search never dead-ends. */
  help: { emergency: Phone; hotline: Phone };
}

export function DoctorGrid({ doctors }: { doctors: DoctorSummary[] }) {
  const locale = useSiteLocale();
  // Cards glide out, in and into their new places as filters change (C-084); AutoAnimate turns
  // itself off for reduced motion.
  const [listRef] = useAutoAnimate<HTMLUListElement>({ duration: 220, easing: 'ease-out' });
  return (
    <ul
      ref={listRef}
      className="reveal-list grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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

export function DoctorDirectory({ doctors, departments, branches, help }: DoctorDirectoryProps) {
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
        <div
          className="flex flex-col items-start gap-4 rounded-panel border border-dashed border-border-strong p-8"
          data-testid="doctor-empty"
        >
          <p className="text-lg font-medium text-heading">{t('doctors.empty')}</p>
          <p className="text-text-muted">{t('doctors.emptyHelp')}</p>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${help.emergency.tel}`} className={buttonClassName('danger', 'md')}>
              <Icon name="siren" size={18} />
              {t('shell.emergency')} {help.emergency.display}
            </a>
            <a href={`tel:${help.hotline.tel}`} className={buttonClassName('secondary', 'md')}>
              <Icon name="phone" size={18} />
              {t('shell.callHotline')} {help.hotline.display}
            </a>
            <Link href="/departments" className={buttonClassName('ghost', 'md')}>
              {t('doctors.seeDepartments')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
