// Locale-aware links and navigation for the public site: `Link href="/doctors"` renders
// `/bn/doctors` or `/en/doctors` for the current language. Implements: T-WEB-01, P-023.
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
