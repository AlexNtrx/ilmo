import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";

import {
  adminRole,
  ilmoAccessControl,
  staffRole,
} from "@/lib/auth/permissions";

export const disabledPublicAuthPaths = [
  "/sign-up/email",
  "/sign-in/email",
  "/is-username-available",
] as const;

export const emailAndPasswordPolicy = {
  enabled: true,
  disableSignUp: true,
} as const;

export function createIlmoAuthPlugins() {
  return [
    username(),
    admin({
      ac: ilmoAccessControl,
      roles: {
        admin: adminRole,
        staff: staffRole,
      },
      defaultRole: "staff",
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ];
}
