'use client';
// Test price search: by name or code in either language (Bangla digits accepted) and by category;
// a table on wide screens, stacked rows on phones (FR-WEB-TST-001, AT-WEB-022). Rows arrive from
// the server already formatted. Implements: T-WEB-09.
import { Field, Select, TextInput } from '@hms/ui';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { normalizeQuery } from '../content/normalize';

export interface TestRow {
  code: string;
  codeDisplay: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: string;
  reportTime: string;
  preparation: string;
  terms: string;
}

export function TestPriceList({
  rows,
  categories,
}: {
  rows: TestRow[];
  categories: { value: string; label: string }[];
}) {
  const t = useTranslations();
  // A link from the site search opens the list already filtered (?q=<code>).
  const [query, setQuery] = useState(useSearchParams().get('q') ?? '');
  const [category, setCategory] = useState('');
  const results = useMemo(() => {
    const normalized = normalizeQuery(query);
    return rows.filter(
      (row) =>
        (!category || row.category === category) && (!normalized || row.terms.includes(normalized)),
    );
  }, [rows, query, category]);

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="grid gap-4 rounded-panel border border-border bg-surface p-4 md:grid-cols-[2fr_1fr]"
      >
        <Field label={t('tests.searchLabel')}>
          {(control) => (
            <TextInput
              {...control}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          )}
        </Field>
        <Field label={t('tests.categoryLabel')}>
          {(control) => (
            <Select
              {...control}
              options={[{ value: '', label: t('tests.allCategories') }, ...categories]}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          )}
        </Field>
      </form>
      <p aria-live="polite" className="font-ui font-medium" data-testid="test-count">
        {t('tests.count', { count: results.length })}
      </p>
      {results.length === 0 ? (
        <p className="rounded-panel border border-dashed border-border-strong p-10 text-center text-text-muted">
          {t('tests.empty')}
        </p>
      ) : (
        <table className="w-full text-sm" data-testid="test-table">
          <caption className="sr-only">{t('tests.title')}</caption>
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-border text-text-muted">
              <th scope="col" className="py-2 text-start font-medium">
                {t('tests.code')}
              </th>
              <th scope="col" className="py-2 text-start font-medium">
                {t('tests.name')}
              </th>
              <th scope="col" className="py-2 text-start font-medium">
                {t('tests.categoryLabel')}
              </th>
              <th scope="col" className="py-2 text-start font-medium">
                {t('tests.reportTime')}
              </th>
              <th scope="col" className="py-2 text-end font-medium">
                {t('tests.price')}
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr
                key={row.code}
                className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border bg-surface px-3 py-3 md:table-row md:bg-transparent md:px-0"
              >
                <td className="font-ui text-xs text-text-muted md:py-3 md:text-sm">
                  {row.codeDisplay}
                </td>
                <th scope="row" className="col-start-1 text-start font-medium md:py-3">
                  {row.name}
                  {row.preparation ? (
                    <span className="block text-xs font-normal text-text-muted">
                      {row.preparation}
                    </span>
                  ) : null}
                </th>
                <td className="col-start-1 text-text-muted md:py-3">{row.categoryLabel}</td>
                <td className="col-start-1 text-text-muted md:py-3">{row.reportTime}</td>
                <td className="col-start-2 row-span-4 row-start-1 self-center text-end font-semibold text-heading md:py-3">
                  {row.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="font-ui text-xs text-text-muted">{t('tests.sampleNote')}</p>
    </div>
  );
}
