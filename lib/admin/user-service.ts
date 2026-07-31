import type { ManagedRole } from "@/lib/admin/types";

export type UserRecord = {
  id: string;
  username: string | null;
  role: string | null;
};

export type UserStore = {
  findUser(id: string): Promise<UserRecord | null>;
  countAdmins(): Promise<number>;
};

export type AuthenticatedUserAdmin = {
  createUser(input: {
    email: string;
    password: string;
    name: string;
    username: string;
    displayUsername: string;
    role: ManagedRole;
  }): Promise<void>;
  updateProfile(input: {
    userId: string;
    name: string;
    username?: string;
    displayUsername: string;
  }): Promise<void>;
  setRole(userId: string, role: ManagedRole): Promise<void>;
  setPassword(userId: string, password: string): Promise<void>;
  revokeSessions(userId: string): Promise<void>;
  removeUser(userId: string): Promise<void>;
};

export function createUserService({
  store,
  userAdmin,
  createInternalEmail,
}: {
  store: UserStore;
  userAdmin: AuthenticatedUserAdmin;
  createInternalEmail: () => string;
}) {
  return {
    async create(input: {
      username: string;
      name: string;
      password: string;
      role: ManagedRole;
    }) {
      await userAdmin.createUser({
        ...input,
        email: createInternalEmail(),
        username: input.username.toLowerCase(),
        displayUsername: input.username,
      });
      return { status: "SUCCESS" as const };
    },
    async updateProfile(input: {
      userId: string;
      username: string;
      name: string;
    }) {
      const user = await store.findUser(input.userId);
      if (!user) {
        return { status: "NOT_FOUND" as const };
      }

      const normalizedUsername = input.username.toLowerCase();
      await userAdmin.updateProfile({
        userId: input.userId,
        name: input.name,
        displayUsername: input.username,
        ...(user.username === normalizedUsername
          ? {}
          : { username: normalizedUsername }),
      });
      return { status: "SUCCESS" as const };
    },
    async changeRole(input: {
      userId: string;
      role: ManagedRole;
    }) {
      const user = await store.findUser(input.userId);
      if (!user) {
        return { status: "NOT_FOUND" as const };
      }
      if (user.role === input.role) {
        return { status: "SUCCESS" as const };
      }
      if (
        user.role === "admin" &&
        input.role === "staff" &&
        (await store.countAdmins()) <= 1
      ) {
        return { status: "LAST_ADMIN" as const };
      }

      await userAdmin.setRole(input.userId, input.role);
      return { status: "SUCCESS" as const };
    },
    async resetPassword(input: {
      actorId: string;
      userId: string;
      password: string;
    }) {
      if (!(await store.findUser(input.userId))) {
        return { status: "NOT_FOUND" as const };
      }

      await userAdmin.setPassword(input.userId, input.password);
      try {
        await userAdmin.revokeSessions(input.userId);
      } catch {
        return { status: "PARTIAL_FAILURE" as const };
      }

      return {
        status:
          input.actorId === input.userId
            ? ("SELF_SESSION_REVOKED" as const)
            : ("SUCCESS" as const),
      };
    },
    async delete(input: { actorId: string; userId: string }) {
      if (input.actorId === input.userId) {
        return { status: "SELF_DELETE" as const };
      }
      const user = await store.findUser(input.userId);
      if (!user) {
        return { status: "NOT_FOUND" as const };
      }
      if (user.role === "admin" && (await store.countAdmins()) <= 1) {
        return { status: "LAST_ADMIN" as const };
      }

      await userAdmin.removeUser(input.userId);
      return { status: "SUCCESS" as const };
    },
  };
}
