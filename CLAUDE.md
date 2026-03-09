# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # prisma generate + next build
npm run lint         # ESLint
npm run prisma:push  # Apply schema changes to DB (use instead of migrate — shadow DB not available)
npm run prisma:studio  # Open Prisma Studio
```

> **Note:** `prisma migrate dev` fails because the DB user lacks permission to create shadow databases. Always use `prisma db push` (with `--accept-data-loss` if needed) for schema changes.

## Architecture

**Stack:** Next.js 15 App Router · React 19 · MySQL via Prisma · Better Auth · shadcn/ui (Radix + Tailwind) · TypeScript

**What it is:** V Arena — a community site for V Rising with build sharing, spell tier lists, leaderboards, and user profiles.

### Authentication

Two-layer user system:

- **Better Auth** manages its own tables (`user`, `session`, `account`, `verification` mapped via `@@map`). Handles email/password auth, sessions, email verification, and password reset.
- **Prisma `User` model** is the app-level user, synced from Better Auth via hooks in `lib/better-auth/auth.ts`. Some API routes have fallback sync logic for missed hook calls.

Key files:
- `lib/better-auth/auth.ts` — auth config, email templates, user sync hooks
- `lib/better-auth/server.ts` — `getServerSession()` for server components/routes
- `lib/better-auth/client.ts` — `authClient` for client components
- `app/api/auth/[...better]/route.ts` — auth API handler with rate limiting (5 attempts / 15 min)

### Database

Prisma ORM with MySQL2. Singleton PrismaClient in `lib/prisma.ts`. The schema separates Better Auth internal tables from domain models.

Mutations use `revalidateTag()` for Next.js cache invalidation (tag-based, not time-based).

### API Routes

Pattern in `app/api/*`:
1. Get session via `getServerSession()`
2. Validate input
3. Query/mutate via Prisma
4. Call `revalidateTag()` if needed

### Middleware

`middleware.ts` protects `/capybara/*` (admin panel), `/profile/*`, and `/auth/*`. Redirects authenticated users away from auth pages. Admin access checked via `isAdminEmail()` util.

### Key Conventions

- **`prisma db push` only** — no shadow DB access for migrations.
- **Build code format:** game builds are serialized as a single encoded string with positional character slots. Validation logic lives in `app/api/builds/`.
- **Public build limits:** max 5 public builds per user, 100 total.
- **Admin route:** `/capybara` is the admin panel (not `/admin`).
- **Steam linking:** uses Steam OpenID 2.0 (not OAuth2) via custom routes at `app/api/auth/steam/`.

## Design Philosophy
   - Stack: Tailwind + shadcn/ui
   - Aesthetic: utilitarian/refined, dark-first
   - Never use generic gradients or default color schemes
   - Typography: always use a distinctive display font paired with a refined body font
   - Prefer asymmetric layouts, generous negative space
