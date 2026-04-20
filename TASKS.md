# TASKS.md

## Goal

This file turns `AGENT.md` into an implementation checklist for rebuilding the project as a modern fullstack TypeScript monorepo.

Primary stack target:

- `pnpm` monorepo
- Next.js App Router frontend
- Zustand
- Axios
- React Hook Form
- Zod
- Tailwind CSS + `shadcn/ui`
- NestJS backend
- Prisma ORM
- PostgreSQL in production
- SQLite in development
- Docker-isolated code execution for `C`, `C++`, `Python`, and `JavaScript`

---

## Phase 0: Planning And Cleanup

- [x] Review the current project and preserve only domain/product behaviors worth keeping
- [x] Finalize rewritten information architecture for frontend routes
- [x] Finalize backend module boundaries
- [x] Define initial MVP vs stretch features
- [x] Decide naming conventions for packages, modules, DTOs, entities, and UI sections
- [x] Document core user journeys:
  - [x] unauthenticated visitor browsing problems
  - [x] user signup/login/logout/refresh session
  - [x] user running code
  - [x] user submitting code
  - [x] user viewing submission history
  - [x] user creating/editing/deleting problems
- [x] Define initial verdict taxonomy:
  - [x] `QUEUED`
  - [x] `RUNNING`
  - [x] `ACCEPTED`
  - [x] `WRONG_ANSWER`
  - [x] `COMPILATION_ERROR`
  - [x] `RUNTIME_ERROR`
  - [x] `TIME_LIMIT_EXCEEDED`
  - [x] `MEMORY_LIMIT_EXCEEDED`
  - [x] `INTERNAL_ERROR`

---

## Phase 1: Monorepo Foundation

- [x] Initialize `pnpm-workspace.yaml`
- [x] Create root `package.json`
- [x] Create workspace structure:
  - [x] `apps/web`
  - [x] `apps/api`
  - [x] `packages/types`
  - [x] `packages/config`
  - [x] optional `packages/ui`
- [x] Add root scripts for:
  - [x] dev
  - [x] build
  - [x] lint
  - [x] test
  - [x] format
- [x] Add shared TypeScript configuration
- [x] Add shared ESLint configuration
- [x] Add shared Prettier configuration
- [x] Add `.editorconfig`
- [x] Add `.gitignore`
- [x] Add environment file templates
- [x] Add base README for monorepo commands

Deliverable:

- clean monorepo bootstrapped with shared tooling and scripts

---

## Phase 2: Frontend App Setup

- [x] Scaffold Next.js app with App Router in `apps/web`
- [x] Enable strict TypeScript
- [x] Configure Tailwind CSS
- [x] Install and initialize `shadcn/ui`
- [x] Install and configure React Hook Form
- [x] Install and configure Zod
- [x] Install and configure React Hook Form Zod resolver
- [x] Set up theme provider and dark mode support
- [x] Configure path aliases
- [x] Set up project structure for:
  - [x] `app/`
  - [x] `components/`
  - [x] `features/`
  - [x] `lib/`
  - [x] `store/`
  - [x] `types/`
- [x] Add global layout and route shell
- [x] Add app-level loading and error boundaries
- [x] Add typography, spacing, and color tokens
- [x] Establish form architecture conventions using React Hook Form + Zod
- [x] Create reusable primitives:
  - [x] buttons
  - [x] forms
  - [x] inputs
  - [x] tables
  - [x] badges
  - [x] dialogs
  - [x] toasts
  - [x] skeleton loaders

Deliverable:

- frontend app scaffolded with design system foundations and dark mode

---

## Phase 3: Backend App Setup

- [x] Scaffold NestJS app in `apps/api`
- [x] Configure strict TypeScript and path aliases
- [x] Add Nest config module
- [x] Add global validation pipe
- [x] Add exception handling strategy
- [x] Add logging strategy
- [x] Set up module structure:
  - [x] `auth`
  - [x] `users`
  - [x] `problems`
  - [x] `submissions`
  - [x] `execution` or `judge`
  - [x] `health`
  - [x] `common`
- [x] Configure CORS for frontend integration
- [x] Add cookie parser / secure cookie support
- [x] Add API versioning strategy if desired

Deliverable:

- backend scaffolded with proper NestJS structure and app-wide validation/config

---

## Phase 4: Prisma And Database Foundation

- [x] Initialize Prisma in `apps/api`
- [x] Configure SQLite for development
- [x] Configure PostgreSQL-compatible schema for production
- [x] Define initial Prisma models:
  - [x] `User`
  - [x] `Problem`
  - [x] `TestCase`
  - [x] `Submission`
  - [x] `RefreshToken` or session model
- [x] Add enums:
  - [x] user roles
  - [x] problem difficulty
  - [x] language
  - [x] submission status
- [x] Add indexes and unique constraints
- [x] Add Prisma migration strategy
- [x] Add Prisma seed script
- [x] Generate Prisma client
- [x] Add database service/provider pattern for NestJS

Deliverable:

- database schema in place with migrations and seed support

---

## Phase 5: Shared Types And Contracts

- [x] Create shared package for reusable domain types
- [x] Define API-facing enums and shared constants
- [x] Share safe frontend-consumable types where useful
- [x] Avoid leaking backend-only/internal implementation types
- [x] Establish naming conventions for DTO vs shared type usage

Deliverable:

- consistent contract strategy across frontend and backend

---

## Phase 6: Authentication System

### Backend

- [x] Add auth module structure
- [x] Implement signup flow
- [x] Implement login flow
- [x] Implement logout flow
- [x] Hash passwords securely
- [x] Implement DB-backed server session auth
- [x] Create session persistence model/table
- [x] Set secure `HttpOnly` auth cookie on login
- [x] Clear/revoke session on logout
- [x] Add server-side session validation/current-user flow
- [x] Create guards for protected endpoints
- [x] Create roles guard for `USER` / `ADMIN`
- [x] Add `GET /users/me` or equivalent current-session endpoint
- [x] Add DTO validation for auth endpoints

### Frontend

- [x] Create auth API client utilities
- [x] Create Zustand auth store
- [x] Implement session bootstrap/restore flow
- [x] Build signup page
- [x] Build login page
- [x] Implement auth form schemas with Zod
- [x] Implement auth forms with React Hook Form
- [x] Add logout behavior
- [x] Add protected-route handling for authenticated sections
- [x] Derive auth state from secure-cookie-backed session checks
- [x] Add auth-related loading/error states

Deliverable:

- DB-backed secure cookie-based auth flow with server-validated session state

---

## Phase 7: Public Problem Browsing

### Backend

- [x] Create problem list endpoint
- [x] Create problem detail endpoint
- [x] Add pagination/filter/sort support
- [x] Expose only public-safe problem fields
- [x] Exclude hidden test cases from public responses

### Frontend

- [x] Build home/problems listing page as a Server Component where practical
- [x] Add search UI
- [x] Add difficulty filter UI
- [x] Add sorting UI
- [x] Add empty state
- [x] Add loading state
- [x] Add polished problem cards/table rows
- [x] Build problem details page
- [x] Render statement, constraints, and samples cleanly
- [x] Add metadata for problem pages

Deliverable:

- public browse-and-read experience for coding problems

---

## Phase 8: Problem Authoring And Management

### Backend

- [x] Create protected endpoint to create problem
- [x] Create protected endpoint to update problem
- [x] Create protected endpoint to delete problem
- [x] Create protected endpoint to manage test cases
- [x] Validate ownership/authorization rules
- [x] Support sample test cases vs hidden judge test cases
- [x] Optionally support problem slug generation

### Frontend

- [x] Build add-problem page
- [x] Build edit-problem page
- [x] Define Zod schemas for problem authoring forms
- [x] Build problem authoring with React Hook Form
- [x] Add structured form for:
  - [x] title
  - [x] difficulty
  - [x] statement
  - [x] constraints
  - [x] examples
  - [x] sample test cases
  - [x] hidden test cases
- [x] Add field-level validation UX
- [x] Build my-problems dashboard
- [x] Add delete confirmation dialog
- [x] Add optimistic or clearly tracked mutation states

Deliverable:

- authenticated users can create and manage coding problems cleanly

---

## Phase 9: Code Editor Experience

- [x] Decide editor implementation:
  - [x] enhanced textarea
  - [x] Monaco editor
- [x] Build code editor component abstraction
- [x] Add language selector:
  - [x] `c`
  - [x] `cpp`
  - [x] `python`
  - [x] `javascript`
- [x] Add starter template/snippet support per language if desired
- [x] Add input panel
- [x] Add output panel
- [x] Add verdict/status display area
- [x] Add editor preferences if useful:
  - [x] theme
  - [x] font size
  - [x] word wrap
- [x] Persist editor preferences appropriately

Deliverable:

- strong coding workspace on the problem page

---

## Phase 10: Run Code Flow

### Backend

- [x] Design execution request/response contract
- [x] Create execution DTOs
- [x] Create run-code endpoint
- [x] Route requests through judge/execution service abstraction
- [x] Add language-specific execution adapters
- [x] Add timeout handling
- [x] Add memory limit handling where possible
- [x] Capture stdout/stderr safely
- [x] Normalize compilation/runtime errors

### Frontend

- [x] Add run-code action to problem page
- [x] Disable repeated submissions while request is pending
- [x] Show running/loading state
- [x] Render stdout/stderr/normalized feedback
- [x] Handle compiler/runtime errors gracefully

Deliverable:

- sandboxed custom-input execution flow

---

## Phase 11: Submission And Judging Flow

### Backend

- [x] Create submission create endpoint
- [x] Persist submission with queued status
- [x] Add job processing path for judging
- [x] Run hidden test cases against stored submission
- [x] Update submission status incrementally
- [x] Store runtime metadata
- [x] Define result aggregation logic
- [x] Add submission detail endpoint
- [x] Add submission list endpoint
- [x] Add per-user submissions endpoint

### Frontend

- [x] Add submit action on problem page
- [x] Show queued/running states clearly
- [x] Add polling or realtime update strategy
- [x] Build submissions list page
- [x] Build my submissions dashboard
- [x] Build submission detail drawer/page if useful
- [x] Show verdict badges and timestamps

Deliverable:

- robust submission lifecycle visible to users

---

## Phase 12: Docker-Based Judge Infrastructure

- [x] Design runner interface independent of controller/service wiring
- [x] Create Docker runner strategy for `C`
- [x] Create Docker runner strategy for `C++`
- [x] Create Docker runner strategy for `Python`
- [x] Create Docker runner strategy for `JavaScript`
- [x] Ensure no network access in runner containers
- [x] Enforce timeouts
- [x] Enforce cleanup after execution
- [x] Add safe temporary file/container handling
- [x] Normalize execution results across languages
- [x] Add local developer instructions for judge dependencies

Deliverable:

- isolated runner system replacing unsafe host execution

---

## Phase 13: Dashboards And User Experience

- [x] Build authenticated user dashboard shell
- [x] Build my submissions page
- [x] Build my problems page
- [x] Add filters for verdict/language/date where useful
- [x] Add pagination for large submission lists
- [x] Add empty states for new users
- [x] Add responsive table/card patterns for mobile
- [x] Ensure dark mode works across all dashboard views

Deliverable:

- complete authenticated product area with polished UX

---

## Phase 14: Admin/Role Support

- [x] Finalize role model behavior
- [x] Protect admin-only endpoints if any
- [x] Decide whether problem moderation is admin-only or user-owned
- [x] Add role-based UI guards where needed
- [x] Keep role system minimal and explainable

Deliverable:

- minimal but scalable authorization layer

---

## Phase 15: Quality, Validation, And Error Handling

- [x] Add frontend form validation patterns with React Hook Form + Zod
- [x] Add backend DTO validation everywhere
- [x] Add consistent API error response handling
- [x] Add frontend error boundary strategy
- [x] Add not-found pages
- [x] Add robust loading states
- [x] Audit all mutation flows for bad-state handling

Deliverable:

- app behaves predictably in failure states

---

## Phase 16: Testing

### Frontend

- [x] Add test setup
- [x] Test auth UI flows
- [x] Test problem listing/filter behavior
- [x] Test key interactive components

### Backend

- [x] Test auth service/controller flows
- [x] Test validation failures
- [x] Test problem CRUD logic
- [x] Test submission lifecycle logic
- [x] Test execution service contract boundaries

### Optional Integration

- [x] Add end-to-end smoke tests for key user journeys

Deliverable:

- enough automated coverage to demonstrate engineering discipline

---

## Phase 17: DX, Documentation, And Deployment Readiness

- [x] Add root setup documentation
- [x] Add app-specific README sections
- [x] Add environment variable docs
- [x] Add local development instructions
- [x] Add database migration instructions
- [x] Add seed instructions
- [x] Add judge/Docker prerequisites
- [x] Add architecture overview diagram or section
- [x] Add deployment notes for:
  - [x] frontend
  - [x] backend
  - [x] PostgreSQL
  - [x] runner environment

Deliverable:

- project is understandable and runnable by someone else

---

## Phase 18: Resume-Grade Polish

- [x] Review visual quality across key pages
- [x] Improve accessibility and keyboard behavior
- [x] Remove rough edges and inconsistent copy
- [x] Ensure naming is professional and cohesive
- [x] Add demo-ready seed content
- [x] Validate mobile responsiveness
- [x] Review dark mode thoroughly
- [x] Ensure architecture can be explained clearly in interviews

Deliverable:

- polished fullstack portfolio project

---

## Recommended MVP Cut

If implementation needs to be staged, build this MVP first:

- [x] monorepo setup
- [x] auth with DB-backed secure cookie-based session flow
- [x] problem list + detail
- [x] add problem + hidden test cases
- [x] run code
- [x] submit code
- [x] my submissions
- [x] Docker execution for all four languages

Defer if needed:

- [x] advanced filtering
- [x] admin moderation
- [x] realtime updates beyond polling
- [x] highly advanced analytics

---

## Suggested Build Order

1. monorepo + tooling
2. NestJS + Prisma + schema
3. Next.js app shell + design system
4. auth
5. problem browsing
6. problem authoring
7. editor + run code
8. submission judging
9. dashboards
10. tests + polish

---

## Done Criteria

The rewrite is done when:

- [x] both apps run from the monorepo cleanly
- [x] the project is fully TypeScript
- [x] auth is secure and production-credible
- [x] problems can be created, browsed, edited, and deleted appropriately
- [x] code can be run and submitted in all required languages
- [x] judging is isolated and not executed unsafely on the host
- [x] dashboards work for real users
- [x] UI is polished and dark-mode capable
- [x] the project is maintainable and explainable in interviews
- [x] documentation is sufficient for another developer to run it
