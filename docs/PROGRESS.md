# Ilmo Project Progress

## Current State

| Field | Actual state |
| --- | --- |
| Current phase | Phase 8 — Database implementation |
| Current work item | DB-05 — Initial migration, seed, and verification |
| Status | Implemented and validated; awaiting `Approve implementation` |
| Active branch | `feature/db-05-migration-seed` |
| Base commit | `82ac7893c2e86c01d2be9ce6217544b83ae10fe3` |
| Plan approval | Approved |
| Implementation approval | Pending |
| Next authorized work | None |

## Completed State

- Phases 1–6 and the Phase 4 wireframes are approved.
- Phase 7 environment setup is complete.
- DB-01 committed as `0520ddb`.
- DB-02 committed as `d418496`.
- DB-03 committed as `1d63226`.
- DB-04A committed as `ce1946f`.
- DB-04B committed as `82ac789`.

## Current Implementation

- The application UI remains the Create Next App scaffold.
- The Prisma schema contains the approved Ilmo domain models and the
  verified Better Auth User, Session, Account, and Verification models.
- IssueStatusHistory now has an optional User relation using
  `onDelete: SetNull`.
- Better Auth 1.6.25 is configured for username/password with `admin`
  and `staff` roles and public sign-up disabled.
- Basic admin-only CRUD permissions are defined; staff has none.
- DB-05 seed and read-only database verification scripts are prepared.
- No auth route, login UI, dashboard UI, or user CRUD service exists.
- Initial migration `20260730184652_init` is applied locally.
- The first admin, six Finnish categories, and pilot Location are seeded.

## DB-05 Validation

- Prisma format, validation, and Client generation passed.
- The read-only database preflight passed against local database
  `ilmo`, with no conflicting Ilmo or Better Auth tables.
- The first create-only attempt failed with schema-engine
  `spawn UNKNOWN`; the approved retry created one migration.
- Migration SQL review passed, schema hash stayed unchanged, and the
  migration applied successfully.
- Post-apply migration status reports the schema is up to date.
- Invalid initial-admin input attempts failed before writes.
- The successful first seed created one admin, six categories, and one
  Location.
- The second seed created no records.
- Full database verification passed after both seed runs.
- Final Prisma validation, Client generation, migration status, and lint
  passed.
- The sandbox build failed only on Google Fonts; the same current-tree
  build passed with network access.

## Worklog Index

| Work item | Worklog | Commit |
| --- | --- | --- |
| DB-01 | [DB-01](worklogs/DB-01.md) | `0520ddb` |
| DB-02 | [DB-02](worklogs/DB-02.md) | `d418496` |
| DB-03 | [DB-03](worklogs/DB-03.md) | `1d63226` |
| DB-04A | [DB-04A](worklogs/DB-04A.md) | `ce1946f` |
| DB-04B | [DB-04B](worklogs/DB-04B.md) | `82ac789` |
| DB-05 | [DB-05](worklogs/DB-05.md) | Not committed |

## Blockers and Risks

- The schema engine is unsigned on this Windows installation; retry
  succeeded, but the earlier intermittent `spawn UNKNOWN` remains a risk.
- Better Auth warned that `BETTER_AUTH_URL` was not visible at runtime;
  local runtime configuration must be verified before login work.
- Runtime authentication and user CRUD are not implemented or tested.
- Advanced concurrency protection for the last-admin rule is deferred.
- npm reports 18 dependency vulnerabilities (5 moderate and 13 high);
  no automatic audit fix was run.

## Next Authorized Work

None until DB-05 receives implementation approval and is committed.
