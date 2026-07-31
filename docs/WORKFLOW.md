# Ilmo Implementation Workflow

## Purpose

This document defines the approved implementation order and the
mandatory process for each milestone. Approval applies only to the
current milestone.

## Exact Approval Commands

- `Approve plan`
- `Approve implementation`
- `Next slice`

`Approve plan` authorizes only the current plan.
`Approve implementation` allows the accepted work to be committed.
`Next slice` allows planning of the next authorized milestone.

Codex must not implement before `Approve plan`, commit before
`Approve implementation`, or plan the next milestone before
`Next slice`. Do not add extra approval gates inside one milestone.

## Remaining Implementation Order

1. RR-01 — UI review and release readiness
2. Deployment

DB-05 and VS-01 through VS-03 are committed and integrated into `main`.
RR-01 is the current authorized milestone. It reviews and corrects confirmed
Version 0 defects without redesigning the approved flows or adding deployment
configuration. Deployment remains a separate milestone.

## Mandatory Milestone Process

For every milestone:

1. Read `AGENTS.md`, `docs/PROJECT_SPEC.md`, `docs/WORKFLOW.md`, and
   `docs/PROGRESS.md`.
2. Read `docs/DATABASE_DESIGN.md` when data is involved.
3. Confirm the authorized milestone.
4. Present one plan with objective, acceptance criteria, expected
   files, data flow, smallest implementation, validation, risks, branch,
   and commit plan.
5. Stop for `Approve plan`.
6. Implement only the approved scope.
7. Run the approved validation and inspect the actual Git diff.
8. Create a concise worklog from the actual diff and update progress.
9. Present the result and stop for `Approve implementation`.
10. Commit only after approval, then stop for `Next slice`.

## Validation

- Run the checks approved for the milestone.
- Run relevant automated tests when a test setup exists.
- Perform relevant manual verification.
- Run lint and build unless the approved plan says otherwise.
- Inspect Git status, changed-file scope, and the actual diff.
- Record checks honestly as passed, failed, or not run.
- Report important errors, environment limits, and unresolved risks.
- Never treat an unauthorized or blocked database check as passed.

## Worklogs and Progress

- Keep each new worklog to approximately 30 lines.
- Record only decisions, actual changed files, validation, unresolved
  risks, and approval or commit status.
- Base completed worklogs on the actual implementation diff.
- Do not modify previous worklogs.
- Update progress with actual state only.

## Database and Environment Safety

- Never read or print `.env` values.
- Never create or apply a migration without a specific approved plan.
- Never run destructive or mutating database commands without explicit
  approval.
- Keep the Windows Prisma engine limitation and untested migration path
  visible until resolved and verified.
- Abort rather than confirm any unexpected migration reset prompt.
- Review a create-only migration before applying it.
