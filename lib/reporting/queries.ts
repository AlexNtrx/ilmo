import "server-only";

import { prisma } from "@/lib/prisma";

export type PublicReportCategory = {
  id: number;
  nameFi: string;
  isUrgent: boolean;
  requiresDescription: boolean;
};

export type PublicReportPageData =
  | { state: "missing" }
  | { state: "inactive" }
  | {
      state: "active";
      location: {
        nameFi: string;
        descriptionFi: string;
      };
      categories: PublicReportCategory[];
    };

/**
 * Resolves the public Location state and returns active Categories in their
 * stable staff-managed order for the reporting page.
 */
export async function getPublicReportPageData(
  publicCode: string,
): Promise<PublicReportPageData> {
  const location = await prisma.location.findUnique({
    where: { publicCode },
    select: {
      nameFi: true,
      descriptionFi: true,
      isActive: true,
    },
  });

  if (!location) {
    return { state: "missing" };
  }

  if (!location.isActive) {
    return { state: "inactive" };
  }

  const categories = await prisma.issueCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      nameFi: true,
      isUrgent: true,
      requiresDescription: true,
    },
  });

  return {
    state: "active",
    location: {
      nameFi: location.nameFi,
      descriptionFi: location.descriptionFi,
    },
    categories,
  };
}
