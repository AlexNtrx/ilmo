import "server-only";

import type { ManagedCategory, ManagedUser } from "@/lib/admin/types";
import { parseStaffRole } from "@/lib/staff/roles";
import { prisma } from "@/lib/prisma";

/** Lists categories in their stable management order with reference counts. */
export async function listManagedCategories(): Promise<ManagedCategory[]> {
  const categories = await prisma.issueCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      nameFi: true,
      isUrgent: true,
      mergeMode: true,
      requiresDescription: true,
      isActive: true,
      sortOrder: true,
      _count: { select: { issues: true } },
    },
  });
  return categories.map(({ _count, ...category }) => ({
    ...category,
    issueCount: _count.issues,
  }));
}

/** Lists manageable users while narrowing stored roles to Ilmo's scalar roles. */
export async function listManagedUsers(): Promise<ManagedUser[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      username: true,
      displayUsername: true,
      role: true,
      createdAt: true,
    },
  });
  return users.map((user) => ({
    ...user,
    role: parseStaffRole(user.role),
    createdAt: user.createdAt.toISOString(),
  }));
}
