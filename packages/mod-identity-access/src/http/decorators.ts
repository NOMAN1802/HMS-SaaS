// Route markers read by the global guards (D section 7.2). Every handler carries exactly one:
// @Public, @AllowWithoutTenant or @RequirePermission. A handler with none is refused (T-ACC-02).
import { SetMetadata } from '@nestjs/common';
import type { PermissionCode } from '@hms/contracts';

export const PUBLIC_KEY = 'hms:public';
export const ALLOW_WITHOUT_TENANT_KEY = 'hms:allow-without-tenant';
export const REQUIRED_PERMISSIONS_KEY = 'hms:required-permissions';

/** No session needed (login, health). Also skips CSRF and the hospital check. */
export const Public = () => SetMetadata(PUBLIC_KEY, true);

/** Session needed, but no hospital yet (session info, hospital selection, logout). */
export const AllowWithoutTenant = () => SetMetadata(ALLOW_WITHOUT_TENANT_KEY, true);

/**
 * Session, hospital and every listed permission needed. Codes come from the catalogue in
 * @hms/contracts, so a misspelled code fails typecheck. On a controller it applies to every
 * handler, and a handler's own codes are added to it.
 */
export const RequirePermission = (...codes: [PermissionCode, ...PermissionCode[]]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, codes);
