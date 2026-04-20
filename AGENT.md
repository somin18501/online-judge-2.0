# AGENT.md

## Objective

Rewrite this project into a modern, scalable, resume-grade fullstack TypeScript application.

The current project is a basic online judge / code compiler platform built with React + Express + MongoDB. The rewritten version must preserve the core product idea while significantly improving architecture, developer experience, maintainability, security, and production readiness.

The rewritten platform should allow users to:

- Sign up and log in
- Browse coding problems
- View a single problem
- Run code against custom input
- Submit code against hidden test cases
- View submission history
- Add and manage problems
- Support `C`, `C++`, `Python`, and `JavaScript`

The new implementation must be written fully in TypeScript.

---

## High-Level Product Direction

This project should be presented as a polished fullstack engineering project suitable for a frontend developer resume with around 2 years of experience. That means:

- the frontend should feel production-quality, not tutorial-grade
- the architecture should be clean and explainable in interviews
- the codebase should be modular and maintainable
- auth, validation, and execution safety should reflect good engineering judgment
- UI/UX should be modern, responsive, and support dark mode
- the stack should showcase current ecosystem best practices

This is not just a migration. It is a full redesign and reimplementation of the existing product in a stronger stack.

---

## Required Tech Stack

### Frontend

- Next.js with App Router
- TypeScript
- Tailwind CSS
- `shadcn/ui` for component primitives
- React Hook Form for form state handling
- Zod for form/schema validation
- Zustand for client-side global state
- Axios for API calls
- Dark mode support
- `pnpm` as package manager

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL for production
- SQLite for local development

### Code Execution

- Docker-based isolated execution for user code
- Support:
  - `C`
  - `C++`
  - `Python`
  - `JavaScript`

---

## Monorepo Requirement

Use a `pnpm` monorepo.

Recommended structure:

```text
apps/
  web/        # Next.js frontend
  api/        # NestJS backend
packages/
  types/      # shared app/domain types
  config/     # shared tsconfig/eslint/prettier settings
  ui/         # optional shared UI helpers/components if needed
```

Guidelines:

- prefer shared types and schemas where practical
- keep app boundaries clear
- avoid tightly coupling frontend implementation to backend internals
- shared packages should be genuinely reusable, not dumping grounds

---

## Architecture Goals

The rewritten project must be:

- scalable
- modular
- secure by default
- easy to run locally
- easy to extend later
- interview-friendly

Prioritize:

1. clear folder structure
2. strong typing
3. validation at boundaries
4. separation of concerns
5. reusable domain models and DTOs
6. observable async submission pipeline
7. good UX for loading, errors, empty states, and status updates

---

## Frontend Requirements

### App Framework

Use Next.js App Router properly.

Apply Next.js features where they actually help:

- Server Components by default
- Client Components only where interactivity is required
- route groups and nested layouts where useful
- loading and error states using App Router conventions
- server-side data fetching where appropriate
- streaming/suspense where useful
- metadata support for SEO/basic sharing
- server actions only if they fit naturally; do not force them where Axios-based API interaction is clearer

### State Management

Use Zustand only for client-side state that truly needs to persist across components, such as:

- auth/session state derived from backend session status
- editor preferences
- theme-related UI preferences if not handled elsewhere
- filters/sort state if it must persist across navigation

Do not use Zustand for all data fetching by default. Prefer:

- Server Components for server-fetched read-heavy pages
- local component state for isolated UI state
- explicit API hooks/utilities for mutations and interactive flows

### Styling and UI

Use:

- Tailwind CSS for layout and styling
- `shadcn/ui` for accessible component primitives
- a clear design system
- dark mode support from the start

UI expectations:

- polished layout
- desktop and mobile responsive
- accessible forms and controls
- good spacing/typography
- consistent states for pending/success/error
- code editor area should feel intentional, not like a plain textarea mockup

If introducing a code editor library, choose a mature option such as Monaco and integrate it cleanly, but keep the abstraction isolated.

### Forms And Validation

Frontend forms should use:

- React Hook Form for form state and submission handling
- Zod for schema validation
- `zodResolver` integration for schema-driven form validation

Guidelines:

- define explicit schemas for auth, problem authoring, filters where appropriate, and other meaningful user input surfaces
- keep validation messages clear and user-friendly
- reuse schemas or schema fragments where practical without overcoupling frontend and backend validation internals
- avoid manual uncontrolled form handling unless the interaction is trivial and clearly does not need a form abstraction

### Frontend Routes

At minimum include:

- home / problems listing
- problem details page
- auth pages
- dashboard/profile page
- user submissions page
- user problems page
- add/edit problem page
- submission details page if useful

### Frontend Data Strategy

Recommended split:

- public pages and read-heavy content: fetch in Server Components where possible
- authenticated interactive dashboards/forms: use Client Components with Axios calls
- keep API client layer centralized
- use typed request/response contracts

---

## Backend Requirements

### NestJS Usage

Use NestJS features properly, not as a thin Express wrapper.

Make good use of:

- modules
- controllers
- services
- DTOs
- guards
- interceptors where useful
- pipes and validation
- config module
- Prisma integration patterns
- eventing/queue boundaries for submission processing

Suggested modules:

- `auth`
- `users`
- `problems`
- `testcases`
- `submissions`
- `execution` or `judge`
- `health`
- `common`

### ORM and Database

Use Prisma ORM.

Environment strategy:

- SQLite for local development
- PostgreSQL for production

Schema should be normalized and future-friendly.

Suggested core entities:

- `User`
- `Problem`
- `TestCase`
- `Submission`
- `RefreshToken` or equivalent session model

Optional entities if useful:

- `ProblemTag`
- `SubmissionResult`
- `ExecutionJob`

### Validation and Error Handling

All inbound data should be validated.

Use:

- DTOs with validation decorators
- global validation pipe
- consistent exception handling
- clear HTTP status codes

Avoid vague success/message-only patterns. Prefer structured API responses and proper status semantics.

---

## Authentication Requirements

Use email/password authentication with a stronger production-style flow.

### Required auth design

- DB-backed server sessions with secure `HttpOnly` cookies
- role support with minimal roles:
  - `USER`
  - `ADMIN`

### Auth expectations

- passwords hashed securely
- secure session cookie handling
- session records persisted in the database
- session invalidation/logout handled server-side
- protected routes/guards on backend
- frontend should not rely on storing auth tokens in `localStorage`
- frontend should support session restoration via server-validated session checks

Auth should be explainable simply in interviews:

- session is maintained through a database-backed server session
- the browser sends a secure `HttpOnly` auth cookie automatically
- auth state is derived from server-validated session/user endpoints
- secure cookies reduce exposure compared with storing auth tokens in local storage

---

## Online Judge / Code Execution Requirements

This area must be significantly improved versus the existing project.

### Hard requirement

Do not run arbitrary user code directly on the host process without isolation.

Use Docker-based isolated execution.

### Language support

Support:

- `C`
- `C++`
- `Python`
- `JavaScript`

### Execution modes

There should be two distinct flows:

1. `Run Code`
- user provides custom input
- quick feedback
- still sandboxed

2. `Submit`
- evaluated against stored problem test cases
- persisted submission lifecycle
- ideally async

### Submission lifecycle

Support clear statuses such as:

- `QUEUED`
- `RUNNING`
- `ACCEPTED`
- `WRONG_ANSWER`
- `COMPILATION_ERROR`
- `RUNTIME_ERROR`
- `TIME_LIMIT_EXCEEDED`
- `MEMORY_LIMIT_EXCEEDED`
- `INTERNAL_ERROR`

### Execution constraints

Design for:

- execution timeout
- memory limits
- no network access
- isolated filesystem/container
- cleanup after completion

### Architecture suggestion

Keep the judge logic isolated behind a dedicated module/service boundary so it can later be extracted into a separate worker or microservice if needed.

If useful, support:

- job queue for submissions
- synchronous path for `Run Code`
- asynchronous worker path for `Submit`

The code should be structured so that the rest of the backend does not depend on Docker details directly.

---

## Recommended Domain Model

Use the existing product idea, but refine it.

### User

- id
- email
- username
- passwordHash
- role
- createdAt
- updatedAt

### Problem

- id
- title
- slug
- statement
- constraints
- examples
- difficulty
- createdBy
- createdAt
- updatedAt
- visibility/published state if useful

### TestCase

- id
- problemId
- input
- expectedOutput
- isSample
- order

### Submission

- id
- problemId
- userId
- language
- sourceCode
- status
- stdout/stderr summary where appropriate
- runtimeMs
- memoryKb
- createdAt
- updatedAt

Avoid using usernames as foreign-key-like string references. Use real relational IDs.

---

## API Design Expectations

The API should be versionable and organized.

Recommended style:

- `/auth/...`
- `/users/me`
- `/problems`
- `/problems/:id`
- `/problems/:id/testcases`
- `/submissions`
- `/submissions/:id`
- `/execution/run`

Guidelines:

- use DTOs and typed responses
- paginate list endpoints where sensible
- support filtering/sorting for problems and submissions
- distinguish public data from protected/internal data
- do not expose hidden testcases to normal users

---

## Frontend UX Expectations

This should feel like a serious project, not a basic CRUD dashboard.

### Must-have UX elements

- modern landing/listing experience for problems
- searchable and filterable problem table/grid
- clean problem reading layout
- proper code editor area
- visible verdict/status progression for submissions
- authenticated dashboard
- empty/loading/error states across pages
- dark mode support

### Resume-quality polish

Include thoughtful details like:

- persistent theme toggle
- keyboard-friendly interactions where practical
- clean form validation UX
- consistent toasts/alerts
- badges for difficulty and verdict
- status indicators for queued/running submissions

---

## Code Quality Standards

The rewritten codebase must be:

- fully typed
- linted
- formatted
- modular
- readable
- testable

Use:

- ESLint
- Prettier
- strict TypeScript settings

General standards:

- avoid large god-components and god-services
- keep domain logic out of controllers
- keep frontend presentation separate from API/client concerns
- prefer small composable utilities
- use explicit naming
- avoid `any`
- avoid duplicated request/response types
- avoid ad hoc manual validation logic in forms when Zod schemas should define the contract

---

## Testing Expectations

Testing should be practical, not excessive.

### Frontend

Prefer targeted tests for:

- critical UI states
- important user flows
- utility functions

### Backend

Cover:

- auth flows
- validation behavior
- problem CRUD logic
- submission lifecycle logic
- execution service contract boundaries

At minimum, include enough tests to show engineering discipline.

---

## Environment and Config Requirements

Use proper environment separation.

Examples:

- `.env.development`
- `.env.test`
- `.env.production`

The codebase should not hardcode:

- database credentials
- JWT secrets
- cookie secrets
- Docker runner config

All secrets and environment-specific values must come from environment configuration.

---

## Suggested Implementation Plan

### Phase 1: Repository Setup

- create `pnpm` workspace
- scaffold `apps/web` and `apps/api`
- add shared config packages
- set up TypeScript, linting, formatting, and base scripts

### Phase 2: Backend Foundation

- scaffold NestJS modules
- configure Prisma
- define database schema
- add auth foundation
- add role-based guard support

### Phase 3: Frontend Foundation

- scaffold Next.js App Router app
- set up Tailwind and `shadcn/ui`
- add theme support
- establish app layout, navigation, and route structure
- create typed Axios client

### Phase 4: Core Product Flows

- auth pages and session restoration
- problems listing and problem detail pages
- add/edit problem flows
- submissions and dashboard pages

### Phase 5: Judge System

- design execution service abstraction
- add Docker-based runners
- implement `Run Code`
- implement async `Submit` judging
- add verdict polling or realtime status updates

### Phase 6: Polish

- improve UX states
- improve accessibility
- add tests
- add seed data
- add health checks and docs

---

## Non-Goals

Unless explicitly needed, do not add:

- microservices from day one
- Kubernetes
- excessive CQRS/event-sourcing complexity
- overengineered state management
- unnecessary websocket complexity if polling is sufficient initially

Keep the project ambitious but realistic.

---

## Deliverable Expectations

The final rewrite should look like a project a strong junior-to-mid frontend engineer built with good fullstack judgment.

It should be:

- easy to demo
- easy to explain in interviews
- visually polished
- architecturally sound
- safer than the original implementation
- clearly better organized than the current codebase

---

## Implementation Notes For The Agent

When rewriting this project:

- preserve the original product intent, but improve the architecture freely
- prefer maintainability over fast hacks
- use Next.js and NestJS idiomatically
- use Server Components where they reduce client complexity
- use Client Components only where interactivity requires them
- keep API contracts typed and deliberate
- design database relations properly
- isolate execution concerns behind a service boundary
- support JavaScript in addition to the previous languages
- make reasonable improvements to naming, foldering, and UX
- optimize for production-like quality without making the codebase unnecessarily complex

If a tradeoff is needed, choose the option that is easier to maintain, easier to explain, and safer in production.
