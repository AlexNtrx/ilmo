# Worklog: DB-04A — IssueStatusHistory

## 1. Work Item Identity

| Field | Value |
| --- | --- |
| ID | `DB-04A` |
| Title | IssueStatusHistory |
| Phase | Phase 8 — Database implementation |
| Status | Implemented and verified; awaiting implementation approval |
| Branch | `feature/db-04a-issue-status-history` |
| Base branch | `main` |
| Base commit | `1d63226` |
| Planned commit message | `feat(database): add issue status history model` |
| Related decisions | `docs/PROJECT_SPEC.md`, `docs/DATABASE_DESIGN.md`, and `docs/WORKFLOW.md` |

### Acceptance Criteria

- [x] Fast-forward `main` to DB-03 commit `1d63226`.
- [x] Create DB-04A from `main` at `1d63226`.
- [x] Add `Issue.statusHistory`.
- [x] Add the approved IssueStatusHistory fields and Issue relation.
- [x] Keep `changedByUserId` nullable and unbound.
- [x] Add no auth models, packages, indexes, or runtime behavior.
- [x] Create no migration and run no database-mutating command.

## 2. Starting State

### Existing Behavior

DB-03 was committed as `1d63226`. Issue and IssueConfirmation existed,
but status history did not.

### Relevant Existing Files

- `prisma/schema.prisma`
- `docs/DATABASE_DESIGN.md`
- `docs/WORKFLOW.md`
- `docs/PROGRESS.md`
- `docs/worklogs/DB-03.md`

### Missing Behavior

Prisma could not represent initial or later Issue status transitions.

### Known Limitations

- Better Auth is not installed or configured.
- No verified User model exists.
- Migration remains untested.
- Append-only behavior cannot be enforced by this schema alone.

### Recommended Starting Point for Reading the Code

Read `Issue.statusHistory` and `IssueStatusHistory` in
`prisma/schema.prisma`, paying particular attention to the absence of a
User relation.

## 3. Actual End-to-End Flow

```text
Approved status-history fields
→ Issue reverse relation and IssueStatusHistory model
→ Prisma format and validation
→ generated history client types
```

`changedByUserId` remains a scalar String with no referential
validation.

## 4. Files Actually Changed

### `prisma/schema.prisma`

- Change type: Modified
- Changed symbols: Issue and IssueStatusHistory
- Reason: Implement approved DB-04A data structure
- Role: Prisma schema and generated-client source
- Owner inspection focus: Nullable statuses, change source, timestamp,
  Issue relation, and absent auth relation
- Classification: Required

### `docs/DATABASE_DESIGN.md`

- Change type: Modified
- Changed sections: Current state, history, and Better Auth boundary
- Reason: Document the implemented model and temporary scalar
- Role: Preserve the DB-04A/DB-04B boundary
- Owner inspection focus: `changedByUserId` is not described as an FK
- Classification: Documentation

### `docs/WORKFLOW.md`

- Change type: Modified
- Changed section: Phase 8 implementation order
- Reason: Lock DB-04A → DB-04B → DB-05
- Role: Prevent auth or migration work from starting early
- Owner inspection focus: DB-05 prerequisite
- Classification: Documentation

### `docs/PROGRESS.md`

- Change type: Modified
- Changed sections: Current work, validation, index, and next-work gate
- Reason: Record actual DB-04A state
- Role: Authorization control
- Owner inspection focus: DB-04B remains unauthorized
- Classification: Documentation

### `docs/worklogs/DB-04A.md`

- Change type: Created
- Reason: Record actual implementation and evidence
- Role: Owner review and learning record
- Owner inspection focus: Commands, exclusions, and risks
- Classification: Documentation

## 5. Code-Reading Order

1. `prisma/schema.prisma`
2. `docs/DATABASE_DESIGN.md`
3. `docs/WORKFLOW.md`
4. `docs/PROGRESS.md`
5. `docs/worklogs/DB-04A.md`

## 6. Before and After

### Previous Behavior

No schema model represented Issue status transitions.

### New Behavior

Prisma represents status-history records and the reverse Issue
collection.

### User-Visible Changes

None.

### Database Changes

None. Only the Prisma schema changed.

### Validation Changes

Prisma validation and generated client types include IssueStatusHistory.

### Error-Handling Changes

None.

### Authentication or Security Changes

None. `changedByUserId` is not a verified foreign key or runtime auth
identifier yet.

## 7. Important Code Explanations

### Difficult Code

`changedByUserId` เป็นเพียง nullable String ใน DB-04A จึงเก็บค่าได้แต่
database ยังไม่ตรวจว่าค่านั้นอ้างถึง user จริง relation จะเพิ่มได้
หลัง DB-04B ตรวจ schema จาก Better Auth configuration จริงเท่านั้น

### Important TypeScript Syntax

DB-04A ไม่แก้ TypeScript โดยตรง แต่ Prisma Client จะสร้าง type ที่
แสดงว่า `fromStatus` และ `changedByUserId` อาจเป็น null

### Next.js Server and Client Boundaries

ไม่มี Next.js code หรือ auth route เปลี่ยน

### Validation Boundaries

Prisma ตรวจ type และ Issue relation ได้ แต่ยังตรวจ staff identifier
หรือความสัมพันธ์ระหว่าง `changeSource` กับ `changedByUserId` ไม่ได้

### Transaction Boundaries

DB-04A ไม่ implement atomic issue creation หรือ closure transaction

### Why This Approach Was Chosen

แยก history schema ออกจาก Better Auth เพื่อไม่สร้าง User model จาก
draft ที่ยังไม่ได้ตรวจ package version และ actual configuration

### Important Rejected Alternatives

- Adding a User relation — deferred to DB-04B.
- Adding auth models or packages — outside DB-04A.
- Adding indexes, triggers, or migrations — explicitly excluded.

## 8. Commands and Evidence

| Command | Purpose | Result | Status | Important output or error |
| --- | --- | --- | --- | --- |
| `git switch main` | Select integration branch | Main selected | Passed | Working tree clean |
| `git merge --ff-only feature/db-03-issue-confirmation` | Integrate DB-03 | Fast-forward completed | Passed | Main moved to `1d63226` |
| `git switch -c feature/db-04a-issue-status-history` | Create DB-04A branch | Branch created | Passed | Base `1d63226` |
| `npx.cmd prisma format` | Format schema | Formatted | Passed | Completed in 22 ms |
| `npx.cmd prisma validate` | Validate schema | Valid | Passed | No validation errors |
| `npx.cmd prisma generate` | Generate Prisma Client | Generated | Passed | Prisma Client 7.9.1 in 133 ms |
| `npm.cmd run lint` | Run ESLint | Completed | Passed | No lint errors |
| `npm.cmd run build` | Build in sandbox | Font fetch failed | Failed | Google Fonts unavailable |
| `npm.cmd run build` with approved network access | Retry unchanged build | Build completed | Passed | Compile, TypeScript, and static generation passed |
| Automated tests | Run focused tests | No approved test script | Not run | No test script exists |
| Schema diff inspection | Inspect actual schema change | Expected DB-04A diff | Passed | History model, reverse relation, and formatting only |
| Final scope, schema-boundary, migration, link, and `git diff --check` inspection | Verify completed DB-04A handoff | All checks passed | Passed | Exactly five approved files changed; auth models, relation, and indexes absent; no migration directory; links resolved; diff check clean |

No Better Auth CLI, migration, `db push`, seed, SQL, package
installation, or database-mutating command was run.

## 9. Problems Encountered

### Errors

- Sandboxed build could not download Google Fonts.

### Unexpected Behavior

- Prisma formatting realigned existing Issue fields, creating harmless
  whitespace-only diff lines.

### Environment Limitations

- PowerShell wrappers remain blocked.
- Build requires font network access.
- Migration remains untested.

### Workarounds

- Used `.cmd` executables.
- Retried the unchanged build with network access.

### Verified Root Cause

The failed build reported font connection errors; the same source built
successfully with network access.

### Remaining Uncertainty

- Better Auth schema and User identifier relation
- Append-only enforcement
- History indexes and database migration behavior

## 10. Decisions and Assumptions

### Approved Decisions Used

- Approved history fields and types
- Nullable `fromStatus` and `changedByUserId`
- Issue relation with Restrict/Cascade
- Temporarily unbound auth identifier
- Locked DB-04A → DB-04B → DB-05 order

### New Implementation Decisions Proposed

None.

### Assumptions Used

None.

### Documentation Affected

- `docs/DATABASE_DESIGN.md`
- `docs/WORKFLOW.md`
- `docs/PROGRESS.md`
- `docs/worklogs/DB-04A.md`

### Migration Impact

DB-04A requires a future migration, but DB-05 cannot start before
DB-04B is integrated into `main`.

## 11. Owner Review Checklist

- [ ] Inspect `Issue.statusHistory`.
- [ ] Inspect every IssueStatusHistory field.
- [ ] Confirm `changedByUserId` has no relation.
- [ ] Confirm no auth models or packages changed.
- [ ] Confirm no indexes or migration directory.
- [ ] Review the locked workflow sequence.
- [ ] Review validation evidence.

## 12. Result

### Acceptance Criteria Result

- Base integration and branch: Passed
- Approved model and reverse relation: Passed
- Temporary unbound identifier: Passed
- Prisma checks and lint: Passed
- Build: Passed with network access
- Automated tests: Not run — no approved script
- Excluded work: Passed
- Final scope: Passed

### Remaining Risks

- No referential integrity for `changedByUserId`.
- Append-only behavior is not enforced.
- Migration remains untested.
- Build depends on Google Fonts network access.

### Technical Debt

- `.env.example` is absent.
- No automated test script exists.

### Recommended Next Action

Review DB-04A and issue `Approve implementation` if acceptable.

### Approval Status

- Plan approval: Approved
- Implementation approval: Pending
- Commit: Not created
