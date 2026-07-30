# Ilmo Implementation Workflow

## Purpose

This document defines both the implementation order and the mandatory
execution process for every work item. Documentation-task approval does
not approve Phase 8, Prisma schema changes, database migrations, or
application implementation.

## Exact Approval Commands

- `Approve plan`
- `Approve implementation`
- `Next slice`

Their meanings are:

- `Approve plan`: Codex may implement only the current approved work
  item.
- `Approve implementation`: The current implementation may be accepted
  and committed.
- `Next slice`: Codex may begin planning the next authorized work item.

Codex must not implement before `Approve plan`, commit before
`Approve implementation`, or begin or plan the next item before
`Next slice`.

## Implementation Order

### Phase 8 — Database Implementation

Phase 8 is divided into small reviewable work items:

#### DB-01 — Enums and Location

- Define the approved domain enums needed by this work item.
- Implement the approved Location concept.
- Resolve only implementation details required by this scope.

#### DB-02 — IssueCategory

- Implement the approved IssueCategory concept.
- Preserve the decisions that there is no code field and no
  `isDefault` field.
- Do not implement seed execution until DB-05.

#### DB-03 — Issue and IssueConfirmation

- Implement the approved Issue and IssueConfirmation concepts.
- Plan the one-`OPEN`-issue invariant and `sourceHash` boundaries without
  inventing unapproved privacy decisions.

#### DB-04A — IssueStatusHistory

- Implement the approved history concept and append-only model.
- Preserve nullable initial `fromStatus`.
- Keep `changedByUserId` as a temporarily unbound nullable String.
- Do not add Better Auth models, packages, configuration, or relations.

#### DB-04B — Better Auth Schema Verification and User Relation

- Select and pin the Better Auth and Prisma adapter versions.
- Verify official installation and Prisma 7 integration requirements.
- Approve the minimal auth configuration, authentication method,
  plugins, and additional fields.
- Generate or inspect the Prisma schema from the actual configuration.
- Approve mappings, identifiers, constraints, relations, and indexes.
- Add the `changedByUser` relation only after User is verified.

#### DB-05 — Migration, Seed Data, and Database Verification

- Begin only after DB-04B is approved, implemented, committed, and
  integrated into `main`.
- Plan and create migration artifacts only after specific approval.
- Insert default categories only when the category table is empty.
- Verify seed idempotency and that seeded categories remain editable.
- Verify the database behavior required by the approved design.

Every DB work item requires its own plan, acceptance criteria, expected
changed files, review, plan approval, and implementation approval. The
entire Prisma schema must not be implemented as one large work item.

### Vertical Slices After Phase 8

After Phase 8, implementation uses complete vertical slices rather than
broad horizontal layers.

The first vertical slice is:

```text
QR/location report page
→ server-side validation
→ duplicate and rate-limit protection
→ create or merge business service
→ Prisma transaction
→ PostgreSQL
→ staff dashboard
→ staff resolve action
→ atomic status-history update
```

Better Auth, Zod validation, services, UI, and supporting database work
are introduced inside the first slice where each is required, while
preserving the approved architecture.

Every slice must include:

- User story
- Acceptance criteria
- Expected changed files
- End-to-end data flow
- Smallest working implementation
- Tests and verification
- Code review
- Commit plan
- Plan approval gate
- Implementation approval gate

## Mandatory Work-Item Process

For every implementation work item:

1. Read `AGENTS.md`.
2. Read `docs/PROJECT_SPEC.md`.
3. Read `docs/DATABASE_DESIGN.md` when the task involves data.
4. Read `docs/WORKFLOW.md`.
5. Read `docs/PROGRESS.md`.
6. Read the relevant existing worklog when continuing an existing item.
7. Confirm the current authorized work item.
8. Present a plan containing:
   - Work item ID
   - User story or technical objective
   - Acceptance criteria
   - Expected changed files
   - End-to-end data flow
   - Smallest working implementation
   - Validation and test plan
   - Risks
   - Open implementation decisions
   - Branch suggestion
   - Commit plan
9. Stop and wait for the exact command `Approve plan`.
10. Implement only the approved scope.
11. Run the required validation described below.
12. Inspect the actual Git diff.
13. Create or update the work-item worklog from the actual changes.
14. Update `docs/PROGRESS.md`.
15. Present the implementation result.
16. Stop and wait for the exact command `Approve implementation`.
17. Commit only after implementation approval.
18. Do not begin or plan the next item.
19. Stop and wait for the exact command `Next slice`.

## Required Validation for Every Work Item

Every work item must define and perform validation appropriate to its
approved scope.

- Run relevant automated tests when an approved test setup exists.
- Perform manual verification of the changed user flow or technical
  behavior.
- Run `npm run lint`, or record why it was not run.
- Run `npm run build`, or record why it was not run.
- Inspect the actual Git diff and confirm that it matches the approved
  file and behavior scope.
- Confirm that unrelated working behavior was preserved.
- Record every required check as `passed`, `failed`, or `not run`.
- Never report a check as passed unless it was actually executed
  successfully.
- Report important output, errors, environment limitations, and
  remaining uncertainty honestly.

Database validation, migrations, destructive commands, and package
installation still require their own explicit approved scope. A blocked
or unauthorized check must be reported as `not run`, together with the
reason; it must not be treated as passed.

## Worklog and Progress Requirements

- Use `docs/worklogs/WORKLOG_TEMPLATE.md`.
- Create a completed worklog only from the actual post-implementation
  Git diff.
- Do not create placeholder completed worklogs.
- Record every command actually executed, its purpose, its real result,
  its `passed`, `failed`, or `not run` status, and important output or
  error summary.
- Update progress with actual state only.
- Do not list planned work as complete.
- Add the accepted commit hash only after a commit exists.

## Database Safety

- Never read or print `.env` values.
- Never create or apply a migration without a specific approved plan.
- Never run a destructive database command without explicit approval.
- Treat the blocked Windows Prisma engine and untested migration path as
  active risks until resolved and verified.
- Never report database verification as passed when it was not run or
  was blocked.
