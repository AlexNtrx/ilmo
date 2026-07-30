# Ilmo Project Progress

## Current State

| Field | Actual state |
| --- | --- |
| Current phase | Phase 8 — Database implementation |
| Current work item | DB-04B — Auth schema integration |
| Status | Implemented and validated; awaiting `Approve implementation` |
| Active branch | `feature/db-04b-better-auth-schema` |
| Base commit | `ce1946f` |
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

## Current Implementation

- The application UI remains the Create Next App scaffold.
- The Prisma schema contains the approved Ilmo domain models and the
  verified Better Auth User, Session, Account, and Verification models.
- IssueStatusHistory now has an optional User relation using
  `onDelete: SetNull`.
- Better Auth 1.6.25 is configured for username/password with `admin`
  and `staff` roles and public sign-up disabled.
- Basic admin-only CRUD permissions are defined; staff has none.
- No auth route, login UI, dashboard UI, or user CRUD service exists.
- No Prisma migration history exists and migration remains untested.

## DB-04B Validation

- Prisma format, validation, and Client generation passed.
- Lint passed.
- The sandboxed build failed only on Google Fonts network access.
- The unchanged build passed with network access.
- No migration or database-mutating command ran.

## Worklog Index

| Work item | Worklog | Commit |
| --- | --- | --- |
| DB-01 | [DB-01](worklogs/DB-01.md) | `0520ddb` |
| DB-02 | [DB-02](worklogs/DB-02.md) | `d418496` |
| DB-03 | [DB-03](worklogs/DB-03.md) | `1d63226` |
| DB-04A | [DB-04A](worklogs/DB-04A.md) | `ce1946f` |
| DB-04B | [DB-04B](worklogs/DB-04B.md) | Not committed |

## Blockers and Risks

- Windows still blocks `schema-engine-windows.exe`; migration is
  untested.
- Runtime authentication and user CRUD are not implemented or tested.
- Advanced concurrency protection for the last-admin rule is deferred.
- npm reported dependency vulnerabilities during installation; no
  automatic audit fix was run.

## Next Authorized Work

DB-05 remains unauthorized until DB-04B receives implementation
approval, is committed, integrated into `main`, and followed by
`Next slice`.
