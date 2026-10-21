'use client';
// Site-wide search results grouped by type, in the page language; accepts Bangla or English words
// and Bangla or Latin digits (FR-WEB-SRCH-001, AT-WEB-058). The query lives in the URL (?q=) so
// results can be shared. Implements: T-WEB-17.
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Field, TextInput } from '@hms/ui';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { normalizeQuery } from '../content/normalize';
import type { SearchEntry, SearchKind } from '../content/search-index';
import { Link, usePathname, useRouter } from '../i18n/navigation';

const GROUPS = [
  { kind: 'doctor', key: 'search.group.doctor' },
  { kind: 'department', key: 'search.group.department' },
  { kind: 'centre', key: 'search.group.centre' },
  { kind: 'package', key: 'search.group.package' },
  { kind: 'test', key: 'search.group.test' },
  { kind: 'article', key: 'search.group.article' },
] as const satisfies readonly { kind: SearchKind; key: string }[];

const PER_GROUP = 8;

export function SiteSearch({ index }: { index: SearchEntry[] }) {
  const t = useTranslations();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const normalized = normalizeQuery(query);

  const results = useMemo(
    () => (normalized.length < 2 ? [] : index.filter((entry) => entry.terms.includes(normalized))),
    [index, normalized],
  );

  function change(value: string) {
    setQuery(value);
    router.replace(value ? `${pathname}?q=${encodeURIComponent(value)}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <form role="search" onSubmit={(event) => event.preventDefault()} className="max-w-2xl">
        <Field label={t('search.label')}>
          {(control) => (
            <TextInput
              {...control}
              type="search"
              value={query}
              placeholder={t('search.placeholderAll')}
              onChange={(event) => change(event.target.value)}
              className="h-12 text-lg"
            />
          )}
        </Field>
      </form>
      <p aria-live="polite" className="font-ui font-medium" data-testid="search-count">
        {normalized.length < 2 ? t('search.hint') : t('search.results', { count: results.length })}
      </p>
      {GROUPS.map(({ kind, key }) => {
        const entries = results.filter((entry) => entry.kind === kind);
        if (entries.length === 0) return null;
        return (
          <section
            key={kind}
            aria-labelledby={`group-${kind}`}
            data-testid={`search-group-${kind}`}
          >
            <h2 id={`group-${kind}`} className="mb-3 text-xl font-semibold">
              {t(key)}
            </h2>
            <ResultList entries={entries.slice(0, PER_GROUP)} />
          </section>
        );
      })}
    </div>
  );
}

/** One group's results; entries glide in and out as the query changes (C-084). AutoAnimate turns
 * itself off for reduced motion. */
function ResultList({ entries }: { entries: SearchEntry[] }) {
  const [listRef] = useAutoAnimate<HTMLUListElement>({ duration: 200, easing: 'ease-out' });
  return (
    <ul ref={listRef} className="grid gap-3 md:grid-cols-2">
      {entries.map((entry) => (
        <li key={entry.href}>
          <Link
            href={entry.href}
            className="flex flex-col rounded-panel border border-border bg-surface p-4 transition-colors duration-200 hover:border-primary"
          >
            <span className="font-medium text-heading">{entry.label}</span>
            <span className="text-sm text-text-muted">{entry.detail}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
