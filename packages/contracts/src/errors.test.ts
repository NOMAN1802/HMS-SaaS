import { describe, expect, it } from 'vitest';
import { errorCodes } from './errors.js';

describe('errorCodes', () => {
  it('maps auth codes to the D 8.3 HTTP statuses', () => {
    expect(errorCodes.UNAUTHENTICATED).toBe(401);
    expect(errorCodes.INVALID_CREDENTIALS).toBe(401);
    expect(errorCodes.CSRF_TOKEN_INVALID).toBe(403);
    expect(errorCodes.TENANT_NOT_SELECTED).toBe(403);
    expect(errorCodes.ACCOUNT_LOCKED).toBe(423);
    expect(errorCodes.PERMISSION_DENIED).toBe(403);
    expect(errorCodes.ENTITLEMENT_MISSING).toBe(403);
    expect(errorCodes.VALIDATION_FAILED).toBe(422);
  });
});
