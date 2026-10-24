// Security headers shared by the public site and the staff app (P-029, P-047, NFR-WEB-SEC-001,
// NFR-WEB-SEC-002). On the shared host both apps live on one origin, so a weakness in either
// reaches both (C-080): they send the same enforced policy. The only difference is the staff
// app's `connect-src`, which must allow the API host. Exported as `@hms/ui/security` and used
// from each app's next.config.ts. Implements: T-WEB-01, T-WEB-18.

export interface HeaderEntry {
  key: string;
  value: string;
}

export interface SecurityHeaderOptions {
  /** `next dev`: React Refresh needs `eval` and a websocket. */
  development: boolean;
  /** Origins the page may call besides its own, such as the API host. */
  connectSources?: readonly string[];
}

/**
 * Next.js inlines its bootstrap scripts, and the site's pages are prebuilt (P-028), so a
 * per-request nonce is not possible: inline scripts are allowed, while `eval` stays blocked
 * outside development.
 */
export function contentSecurityPolicy({
  development,
  connectSources = [],
}: SecurityHeaderOptions): string {
  const scriptSrc = ["'self'", "'unsafe-inline'", ...(development ? ["'unsafe-eval'"] : [])];
  const connectSrc = ["'self'", ...connectSources, ...(development ? ['ws:'] : [])];
  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connectSrc.join(' ')}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

export function securityHeaders(options: SecurityHeaderOptions): HeaderEntry[] {
  return [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy(options) },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ];
}
