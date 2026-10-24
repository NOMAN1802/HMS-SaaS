// Security header checks (T-WEB-01, T-WEB-18, P-029, P-047, AT-WEB-006 and AT-WEB-067 unit part).
import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, securityHeaders } from './headers';

describe('content security policy', () => {
  it('blocks eval and third-party origins in production', () => {
    const csp = contentSecurityPolicy({ development: false });
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).toContain("default-src 'self'");
    expect(csp).not.toMatch(/https?:/);
  });

  it('forbids framing, plugins and foreign form targets', () => {
    const csp = contentSecurityPolicy({ development: false });
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("form-action 'self'");
  });

  it('allows eval and the dev websocket only in development', () => {
    const csp = contentSecurityPolicy({ development: true });
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain('ws:');
  });

  it('lets the staff app call the API host and nothing else', () => {
    const csp = contentSecurityPolicy({
      development: false,
      connectSources: ['https://healthcareapi.bytespate.com'],
    });
    expect(csp).toContain("connect-src 'self' https://healthcareapi.bytespate.com;");
    expect(csp).toContain("script-src 'self' 'unsafe-inline';");
  });
});

describe('security headers', () => {
  it('sends the full header set', () => {
    const keys = securityHeaders({ development: false }).map((header) => header.key);
    expect(keys).toEqual([
      'Content-Security-Policy',
      'Referrer-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Permissions-Policy',
    ]);
  });
});
