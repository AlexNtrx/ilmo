import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseStaffRole } from "@/lib/staff/roles";
import type { StaffActor } from "@/lib/staff/types";

export async function getStaffActor(): Promise<
  | { status: "AUTHENTICATED"; actor: StaffActor }
  | { status: "SESSION_EXPIRED" }
  | { status: "UNAUTHORIZED" }
> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { status: "SESSION_EXPIRED" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    return { status: "SESSION_EXPIRED" };
  }

  const role = parseStaffRole(user.role);

  if (!role) {
    return { status: "UNAUTHORIZED" };
  }

  return {
    status: "AUTHENTICATED",
    actor: {
      id: user.id,
      name: user.name,
      role,
    },
  };
}

export async function requireStaffPageActor(): Promise<StaffActor> {
  const result = await getStaffActor();

  if (result.status === "SESSION_EXPIRED") {
    redirect("/staff/login");
  }

  if (result.status === "UNAUTHORIZED") {
    redirect("/staff/unauthorized");
  }

  return result.actor;
}
