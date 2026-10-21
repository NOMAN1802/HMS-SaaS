'use client';
// Hero search: suggests departments and doctors as the visitor types, in both languages and with
// Bangla digits (FR-WEB-HOME-*, SM-W04). Submitting goes to the doctor directory with the query;
// without JavaScript the form still submits there. Suggestions are plain links.
// Implements: T-WEB-06.
import { Button, Icon, TextInput } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { useId, useMemo, useState } from 'react';
import { normalizeQuery } from '../content/normalize';
import { Link, useRouter } from '../i18n/navigation';
import { localePrefixes } from '../i18n/routing';
import { useSiteLocale } from '../i18n/locale';

export interface SearchSuggestion {
  kind: 'doctor' | 'department';
  label: string;
  detail: string;
  href: string;
  /** Text matched against the query: both languages, already normalized. */
  terms: string;
}

const MAX_RESULTS = 8;

export function HeroSearch({ suggestions }: { suggestions: SearchSuggestion[] }) {
  const t = useTranslations();
  const locale = useSiteLocale();
  const router = useRouter();
  const inputId = useId();
  const resultsId = useId();
  const [query, setQuery] = useState('');
  const normalized = normalizeQuery(query);

  const results = useMemo(
    () =>
      normalized.length < 2
        ? []
        : suggestions.filter((item) => item.terms.includes(normalized)).slice(0, MAX_RESULTS),
    [normalized, suggestions],
  );

  return (
    <form
      role="search"
      action={`${localePrefixes[locale]}/doctors`}
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(query.trim() ? `/doctors?q=${encodeURIComponent(query.trim())}` : '/doctors');
      }}
      className="relative w-full max-w-xl"
    >
      <label htmlFor={inputId} className="sr-only">
        {t('search.label')}
      </label>
      <div className="flex gap-2 rounded-panel bg-surface p-2 shadow-overlay">
        <div className="relative flex-1">
          <Icon
            name="search"
            size={20}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <TextInput
            id={inputId}
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search.placeholder')}
            autoComplete="off"
            aria-describedby={resultsId}
            className="h-11 border-transparent ps-10"
          />
        </div>
        <Button type="submit" size="lg">
          {t('search.submit')}
        </Button>
      </div>
      <p id={resultsId} className="sr-only" aria-live="polite">
        {normalized.length >= 2 ? t('search.results', { count: results.length }) : ''}
      </p>
      {results.length > 0 ? (
        <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-panel border border-border bg-surface shadow-overlay">
          {results.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 hover:bg-primary-soft"
              >
                <Icon
                  name={item.kind === 'doctor' ? 'user' : 'stethoscope'}
                  size={20}
                  className="text-primary"
                />
                <span className="flex flex-col">
                  <span className="font-medium text-text">{item.label}</span>
                  <span className="text-sm text-text-muted">
                    {item.kind === 'doctor' ? t('search.kindDoctor') : t('search.kindDepartment')}
                    {' . '}
                    {item.detail}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
