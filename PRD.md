# PRD.md

## Product Name

Online Judge Platform

Working concept:

A modern fullstack coding platform where users can browse problems, write code, run it against custom input, and submit it against hidden test cases with production-style UX and safer execution architecture.

---

## 1. Product Summary

This product is a web-based coding judge platform inspired by lightweight online coding platforms such as LeetCode, HackerRank, or Codeforces problem runners, but scoped to a strong portfolio-ready implementation.

The main purpose of the rewrite is to turn the current basic project into a polished, scalable, maintainable, resume-grade fullstack TypeScript application.

This project should demonstrate:

- strong frontend engineering
- practical fullstack architecture
- good UI/UX judgment
- modern TypeScript patterns
- secure authentication
- safer code execution design

---

## 2. Product Goals

### Primary Goals

- Let users browse coding problems easily
- Let users read full problem statements with examples and constraints
- Let users write code in multiple languages
- Let users run code against custom input
- Let users submit code against hidden test cases
- Let authenticated users manage their own problems and submissions
- Deliver a polished, responsive, dark-mode-capable UI

### Secondary Goals

- Make the project strong enough for resume and interview discussion
- Use modern stack choices and idiomatic architecture
- Keep the codebase scalable and maintainable
- Provide a solid path for future features such as tags, leaderboards, or contests

---

## 3. Non-Goals

The initial version does not need to include:

- contests
- leaderboards
- social features
- discussion forums
- advanced plagiarism detection
- real-time collaborative coding
- enterprise-grade multi-tenant architecture

These can be considered later if needed.

---

## 4. Target Users

### Primary User

A learner or developer who wants to:

- practice coding problems
- run code quickly
- submit solutions and view verdicts

### Secondary User

A logged-in platform contributor who wants to:

- create coding problems
- define test cases
- manage their authored problems

### Portfolio Reviewer / Interviewer

This is also an indirect audience.

The project should clearly demonstrate:

- frontend depth
- architectural maturity
- practical backend competence
- safe engineering judgment around arbitrary code execution

---

## 5. User Problems

The current project solves basic needs but has several limitations:

- outdated architecture
- weak auth/session design
- limited maintainability
- direct unsafe code execution model
- limited language support
- basic UI polish
- weak separation of responsibilities

The new product should address these by improving both the user experience and the engineering foundation.

---

## 6. Core User Stories

### Public User Stories

- As a visitor, I can browse all available coding problems
- As a visitor, I can search and filter problems
- As a visitor, I can open a problem and read its statement, constraints, and examples
- As a visitor, I can write code and run it against custom input
- As a visitor, I am prompted to log in before submitting code

### Authenticated User Stories

- As a user, I can sign up and log in securely
- As a user, I can stay signed in across sessions
- As a user, I can submit a solution for a problem
- As a user, I can see my submission status update from queued/running to final verdict
- As a user, I can view my submission history
- As a user, I can create a new coding problem
- As a user, I can add sample and hidden test cases to a problem
- As a user, I can edit or delete problems I own

### Admin / Elevated Access Stories

- As an admin, I can perform platform-level moderation if needed

This role should remain minimal in the initial implementation.

---

## 7. Functional Requirements

### 7.1 Authentication

The system must support:

- email/password signup
- email/password login
- logout
- DB-backed server sessions with secure `HttpOnly` cookies
- role-aware access control

### 7.2 Problem Browsing

The system must support:

- listing problems
- problem detail page
- search
- filtering by difficulty
- pagination or scalable listing pattern

### 7.3 Problem Authoring

The system must support:

- creating a problem
- editing a problem
- deleting a problem
- defining sample test cases
- defining hidden test cases

### 7.4 Code Editor And Execution

The system must support:

- selecting a language
- writing code
- running code against custom input
- reading output and error feedback

Supported languages:

- `C`
- `C++`
- `Python`
- `JavaScript`

### 7.5 Submission Flow

The system must support:

- submitting code for a problem
- asynchronous or background judging
- status tracking
- viewing submission history

Supported verdict states:

- `QUEUED`
- `RUNNING`
- `ACCEPTED`
- `WRONG_ANSWER`
- `COMPILATION_ERROR`
- `RUNTIME_ERROR`
- `TIME_LIMIT_EXCEEDED`
- `MEMORY_LIMIT_EXCEEDED`
- `INTERNAL_ERROR`

### 7.6 User Dashboard

The system must support:

- viewing my submissions
- viewing my problems
- navigating account-related sections cleanly

---

## 8. UX Requirements

The product should feel modern and intentional.

### UX Expectations

- responsive on desktop and mobile
- dark mode support
- clear navigation
- polished tables/cards/forms
- helpful empty states
- visible loading states
- clear error handling
- strong readability for problem statements
- clear visual treatment for verdicts and difficulty

### Form Expectations

All meaningful frontend forms should use:

- React Hook Form
- Zod validation

Examples:

- signup/login
- create/edit problem
- filters where a schema-based form makes sense

---

## 9. Technical Product Constraints

The rewrite must use:

- Next.js App Router
- NestJS
- Prisma
- PostgreSQL in production
- SQLite in development
- Zustand
- Axios
- Tailwind CSS
- `shadcn/ui`
- React Hook Form
- Zod
- Docker-isolated execution
- `pnpm` monorepo

---

## 10. Success Criteria

The project is successful when:

- users can browse, run, and submit solutions smoothly
- authenticated flows are secure and stable
- code execution is isolated and safer than the current implementation
- the app is visually polished and dark-mode ready
- the architecture is clear and maintainable
- the project is strong enough to discuss confidently in interviews

---

## 11. MVP Scope

### In Scope

- auth with DB-backed secure cookie-based session flow
- public problem browsing
- problem detail page
- code editor area
- run code flow
- submit solution flow
- my submissions page
- my problems page
- create/edit/delete problem
- support for `C`, `C++`, `Python`, `JavaScript`
- Docker-based isolated execution

### Out Of Scope For Initial MVP

- contests
- leaderboards
- social interactions
- public discussion threads
- advanced analytics

---

## 12. Risks

### Product Risks

- scope expansion beyond portfolio-project realism
- judge infrastructure becoming overly complex
- UX polish taking too long relative to core feature delivery

### Technical Risks

- secure code execution complexity
- multi-language runner consistency
- session/auth edge cases
- schema drift between frontend/backend contracts

---

## 13. Open Future Opportunities

Possible future additions:

- tags and problem categories
- favorites/bookmarks
- admin moderation dashboard
- realtime verdict updates
- contest mode
- leaderboard
- AI-powered hints

---

## 14. Final Product Positioning

This product should read as:

"A modern online judge platform built with Next.js, NestJS, Prisma, and Docker-based sandboxed execution, designed to showcase production-style frontend and fullstack engineering."
