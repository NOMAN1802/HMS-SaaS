// Hospital administration endpoints (T-ACC-05; FR-ACC-007, FR-ACC-008, FR-ACC-010; T-ACC-03 locks).
// Every answer is validated against the shared contract; the API checks each permission again.
import {
  type AccountLockStatus,
  accountLockStatusSchema,
  type AdminRole,
  adminRoleListSchema,
  adminRoleSchema,
  type AdminUser,
  adminUserListSchema,
  adminUserSchema,
  type CreateRoleRequest,
  type CreateUserRequest,
  type PermissionCode,
  type SetMembershipStatusRequest,
} from '@hms/contracts';
import { apiRequest } from './client';

const user = (data: unknown): AdminUser => adminUserSchema.parse(data);
const role = (data: unknown): AdminRole => adminRoleSchema.parse(data);
const lock = (data: unknown): AccountLockStatus => accountLockStatusSchema.parse(data);

export const adminApi = {
  users: () => apiRequest('/admin/users', { parse: (data) => adminUserListSchema.parse(data) }),
  createUser: (body: CreateUserRequest) =>
    apiRequest('/admin/users', { method: 'POST', body, parse: user }),
  setRoles: (userId: string, roleIds: string[]) =>
    apiRequest(`/admin/users/${userId}/roles`, { method: 'PUT', body: { roleIds }, parse: user }),
  setMembershipStatus: (userId: string, body: SetMembershipStatusRequest) =>
    apiRequest(`/admin/users/${userId}/membership`, { method: 'POST', body, parse: user }),
  resetPassword: (userId: string, temporaryPassword: string, reason: string) =>
    apiRequest(`/admin/users/${userId}/password`, {
      method: 'POST',
      body: { temporaryPassword, reason },
      parse: user,
    }),
  resetMfa: (userId: string, reason: string) =>
    apiRequest(`/admin/users/${userId}/mfa/reset`, {
      method: 'POST',
      body: { reason },
      parse: user,
    }),
  lock: (userId: string, reason: string) =>
    apiRequest(`/admin/users/${userId}/lock`, { method: 'POST', body: { reason }, parse: lock }),
  unlock: (userId: string, reason: string) =>
    apiRequest(`/admin/users/${userId}/unlock`, { method: 'POST', body: { reason }, parse: lock }),
  roles: () => apiRequest('/admin/roles', { parse: (data) => adminRoleListSchema.parse(data) }),
  createRole: (body: CreateRoleRequest) =>
    apiRequest('/admin/roles', { method: 'POST', body, parse: role }),
  setPermissions: (roleId: string, permissions: PermissionCode[]) =>
    apiRequest(`/admin/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: { permissions },
      parse: role,
    }),
};
