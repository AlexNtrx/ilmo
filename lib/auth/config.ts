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

export const externalAdminAuthPathPrefix = "/api/auth/admin/";

/** Checks only the external Admin-plugin URL space protected by the auth route. */
export function isExternalAdminAuthPath(pathname: string) {
  return pathname.startsWith(externalAdminAuthPathPrefix);
}

export const emailAndPasswordPolicy = {
  enabled: true,
  disableSignUp: true,
} as const;

/**
 * Builds the verified Ilmo auth plugins with scalar admin/staff roles and
 * cookie handling last, as required by the Next.js integration.
 */
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
