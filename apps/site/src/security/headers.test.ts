// Security header checks (T-WEB-01, P-029, AT-WEB-006 unit part).
import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, securityHeaders } from './headers';

describe('content security policy', () => {
  it('blocks eval and third-party origins in production', () => {
    const csp = contentSecurityPolicy(false);
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).toContain("default-src 'self'");
    expect(csp).not.toMatch(/https?:/);
  });

  it('forbids framing, plugins and foreign form targets', () => {
    const csp = contentSecurityPolicy(false);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("form-action 'self'");
  });

  it('allows eval and the dev websocket only in development', () => {
    const csp = contentSecurityPolicy(true);
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain('ws:');
  });
});

describe('security headers', () => {
  it('sends the full header set', () => {
    const keys = securityHeaders(false).map((header) => header.key);
    expect(keys).toEqual([
      'Content-Security-Policy',
      'Referrer-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Permissions-Policy',
    ]);
  });
});
