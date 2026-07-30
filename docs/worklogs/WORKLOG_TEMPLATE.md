# Worklog: `<WORK-ITEM-ID> — <Title>`

> Blank reusable template. Complete this document only from the actual
> Git diff after implementation. Do not present planned changes as
> completed work.

## 1. Work Item Identity

| Field | Value |
| --- | --- |
| ID | `<ID>` |
| Title | `<Title>` |
| Phase | `<Phase>` |
| Status | `<Planned / Implemented / Verified / Approved / Committed>` |
| Branch | `<Actual branch>` |
| Base commit | `<Commit hash>` |
| Planned commit message | `<English commit message>` |
| Related decisions | `<Links or decision references>` |

### Acceptance Criteria

- [ ] `<Criterion>`

## 2. Starting State

### Existing Behavior

`<Describe verified behavior before the change.>`

### Relevant Existing Files

- `<Path and purpose>`

### Missing Behavior

`<Describe the gap addressed by this item.>`

### Known Limitations

- `<Limitation>`

### Recommended Starting Point for Reading the Code

`<Identify the best file or symbol to read first and explain why.>`

## 3. Actual End-to-End Flow

`<Describe or diagram the real implemented execution and data flow.
Do not copy only the planned architecture.>`

## 4. Files Actually Changed

Repeat this section for every created, modified, renamed, or deleted
file.

### `<Path>`

- Change type: `<Created / Modified / Renamed / Deleted>`
- Previous purpose: `<Purpose before this work, or not applicable>`
- Changed symbol, section, function, model, or component: `<Name>`
- Approximate line range: `<Range when useful>`
- Reason for change: `<Reason>`
- Role in end-to-end flow: `<Role>`
- Called by: `<Files or symbols>`
- Calls: `<Files or symbols>`
- Owner inspection focus: `<What to inspect>`
- Classification: `<Required / Supporting / Test / Documentation>`

## 5. Code-Reading Order

1. `<File or symbol>` — `<Why this is the useful starting point>`
2. `<File or symbol>` — `<Why it follows>`

## 6. Before and After

### Previous Behavior

`<Verified behavior before implementation.>`

### New Behavior

`<Verified behavior after implementation.>`

### User-Visible Changes

`<Finnish-facing change or none.>`

### Database Changes

`<Models, migration, queries, transactions, or none.>`

### Validation Changes

`<Server validation changes or none.>`

### Error-Handling Changes

`<Error behavior changes or none.>`

### Authentication or Security Changes

`<Authentication, authorization, privacy, rate-limit, or security
changes or none.>`

## 7. Important Code Explanations

Write explanations in Thai for the project owner.

### Difficult Code

`<Explain the difficult implementation in Thai.>`

### Important TypeScript Syntax

`<Explain relevant TypeScript syntax in Thai.>`

### Next.js Server and Client Boundaries

`<Explain boundaries and why they are correct in Thai.>`

### Validation Boundaries

`<Explain trusted and untrusted inputs in Thai.>`

### Transaction Boundaries

`<Explain atomic operations and rollback behavior in Thai.>`

### Why This Approach Was Chosen

`<Explain the reasoning in Thai.>`

### Important Rejected Alternatives

- `<Alternative and reason for rejection>`

## 8. Commands and Evidence

Record every command actually executed, why it was run, and what
happened. When a required check was not run, record it explicitly as
`Not run` and explain why.

| Command | Purpose | Result | Status | Important output or error |
| --- | --- | --- | --- | --- |
| `<Command>` | `<Purpose>` | `<Result>` | `<Passed / Failed / Not run / Blocked>` | `<Summary>` |

Never mark a command passed unless it was actually executed
successfully.

## 9. Problems Encountered

### Errors

- `<Error>`

### Unexpected Behavior

- `<Behavior>`

### Environment Limitations

- `<Limitation>`

### Workarounds

- `<Workaround>`

### Verified Root Cause

`<Evidence-supported root cause or not verified.>`

### Remaining Uncertainty

- `<Uncertainty>`

## 10. Decisions and Assumptions

### Approved Decisions Used

- `<Decision>`

### New Implementation Decisions Proposed

- `<Proposal requiring approval, or none>`

### Assumptions Used

- `<Assumption and status, or none>`

### Documentation Affected

- `<Path and required update>`

### Migration Impact

`<Impact, none, or not applicable.>`

## 11. Owner Review Checklist

- [ ] Open `<file>`
- [ ] Inspect `<symbol>`
- [ ] Test `<manual flow>`
- [ ] Inspect `<database records or not applicable>`
- [ ] Test `<error case>`
- [ ] Understand `<question or design point>`

## 12. Result

### Acceptance Criteria Result

- `<Criterion>`: `<Passed / Failed / Blocked / Not run>`

### Remaining Risks

- `<Risk>`

### Technical Debt

- `<Debt>`

### Recommended Next Action

`<Action>`

### Approval Status

- Plan approval: `<Not requested / Approved>`
- Implementation approval: `<Not requested / Pending / Approved>`
- Commit: `<Not created / Commit hash>`
