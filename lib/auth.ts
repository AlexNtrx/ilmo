import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { admin, username } from "better-auth/plugins";

import {
  adminRole,
  ilmoAccessControl,
  staffRole,
} from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [
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
  ],
});
