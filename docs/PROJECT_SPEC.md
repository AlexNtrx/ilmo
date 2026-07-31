# Ilmo Project Specification

## 1. Product Summary

**Approved Decision:** Ilmo is a QR-based facility issue reporting
system for a fictional small shopping-centre toilet pilot.

The system gives visitors a low-friction way to report a facility issue
and gives staff a controlled workspace for reviewing and closing active
issues.

## 2. Version 0 Scope

Version 0 includes:

- Location-specific public reporting through QR URLs
- Finnish public reporting without authentication
- Selection of one or multiple issue categories
- Independent processing of every selected category
- Open-issue matching, confirmation tracking, and issue creation
- Staff authentication and active-issue management
- Issue resolution and invalidation with append-only status history
- Admin-owned issue-category management
- Admin-only basic user management
- Basic duplicate and rate-limit protection

## 3. Approved Exclusions

**Approved Decisions:**

- Public users do not sign in.
- Public users do not see existing issues.
- There is no public sign-up.
- Version 0 does not expose ban, unban, account disabling, account
  re-enabling, impersonation, email editing, session-listing UI, or
  manual session-management UI.
- Version 0 does not support reopening an issue.
- Issues are not deleted through the Version 0 application.
- Version 0 has no push, email, or SMS issue notifications.
- Sonner is not a new-issue notification system.

## 4. Actors

### Public Reporter

An unauthenticated visitor who opens a location-specific report form
from a QR code and submits one overall report containing one or more
selected categories.

### Admin

An authenticated user who can use the staff dashboard, close issues,
manage issue categories, and perform the approved basic user-management
operations.

### Staff

An authenticated user who can use the dashboard, inspect issues and
confirmation counts, and close open issues. Staff cannot manage issue
categories, users, roles, or system configuration.

Both roles authenticate through Better Auth with username and password.
The only application roles are `admin` and `staff`.

## 5. Approved User Flows

### Public Reporter Flow

1. A public reporter scans a location-specific QR code.
2. The reporter immediately sees a Finnish location report form.
3. The reporter does not sign in.
4. The reporter does not see existing issues.
5. The reporter selects one or multiple issue categories.
6. The reporter supplies a description when a selected category
   requires one.
   When supplied, the shared description is attached to every selected
   category. A merge preserves the existing Issue description and
   stores the new text on the new IssueConfirmation.
7. The system validates the submission on the server.
8. Every selected category is processed independently.
9. The reporter receives one neutral overall success result.

### Authenticated Issue Flow

1. An admin or staff user signs in with username and password. There is
   no public sign-up.
2. The authenticated user views active issues ordered by priority, age,
   and stable identifier.
3. The authenticated user can open issue details and view confirmation
   counts and supplied descriptions. A direct detail URL remains
   readable after an Issue is closed.
4. The authenticated user can change an `OPEN` issue to `RESOLVED` or
   `INVALID`.
5. The close operation also appends the corresponding status-history
   record.

**Approved Decisions:**

- Better Auth disables public email sign-up, email sign-in, and
  username-availability paths while preserving username/password
  sign-in.
- The staff dashboard lists only `OPEN` Issues in Version 0.
- While the `/staff` tab is visible, the dashboard refreshes its Server
  Component data every 20 seconds. Refreshing pauses while hidden and runs
  once immediately when the tab becomes visible again, without a full-page
  reload, scroll reset, dialog interruption, loading flash, or toast.
- Background refresh also pauses while a confirmation dialog or staff mutation
  is pending. Attempts do not overlap, temporary failures remain silent, and
  polling resumes on the next available interval.
- A closed Issue detail is read-only and exposes no mutation actions.
- The top-Location summary counts confirmations on open Issues and
  breaks ties by Finnish Location name and then Location ID.
- Successful status changes revalidate the dashboard and affected
  detail path before returning a typed result.
- Sonner feedback is shown only after confirmed transaction success,
  followed by navigation to the staff dashboard.
- Staff logout requires confirmation. A successful Better Auth sign-out
  returns to the login page and shows one Sonner success message.
- Cancelled or failed logout keeps the current page and never shows
  success feedback. Failure remains recoverable in the confirmation
  dialog.

### Issue Category Management Flow

Only an admin can:

- Create categories
- Edit categories
- Reorder categories
- Activate and deactivate categories
- Delete an unused category

A category referenced by an Issue cannot be hard-deleted. It must be
deactivated when history must be preserved.

Category administration uses deterministic Move Up and Move Down actions.
The persisted order is normalized to ten-step `sortOrder` values. A friendly
reference pre-check is followed by database-enforced foreign-key protection.

### User Management Flow

Only an admin can:

- Create a user
- List and view users
- Edit username
- Edit name
- Edit role
- Reset a password
- Delete a user

The create-user form contains `username`, `name`, temporary password,
and role. The edit-user form contains username, name, role,
reset-password action, and delete-user action. The login form contains
only username and password.

**Approved Decisions:**

- The only roles are `admin` and `staff`.
- Role input must be one scalar value; arrays, comma-separated roles,
  and unknown values are rejected on the server.
- New accounts default to `staff` when no approved admin role selection
  is supplied.
- Only admins can manage users or roles.
- The last remaining admin cannot be demoted or deleted.
- An admin cannot delete their own account in Version 0.
- Password reset automatically revokes the target user's sessions.
- User deletion cascades to Better Auth Session and Account records.
- User deletion preserves IssueStatusHistory and sets its
  `changedByUserId` to null.
- Internal email is generated on the server from an opaque UUID and
  does not change when username changes.
- Before deleting or demoting an admin, the server counts admins and
  rejects the operation when only one admin remains.
- Advanced concurrency protection for the last-admin check is deferred.
- Profile updates change only username, display username, and name through
  `adminUpdateUser`. Role changes are separate `setRole` operations.
- Usernames contain 3–30 ASCII letters, numbers, underscores, or periods.
  The stored username is lowercase and the submitted form is retained as the
  display username. Version 0 has no reserved-username list.
- Names contain 1–100 characters and passwords contain 8–128 characters.
- Internal email uses an opaque UUID address under `users.ilmo.invalid`.
- A self-password reset revokes the current session and requires a new login.
  A revocation failure after password update is reported as a partial failure.
- External `/api/auth/admin/*` requests are unavailable. Authenticated Ilmo
  Server Actions own all user-management operations.

## 6. Approved Business Rules

### Report Matching

**Approved Decisions:**

- Standard categories use `MERGE_OPEN`.
- An existing issue matches only when location, issue category, and
  `OPEN` status are all the same.
- A matching report creates an `IssueConfirmation`.
- A matching report does not create a duplicate `Issue`.
- When no matching `OPEN` issue exists, the system creates:
  - A new `OPEN` Issue
  - Its first IssueConfirmation
  - Its initial IssueStatusHistory record
- The new Issue, first confirmation, and initial history must be
  created atomically.
- Categories configured as `ALWAYS_CREATE` always create a new Issue.
- A category can require a description.
- The Version 0 description maximum is 200 characters.
- IssueConfirmation preserves the description supplied with each
  report. A later merged report does not overwrite `Issue.description`.

### Status and Priority

**Approved Decisions:**

- Issue statuses are `OPEN`, `RESOLVED`, and `INVALID`.
- Version 0 does not support reopening an issue.
- Issue priorities are `NORMAL`, `HIGH`, and `URGENT`.
- A safety category creates an `URGENT` issue from the first report.
- An ordinary issue is promoted to `HIGH` at five confirmations or
  after two hours.
- An `URGENT` issue is never downgraded to `HIGH`. Only a `NORMAL`
  issue can be promoted by the confirmation-count or age rule.
- Closing an Issue and creating its status-history record must be
  atomic.
- A staff close transaction conditionally updates only an `OPEN` Issue.
- An already-closed Issue is not updated and receives no duplicate
  status-history row.
- Status history is append-only.
- Initial history is `fromStatus = null` to `toStatus = OPEN`.
- Status-history `changeSource` is `SYSTEM` or `STAFF`.

### Duplicate and Rate-Limit Protection

**Approved Decisions:**

- Basic duplicate protection is required.
- Basic rate-limit protection is required.

The approved demo threshold is five submissions per ten minutes.
Version 0 uses an opaque HttpOnly browser cookie and stores its
server-secret HMAC only in the temporary ReportSubmission ledger. An
identical payload within sixty seconds returns the same neutral success
without another confirmation. Ledger rows older than 24 hours are
removed opportunistically during submission.

IssueConfirmation does not retain reporter hashes in Version 0.
Clearing the cookie or changing browsers can bypass this pilot-level
protection.

### Issue Categories and Seed Data

**Approved Decisions:**

- Default categories are inserted only when the category table is
  empty.
- Seeded categories remain editable staff-owned data.
- IssueCategory has no code field.
- IssueCategory has no `isDefault` field.
- Category behavior is controlled by:
  - `isUrgent`
  - `mergeMode`
  - `requiresDescription`
  - `isActive`
  - `sortOrder`

The approved initial categories are:

| sortOrder | Finnish name | Urgent | Merge mode | Description required |
| ---: | --- | --- | --- | --- |
| 10 | WC-paperi on loppu | No | `MERGE_OPEN` | No |
| 20 | Saippua on loppu | No | `MERGE_OPEN` | No |
| 30 | Tila tarvitsee siivousta | No | `MERGE_OPEN` | No |
| 40 | WC-istuin tai muu varuste on rikki | No | `MERGE_OPEN` | Yes |
| 50 | Turvallisuusriski | Yes | `MERGE_OPEN` | Yes |
| 60 | Muu ongelma | No | `MERGE_OPEN` | Yes |

All initial categories are active. No initial category uses
`ALWAYS_CREATE`.

The pilot Location uses public code `pilot-wc-001`, Finnish name
`Kauppakeskuksen WC`, and Finnish description
`Pilottikohteen yleinen WC`. Seed execution creates it when absent and
does not update an existing record.

The seed provisions the first admin only when no admin exists. It uses
server-only Better Auth account creation, an opaque internal email, and
environment-provided username, name, and password. All required values
must be valid before any seed write. Secrets and passwords must never
be printed or committed.

## 7. Approved Architecture

**Approved Decisions:**

- Use one Next.js App Router full-stack repository.
- Use TypeScript, PostgreSQL, Prisma ORM, and Tailwind CSS.
- Public report submission uses a Route Handler.
- Staff mutations use Server Actions.
- Data reads use Server Components through service and data layers.
- Client Components are used only where interaction requires them.
- Zod validation runs on the server.
- Shared business services sit above Prisma and data access.
- Better Auth provides staff authentication.
- Better Auth uses secure server-managed sessions and cookies according
  to its verified implementation requirements.
- Sonner is used only for short staff-action feedback.
- Vercel is the deployment target.
- Hosted PostgreSQL is planned for the deployed environment.

### Technology Status

#### Approved Stack

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- shadcn/ui
- Sonner
- Zod
- Better Auth
- Vercel
- Hosted PostgreSQL for the later deployed environment

#### Installed Stack

Derived from the current repository and `package.json`:

- Next.js 16.2.12
- React 19.2.4
- TypeScript
- Prisma 7.9.1
- `pg`
- Prisma PostgreSQL adapter
- Tailwind CSS 4
- dotenv
- ESLint
- Better Auth 1.6.25
- Better Auth Prisma adapter 1.6.25
- Better Auth schema generator CLI 1.6.25
- Zod 4
- shadcn/ui configuration and VS-01 component sources
- Locally bundled Inter variable font
- Sonner 2

#### Approved but Not Yet Installed

- None

Approved but uninstalled technologies are not currently implemented.

## 8. Approved Wireframes and Screen Structure

The Phase 4 low-fidelity wireframes and screen structure are approved.

Figma source:
[Ilmo low-fidelity wireframes](https://www.figma.com/design/xy6Qo2HmU9bPDTO9Vm6g9g/ilmo)

Approved screens and states:

- Public location report form
- Neutral success state
- Invalid location state
- Staff login
- Mobile staff dashboard
- Desktop staff dashboard
- Issue detail
- Loading state
- Empty state
- Error state
- Unauthorized state

Final colors, typography, exact spacing, final component styling, exact
Finnish UI copy, and the final accessibility target remain open. These
open visual details do not make the approved screen structure
provisional.

## 9. Finnish UI and Language Requirements

**Approved Decisions:**

- Documentation, code, identifiers, file names, routes, branch names,
  and commit messages are written in English.
- Explanations presented to the project owner are written in Thai.
- Application user-facing text is written in Finnish.
- The public success response is one neutral overall result.

Exact Finnish UI copy remains an open implementation and design detail.

## 10. Approved Decisions

The statements labeled **Approved Decision** throughout this
specification are locked requirements. Implementation must not change
them without explicit owner approval.

The following decision groups are approved:

- Product and Version 0 boundaries
- Public and staff flows
- Report matching and confirmation behavior
- Status and priority models
- Category behavior and seed ownership
- Append-only status history
- Transaction boundaries
- Duplicate and rate-limit requirements
- Full-stack application architecture
- Better Auth username-and-password authentication
- Two-role authorization and admin-only basic user management
- User deletion preservation and cascade behavior
- Phase 4 wireframes and screen structure
- Finnish application language
- Vercel and hosted PostgreSQL deployment direction

## 11. Approved Demo Assumptions

The following values are approved for the current demo but may be
revised later through an explicit decision:

- Promote an ordinary issue to `HIGH` at five confirmations or after
  two hours.
- Allow five submissions per ten minutes under the basic rate-limit
  policy.

## 12. Genuine Open Implementation Details

The following remain open and must not be converted into decisions
without owner approval:

- Advanced concurrency protection for the last-admin check
- Temporary-password delivery
- Stronger reporter identity or distributed abuse protection beyond the
  approved cookie-based pilot mechanism
- Database-enforced one-`OPEN`-issue protection beyond the approved
  Serializable transaction and retry behavior
- Final database index names
- Referential actions not explicitly approved in the implemented
  schema
- Final colors, typography, spacing, and component styling
- Exact Finnish UI copy
- Final accessibility target
