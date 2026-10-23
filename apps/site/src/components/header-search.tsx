'use client';
// Header search: the search button opens a bar under the header instead of leaving the page, and
// matches show under it as the visitor types, grouped like the search page. The index is a static
// JSON file per language, fetched the first time the bar opens. Without JavaScript the button is a
// plain link to the search page. Escape, a click outside or a page change closes the bar and
// focus returns to the button; the arrow keys move between the input and the results.
// Implements: T-WEB-17, FR-WEB-SRCH-001, FR-WEB-NAV-*.
import { Icon, iconButtonClassName, Skeleton, TextInput } from '@hms/ui';
import { useLocale, useTranslations } from 'next-intl';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { normalizeQuery } from '../content/normalize';
import type { SearchEntry } from '../content/search-index';
import { Link, usePathname } from '../i18n/navigation';
import { Container } from './container';
import { matchEntries, MIN_QUERY, SEARCH_GROUPS } from './search-groups';

const PER_GROUP = 3;

type Status = 'loading' | 'ready' | 'failed';

// One request per language for the life of the page, shared by every opening of the bar.
const indexes = new Map<string, Promise<SearchEntry[]>>();

function loadIndex(locale: string): Promise<SearchEntry[]> {
  let request = indexes.get(locale);
  if (!request) {
    request = fetch(`/${locale}/search-index.json`).then((response) => {
      if (!response.ok) throw new Error(`Search index returned ${response.status}`);
      return response.json() as Promise<SearchEntry[]>;
    });
    // A failed request is forgotten, so the next opening tries again.
    request.catch(() => indexes.delete(locale));
    indexes.set(locale, request);
  }
  return request;
}

export function HeaderSearch() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchEntry[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const toggleRef = useRef<HTMLAnchorElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = normalizeQuery(query);
  const results = useMemo(() => matchEntries(index, normalized), [index, normalized]);
  const searchHref =
    normalized.length >= MIN_QUERY ? `/search?q=${encodeURIComponent(query)}` : '/search';

  function toggle(event: MouseEvent<HTMLAnchorElement>) {
    // A modified click still opens the search page in a new tab.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    setOpen((current) => !current);
  }

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    let current = true;
    loadIndex(locale).then(
      (entries) => {
        if (!current) return;
        setIndex(entries);
        setStatus('ready');
      },
      () => {
        if (current) setStatus('failed');
      },
    );
    function outside(event: PointerEvent) {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', outside);
    return () => {
      current = false;
      document.removeEventListener('pointerdown', outside);
    };
  }, [open, locale]);

  // A chosen result changes the page; the bar closes and starts empty next time.
  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [pathname]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      toggleRef.current?.focus();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const stops = [
      inputRef.current,
      ...(panelRef.current?.querySelectorAll<HTMLAnchorElement>('[data-search-result]') ?? []),
    ].filter((stop): stop is HTMLInputElement | HTMLAnchorElement => stop !== null);
    const at = stops.indexOf(document.activeElement as HTMLInputElement | HTMLAnchorElement);
    const next =
      event.key === 'ArrowDown' ? Math.min(at + 1, stops.length - 1) : Math.max(at - 1, 0);
    event.preventDefault();
    stops[next]?.focus();
  }

  return (
    <>
      <Link
        ref={toggleRef}
        href="/search"
        onClick={toggle}
        aria-label={open ? t('search.close') : t('search.headerLink')}
        title={open ? t('search.close') : t('search.headerLink')}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={iconButtonClassName('secondary')}
        data-testid="header-search-toggle"
      >
        <Icon name={open ? 'close' : 'search'} />
      </Link>
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          onKeyDown={onKeyDown}
          className="search-panel absolute inset-x-0 top-full border-b border-border bg-surface shadow-overlay"
          data-testid="header-search"
        >
          <Container className="py-4">
            <form
              role="search"
              onSubmit={(event) => event.preventDefault()}
              className="flex items-center gap-3"
            >
              <label htmlFor={`${panelId}-input`} className="sr-only">
                {t('search.headerLink')}
              </label>
              <span className="relative flex-1">
                <Icon
                  name="search"
                  size={20}
                  className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <TextInput
                  ref={inputRef}
                  id={`${panelId}-input`}
                  type="search"
                  autoComplete="off"
                  value={query}
                  placeholder={t('search.placeholderAll')}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-12 ps-12 text-lg"
                />
              </span>
            </form>
            <div aria-live="polite" className="sr-only" data-testid="header-search-count">
              {normalized.length >= MIN_QUERY && status === 'ready'
                ? t('search.results', { count: results.length })
                : ''}
            </div>
            <SearchPanelBody
              status={status}
              normalized={normalized}
              results={results}
              searchHref={searchHref}
            />
          </Container>
        </div>
      ) : null}
    </>
  );
}

function SearchPanelBody({
  status,
  normalized,
  results,
  searchHref,
}: {
  status: Status;
  normalized: string;
  results: SearchEntry[];
  searchHref: string;
}) {
  const t = useTranslations();
  if (normalized.length < MIN_QUERY) {
    return <p className="mt-3 text-sm text-text-muted">{t('search.hint')}</p>;
  }
  if (status === 'failed') {
    return (
      <p className="mt-3 text-sm">
        <Link href={searchHref} className="font-medium text-primary underline underline-offset-4">
          {t('search.failed')}
        </Link>
      </p>
    );
  }
  if (status === 'loading') {
    return (
      <div className="mt-4 grid gap-3 md:grid-cols-2" aria-busy="true">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-14" />
        ))}
      </div>
    );
  }
  if (results.length === 0) {
    return <p className="mt-3 text-sm text-text-muted">{t('search.none')}</p>;
  }
  return (
    <div className="mt-4 flex max-h-[min(60vh,32rem)] flex-col gap-4 overflow-y-auto overscroll-contain">
      <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
        {SEARCH_GROUPS.map(({ kind, key }) => {
          const entries = results.filter((entry) => entry.kind === kind).slice(0, PER_GROUP);
          if (entries.length === 0) return null;
          return (
            <section key={kind} aria-labelledby={`header-group-${kind}`}>
              <h2
                id={`header-group-${kind}`}
                className="mb-1 font-ui text-xs font-semibold tracking-wide text-text-muted uppercase"
              >
                {t(key)}
              </h2>
              <ul className="flex flex-col">
                {entries.map((entry) => (
                  <li key={entry.href}>
                    <Link
                      href={entry.href}
                      data-search-result=""
                      className="-mx-2 flex flex-col rounded-control px-2 py-2 transition-colors duration-150 hover:bg-primary-soft focus-visible:bg-primary-soft"
                    >
                      <span className="font-medium text-heading">{entry.label}</span>
                      <span className="truncate text-sm text-text-muted">{entry.detail}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <Link
        href={searchHref}
        data-search-result=""
        className="inline-flex w-fit items-center gap-1 font-ui text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        {t('search.seeAll', { count: results.length })}
        <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
      </Link>
    </div>
  );
}
