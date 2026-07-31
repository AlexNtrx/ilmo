# Ilmo Project Progress

## Current State

| Field | Actual state |
| --- | --- |
| Current phase | Vertical slices — staff workspace |
| Current work item | VS-03 — Category and user CRUD |
| Status | Implementation approved; commit pending |
| Active branch | `feature/vs-03-category-user-crud` |
| Base commit | `238092e50ea6bb3df98104268bbc3661b4605f02` |
| Plan approval | Approved |
| Implementation approval | Approved |
| Next authorized work | None |

## Completed State

- Phases 1–7 and the Phase 4 wireframes are approved.
- DB-01 through DB-05 are committed.
- VS-01 is committed as `ec9417d`; VS-02 is committed as `238092e`.
  Both are integrated into `main`.

## Current Implementation

- `/report/[publicCode]` provides the approved public reporting flow.
- `/api/auth/[...all]` mounts Better Auth with public email sign-up,
  email sign-in, and username availability disabled.
- `/staff/login` accepts username and password only.
- `/staff` is protected by a live session and scalar `admin` or `staff`
  role check and lists only open Issues.
- `/staff` preserves Server Component data loading and refreshes it in the
  background every 20 seconds while visible. Hidden tabs pause; returning
  refreshes once immediately, with overlap prevention and listener cleanup.
  Confirmation dialogs and pending staff mutations pause polling; temporary
  refresh failures remain silent and release the next interval.
- Staff details remain readable for open, resolved, and invalid Issues;
  closed Issues expose no mutation actions.
- Resolve and invalid Server Actions use an OPEN-only conditional update
  and append the authenticated actor in the same transaction.
- Successful closures revalidate both staff routes, show Sonner
  feedback, and return to the dashboard.
- The global Toaster persists through staff and login navigation.
- Logout requires an accessible confirmation dialog. Better Auth
  sign-out returns a typed result; only success navigates and shows
  feedback, while failure remains recoverable in the dialog.
- Resolve, invalid, and logout share one controlled confirmation shell
  with semantic tones, pending locks, inline errors, and responsive actions.
- No Prisma schema, migration, seed, category CRUD, or user CRUD change
  is part of VS-02.
- `/staff/admin/categories` provides admin-only create, edit, deterministic
  reorder, activation, deactivation, and race-safe deletion.
- `/staff/admin/users` provides admin-only create, profile edit, separate role
  change, password reset/session revocation, and protected deletion.
- External `/api/auth/admin/*` requests return 404; Ilmo Server Actions pass
  authenticated request headers to the verified Better Auth Admin APIs.

## VS-03 Validation

- `npm test`: 49 tests passed, including all VS-01 and VS-02 regressions.
- Authenticated integration verification passed with a temporary `staff` User:
  username login, scalar session role, `/staff` access, admin-page denial,
  admin-operation denial, external Admin-plugin GET/POST blocking, and cleanup.
- Production build and lint pass. Build retains the known Better Auth warnings
  when URL and secret are unavailable to the build process.
- Owner verification passed with real admin and staff sessions, including
  responsive, keyboard, focus, dialog, authorization, and cleanup checks.

## VS-02 Validation

- `npm test`: 35 tests passed, including all 13 VS-01 tests and focused
  dashboard-refresh timing, visibility, overlap, and cleanup coverage.
- Lint and production build passed after correcting one development-only
  Server Action export error found during browser verification.
- Disabled public auth endpoints returned 404; username sign-in remained
  available and rejected invalid credentials.
- Unauthenticated `/staff` access redirected to `/staff/login`.
- Login layout showed no horizontal overflow at 360, 390, 768, 1280,
  and 1600 pixel widths.
- Owner review found that a successful Issue mutation could unmount the
  action component before its success effect ran. The client now handles
  the returned result before navigation, and the Toaster lives in the
  root layout.
- Owner review also found that logout had no confirmation or feedback.
  The corrected dialog, status mutations, logout, and session-expiry
  paths await real-session re-verification because no credential was
  provided; no auth bypass or test account was created.
- The shared dialog shell was rendered without overflow at 360, 390, and
  1280 pixels. Escape, outside cancellation, focus restoration, login
  navigation, one logout toast, and an error-free console were observed.
- Production build and lint pass with the auto-refresh component. Real-session
  cross-browser freshness, scroll, and open-dialog checks remain pending.

## Worklog Index

| Work item | Worklog | Commit |
| --- | --- | --- |
| DB-01 | [DB-01](worklogs/DB-01.md) | `0520ddb` |
| DB-02 | [DB-02](worklogs/DB-02.md) | `d418496` |
| DB-03 | [DB-03](worklogs/DB-03.md) | `1d63226` |
| DB-04A | [DB-04A](worklogs/DB-04A.md) | `ce1946f` |
| DB-04B | [DB-04B](worklogs/DB-04B.md) | `82ac789` |
| DB-05 | [DB-05](worklogs/DB-05.md) | `516cf09` |
| VS-01 | [VS-01](worklogs/VS-01.md) | `ec9417d` |
| VS-02 | [VS-02](worklogs/VS-02.md) | `238092e` |
| VS-03 | [VS-03](worklogs/VS-03.md) | Not committed |

## Blockers and Risks

- Authenticated browser verification still requires the owner to sign in.
- Better Auth build-time warnings remain when its URL and secret are not
  available to the build process; no values were read or printed.
- The Windows Prisma engine had an earlier intermittent `spawn UNKNOWN`.
- Age-only HIGH promotion without a later report remains unresolved.
- The pilot cookie identity and lack of a database one-OPEN-issue
  constraint remain accepted VS-01 limitations.
- npm reports 18 dependency vulnerabilities; no audit fix was run.
- Automated browser end-to-end tests remain intentionally absent.

## Next Authorized Work

None until VS-03 receives implementation approval and is committed.
