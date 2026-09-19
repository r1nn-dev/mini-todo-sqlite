# Phase 0 Research: Todo CRUD (Add, View, Toggle, Delete)

## 1. Test framework for route handlers + validation logic

**Decision**: Vitest

**Rationale**: The project has no test runner configured yet (`package.json`
has no `test` script). Vitest has native ESM/TypeScript support with minimal
config, runs fast, and can import Next.js route handler modules and plain
`lib/` functions directly without a heavyweight DOM/transform setup — a good
fit for Principle I (Simplicity First) and Principle IV (Test-First for Core
Logic), which only requires tests for data-mutating/branching logic, not full
browser rendering.

**Alternatives considered**:
- **Jest**: More configuration overhead for ESM + Next.js 16/React 19 than
  Vitest; no material benefit for this project's scope.
- **Next.js's built-in test helpers / Playwright**: Aimed at full
  browser/e2e testing, which is more than this "mini" feature's core-logic
  test requirement calls for; can be added later if UI e2e coverage is
  desired.

## 2. Prisma Client lifecycle in the Next.js dev server

**Decision**: A singleton `PrismaClient` in `lib/db.ts`, cached on
`globalThis` in development to survive Next.js's hot-module-reload cycles,
matching Prisma's documented Next.js pattern.

**Rationale**: Next.js dev mode re-evaluates modules on every change;
without caching, each reload would create a new `PrismaClient` and eventually
exhaust SQLite file handles/connections. A single cached instance keeps
Principle III's "single source of truth" story clean — one client, one
`dev.db`.

**Alternatives considered**:
- **New `PrismaClient` per request**: Simple but leaks connections/file
  handles under hot reload; rejected.

## 3. Database location and configuration

**Decision**: `DATABASE_URL="file:./dev.db"` in a `.env` file (git-ignored),
with `prisma/schema.prisma` reading `env("DATABASE_URL")` as its SQLite
datasource. No external database service or server configuration is
involved — the file lives inside the project directory.

**Rationale**: Matches the user's explicit constraint (no external service
signup, no separate server config) and the constitution's Technology
Constraints ("read from environment variables with sensible local
defaults, never hard-coded absolute paths").

**Alternatives considered**:
- **Hard-coded absolute path**: Rejected — explicitly disallowed by the
  constitution.
- **In-memory SQLite**: Rejected — spec's FR-008 requires todos to persist
  across sessions, which an in-memory database would not satisfy.

## 4. Todo identifier strategy

**Decision**: Prisma-managed auto-incrementing integer primary key (`id Int
@id @default(autoincrement())`).

**Rationale**: Single-process, single-file local SQLite with no distributed
writers — there's no need for globally-unique IDs (UUID/cuid). An
autoincrement integer is the simplest option that satisfies Principle I and
is sufficient for REST resource identification (`/api/tasks/:id`).

**Alternatives considered**:
- **UUID/cuid**: Adds ID-generation complexity with no benefit at this
  scale; rejected as unnecessary complexity under Principle I.

## 5. REST response contract shape

**Decision**: A consistent JSON envelope for every `/api/tasks` endpoint —
success responses as `{ "data": <Todo | Todo[]> }`, error responses as
`{ "error": { "message": string } }` with an appropriate HTTP status code
(400 for validation failures, 404 for a missing todo).

**Rationale**: Directly satisfies Principle V's requirement for a
"consistent, documented response shape (success and error cases)" and gives
the UI's single typed API client one shape to branch on.

**Alternatives considered**:
- **Bare resource in the response body with no envelope**: Common for small
  APIs, but makes error responses inconsistent in shape from success
  responses; rejected in favor of the explicit envelope for clarity.

## Outcome

All unknowns from the Technical Context are resolved. No remaining
`NEEDS CLARIFICATION` markers.
