# Ilmo Project Progress

## Current State

| Field | Actual state |
| --- | --- |
| Current phase | Vertical slices — public reporting |
| Current work item | VS-01 — Public reporting end-to-end |
| Status | Implemented and validated; awaiting `Approve implementation` |
| Active branch | `feature/vs-01-public-reporting` |
| Base commit | `516cf09e4152977303f4e7c093fa7f24325cf482` |
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
- DB-05 committed as `516cf09`.

## Current Implementation

- The root route remains the Create Next App scaffold.
- `/report/[publicCode]` implements the approved Finnish public
  reporting form and public reporting states.
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
- IssueConfirmation stores report-specific descriptions while its
  `sourceHash` remains null.
- ReportSubmission provides the temporary cookie-based duplicate and
  rate-limit ledger.
- Reporting uses a Serializable Prisma transaction with at most two
  retries for recognized `P2034` conflicts.
- One local urgent verification Issue was created through the public
  flow; its repeated identical submission produced no extra
  confirmation. The owner removed that verification Issue and its
  related confirmation and status history after review; seed-owned
  Location and Category records remain unchanged.

## VS-01 Validation

- Prisma format, validation, Client generation, migration creation,
  migration apply, and migration status passed.
- Migration `20260731055125_add_public_reporting_support` was reviewed;
  no reset or destructive SQL was requested.
- All 13 focused `node:test` tests passed through `tsx`.
- Lint and the production build passed.
- Browser checks covered 320, 390, 768, and 1440 pixel widths with no
  horizontal overflow or Next.js error overlay.
- Active, missing, inactive, loading, validation, server-error, and
  neutral-success states were inspected.
- Validation focus recovery and visible keyboard focus were observed.
- Owner review confirmed Space-key checkbox activation and the selected
  visual and text state using a real keyboard.
- The temporary inactive verification Location was removed.
- Read-only verification confirmed one urgent Issue, one confirmation,
  preserved description, null confirmation sourceHash, and initial
  null-to-OPEN SYSTEM history.
- The owner removed that manual verification data after review.

## Worklog Index

| Work item | Worklog | Commit |
| --- | --- | --- |
| DB-01 | [DB-01](worklogs/DB-01.md) | `0520ddb` |
| DB-02 | [DB-02](worklogs/DB-02.md) | `d418496` |
| DB-03 | [DB-03](worklogs/DB-03.md) | `1d63226` |
| DB-04A | [DB-04A](worklogs/DB-04A.md) | `ce1946f` |
| DB-04B | [DB-04B](worklogs/DB-04B.md) | `82ac789` |
| DB-05 | [DB-05](worklogs/DB-05.md) | `516cf09` |
| VS-01 | [VS-01](worklogs/VS-01.md) | Not committed |

## Blockers and Risks

- The schema engine is unsigned on this Windows installation; retry
  succeeded, but the earlier intermittent `spawn UNKNOWN` remains a risk.
- Better Auth warned that `BETTER_AUTH_URL` was not visible at runtime;
  local runtime configuration must be verified before login work.
- Runtime authentication and user CRUD are not implemented or tested.
- Advanced concurrency protection for the last-admin rule is deferred.
- Cookie clearing or changing browsers can bypass the pilot duplicate
  and rate-limit identity.
- The Serializable retry strategy has no additional database-level
  one-OPEN-issue constraint.
- Automated browser end-to-end tests remain intentionally absent.
- npm reports 18 dependency vulnerabilities (5 moderate and 13 high);
  no automatic audit fix was run.

## Next Authorized Work

None until VS-01 receives implementation approval and is committed.
