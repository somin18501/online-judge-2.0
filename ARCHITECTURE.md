# ARCHITECTURE.md

## Overview

This document describes the target architecture for the rewritten project.

The system is a fullstack TypeScript monorepo composed of:

- a Next.js frontend
- a NestJS API backend
- a relational database via Prisma
- a Docker-based code execution subsystem

The design goal is to keep the codebase maintainable, scalable, and interview-friendly while avoiding unnecessary complexity.

---

## 1. Monorepo Structure

Use a `pnpm` workspace.

Recommended structure:

```text
apps/
  web/                  # Next.js frontend
  api/                  # NestJS backend
packages/
  types/                # shared safe domain types / enums
  config/               # shared tsconfig/eslint/prettier config
  ui/                   # optional reusable UI layer if needed
```

Principles:

- shared packages should stay small and intentional
- frontend and backend should remain independently understandable
- avoid putting backend-only internals into shared packages
- domain contracts may be shared where safe

---

## 2. System Context

At runtime, the system has four major parts:

1. Next.js web application
2. NestJS API server
3. Prisma-backed database
4. Docker-based execution/judge subsystem

High-level flow:

1. User interacts with Next.js frontend
2. Frontend calls NestJS API using Axios
3. API reads/writes relational data through Prisma
4. For run/submit actions, API delegates to execution/judge service
5. Judge service runs code in isolated containers
6. API returns execution/submission status to frontend

---

## 3. Frontend Architecture

### 3.1 Framework

Use Next.js App Router with TypeScript.

Default principles:

- Server Components first
- Client Components only when interactivity is required
- colocate route-specific UI inside route segments where practical
- keep shared UI in `components/` or `features/`

### 3.2 Proposed Frontend Foldering

Example:

```text
apps/web/
  app/
    (public)/
    (auth)/
    dashboard/
    problems/
    api/                # only if needed for frontend-specific route handlers
    layout.tsx
    page.tsx
    loading.tsx
    error.tsx
  components/
  features/
    auth/
    problems/
    submissions/
    editor/
  lib/
    api/
    utils/
    schemas/
  store/
  types/
```

### 3.3 Data Fetching Strategy

Use the following split:

- Server Components for read-heavy public pages such as problem listing and problem details
- Client Components for interactive flows such as auth forms, editor actions, submission polling, dashboards, and mutations
- Axios for API calls from client-side interactive flows

### 3.4 State Strategy

Use Zustand only where shared client state is justified.

Good candidates:

- auth/session UI state
- theme or user preferences if needed
- editor preferences
- cross-route filters if necessary

Do not use Zustand as a replacement for all server data.

### 3.5 Forms And Validation

Frontend forms should use:

- React Hook Form
- Zod
- `zodResolver`

Keep validation schemas explicit and colocated with feature logic where practical.

### 3.6 UI Layer

Use:

- Tailwind CSS for styling/layout
- `shadcn/ui` for accessible component primitives
- a dark-mode-capable theme system

Recommended UI concerns:

- design tokens
- consistent badges for difficulty/verdict
- reusable table/list patterns
- code editor shell abstraction

---

## 4. Backend Architecture

### 4.1 Framework

Use NestJS with TypeScript and Prisma.

NestJS should be used idiomatically:

- controllers for HTTP transport concerns
- services for business logic
- modules for domain boundaries
- DTOs for request validation
- guards for auth/authorization
- interceptors and filters when useful

### 4.2 Proposed Backend Module Structure

```text
apps/api/src/
  main.ts
  app.module.ts
  common/
  config/
  prisma/
  auth/
  users/
  problems/
  submissions/
  execution/
  health/
```

### 4.3 Recommended Module Responsibilities

#### `auth`

- signup
- login
- logout
- refresh token flow
- access token creation
- auth guards
- roles guard

#### `users`

- current user profile
- user retrieval
- role-aware user operations if needed later

#### `problems`

- create/update/delete problem
- list problems
- get problem details
- manage sample/hidden testcases

#### `submissions`

- create submission
- query submission history
- submission detail
- submission lifecycle state persistence

#### `execution`

- run-code endpoint handling
- submission judge orchestration
- runner abstraction
- execution result normalization

#### `health`

- readiness/liveness checks

---

## 5. Database Architecture

### 5.1 ORM

Use Prisma ORM.

### 5.2 Environment Strategy

- SQLite in local development
- PostgreSQL in production

The schema should remain relational and portable across both.

### 5.3 Core Models

#### User

- `id`
- `email`
- `username`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

#### RefreshToken

- `id`
- `userId`
- `tokenHash` or equivalent persisted reference
- `expiresAt`
- `revokedAt`
- `createdAt`

#### Problem

- `id`
- `title`
- `slug`
- `statement`
- `constraints`
- `difficulty`
- `createdById`
- `createdAt`
- `updatedAt`

#### TestCase

- `id`
- `problemId`
- `input`
- `expectedOutput`
- `isSample`
- `order`

#### Submission

- `id`
- `problemId`
- `userId`
- `language`
- `sourceCode`
- `status`
- `stdoutSummary`
- `stderrSummary`
- `runtimeMs`
- `memoryKb`
- `createdAt`
- `updatedAt`

### 5.4 Data Principles

- use proper foreign keys
- do not store usernames as relational references
- separate sample testcases from hidden judge testcases
- do not expose hidden testcases in public API responses

---

## 6. Authentication Architecture

### 6.1 Strategy

Use:

- DB-backed server session authentication with secure `HttpOnly` cookies

### 6.2 Session Flow

1. User logs in with email/password
2. Backend validates credentials
3. Backend creates a session record in the database
4. Backend sets a secure `HttpOnly` auth cookie containing the session identifier or opaque session reference
5. Frontend calls authenticated endpoints using the cookie-backed session
6. Frontend restores auth state through current-user/session validation endpoints

### 6.3 Authorization

Minimal roles:

- `USER`
- `ADMIN`

Use Nest guards to enforce:

- authenticated routes
- role-based routes where needed

### 6.4 Frontend Implications

- do not rely on localStorage tokens as the main session mechanism
- support session restoration via cookie-backed server validation
- centralize auth-aware Axios behavior

### 6.5 Session Persistence

The backend should persist sessions in the database through Prisma-backed storage.

Suggested session fields:

- `id`
- `userId`
- `expiresAt`
- `revokedAt`
- `createdAt`
- `updatedAt`

This enables:

- explicit logout
- server-side revocation
- reliable session validation
- easy reasoning about authenticated state

---

## 7. API Architecture

### 7.1 Principles

- REST-style endpoints
- DTO validation on all writes
- predictable response shapes
- proper HTTP status codes
- hide internal execution details unless intentionally exposed

### 7.2 Example Endpoint Shape

```text
/auth/signup
/auth/login
/auth/logout
/auth/refresh
/users/me
/problems
/problems/:id
/problems/:id/testcases
/submissions
/submissions/:id
/execution/run
```

### 7.3 API Concerns

- authenticated problem authoring
- public-safe problem reads
- hidden testcase protection
- paginated list responses where useful

---

## 8. Execution / Judge Architecture

### 8.1 Design Principle

Arbitrary user code must not be executed directly on the application host without isolation.

Use Docker-based execution through a dedicated abstraction.

### 8.2 Modes

#### Run Code

- user provides source code and custom input
- fast feedback
- sandboxed
- synchronous or near-synchronous response

#### Submit

- user submits source code for a problem
- backend stores submission first
- judge evaluates against hidden testcases
- status moves through queued/running/final verdict states

### 8.3 Language Support

- `C`
- `C++`
- `Python`
- `JavaScript`

### 8.4 Execution Pipeline

Suggested flow:

1. API receives run or submit request
2. Request validated by DTO/schema
3. Execution service chooses language runner
4. Temporary workspace prepared
5. Code copied into isolated container
6. Program compiled/interpreted and executed
7. Stdout/stderr/runtime info collected
8. Results normalized
9. Temporary resources cleaned up

### 8.5 Runner Abstraction

Use an interface such as:

- prepare
- execute
- cleanup
- normalizeResult

This lets language-specific runners differ internally while preserving a common contract.

### 8.6 Safety Constraints

Design for:

- no network access
- timeout limits
- memory limits
- filesystem isolation
- cleanup guarantees

### 8.7 Submission Lifecycle

Recommended statuses:

- `QUEUED`
- `RUNNING`
- `ACCEPTED`
- `WRONG_ANSWER`
- `COMPILATION_ERROR`
- `RUNTIME_ERROR`
- `TIME_LIMIT_EXCEEDED`
- `MEMORY_LIMIT_EXCEEDED`
- `INTERNAL_ERROR`

---

## 9. Async Processing Strategy

The architecture should keep room for background processing.

Recommended path:

- `Run Code`: direct execution path
- `Submit`: queued/background processing path

You can start with a simple in-process queue boundary if needed, but the code should be organized so submission judging can later move to a separate worker without requiring major API refactoring.

---

## 10. Rendering Strategy

### Public Pages

Prefer Server Components for:

- home page
- problem listing
- problem details

### Interactive Authenticated Pages

Prefer Client Components for:

- login/signup
- dashboard flows
- problem authoring forms
- editor interactions
- submission polling UI

This split keeps the frontend efficient while preserving good UX for interactive features.

---

## 11. Error Handling And Validation

### Frontend

- React Hook Form + Zod for forms
- clear field-level validation messages
- route-level error boundaries where appropriate
- consistent mutation error handling

### Backend

- DTO validation via Nest validation pipe
- consistent exception mapping
- avoid silent failures

---

## 12. Testing Strategy

### Frontend

Focus on:

- important user flows
- key UI states
- feature-level components

### Backend

Focus on:

- auth flows
- module service behavior
- DTO validation
- problem ownership checks
- submission lifecycle behavior
- execution service contract behavior

---

## 13. Deployment-Oriented Considerations

The architecture should be ready for:

- independently deployable frontend and backend
- managed PostgreSQL in production
- environment-based config
- runner/Docker availability in environments where judging is enabled

Secrets must never be hardcoded.

---

## 14. Key Tradeoffs

### Why Monorepo

- easier shared typing
- better fullstack coherence
- easier unified tooling

### Why Server Components

- reduce unnecessary client JS for public/read-heavy routes
- align with modern Next.js best practices

### Why Zustand

- lightweight and sufficient for targeted client-global state

### Why React Hook Form + Zod

- strong form ergonomics
- explicit validation
- good TypeScript integration

### Why NestJS

- structured backend architecture
- strong conventions for scaling code organization

### Why Prisma

- productive relational modeling
- strong developer experience

### Why Docker-Based Execution

- materially safer than direct host execution
- easier to discuss as a production-minded architecture

---

## 15. Final Architectural Position

The target system should be understandable as:

"A `pnpm` monorepo containing a Next.js App Router frontend and a NestJS API backend, backed by Prisma and a relational database, with Docker-isolated multi-language code execution and production-style auth/session handling."
