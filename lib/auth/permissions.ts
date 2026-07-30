import { createAccessControl } from "better-auth/plugins/access";

export const ilmoPermissionStatements = {
  user: [
    "create",
    "list",
    "get",
    "update",
    "set-role",
    "set-password",
    "delete",
  ],
  session: ["revoke"],
} as const;

export const ilmoAccessControl = createAccessControl(
  ilmoPermissionStatements,
);

export const adminRole = ilmoAccessControl.newRole({
  user: [
    "create",
    "list",
    "get",
    "update",
    "set-role",
    "set-password",
    "delete",
  ],
  session: ["revoke"],
});

export const staffRole = ilmoAccessControl.newRole({
  user: [],
  session: [],
});

export const ilmoRoles = {
  admin: adminRole,
  staff: staffRole,
} as const;

export type IlmoRole = keyof typeof ilmoRoles;
