// Security headers for every public-site response (P-029, NFR-WEB-SEC-001). The policy is
// enforced, not report-only, and allows no third-party origin in WEB-A.
// Implements: T-WEB-01.

export interface HeaderEntry {
  key: string;
  value: string;
}

/**
 * Pages are statically generated (P-028), so a per-request nonce is not possible: Next.js
 * inlines its bootstrap scripts into the prebuilt HTML. Inline scripts are therefore allowed,
 * while `eval` stays blocked outside development (React Refresh needs it in `next dev`).
 */
export function contentSecurityPolicy(development: boolean): string {
  const scriptSrc = ["'self'", "'unsafe-inline'", ...(development ? ["'unsafe-eval'"] : [])];
  const connectSrc = ["'self'", ...(development ? ['ws:'] : [])];
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

export function securityHeaders(development: boolean): HeaderEntry[] {
  return [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy(development) },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ];
}
