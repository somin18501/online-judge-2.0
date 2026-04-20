# @au/api

NestJS backend for the AU Online Judge platform.

## Features

- DB-backed server sessions with secure `HttpOnly` cookies (argon2id-hashed passwords, sha256-hashed session tokens).
- Role-aware guards (`USER` / `ADMIN`).
- Prisma ORM with SQLite for development, PostgreSQL-ready for production.
- Global Zod-backed config validation via `@nestjs/config`.
- Global `ValidationPipe` + feature-level `ZodValidationPipe` for schema-driven inputs.
- Consistent exception mapping (`AllExceptionsFilter`) with Prisma + Zod normalization.
- Problem CRUD with ownership / admin authorization.
- Async submission judging with status lifecycle (`QUEUED` -> `RUNNING` -> final).
- Execution service abstraction with `local` (dev-only) and `docker` (sandboxed) runners.
- Health endpoints via `@nestjs/terminus`.

## Quick start

```bash
# From repo root
pnpm install

# API-specific
cd apps/api
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate   # creates the SQLite dev db + applies migrations
pnpm prisma:seed      # seeds admin/demo users + a few problems
pnpm dev              # nest start --watch
```

The API will be available at `http://localhost:4000/api/v1`.

## Demo credentials (after seeding)

| Role  | Email           | Password     |
| ----- | --------------- | ------------ |
| admin | admin@au.test   | Password1!   |
| user  | demo@au.test    | Password1!   |

## Execution runners

Two runners are available and selected via `EXECUTION_RUNNER`:

- `local` (**default in development**): runs user code directly on the host. Convenient but unsafe. Never use in production.
- `docker`: runs each submission inside a disposable container with `--network=none`, memory/pids/cpu limits, dropped Linux capabilities, and a read-only root filesystem. See `/docker-runners` at the repo root for the language images.

## Production notes

- Switch the `datasource.provider` in `prisma/schema.prisma` to `postgresql` and `DATABASE_URL` to a Postgres URL, then run `pnpm prisma:deploy`.
- Set `COOKIE_SECURE=true`, `COOKIE_SAMESITE=lax` (or `strict`), and a strong `SESSION_SECRET` (32+ chars).
- Set `EXECUTION_RUNNER=docker` and ensure the runner images are built and available.
- Put the API behind a TLS-terminating reverse proxy; the API trusts `x-forwarded-for` for session audit metadata only.
