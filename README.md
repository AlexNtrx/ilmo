# Ilmo

Ilmo is a QR-based facility issue reporting system designed for a
fictional small shopping centre.

Visitors can scan a QR code at a toilet location and report one or
multiple issues without creating an account. The system automatically
merges matching reports into an existing open issue or creates a new
issue.

Staff members can sign in to view prioritized issues, manage issue
categories, and mark issues as resolved or invalid.

## Project Status

The project is currently under development.

Current phase:

- Environment setup and version control

## Version 0 Scope

### Public reporter

- Open a location-specific form through a QR code
- Select one or multiple issue categories
- Add a short description when required
- Submit a report without signing in
- Receive a neutral success response

### Staff

- Sign in to the staff workspace
- View active issues ordered by priority
- View issue details and confirmation counts
- Mark issues as resolved or invalid
- View issue status history
- Create, edit, reorder, activate, deactivate, and delete unused issue
  categories

## Core Business Rule

Matching standard reports are merged when they have:

- The same location
- The same issue category
- An existing issue with the `OPEN` status

Free-text categories configured with `ALWAYS_CREATE` always create a
new issue.

## Technology Stack

- Next.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- shadcn/ui
- Sonner
- Zod
- Better Auth
- Vercel

## Local Development

### Requirements

- Node.js 24 LTS
- npm
- Git
- PostgreSQL

### Installation

```bash
npm install