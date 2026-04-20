# AU Online Judge

A modern fullstack TypeScript rewrite of an online coding judge platform. Users can
browse and solve coding problems in C, C++, Python, and JavaScript, run code against
custom input, submit solutions against hidden test cases, and author their own
problems. Code executes inside isolated Docker containers with strict resource and
network limits.

> The original MERN implementation lives in [`legacy/`](./legacy/) for reference only.

## Stack

- **Monorepo**: `pnpm` workspaces
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, `shadcn/ui`, React Hook Form, Zod, Zustand, Axios, Monaco editor
- **Backend**: NestJS 10, Prisma 5, Argon2, secure `HttpOnly` session cookies, Zod-validated DTOs
- **Database**: SQLite in dev (zero-install), PostgreSQL in production
- **Judge**: Docker-isolated runners for C, C++, Python, JavaScript with `--network=none`, memory/CPU/pids limits, and dropped capabilities
- **Shared contracts**: `@au/types` package with shared enums, API types, and Zod schemas consumed by both apps

## Repository layout

```
apps/
  web/     Next.js frontend
  api/     NestJS backend (Prisma + judge service)
packages/
  types/   Shared domain enums, API types, Zod schemas (@au/types)
  config/  Shared ESLint / TypeScript base configs
docker/
  compose.yaml         Postgres-for-local-dev
  runners/*.Dockerfile Judge runner images
legacy/    Original MERN implementation (read-only reference)
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (required for secure code execution)

## Quick start

```bash
pnpm install

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm --filter @au/api prisma:migrate
pnpm --filter @au/api prisma:seed

# build the four judge runner images once (needed for Docker execution)
bash docker/runners/build-all.sh

pnpm dev                    # starts web and api together
```

Frontend: http://localhost:3000  
Backend:  http://localhost:4000

## Useful scripts

Run from the monorepo root:

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `pnpm dev`        | Runs `web` and `api` concurrently                    |
| `pnpm build`      | Builds every package/app                             |
| `pnpm lint`       | Lints all workspaces                                 |
| `pnpm test`       | Runs unit tests (Jest for api, Vitest for web/types) |
| `pnpm typecheck`  | Typechecks every workspace                           |
| `pnpm format`     | Formats with Prettier                                |
| `pnpm db:migrate` | Runs Prisma migrations in `apps/api`                 |
| `pnpm db:seed`    | Seeds the database with demo content                 |

## Authentication

Authentication uses DB-backed server sessions delivered via a secure `HttpOnly`
cookie. On login the server hashes a random session token with SHA-256 before
storing it, and returns only the raw token to the client (as the cookie value).
Every protected request re-validates the session against the database, so logout
revokes access immediately. See
[`apps/api/src/auth`](./apps/api/src/auth) for the implementation.

## Code execution

The execution service in `apps/api/src/execution` exposes two flows:

- **Run code** (`POST /execution/run`) — synchronous, user-supplied stdin,
  no grading. Used by the editor "Run" button.
- **Submit** (`POST /submissions`) — creates a `QUEUED` submission, then
  asynchronously runs it against all hidden test cases and streams back
  status updates (`RUNNING → ACCEPTED / WRONG_ANSWER / …`). Polled by the
  frontend on the problem and submission pages.

Two runner strategies ship out of the box:

- `DockerRunner` (production) — each invocation spawns a short-lived container
  with `--network=none`, `--read-only`, `--memory`, `--pids-limit`, `--cpus`,
  `--cap-drop=ALL`, and `--security-opt=no-new-privileges`. A host-side timer
  `docker kill`s the container on timeout. Build the four supported images via
  `bash docker/runners/build-all.sh`.
- `LocalRunner` (dev only, **unsafe**) — executes code directly on the host for
  fast iteration when Docker isn't available. Must never be enabled in
  production. Toggle via `EXECUTION_RUNNER=local|docker`.

## Production deployment notes

- Run Postgres via the provided compose file or a managed provider; point
  `DATABASE_URL` at it and run `prisma:deploy`.
- Deploy the API behind HTTPS on a host with Docker available to the NestJS
  process (the runner shells out to `docker run`). Set `COOKIE_SECURE=true` and
  `COOKIE_SAME_SITE=lax`.
- Deploy the frontend (Next.js) as a standalone Node.js app or on any platform
  that supports App Router SSR. Set `NEXT_PUBLIC_API_URL` to the public API
  origin and ensure CORS on the backend allows the web origin.
- Build judge images once per host and cache them — they have no runtime
  dependency on the internet.

## Further reading

- [`AGENT.md`](./AGENT.md) — project blueprint and constraints
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system design
- [`PRD.md`](./PRD.md) — product requirements
- [`TASKS.md`](./TASKS.md) — phase-by-phase implementation checklist
