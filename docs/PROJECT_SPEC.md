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
- Staff-owned issue-category management
- Basic duplicate and rate-limit protection

## 3. Approved Exclusions

**Approved Decisions:**

- Public users do not sign in.
- Public users do not see existing issues.
- There is no public sign-up.
- Version 0 does not support reopening an issue.
- Issues are not deleted through the Version 0 application.
- Version 0 has no push, email, or SMS issue notifications.
- Sonner is not a new-issue notification system.

## 4. Actors

### Public Reporter

An unauthenticated visitor who opens a location-specific report form
from a QR code and submits one overall report containing one or more
selected categories.

### Staff User

An authenticated user who can view active issues, inspect issue details
and confirmation counts, close open issues, and manage issue
categories. Staff authentication uses Better Auth.

## 5. Approved User Flows

### Public Reporter Flow

1. A public reporter scans a location-specific QR code.
2. The reporter immediately sees a Finnish location report form.
3. The reporter does not sign in.
4. The reporter does not see existing issues.
5. The reporter selects one or multiple issue categories.
6. The reporter supplies a description when a selected category
   requires one.
7. The system validates the submission on the server.
8. Every selected category is processed independently.
9. The reporter receives one neutral overall success result.

### Staff Flow

1. A staff user signs in through Better Auth. There is no public
   sign-up.
2. The staff user views active issues.
3. The staff user can open issue details and view confirmation counts.
4. The staff user can change an `OPEN` issue to `RESOLVED` or `INVALID`.
5. The close operation also appends the corresponding status-history
   record.

### Issue Category Management Flow

Authenticated staff can:

- Create categories
- Edit categories
- Reorder categories
- Activate and deactivate categories
- Delete an unused category

A category referenced by an Issue cannot be hard-deleted. It must be
deactivated when history must be preserved.

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

### Status and Priority

**Approved Decisions:**

- Issue statuses are `OPEN`, `RESOLVED`, and `INVALID`.
- Version 0 does not support reopening an issue.
- Issue priorities are `NORMAL`, `HIGH`, and `URGENT`.
- A safety category creates an `URGENT` issue from the first report.
- An ordinary issue is promoted to `HIGH` at five confirmations or
  after two hours.
- Closing an Issue and creating its status-history record must be
  atomic.
- Status history is append-only.
- Initial history is `fromStatus = null` to `toStatus = OPEN`.
- Status-history `changeSource` is `SYSTEM` or `STAFF`.

### Duplicate and Rate-Limit Protection

**Approved Decisions:**

- Basic duplicate protection is required.
- Basic rate-limit protection is required.

The approved demo threshold is five submissions per ten minutes. The
identity, key, storage, and privacy design remain open.

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

#### Approved but Not Yet Installed

- Better Auth
- Zod
- Sonner
- shadcn/ui components and configuration

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
- Better Auth for staff
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

- Exact Better Auth schema integration
- Better Auth identity field types, verified against its implementation
  requirements
- `sourceHash` generation, privacy, retention, expiry, and uniqueness
- Rate-limit identity, key, storage mechanism, and privacy handling
- Prisma representation of the one-`OPEN`-issue invariant
- Whether a PostgreSQL partial unique index and custom migration SQL are
  required
- Final database index names
- Cascade and referential actions
- Final colors, typography, spacing, and component styling
- Exact Finnish UI copy
- Final accessibility target
- The safe `.env.example` template, which is not currently present
