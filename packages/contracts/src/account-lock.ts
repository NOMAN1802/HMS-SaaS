// Account lock administration and diagnostics payloads (T-ACC-03; UC-ACC-02; FR-ACC-004,
// FR-SUP-003). Diagnostics carry IDs, codes and times only, never clinical data.
import { z } from 'zod';

export const accountLockRequestSchema = z.object({
  // Kept with the lock and in the audit trail, so the next administrator knows why.
  reason: z.string().trim().min(3).max(500),
});
export type AccountLockRequest = z.infer<typeof accountLockRequestSchema>;

export const loginAttemptSchema = z.object({
  occurredAt: z.iso.datetime(),
  action: z.string(),
  outcome: z.enum(['SUCCEEDED', 'DENIED', 'FAILED']),
  reason: z.string().nullable(),
  ipAddress: z.string().nullable(),
  correlationId: z.string().nullable(),
});
export type LoginAttempt = z.infer<typeof loginAttemptSchema>;

export const accountLockStatusSchema = z.object({
  userId: z.uuid(),
  username: z.string(),
  status: z.enum(['ACTIVE', 'LOCKED_TEMPORARY', 'LOCKED_ADMIN', 'DISABLED']),
  failedAttempts: z.number().int().nonnegative(),
  lockedAt: z.iso.datetime().nullable(),
  lockedUntil: z.iso.datetime().nullable(),
  lockReason: z.enum(['FAILED_LOGINS', 'ADMIN_ACTION']).nullable(),
  lockNote: z.string().nullable(),
  lockedByUserId: z.uuid().nullable(),
  /** Most recent login events first, with the source IP of each attempt. */
  recentAttempts: z.array(loginAttemptSchema),
});
export type AccountLockStatus = z.infer<typeof accountLockStatusSchema>;
