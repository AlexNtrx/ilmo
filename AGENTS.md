<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Ilmo Mandatory Project Rules

These rules apply to Codex and every developer working in this repository.

## Required Reading

Before planning or implementing work:

1. Read this file.
2. Read [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md).
3. Read [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) when the work involves data.
4. Read [`docs/WORKFLOW.md`](docs/WORKFLOW.md).
5. Read [`docs/PROGRESS.md`](docs/PROGRESS.md).
6. Read the relevant worklog when continuing an existing work item.

## Decision and Scope Control

- Treat every item labeled **Approved Decision** as locked unless the project owner explicitly changes it.
- Never silently convert an **Open Implementation Detail** or assumption into a decision.
- Modify only files inside the currently approved work-item scope.
- Preserve working behavior outside the approved scope.
- Keep the project documentation synchronized with actual implementation.

## Approval Gates

The exact approval commands are:

- `Approve plan`
- `Approve implementation`
- `Next slice`

Never implement before `Approve plan`. Never commit before `Approve implementation`. Never begin or plan the next work item before `Next slice`.

Follow the complete mandatory process in [`docs/WORKFLOW.md`](docs/WORKFLOW.md). An approval applies only to the current work item and does not authorize unrelated changes.

## Language Rules

- Write documentation, code, identifiers, file names, routes, branch names, and commit messages in English.
- Present explanations to the project owner in Thai.
- Write application user-facing text in Finnish.

## Security and Database Safety

- Never read, print, expose, or commit `.env` values.
- Never run destructive database commands without explicit approval.
- Never create or apply a migration without a specific approved plan.
- Never claim that a command or test passed unless it was actually executed successfully.
- Record commands, results, failures, limitations, and workarounds honestly.

## Implementation Boundaries

- Preserve the approved Next.js App Router architecture described in `docs/PROJECT_SPEC.md`.
- Use complete vertical slices after Phase 8 rather than implementing broad horizontal layers.
- Keep server validation, authorization, transaction, and data-access boundaries explicit.
- Create or update the current work-item worklog from the actual Git diff after implementation.
