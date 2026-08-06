# Ilmo

Ilmo is a QR-based facility issue reporting system designed for a fictional shopping-centre toilet pilot.

Visitors can scan a location-specific QR code and report problems without creating an account. The system matches new reports with existing open issues to reduce duplicates, while authenticated staff can review, manage, resolve, or invalidate reported issues.

## Key Features

* QR-based public reporting without sign-in
* Location-specific issue reports
* Multiple issue categories in one submission
* Open-issue matching and confirmation tracking
* Staff dashboard for issue management
* Issue resolution and invalidation
* Category management
* Finnish-language public reporting flow

## Tech Stack

* Next.js App Router
* TypeScript
* PostgreSQL
* Prisma ORM
* Tailwind CSS
* shadcn/ui
* Zod
* Better Auth
* Sonner
* Vercel

## Project Scope

Version 0 focuses on the complete reporting and staff-management workflow.

Push notifications, email notifications, and SMS notifications are outside the current scope.

## Local Development

```bash
npm install
npx prisma generate
npm run dev
```

Create a local environment file from the provided template:

```powershell
Copy-Item .env.example .env
```

After applying the database migration:

```bash
npm run db:seed
npm run db:verify
```

Build the production version with:

```bash
npm run build
```

## Status

Version 0 release candidate.
