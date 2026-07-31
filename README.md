# Ilmo

Ilmo is a QR-based facility issue reporting system for a fictional
small shopping-centre toilet pilot. Public reporters submit
location-specific reports without signing in, while authenticated staff
review and manage active issues.

## Version 0 Scope

- Finnish public reporting through a location QR code
- One or multiple independently processed issue categories
- Open-issue matching and confirmation tracking
- Staff issue review, resolution, invalidation, and category management
- No push, email, or SMS issue notifications

## Technology Status

The approved stack is Next.js App Router, TypeScript, PostgreSQL, Prisma
ORM, Tailwind CSS, shadcn/ui, Sonner, Zod, Better Auth, Vercel, and
hosted PostgreSQL for the later deployed environment.

The repository currently installs Next.js 16.2.12, React 19.2.4,
TypeScript, Prisma 7.9.1, `pg`, the Prisma PostgreSQL adapter, Tailwind
CSS 4, dotenv, ESLint, Better Auth 1.6.25, the Better Auth Prisma
adapter 1.6.25, the Better Auth schema generator CLI 1.6.25, and tsx
4.23.1. VS-01 also installs Zod 4, shadcn/ui configuration and source
components, a locally bundled Inter variable font, and Sonner for
confirmed staff-action feedback.

## Local Development

### Requirements

- Node.js 24 LTS
- npm
- Git
- PostgreSQL

### Installation

```bash
npm install
```

### Environment variables

The intended setup uses a tracked `.env.example` as the safe template:

```powershell
Copy-Item .env.example .env
```

The tracked `.env.example` contains placeholders for the database and
Better Auth environment boundary. Replace placeholders only in the
untracked `.env`; never commit `.env` or expose its values.

### Prisma Client generation

```bash
npx prisma generate
```

After the initial migration has been applied, the approved database
seed and read-only verification commands are:

```bash
npm run db:seed
npm run db:verify
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Current Status

Phases 1–6 are approved, the Phase 4 low-fidelity wireframes and screen
structure are approved, and Phase 7 environment setup is complete.
Phase 8 database implementation is complete.

The root route remains the Create Next App scaffold. VS-01 implements the
Finnish public reporting flow at `/report/[publicCode]`; VS-02 adds the
protected staff Issue workspace; and VS-03 implements admin-only
Category and User management. The Prisma schema contains the approved Ilmo
domain models, Better Auth models, report-specific confirmation
descriptions, and the temporary duplicate/rate-limit ledger. The DB-05
initial migration and the VS-01 reporting migration are applied to the
local `ilmo` database. The first admin, six Finnish categories, and
pilot Location were seeded and verified idempotently.

The PostgreSQL connection through `pg`, Prisma schema validation,
Prisma Client generation, `npm run lint`, and `npm run build` have
passed in the current setup.

## Documentation

- [Project specification](docs/PROJECT_SPEC.md)
- [Database design](docs/DATABASE_DESIGN.md)
- [Implementation workflow](docs/WORKFLOW.md)
- [Project progress](docs/PROGRESS.md)
