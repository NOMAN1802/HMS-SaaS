// Any unknown path under a locale renders the localized not-found page with status 404, instead of
// the framework's language-less default (FR-WEB-INF-005). Implements: T-WEB-12.
import { notFound } from 'next/navigation';

export default function CatchAll() {
  notFound();
}
