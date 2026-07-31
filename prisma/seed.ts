import "dotenv/config";

import { randomUUID } from "node:crypto";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const defaultCategories = [
  {
    nameFi: "WC-paperi on loppu",
    isUrgent: false,
    mergeMode: "MERGE_OPEN" as const,
    requiresDescription: false,
    isActive: true,
    sortOrder: 10,
  },
  {
    nameFi: "Saippua on loppu",
    isUrgent: false,
    mergeMode: "MERGE_OPEN" as const,
    requiresDescription: false,
    isActive: true,
    sortOrder: 20,
  },
  {
    nameFi: "Tila tarvitsee siivousta",
    isUrgent: false,
    mergeMode: "MERGE_OPEN" as const,
    requiresDescription: false,
    isActive: true,
    sortOrder: 30,
  },
  {
    nameFi: "WC-istuin tai muu varuste on rikki",
    isUrgent: false,
    mergeMode: "MERGE_OPEN" as const,
    requiresDescription: true,
    isActive: true,
    sortOrder: 40,
  },
  {
    nameFi: "Turvallisuusriski",
    isUrgent: true,
    mergeMode: "MERGE_OPEN" as const,
    requiresDescription: true,
    isActive: true,
    sortOrder: 50,
  },
  {
    nameFi: "Muu ongelma",
    isUrgent: false,
    mergeMode: "MERGE_OPEN" as const,
    requiresDescription: true,
    isActive: true,
    sortOrder: 60,
  },
] as const;

function readInitialAdminInput() {
  const username = process.env.ILMO_SEED_ADMIN_USERNAME?.trim();
  const name = process.env.ILMO_SEED_ADMIN_NAME?.trim();
  const password = process.env.ILMO_SEED_ADMIN_PASSWORD;

  if (!username || !name || !password) {
    throw new Error(
      "Initial admin provisioning requires username, name, and password environment values.",
    );
  }

  if (
    username.length < 3 ||
    username.length > 30 ||
    !/^[a-zA-Z0-9_.]+$/.test(username)
  ) {
    throw new Error("The initial admin username is invalid.");
  }

  if (password.length < 8 || password.length > 128) {
    throw new Error("The initial admin password is invalid.");
  }

  return {
    username: username.toLowerCase(),
    displayUsername: username,
    name,
    password,
  };
}

async function provisionInitialAdmin() {
  const adminCount = await prisma.user.count({
    where: { role: "admin" },
  });

  if (adminCount > 0) {
    return false;
  }

  const input = readInitialAdminInput();

  await auth.api.createUser({
    body: {
      email: `${randomUUID()}@users.ilmo.invalid`,
      password: input.password,
      name: input.name,
      role: "admin",
      data: {
        username: input.username,
        displayUsername: input.displayUsername,
      },
    },
  });

  return true;
}

async function seedCategories() {
  const categoryCount = await prisma.issueCategory.count();

  if (categoryCount > 0) {
    return 0;
  }

  const result = await prisma.issueCategory.createMany({
    data: [...defaultCategories],
  });

  return result.count;
}

async function seedPilotLocation() {
  const existingLocation = await prisma.location.findUnique({
    where: { publicCode: "pilot-wc-001" },
    select: { id: true },
  });

  await prisma.location.upsert({
    where: { publicCode: "pilot-wc-001" },
    update: {},
    create: {
      publicCode: "pilot-wc-001",
      nameFi: "Kauppakeskuksen WC",
      descriptionFi: "Pilottikohteen yleinen WC",
      isActive: true,
    },
  });

  return existingLocation === null;
}

async function main() {
  const adminCreated = await provisionInitialAdmin();
  const categoriesCreated = await seedCategories();
  const locationCreated = await seedPilotLocation();

  console.log(
    `Seed completed: admin created=${adminCreated}, categories created=${categoriesCreated}, location created=${locationCreated}.`,
  );
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown seed error.";
    console.error(`Seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
