# Ilmo Conceptual Database Design

## Purpose and Status

This document records the approved conceptual database design before
Prisma implementation. It does not claim that the models or migrations
already exist.

Current repository state:

- DB-01 implements the approved domain enums and Location model in
  `prisma/schema.prisma`.
- DB-02 implements the approved IssueCategory model in
  `prisma/schema.prisma`.
- DB-03 implements the approved Issue and IssueConfirmation models and
  their relations in `prisma/schema.prisma`.
- DB-04A implements IssueStatusHistory and the reverse Issue relation.
- DB-04B integrates the Better Auth 1.6.25 generated schema and binds
  the nullable history actor to the verified User identifier.
- DB-05 created and applied the initial migration
  `20260730184652_init` to the local `ilmo` database.
- DB-05 seed and read-only verification scripts are prepared.
- The first create-only attempt returned `spawn UNKNOWN` for
  `schema-engine-windows.exe`; an approved retry succeeded.
- The first admin, six categories, and pilot Location are seeded.
- A second seed created no records, and full database verification
  passed after both seed runs.
- VS-01 adds report-specific confirmation descriptions and the
  temporary ReportSubmission protection ledger through migration
  `20260731055125_add_public_reporting_support`.

## DB-01 Prisma Enum Decisions

DB-01 uses these approved Prisma enum names and values:

| Prisma enum | Values |
| --- | --- |
| `IssueStatus` | `OPEN`, `RESOLVED`, `INVALID` |
| `IssuePriority` | `NORMAL`, `HIGH`, `URGENT` |
| `IssueMergeMode` | `MERGE_OPEN`, `ALWAYS_CREATE` |
| `IssueStatusChangeSource` | `SYSTEM`, `STAFF` |

No database migration is created or applied in DB-01.

## Approved Domain Entities

- Location
- IssueCategory
- Issue
- IssueConfirmation
- IssueStatusHistory
- Better Auth user and session models

## Identifier Strategy

**Approved Decisions:**

- Ilmo domain entities use `Int` autoincrement primary keys.
- Location also has a unique String `publicCode` used by public QR
  URLs.
- IssueCategory has no business code.
- Better Auth identity field types must follow the verified Better Auth
  schema during implementation.

## Location

Approved fields:

| Field | Concept |
| --- | --- |
| `id` | Int autoincrement primary key |
| `publicCode` | Unique String used in public QR URLs |
| `nameFi` | Finnish location name |
| `descriptionFi` | Finnish location description |
| `isActive` | Availability flag |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last-update timestamp |

DB-01 implements `nameFi` and `descriptionFi` as required Strings,
`isActive` with a default of `true`, `createdAt` with a default current
timestamp, and `updatedAt` with Prisma-managed update behavior. It uses
the default Prisma table and column names without length constraints.
The format and normalization rules for `publicCode` remain outside the
DB-01 scope; the schema enforces uniqueness.

Historical locations should be deactivated instead of deleted when
preservation is required.

## IssueCategory

Approved fields:

| Field | Concept |
| --- | --- |
| `id` | Int autoincrement primary key |
| `nameFi` | Finnish category name |
| `isUrgent` | Creates an urgent issue from the first report |
| `mergeMode` | `MERGE_OPEN` or `ALWAYS_CREATE` behavior |
| `requiresDescription` | Requires public description input |
| `isActive` | Public availability flag |
| `sortOrder` | Staff-controlled display order |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last-update timestamp |

DB-02 implements `nameFi` as a required String, `isUrgent` with a
default of `false`, `mergeMode` with a default of `MERGE_OPEN`,
`requiresDescription` with a default of `false`, and `isActive` with a
default of `true`. `sortOrder` is a required Int without a default.
Timestamps use the same Prisma-managed behavior as Location.

DB-02 adds no name uniqueness rule, indexes, mappings, String length
constraints, Issue relation, or seed behavior. These details remain
deferred to their approved later work items.

**Approved Decisions:**

- IssueCategory has no code field.
- IssueCategory has no `isDefault` field.
- Category behavior is controlled by `isUrgent`, `mergeMode`,
  `requiresDescription`, `isActive`, and `sortOrder`.
- Default categories are inserted only when the category table is
  empty.
- Seeded categories remain editable staff-owned data.
- An unused category may be hard-deleted.
- A category referenced by an Issue must be deactivated instead of
  hard-deleted.

## Initial Seed

**Approved Decisions:**

- The seed inserts default categories only when IssueCategory is empty.
- Existing categories are never overwritten.
- Initial category sort orders are 10 through 60 in this order:
  `WC-paperi on loppu`, `Saippua on loppu`,
  `Tila tarvitsee siivousta`,
  `WC-istuin tai muu varuste on rikki`, `Turvallisuusriski`, and
  `Muu ongelma`.
- `Turvallisuusriski` is urgent. The final three categories require a
  description. All initial categories are active and use `MERGE_OPEN`.
- The pilot Location has public code `pilot-wc-001`. It is created when
  absent and an existing record is not updated.
- When no admin exists, all initial-admin inputs are validated before
  any seed write and Better Auth creates the credential account.
- When an admin exists, provisioning is skipped without requiring the
  initial-admin environment values.
- Internal email is opaque and server-generated. Passwords and secrets
  are never logged or committed.

## Issue

Approved fields and relationships:

| Field or relation | Concept |
| --- | --- |
| `id` | Int autoincrement primary key |
| Location relation | Location where the issue was reported |
| Category relation | IssueCategory represented by the issue |
| Optional description | Up to 200 characters in Version 0 |
| `status` | `OPEN`, `RESOLVED`, or `INVALID` |
| `priority` | `NORMAL`, `HIGH`, or `URGENT` |
| `firstReportedAt` | First report timestamp |
| `lastConfirmedAt` | Most recent confirmation timestamp |
| `closedAt` | Nullable closure timestamp |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last-update timestamp |

DB-03 implements required `locationId` and `categoryId` foreign keys.
`description` is nullable and uses PostgreSQL `VarChar(200)`. `status`
defaults to `OPEN`, `priority` defaults to `NORMAL`,
`firstReportedAt` and `lastConfirmedAt` default to the current
timestamp, and `closedAt` is nullable.

Location and IssueCategory expose reverse `issues` relations. Their
Issue relations use `onDelete: Restrict` and `onUpdate: Cascade`.
Issue exposes a reverse `confirmations` relation.

Standard `MERGE_OPEN` matching uses the same Location, IssueCategory,
and `OPEN` status. `ALWAYS_CREATE` categories do not reuse an existing
Issue.

Issues are not deleted through the Version 0 application.

DB-03 adds no indexes or database-level one-`OPEN`-issue invariant.
Those details remain deferred.

## IssueConfirmation

Approved concepts:

| Field or relation | Concept |
| --- | --- |
| `id` | Int autoincrement primary key |
| Issue relation | Issue being confirmed |
| `description` | Nullable report-specific description up to 200 characters |
| `sourceHash` | Nullable compatibility field; always null in Version 0 |
| `createdAt` | Confirmation timestamp |

DB-03 implements required `issueId`, nullable unconstrained
`sourceHash`, and `createdAt` with a current-timestamp default. The
Issue relation uses `onDelete: Restrict` and `onUpdate: Cascade`.

VS-01 adds nullable `description` as PostgreSQL `VarChar(200)`.
Descriptions from merged reports are stored on their confirmations
without overwriting `Issue.description`. Reporter-protection hashes are
not stored in IssueConfirmation.

## ReportSubmission

VS-01 implements a temporary duplicate and rate-limit ledger:

| Field | Implemented concept |
| --- | --- |
| `id` | Int autoincrement primary key |
| `sourceHash` | HMAC of an opaque HttpOnly reporter cookie |
| `payloadHash` | HMAC of canonical Location, category IDs, and description |
| `createdAt` | Submission-attempt timestamp |

The model indexes `(sourceHash, createdAt)` and
`(sourceHash, payloadHash, createdAt)`. Records older than 24 hours are
removed by one submission-time `deleteMany`; there is no cleanup job.

## IssueStatusHistory

Approved concepts:

| Field or relation | Concept |
| --- | --- |
| `id` | Int autoincrement primary key |
| Issue relation | Issue whose status changed |
| `fromStatus` | Nullable previous status |
| `toStatus` | New status |
| `changeSource` | `SYSTEM` or `STAFF` |
| Optional `changedByUser` relation | Staff identity when applicable |
| `changedAt` | Change timestamp |

**Approved history rules:**

- Initial history is `fromStatus = null` to `toStatus = OPEN`.
- `changeSource` is `SYSTEM` or `STAFF`.
- Status history is append-only.
- Version 0 does not support reopening.

DB-04A implements an Int autoincrement `id`, required `issueId`,
nullable `fromStatus`, required `toStatus`, required `changeSource`,
nullable String `changedByUserId`, and `changedAt` defaulting to the
current timestamp. The Issue relation uses `onDelete: Restrict` and
`onUpdate: Cascade`; Issue exposes `statusHistory` as its reverse
relation.

DB-04B binds `changedByUserId` to the verified Better Auth User
identifier through the optional `changedByUser` relation. Deleting a
User sets the history identifier to null, preserving the append-only
history row. The relation uses `onDelete: SetNull` and
`onUpdate: Cascade`.

## Better Auth Models

DB-04B uses exactly version 1.6.25 for the Better Auth runtime, Prisma
adapter, and schema generator CLI. The User, Session, Account, and
Verification models were generated from the actual approved
username-and-password configuration with the Username and Admin
plugins.

### User

| Field or relation | Implemented concept |
| --- | --- |
| `id` | Required String primary key generated by Better Auth |
| `name` | Required, admin-editable name |
| `email` | Required internal email with a unique constraint |
| `emailVerified` | Boolean defaulting to false |
| `image` | Optional image URL |
| `createdAt` | Creation timestamp |
| `updatedAt` | Prisma-managed update timestamp |
| `username` | Optional normalized username with a unique constraint |
| `displayUsername` | Optional original display username |
| `role` | Optional Better Auth String; Ilmo accepts one `admin` or `staff` value |
| `banned` | Generated compatibility field, unused by Ilmo |
| `banReason` | Generated compatibility field, unused by Ilmo |
| `banExpires` | Generated compatibility field, unused by Ilmo |
| `sessions` | Reverse Session relation |
| `accounts` | Reverse Account relation |
| `statusHistoryChanges` | Preserved status-history records attributed to this User |

The model maps to the `user` table. Internal email is generated on the
server as an opaque UUID-based address and does not change when username
changes. Email is not a Version 0 form field.

### Session

Session uses required String `id`, required unique `token`, required
`expiresAt`, required User relation, timestamps, optional IP address and
user agent, and the generated optional `impersonatedBy` compatibility
field. It maps to the `session` table and indexes `userId`.

Deleting a User cascades to Session. Ilmo has no session-listing or
manual session-management UI. VS-03 must automatically revoke the
target user's sessions after a password reset.

### Account

Account uses a required String primary key, required `accountId`,
`providerId`, and `userId`, optional provider tokens and expiries,
optional scope, optional credential password, and timestamps. It maps
to the `account` table and indexes `userId`.

Deleting a User cascades to Account. Credential passwords are stored in
Account rather than User.

### Verification

Verification uses a required String primary key, identifier, value,
expiry, and timestamps. It maps to the `verification` table and indexes
`identifier`.

### User-Management Rules

**Approved Decisions:**

- Only admins manage users.
- Version 0 supports create, list, view, username edit, name edit, role
  edit, password reset, and delete.
- The only roles are scalar `admin` and `staff` values.
- The last admin cannot be demoted or deleted.
- An admin cannot delete their own account.
- The server counts admins before deleting or demoting one and rejects
  the operation when only one remains.
- Ban, unban, disabling, impersonation, email editing, session-listing
  UI, and manual session-management UI are not exposed.
- User deletion cascades to Session and Account.
- User deletion sets attributed history identifiers to null and
  preserves IssueStatusHistory.
- VS-03 performs profile updates and role changes as separate authenticated
  Better Auth operations. Every Admin API receives the current request headers.
- Password reset changes the credential first and then revokes all target-user
  sessions. Failure of the second operation is reported as a partial failure.
- Category deletion maps both the friendly reference pre-check and a database
  foreign-key rejection to the same recoverable referenced-category result.

## Transaction Rules

**Approved Decisions:**

- Creating an Issue, its first IssueConfirmation, and its initial
  IssueStatusHistory must be atomic.
- Closing an Issue and creating its IssueStatusHistory record must be
  atomic.
- A transaction failure must not leave a partial issue creation or
  partial closure.
- Public reports use a Prisma interactive transaction with PostgreSQL
  Serializable isolation.
- Category IDs are processed in sorted order. A recognized Prisma
  `P2034` conflict retries at most twice, and every attempt re-reads the
  matching OPEN Issue.
- VS-01 uses no advisory lock, partial unique index, or permanent
  reporter hash on confirmations.

## Data Preservation

**Approved Decisions:**

- Issues are not deleted through the Version 0 application.
- Historical locations should be deactivated instead of deleted when
  preservation is required.
- Referenced categories must be deactivated instead of hard-deleted.
- Status history is append-only.

## Open Implementation Details

These details remain genuinely open:

- Advanced concurrency protection for the last-admin check
- Stronger reporter identity and abuse protection beyond the temporary
  browser-cookie ledger
- A database-enforced one-`OPEN`-issue invariant beyond Serializable
  transaction retries
- Final index names
- Cascade and referential actions

These details require an approved work-item plan before they become
implementation decisions.
