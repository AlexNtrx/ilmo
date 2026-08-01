import "server-only";

import { Prisma } from "@/generated/prisma/client";
import type {
  CategoryStore,
  CategoryWriteInput,
} from "@/lib/admin/category-service";
import type { CategoryDirection } from "@/lib/admin/types";
import type { UserStore } from "@/lib/admin/user-service";
import { prisma } from "@/lib/prisma";

/** Persists category changes while keeping their display order deterministic. */
export const prismaCategoryStore: CategoryStore = {
  async create(input: CategoryWriteInput) {
    const last = await prisma.issueCategory.findFirst({
      orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
      select: { sortOrder: true },
    });
    await prisma.issueCategory.create({
      data: { ...input, sortOrder: (last?.sortOrder ?? 0) + 10 },
    });
  },
  async update(id, input) {
    const result = await prisma.issueCategory.updateMany({
      where: { id },
      data: input,
    });
    return result.count === 1;
  },
  async setActive(id, isActive) {
    const result = await prisma.issueCategory.updateMany({
      where: { id },
      data: { isActive },
    });
    return result.count === 1;
  },
  move(id: number, direction: CategoryDirection) {
    // Reordering is atomic so readers never observe duplicate or partial positions.
    return prisma.$transaction(async (transaction) => {
      const categories = await transaction.issueCategory.findMany({
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: { id: true },
      });
      const index = categories.findIndex((category) => category.id === id);
      if (index === -1) {
        return "NOT_FOUND" as const;
      }
      const nextIndex = direction === "UP" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= categories.length) {
        return "UNCHANGED" as const;
      }
      [categories[index], categories[nextIndex]] = [
        categories[nextIndex],
        categories[index],
      ];
      for (const [position, category] of categories.entries()) {
        await transaction.issueCategory.update({
          where: { id: category.id },
          data: { sortOrder: (position + 1) * 10 },
        });
      }
      return "MOVED" as const;
    });
  },
  async findIssueCount(id) {
    const category = await prisma.issueCategory.findUnique({
      where: { id },
      select: { _count: { select: { issues: true } } },
    });
    return category?._count.issues ?? null;
  },
  async delete(id) {
    const result = await prisma.issueCategory.deleteMany({ where: { id } });
    return result.count === 1;
  },
  isForeignKeyError(error) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    );
  },
};

/** Supplies the minimal user data required by Ilmo's management safeguards. */
export const prismaUserStore: UserStore = {
  findUser(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true },
    });
  },
  countAdmins() {
    return prisma.user.count({ where: { role: "admin" } });
  },
};
