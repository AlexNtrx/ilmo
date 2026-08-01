import "dotenv/config";

import { prisma } from "@/lib/prisma";

type DatabaseRow = { databaseName: string };
type NameRow = { name: string };
type EnumRow = { enumName: string; value: string };
type ConstraintRow = {
  tableName: string;
  constraintName: string;
  constraintType: string;
};
type ForeignKeyRow = {
  tableName: string;
  constraintName: string;
  deleteRule: string;
  updateRule: string;
};

const expectedTables = [
  "Location",
  "IssueCategory",
  "Issue",
  "IssueConfirmation",
  "IssueStatusHistory",
  "user",
  "session",
  "account",
  "verification",
] as const;

const expectedEnums = new Map([
  ["IssueStatus", ["OPEN", "RESOLVED", "INVALID"]],
  ["IssuePriority", ["NORMAL", "HIGH", "URGENT"]],
  ["IssueMergeMode", ["MERGE_OPEN", "ALWAYS_CREATE"]],
  ["IssueStatusChangeSource", ["SYSTEM", "STAFF"]],
]);

function requireCondition(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function verifyDatabaseTarget() {
  const databases = await prisma.$queryRaw<DatabaseRow[]>`
    SELECT current_database() AS "databaseName"
  `;

  requireCondition(
    databases[0]?.databaseName === "ilmo",
    "DATABASE_URL must target the local ilmo database.",
  );
}

async function readPublicTables() {
  return prisma.$queryRaw<NameRow[]>`
    SELECT tablename AS name
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
}

async function verifyPreflight() {
  await verifyDatabaseTarget();
  const tables = await readPublicTables();
  const conflicts = tables
    .map(({ name }) => name)
    .filter((name) =>
      expectedTables.includes(name as (typeof expectedTables)[number]),
    );

  requireCondition(
    conflicts.length === 0,
    `Existing Ilmo or Better Auth tables block the initial migration: ${conflicts.join(", ")}.`,
  );

  console.log(
    "Preflight passed: target database is ilmo and has no conflicting tables.",
  );
}

async function verifyTables() {
  const tableNames = new Set(
    (await readPublicTables()).map(({ name }) => name),
  );

  for (const table of [...expectedTables, "_prisma_migrations"]) {
    requireCondition(
      tableNames.has(table),
      `Expected table is missing: ${table}.`,
    );
  }
}

async function verifyEnums() {
  const rows = await prisma.$queryRaw<EnumRow[]>`
    SELECT type.typname AS "enumName", enum.enumlabel AS value
    FROM pg_catalog.pg_type AS type
    JOIN pg_catalog.pg_enum AS enum ON enum.enumtypid = type.oid
    JOIN pg_catalog.pg_namespace AS namespace ON namespace.oid = type.typnamespace
    WHERE namespace.nspname = 'public'
    ORDER BY type.typname, enum.enumsortorder
  `;

  for (const [enumName, values] of expectedEnums) {
    const actualValues = rows
      .filter((row) => row.enumName === enumName)
      .map((row) => row.value);
    requireCondition(
      JSON.stringify(actualValues) === JSON.stringify(values),
      `Enum values do not match for ${enumName}.`,
    );
  }
}

async function verifyConstraints() {
  const constraints = await prisma.$queryRaw<ConstraintRow[]>`
    SELECT
      table_name AS "tableName",
      constraint_name AS "constraintName",
      constraint_type AS "constraintType"
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
  `;
  const constraintKeys = new Set(
    constraints.map(
      ({ tableName, constraintName, constraintType }) =>
        `${tableName}:${constraintName}:${constraintType}`,
    ),
  );

  const requiredConstraints = [
    "Location:Location_pkey:PRIMARY KEY",
    "IssueCategory:IssueCategory_pkey:PRIMARY KEY",
    "Issue:Issue_pkey:PRIMARY KEY",
    "IssueConfirmation:IssueConfirmation_pkey:PRIMARY KEY",
    "IssueStatusHistory:IssueStatusHistory_pkey:PRIMARY KEY",
    "user:user_pkey:PRIMARY KEY",
    "session:session_pkey:PRIMARY KEY",
    "account:account_pkey:PRIMARY KEY",
    "verification:verification_pkey:PRIMARY KEY",
  ];

  for (const constraint of requiredConstraints) {
    requireCondition(
      constraintKeys.has(constraint),
      `Expected constraint is missing: ${constraint}.`,
    );
  }

  const foreignKeys = await prisma.$queryRaw<ForeignKeyRow[]>`
    SELECT
      constraints.table_name AS "tableName",
      constraints.constraint_name AS "constraintName",
      referential.delete_rule AS "deleteRule",
      referential.update_rule AS "updateRule"
    FROM information_schema.table_constraints AS constraints
    JOIN information_schema.referential_constraints AS referential
      ON referential.constraint_schema = constraints.constraint_schema
      AND referential.constraint_name = constraints.constraint_name
    WHERE constraints.table_schema = 'public'
      AND constraints.constraint_type = 'FOREIGN KEY'
  `;
  const foreignKeyRules = new Map(
    foreignKeys.map((row) => [
      `${row.tableName}:${row.constraintName}`,
      `${row.deleteRule}:${row.updateRule}`,
    ]),
  );
  const requiredForeignKeys = new Map([
    ["Issue:Issue_locationId_fkey", "RESTRICT:CASCADE"],
    ["Issue:Issue_categoryId_fkey", "RESTRICT:CASCADE"],
    ["IssueConfirmation:IssueConfirmation_issueId_fkey", "RESTRICT:CASCADE"],
    ["IssueStatusHistory:IssueStatusHistory_issueId_fkey", "RESTRICT:CASCADE"],
    [
      "IssueStatusHistory:IssueStatusHistory_changedByUserId_fkey",
      "SET NULL:CASCADE",
    ],
    ["session:session_userId_fkey", "CASCADE:CASCADE"],
    ["account:account_userId_fkey", "CASCADE:CASCADE"],
  ]);

  for (const [foreignKey, rule] of requiredForeignKeys) {
    requireCondition(
      foreignKeyRules.get(foreignKey) === rule,
      `Foreign-key rule does not match for ${foreignKey}.`,
    );
  }
}

async function verifyIndexes() {
  const indexes = await prisma.$queryRaw<NameRow[]>`
    SELECT indexname AS name
    FROM pg_catalog.pg_indexes
    WHERE schemaname = 'public'
  `;
  const indexNames = new Set(indexes.map(({ name }) => name));

  for (const index of [
    "Location_publicCode_key",
    "user_email_key",
    "user_username_key",
    "session_userId_idx",
    "session_token_key",
    "account_userId_idx",
    "verification_identifier_idx",
  ]) {
    requireCondition(
      indexNames.has(index),
      `Expected index is missing: ${index}.`,
    );
  }
}

async function verifySeed() {
  const categories = await prisma.issueCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      nameFi: true,
      isUrgent: true,
      mergeMode: true,
      requiresDescription: true,
      isActive: true,
      sortOrder: true,
    },
  });
  const expectedCategories = [
    ["WC-paperi on loppu", false, "MERGE_OPEN", false, true, 10],
    ["Saippua on loppu", false, "MERGE_OPEN", false, true, 20],
    ["Tila tarvitsee siivousta", false, "MERGE_OPEN", false, true, 30],
    ["WC-istuin tai muu varuste on rikki", false, "MERGE_OPEN", true, true, 40],
    ["Turvallisuusriski", true, "MERGE_OPEN", true, true, 50],
    ["Muu ongelma", false, "MERGE_OPEN", true, true, 60],
  ];
  const actualCategories = categories.map((category) => [
    category.nameFi,
    category.isUrgent,
    category.mergeMode,
    category.requiresDescription,
    category.isActive,
    category.sortOrder,
  ]);

  requireCondition(
    JSON.stringify(actualCategories) === JSON.stringify(expectedCategories),
    "IssueCategory seed data does not match the approved initial values.",
  );

  const locationCount = await prisma.location.count({
    where: { publicCode: "pilot-wc-001" },
  });
  requireCondition(
    locationCount === 1,
    "The pilot Location is missing or duplicated.",
  );

  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { id: true },
  });
  requireCondition(admins.length >= 1, "No admin user exists.");

  const credentialCount = await prisma.account.count({
    where: {
      userId: { in: admins.map(({ id }) => id) },
      providerId: "credential",
    },
  });
  requireCondition(
    credentialCount >= 1,
    "No credential Account exists for an admin user.",
  );
}

async function verifyDatabase() {
  await verifyDatabaseTarget();
  await verifyTables();
  await verifyEnums();
  await verifyConstraints();
  await verifyIndexes();
  await verifySeed();
  console.log("Database verification passed.");
}

const preflight = process.argv.includes("--preflight");

(preflight ? verifyPreflight() : verifyDatabase())
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown database verification error.";
    console.error(`Database verification failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
