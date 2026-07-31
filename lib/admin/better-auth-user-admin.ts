import "server-only";

import { auth } from "@/lib/auth";
import type { AuthenticatedUserAdmin } from "@/lib/admin/user-service";

export function createBetterAuthUserAdmin(
  requestHeaders: Headers,
): AuthenticatedUserAdmin {
  return {
    async createUser(input) {
      await auth.api.createUser({
        headers: requestHeaders,
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
          role: input.role,
          data: {
            username: input.username,
            displayUsername: input.displayUsername,
          },
        },
      });
    },
    async updateProfile(input) {
      await auth.api.adminUpdateUser({
        headers: requestHeaders,
        body: {
          userId: input.userId,
          data: {
            name: input.name,
            displayUsername: input.displayUsername,
            ...(input.username ? { username: input.username } : {}),
          },
        },
      });
    },
    async setRole(userId, role) {
      await auth.api.setRole({
        headers: requestHeaders,
        body: { userId, role },
      });
    },
    async setPassword(userId, password) {
      await auth.api.setUserPassword({
        headers: requestHeaders,
        body: { userId, newPassword: password },
      });
    },
    async revokeSessions(userId) {
      await auth.api.revokeUserSessions({
        headers: requestHeaders,
        body: { userId },
      });
    },
    async removeUser(userId) {
      await auth.api.removeUser({
        headers: requestHeaders,
        body: { userId },
      });
    },
  };
}
