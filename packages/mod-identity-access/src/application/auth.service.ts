// Login, hospital selection, session resolution and logout (UC-ACC-01, FR-ACC-001/002/005,
// ADR-004). Pre-hospital events go to auth_event; once a hospital is bound, the hospital's own
// audit trail also records the login (decision 1 of the T-ACC-01 plan). T-ACC-03 adds the login
// rate limit and the lock after repeated wrong passwords (FR-ACC-004, NFR-SEC-005, C-032).
import { Inject, Injectable } from '@nestjs/common';
import type {
  LoginRequest,
  MembershipSummary,
  SessionResponse,
  UpdatePreferencesRequest,
} from '@hms/contracts';
import { withTenant, type PrismaClient } from '@hms/database';
import { DomainError, type Clock } from '@hms/domain-kernel';
import { appendAuditEvent, PRISMA } from '@hms/platform';
import {
  assertAccountCanLogin,
  isAccountUsable,
  normalizeUsername,
  safeUsernameForLog,
} from '../domain/account-policy.js';
import {
  isSessionExpired,
  newSessionTimes,
  shouldTouch,
  slideIdleExpiry,
} from '../domain/session-policy.js';
import { csrfTokenFor } from '../infrastructure/csrf-token.js';
import { stateAfterFailedLogin } from '../domain/lockout-policy.js';
import {
  appendAuthEvent,
  applyFailedLogin,
  clearFailedLogins,
  findSessionByTokenHash,
  findUserById,
  findUserByUsername,
  insertSession,
  isMembershipActive,
  listMembershipsForUser,
  replaceSession,
  revokeSession,
  setPreferredLang,
  touchSession,
  type MembershipRecord,
  type UserRecord,
} from '../infrastructure/identity.repository.js';
import { verifyAgainstDummy, verifyPassword } from '../infrastructure/password-hasher.js';
import { hashSessionToken, newSessionToken } from '../infrastructure/session-token.js';
import { AUTH_CONFIG, CLOCK, type AuthConfig } from './auth.config.js';
import { LOGIN_THROTTLE, type LoginThrottle } from './login-throttle.js';

export interface AuthContext {
  userId: string;
  tenantId: string | null;
  membershipId: string | null;
  tokenHash: Uint8Array<ArrayBuffer>;
  absoluteExpiresAt: Date;
}

export interface RequestMeta {
  ipAddress?: string;
  correlationId?: string;
}

export interface IssuedSession {
  token: string;
  session: SessionResponse;
}

type Outcome = 'SUCCEEDED' | 'DENIED' | 'FAILED';

const INVALID = 'Invalid username or password';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(LOGIN_THROTTLE) private readonly throttle: LoginThrottle,
  ) {}

  async login(input: LoginRequest, meta: RequestMeta): Promise<IssuedSession> {
    const username = normalizeUsername(input.username);
    await this.throttle.assertAllowed(meta.ipAddress, username, this.clock.now());
    const user = await findUserByUsername(this.prisma, username);
    if (!user) {
      await verifyAgainstDummy(input.password);
      const loggable = safeUsernameForLog(username);
      await this.authEvent('auth.login.failed', 'FAILED', meta, {
        ...(loggable ? { usernameAttempted: loggable } : {}),
        reason: 'UNKNOWN_USER',
      });
      throw new DomainError('INVALID_CREDENTIALS', INVALID);
    }

    // The password is checked first, so lock and disabled states are only revealed to someone
    // who knows the password (otherwise status would leak to anyone who guesses a username).
    if (!(await verifyPassword(user.passwordHash, input.password))) {
      const now = this.clock.now();
      const next = await applyFailedLogin(this.prisma, user.id, (current) =>
        stateAfterFailedLogin(current, now, this.config.lockout),
      );
      await this.authEvent('auth.login.failed', 'FAILED', meta, {
        userId: user.id,
        reason: 'BAD_PASSWORD',
      });
      // FR-ACC-004: the lock itself is an event, so support can see when and from where the
      // last failure came. The caller still gets INVALID_CREDENTIALS (status only after a
      // correct password, see above).
      if (next?.status === 'LOCKED_TEMPORARY') {
        await this.authEvent('auth.account.locked', 'SUCCEEDED', meta, {
          userId: user.id,
          reason: 'FAILED_LOGINS',
        });
      }
      throw new DomainError('INVALID_CREDENTIALS', INVALID);
    }

    try {
      assertAccountCanLogin(user, this.clock.now());
    } catch (error) {
      const reason = error instanceof DomainError ? error.code : 'ACCOUNT_CHECK_FAILED';
      await this.authEvent('auth.login.failed', 'DENIED', meta, { userId: user.id, reason });
      throw error;
    }

    const memberships = await this.activeMemberships(user.id);
    if (memberships.length === 0) {
      await this.authEvent('auth.login.failed', 'DENIED', meta, {
        userId: user.id,
        reason: 'NO_ACTIVE_MEMBERSHIP',
      });
      throw new DomainError('MEMBERSHIP_NOT_ACTIVE', 'Access to this hospital is not active');
    }

    await clearFailedLogins(this.prisma, user.id);
    // FR-ACC-002: with exactly one hospital the choice is automatic (UC-ACC-01 A1).
    const bound = memberships.length === 1 ? (memberships[0] ?? null) : null;
    const issued = await this.startSession(user, memberships, bound, meta);
    await this.authEvent('auth.login.succeeded', 'SUCCEEDED', meta, { userId: user.id });
    return issued;
  }

  async selectMembership(
    ctx: AuthContext,
    membershipId: string,
    meta: RequestMeta,
  ): Promise<IssuedSession> {
    const user = await this.requireUser(ctx.userId);
    const memberships = await this.activeMemberships(user.id);
    const chosen = memberships.find((m) => m.id === membershipId);
    // Another user's or an inactive membership looks the same as a missing one (D section 8.3).
    if (!chosen) throw new DomainError('NOT_FOUND', 'Membership not found');

    // ADR-004: a new session ID on hospital switch. The old token is revoked and the new
    // session created in one transaction, so a concurrent logout or switch cannot leave two
    // valid sessions or revive a logged-out one. The new session keeps the old absolute expiry
    // (FR-ACC-003, C-032).
    return this.startSession(user, memberships, chosen, meta, {
      absoluteLimit: ctx.absoluteExpiresAt,
      replacing: ctx.tokenHash,
    });
  }

  async resolveSession(token: string): Promise<AuthContext | null> {
    const tokenHash = hashSessionToken(token);
    const session = await findSessionByTokenHash(this.prisma, tokenHash);
    const now = this.clock.now();
    if (!session || isSessionExpired(session, now)) return null;

    // Disabling the account or ending the hospital access must stop an open session on the
    // next request (FR-ACC-010, ADR-004).
    // The session is also revoked for good here, so restoring access later cannot revive an
    // old (or stolen) cookie. The database also revokes at the moment access is removed
    // (migration revoke_sessions_on_access_change); this covers anything that slipped through.
    const user = await findUserById(this.prisma, session.userId);
    const accessOk =
      user !== null &&
      isAccountUsable(user, now) &&
      (!session.membershipId ||
        (await isMembershipActive(this.prisma, session.userId, session.membershipId)));
    if (!accessOk) {
      await revokeSession(this.prisma, tokenHash, now);
      return null;
    }

    if (shouldTouch(session.lastSeenAt, now)) {
      const idleExpiresAt = slideIdleExpiry(session, now, this.config.timeouts);
      await touchSession(this.prisma, tokenHash, now, idleExpiresAt);
    }
    return {
      userId: session.userId,
      tenantId: session.tenantId,
      membershipId: session.membershipId,
      tokenHash,
      absoluteExpiresAt: session.absoluteExpiresAt,
    };
  }

  async describeSession(ctx: AuthContext, token: string): Promise<SessionResponse> {
    const user = await this.requireUser(ctx.userId);
    const session = await findSessionByTokenHash(this.prisma, ctx.tokenHash);
    if (!session) throw new DomainError('UNAUTHENTICATED', 'Session ended');
    const memberships = await this.activeMemberships(user.id);
    return this.toResponse(user, memberships, ctx.membershipId, token, session);
  }

  async updatePreferences(
    ctx: AuthContext,
    input: UpdatePreferencesRequest,
    token: string,
  ): Promise<SessionResponse> {
    await setPreferredLang(this.prisma, ctx.userId, input.preferredLang);
    return this.describeSession(ctx, token);
  }

  async logout(ctx: AuthContext, meta: RequestMeta): Promise<void> {
    await revokeSession(this.prisma, ctx.tokenHash, this.clock.now());
    if (ctx.tenantId && ctx.membershipId) {
      await this.tenantAudit(ctx.tenantId, ctx.userId, ctx.membershipId, 'auth.logout', meta);
    }
    await this.authEvent('auth.logout', 'SUCCEEDED', meta, { userId: ctx.userId });
  }

  private async startSession(
    user: UserRecord,
    memberships: MembershipRecord[],
    bound: MembershipRecord | null,
    meta: RequestMeta,
    options: { absoluteLimit?: Date; replacing?: Uint8Array<ArrayBuffer> } = {},
  ): Promise<IssuedSession> {
    const { absoluteLimit, replacing } = options;
    const token = newSessionToken();
    const now = this.clock.now();
    const fresh = newSessionTimes(now, this.config.timeouts);
    const times = absoluteLimit
      ? {
          absoluteExpiresAt: absoluteLimit,
          idleExpiresAt: new Date(Math.min(fresh.idleExpiresAt.getTime(), absoluteLimit.getTime())),
        }
      : fresh;
    const row = {
      tokenHash: hashSessionToken(token),
      userId: user.id,
      tenantId: bound?.tenantId ?? null,
      membershipId: bound?.id ?? null,
      createdAt: now,
      ...times,
    };
    if (replacing) {
      if (!(await replaceSession(this.prisma, replacing, now, row))) {
        throw new DomainError('UNAUTHENTICATED', 'Session ended');
      }
    } else {
      await insertSession(this.prisma, row);
    }
    if (bound) {
      await this.tenantAudit(bound.tenantId, user.id, bound.id, 'auth.login.succeeded', meta);
    }
    const session = this.toResponse(user, memberships, bound?.id ?? null, token, times);
    return { token, session };
  }

  private toResponse(
    user: UserRecord,
    memberships: MembershipRecord[],
    activeMembershipId: string | null,
    token: string,
    times: { idleExpiresAt: Date; absoluteExpiresAt: Date },
  ): SessionResponse {
    return {
      user: {
        id: user.id,
        displayName: user.displayName,
        preferredLang: user.preferredLang === 'bn_BD' ? 'bn-BD' : 'en',
      },
      memberships: memberships.map(toSummary),
      activeMembershipId,
      csrfToken: csrfTokenFor(token, this.config.csrfSecret),
      idleExpiresAt: times.idleExpiresAt.toISOString(),
      absoluteExpiresAt: times.absoluteExpiresAt.toISOString(),
    };
  }

  private async activeMemberships(userId: string): Promise<MembershipRecord[]> {
    const all = await listMembershipsForUser(this.prisma, userId);
    return all.filter((m) => m.status === 'ACTIVE');
  }

  private async requireUser(userId: string): Promise<UserRecord> {
    const user = await findUserById(this.prisma, userId);
    if (!user) throw new DomainError('UNAUTHENTICATED', 'Session ended');
    return user;
  }

  private tenantAudit(
    tenantId: string,
    userId: string,
    membershipId: string,
    action: string,
    meta: RequestMeta,
  ): Promise<void> {
    return withTenant(this.prisma, { tenantId, userId }, (tx) =>
      appendAuditEvent(tx, {
        tenantId,
        action,
        outcome: 'SUCCEEDED',
        actorUserId: userId,
        membershipId,
        ...(meta.correlationId ? { correlationId: meta.correlationId } : {}),
      }),
    );
  }

  private authEvent(
    action: string,
    outcome: Outcome,
    meta: RequestMeta,
    extra: { userId?: string; usernameAttempted?: string; reason?: string },
  ): Promise<void> {
    return appendAuthEvent(this.prisma, { action, outcome, ...meta, ...extra });
  }
}

function toSummary(m: MembershipRecord): MembershipSummary {
  return {
    id: m.id,
    tenantId: m.tenantId,
    tenantNameEn: m.tenantNameEn,
    tenantNameBn: m.tenantNameBn,
  };
}
