import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";

import {
  createIlmoAuthPlugins,
  disabledPublicAuthPaths,
  emailAndPasswordPolicy,
} from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  disabledPaths: [...disabledPublicAuthPaths],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: emailAndPasswordPolicy,
  plugins: createIlmoAuthPlugins(),
});
