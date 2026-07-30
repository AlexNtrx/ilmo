# Ilmo Conceptual Database Design

## Purpose and Status

This document records the approved conceptual database design before
Prisma implementation. It does not claim that the models or migrations
already exist.

Current repository state:

- `prisma/schema.prisma` has no Ilmo domain models.
- There is no Prisma migration history.
- Prisma migration has not been tested.
- Windows currently blocks `schema-engine-windows.exe`.

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

Standard `MERGE_OPEN` matching uses the same Location, IssueCategory,
and `OPEN` status. `ALWAYS_CREATE` categories do not reuse an existing
Issue.

Issues are not deleted through the Version 0 application.

## IssueConfirmation

Approved concepts:

| Field or relation | Concept |
| --- | --- |
| `id` | Int autoincrement primary key |
| Issue relation | Issue being confirmed |
| `sourceHash` | Pending privacy and implementation design |
| `createdAt` | Confirmation timestamp |

No final `sourceHash` algorithm, retention period, expiry behavior, or
uniqueness rule is approved.

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

## Better Auth Models

Better Auth user and session models are part of the approved conceptual
design. Their exact schema, identity field types, keys, and relationship
details must be verified against the Better Auth version selected
during implementation.

Staff-created history may have an optional relation to the Better Auth
user responsible for the change.

## Transaction Rules

**Approved Decisions:**

- Creating an Issue, its first IssueConfirmation, and its initial
  IssueStatusHistory must be atomic.
- Closing an Issue and creating its IssueStatusHistory record must be
  atomic.
- A transaction failure must not leave a partial issue creation or
  partial closure.

## Data Preservation

**Approved Decisions:**

- Issues are not deleted through the Version 0 application.
- Historical locations should be deactivated instead of deleted when
  preservation is required.
- Referenced categories must be deactivated instead of hard-deleted.
- Status history is append-only.

## Open Implementation Details

These details remain genuinely open:

- Exact Better Auth schema integration
- `sourceHash` generation
- `sourceHash` privacy handling
- `sourceHash` retention
- `sourceHash` expiry
- `sourceHash` uniqueness behavior
- Rate-limit identity and storage mechanism
- Prisma representation of the one-`OPEN`-issue invariant
- Whether PostgreSQL partial unique index SQL is required
- Final index names
- Cascade and referential actions

These details require an approved work-item plan before they become
implementation decisions.
