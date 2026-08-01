import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseStaffRole } from "@/lib/staff/roles";
import type { StaffActor } from "@/lib/staff/types";

/**
 * Resolves the current request to a live Ilmo actor. The database role is
 * re-read so authorization does not trust stale client or session data.
 */
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

/** Requires an authenticated admin or staff actor for a protected page. */
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

/** Requires the stronger admin role before rendering an administration page. */
export async function requireAdminPageActor(): Promise<StaffActor> {
  const actor = await requireStaffPageActor();

  if (actor.role !== "admin") {
    redirect("/staff/unauthorized");
  }

  return actor;
}

/** Returns a typed admin authorization result for Server Actions and services. */
export async function getAdminActor(): Promise<
  | { status: "AUTHENTICATED"; actor: StaffActor & { role: "admin" } }
  | { status: "SESSION_EXPIRED" }
  | { status: "UNAUTHORIZED" }
> {
  const result = await getStaffActor();

  if (result.status !== "AUTHENTICATED") {
    return result;
  }

  if (result.actor.role !== "admin") {
    return { status: "UNAUTHORIZED" };
  }

  return {
    status: "AUTHENTICATED",
    actor: { ...result.actor, role: "admin" },
  };
}
