// Result groups and matching shared by the search page and the header search, so both list the
// same matches in the same order. Client-safe: it reads a built index and never the content
// files. Implements: T-WEB-17, FR-WEB-SRCH-001.
import type { SearchEntry, SearchKind } from '../content/search-index';

export const SEARCH_GROUPS = [
  { kind: 'doctor', key: 'search.group.doctor' },
  { kind: 'department', key: 'search.group.department' },
  { kind: 'centre', key: 'search.group.centre' },
  { kind: 'package', key: 'search.group.package' },
  { kind: 'test', key: 'search.group.test' },
  { kind: 'article', key: 'search.group.article' },
] as const satisfies readonly { kind: SearchKind; key: string }[];

/** A query shorter than two characters matches nothing, so one letter does not list everything. */
export const MIN_QUERY = 2;

export function matchEntries(index: readonly SearchEntry[], normalized: string): SearchEntry[] {
  return normalized.length < MIN_QUERY
    ? []
    : index.filter((entry) => entry.terms.includes(normalized));
}
