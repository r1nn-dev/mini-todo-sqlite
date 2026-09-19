---

description: "Task list template for feature implementation"
---

# Tasks: Todo CRUD (Add, View, Toggle, Delete)

**Input**: Design documents from `/specs/001-todo-crud/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/tasks-api.md](./contracts/tasks-api.md)

**Tests**: Included — Constitution Principle IV ("Test-First for Core Logic") requires tests for CRUD logic and route handlers, written before/alongside implementation and failing first.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths follow the single-project Next.js App Router structure from plan.md: `app/`, `lib/`, `prisma/`, `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create `prisma/`, `lib/`, `tests/contract/`, `tests/integration/`, `tests/unit/` directories per plan.md Project Structure
- [X] T002 Install runtime dependencies: `npm install prisma @prisma/client` (pinned to matched stable `7.10.0` for both — see Notes)
- [X] T003 Install test dependency: `npm install -D vitest`
- [X] T004 [P] Add a `"test": "vitest run"` script to `package.json` and create `vitest.config.ts` at the repo root
- [X] T005 [P] Create `.env` (git-ignored) at the repo root with `DATABASE_URL="file:./dev.db"` (research.md decision #3), and confirm `.env` and `prisma/dev.db` are covered by `.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Define the `Todo` model in `prisma/schema.prisma` (SQLite provider, no inline `url` — see Notes) and `prisma.config.ts` reading `env("DATABASE_URL")` for Migrate: `id Int @id @default(autoincrement())`, `title String`, `completed Boolean @default(false)`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt` (data-model.md)
- [X] T007 Run `npx prisma migrate dev --name init` to generate the initial reviewable migration in `prisma/migrations/` and create `prisma/dev.db` (depends on T006)
- [X] T008 [P] Create a Prisma client singleton in `lib/db.ts`, using the `@prisma/adapter-better-sqlite3` driver adapter (mandatory in Prisma 7 — see Notes) and cached on `globalThis` in development so hot reloads reuse one instance (research.md decision #2)
- [X] T009 [P] Define shared types in `lib/types.ts`: re-export Prisma's generated `Todo` type, plus `ApiSuccess<T> = { data: T }` and `ApiError = { error: { message: string } }` envelope types (research.md decision #5)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Add a todo and see it in the list (Priority: P1) 🎯 MVP

**Goal**: A user can add a todo by title and immediately see it in the list; blank titles are rejected; an empty list shows a clear empty state.

**Independent Test**: Open the app with an empty list, add a todo, and confirm it appears as incomplete; confirm a blank-title submission is rejected and adds nothing.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T010 [P] [US1] Unit tests in `tests/unit/validation.test.ts` for the title validator: a normal title is accepted; an empty string is rejected; a whitespace-only string is rejected; a title over 200 characters is rejected; a title of exactly 200 characters is accepted (data-model.md: "reject if empty or whitespace-only after trimming"; "reject if longer than 200 characters")
- [X] T011 [P] [US1] Contract test in `tests/contract/tasks-get.test.ts` for `GET /api/tasks`: returns `{ "data": [] }` when no todos exist (FR-004); returns `{ "data": Todo[] }` ordered by `createdAt` ascending once todos exist (contracts/tasks-api.md)
- [X] T012 [P] [US1] Contract test in `tests/contract/tasks-post.test.ts` for `POST /api/tasks`: a valid `title` returns 201 `{ "data": Todo }` with `completed: false` (FR-001, FR-005); a missing, empty, or whitespace-only `title` returns 400 `{ "error": { "message": string } }` (FR-002); a `title` over 200 characters returns 400 (contracts/tasks-api.md)
- [X] T013 [US1] Integration test in `tests/integration/add-todo.test.ts` covering spec User Story 1 acceptance scenarios: starting from an empty list, adding a todo makes it appear in the list; adding a second todo leaves the first unchanged; submitting a blank title adds nothing

### Implementation for User Story 1

- [X] T014 [US1] Implement the title validator in `lib/validation.ts`: reject titles that are empty or whitespace-only after trimming, and reject titles longer than 200 characters (data-model.md) — makes T010 pass
- [X] T015 [US1] Implement `GET` and `POST` handlers in `app/api/tasks/route.ts` using `lib/db.ts` and `lib/validation.ts`, returning the `{ data }` / `{ error }` envelope from contracts/tasks-api.md (depends on T006-T009, T014) — makes T011, T012 pass
- [X] T016 [US1] Implement `listTodos()` and `addTodo(title)` in `lib/api-client.ts`, wrapping `fetch` against `/api/tasks` with the shared types from `lib/types.ts`
- [X] T017 [US1] Update `app/page.tsx` to render the todo list (title + completed state) and an add-todo form via `lib/api-client.ts`, showing an empty-list state when there are no todos (FR-004) and a clear message when an add is rejected (FR-002) — makes T013 pass end-to-end

**Checkpoint**: User Story 1 is fully functional and independently testable — this is the MVP.

---

## Phase 4: User Story 2 - Toggle a todo's completion status (Priority: P2)

**Goal**: A user can mark any todo complete or incomplete, independent of every other todo.

**Independent Test**: With a todo already in the list, toggle it to complete and confirm the status change; toggle it back and confirm; confirm other todos are unaffected.

### Tests for User Story 2 ⚠️

- [X] T018 [P] [US2] Contract test in `tests/contract/tasks-patch.test.ts` for `PATCH /api/tasks/{id}`: toggling `completed` from `false`→`true` and `true`→`false` returns 200 `{ "data": Todo }` with the updated status (FR-006); an unknown `id` returns 404 `{ "error": { "message": string } }`; a missing or non-boolean `completed` returns 400 (contracts/tasks-api.md)
- [X] T019 [US2] Integration test in `tests/integration/toggle-todo.test.ts` covering spec User Story 2 acceptance scenarios: toggling one todo of several changes only that todo's status, in both directions

### Implementation for User Story 2

- [X] T020 [US2] Implement the `PATCH` handler in `app/api/tasks/[id]/route.ts`: validate `completed` is a boolean, return 404 if the todo doesn't exist, otherwise update it via Prisma (depends on T006-T009) — makes T018 pass
- [X] T021 [US2] Implement `toggleTodo(id, completed)` in `lib/api-client.ts`
- [X] T022 [US2] Add a toggle control per todo in `app/page.tsx` calling `toggleTodo` and reflecting the new status immediately — makes T019 pass end-to-end

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Delete a todo (Priority: P3)

**Goal**: A user can permanently remove a todo without affecting any other todo.

**Independent Test**: With multiple todos in the list, delete one and confirm it's gone while the others remain; deleting the last todo shows the empty-list state.

### Tests for User Story 3 ⚠️

- [X] T023 [P] [US3] Contract test in `tests/contract/tasks-delete.test.ts` for `DELETE /api/tasks/{id}`: deleting an existing todo returns 204 with no body (FR-007); deleting an unknown `id` returns 404 `{ "error": { "message": string } }` (contracts/tasks-api.md edge case)
- [X] T024 [US3] Integration test in `tests/integration/delete-todo.test.ts` covering spec User Story 3 acceptance scenarios: deleting one of several todos removes only that one; deleting the last remaining todo results in the empty-list state

### Implementation for User Story 3

- [X] T025 [US3] Implement the `DELETE` handler in `app/api/tasks/[id]/route.ts`: return 204 on success, 404 when the todo doesn't exist (depends on T006-T009) — makes T023 pass
- [X] T026 [US3] Implement `deleteTodo(id)` in `lib/api-client.ts`
- [X] T027 [US3] Add a delete control per todo in `app/page.tsx` calling `deleteTodo` and removing it from the displayed list immediately — makes T024 pass end-to-end

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality gates that span all user stories

- [X] T028 [P] Run `npm run lint` and `npx tsc --noEmit`, fixing any issues across touched files (constitution Development Workflow gate)
- [X] T029 [P] Run `npm run build` to confirm the production build succeeds (constitution Development Workflow gate)
- [X] T030 Walk through [quickstart.md](./quickstart.md) end-to-end (curl + UI) to validate all four operations and the "act on an already-deleted todo" edge case

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational only
- **User Story 2 (Phase 4)**: Depends on Foundational only (independently testable even though it's typically built after US1)
- **User Story 3 (Phase 5)**: Depends on Foundational only (independently testable even though it's typically built after US1/US2)
- **Polish (Phase 6)**: Depends on whichever user stories are in scope for the release being polished

### Within Each User Story

- Tests are written first and must fail before implementation begins
- `lib/` logic (validation, api-client) before the `app/` code that consumes it
- Route handlers before the UI wiring that calls them

### Parallel Opportunities

- T004 and T005 (Setup) can run in parallel — different files
- T008 and T009 (Foundational) can run in parallel — different files
- T010, T011, T012 (US1 tests) can run in parallel — different files
- T018 (US2 test) and T023 (US3 test) can run in parallel with each other, and with any remaining US1 tasks, once Foundational is done
- Once Foundational (Phase 2) completes, Phases 3, 4, and 5 can be staffed and worked in parallel if desired — though within a single-developer flow, P1 → P2 → P3 order is recommended

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit tests for title validation in tests/unit/validation.test.ts"
Task: "Contract test for GET /api/tasks in tests/contract/tasks-get.test.ts"
Task: "Contract test for POST /api/tasks in tests/contract/tasks-post.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run `tests/unit/validation.test.ts`, `tests/contract/tasks-get.test.ts`, `tests/contract/tasks-post.test.ts`, `tests/integration/add-todo.test.ts`, and manually verify via quickstart.md
5. This is a usable, demoable todo capture tool even before toggle/delete exist

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → test independently → MVP demoable
3. Add User Story 2 → test independently → progress tracking demoable
4. Add User Story 3 → test independently → full CRUD demoable
5. Phase 6 polish once the desired stories are complete

---

## Phase 7: Priority Field (Post-MVP Feature Addition)

**Goal**: Add a `priority` (High/Medium/Low, default Medium) attribute to
Todo, settable at creation and editable afterward, per FR-009/FR-010.

- [X] T031 Add `enum Priority { LOW MEDIUM HIGH }` and `priority Priority @default(MEDIUM)` to the `Todo` model in `prisma/schema.prisma` (data-model.md); verified native `enum` is supported on the SQLite provider via `prisma validate` on a scratch copy before committing to this approach
- [X] T032 Run `npx prisma migrate dev --name add_todo_priority` and `npx prisma generate`; verify existing rows get `priority = 'MEDIUM'` via the migration's `INSERT ... SELECT` column default (no manual backfill)
- [X] T033 [P] Re-export `Priority` from `lib/types.ts` alongside `Todo`
- [X] T034 [P] Add `validatePriority(raw)` to `lib/validation.ts`: `undefined` → `ok, "MEDIUM"`; exactly `"LOW"|"MEDIUM"|"HIGH"` → `ok`; anything else → rejected — unit tests in `tests/unit/validation.test.ts` written first
- [X] T035 Extend `POST /api/tasks` (`app/api/tasks/route.ts`) to accept optional `priority`, validate it, and store it — contract tests in `tests/contract/tasks-post.test.ts` (default applied, explicit value stored, invalid value rejected) written first
- [X] T036 Extend `PATCH /api/tasks/{id}` (`app/api/tasks/[id]/route.ts`) to accept optional `completed` and/or `priority`, requiring at least one; update contracts/tasks-api.md — contract tests in `tests/contract/tasks-patch.test.ts` (priority-only update, both together, invalid priority, neither field → 400) written first
- [X] T037 Extend `lib/api-client.ts`: `addTodo(title, priority?)`, new `updateTodoPriority(id, priority)`
- [X] T038 Add a priority `<select>` to the add-todo form and a per-todo priority `<select>` in the list in `app/page.tsx`, wired to `addTodo`/`updateTodoPriority`
- [X] T039 Update integration test `tests/integration/add-todo.test.ts` for the default-priority and explicit-priority flows
- [X] T040 Update docs for consistency: spec.md (FR-009, FR-010, SC-007, SC-008, Key Entities, Assumptions), data-model.md, contracts/tasks-api.md, quickstart.md
- [X] T041 Run `npx vitest run`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, then restart the dev server (see Notes) and manually verify POST/PATCH priority behavior end-to-end

**Checkpoint**: Priority is settable and editable through the API and UI; all 39 tests pass; build is clean.

---

## Notes

- [P] tasks touch different files and have no unresolved dependencies between them
- [Story] labels map every user-story-phase task back to spec.md for traceability
- Each user story phase is independently completable and testable per its "Independent Test" line
- Verify each test fails before writing the implementation that makes it pass
- Commit after each task or logical group
- **Deviation from research.md (implementation-time discovery)**: `npm install prisma @prisma/client` with no version pin resolved `prisma`'s "latest" tag to `8.0.0-rc.15`, a pre-release that replaces the classic ORM CLI with a cloud "Prisma Platform" toolchain (Projects/Branches/Postgres hosting, `contract`/`db sign`/`migration plan`) and did not match `@prisma/client@7.10.0`. This conflicts with the user's "no external service signup" requirement and the constitution's Simplicity First principle, and none of research.md/data-model.md/quickstart.md's commands (`prisma migrate dev`, etc.) apply to it. Both packages were pinned to the matched stable `7.10.0` release instead, which keeps the classic `prisma init` / `prisma migrate dev` / `prisma generate` workflow the rest of this plan assumes. `prisma` was placed in `devDependencies` (CLI/build-time only) and `@prisma/client` in `dependencies` (runtime).
- **Further deviation discovered while running T006-T008**: even stable Prisma 7 has two breaking changes versus older Prisma (5/6-era) conventions research.md assumed:
  1. `datasource db { url = env("DATABASE_URL") }` in `schema.prisma` is no longer valid — Migrate/CLI connection config now lives in a `prisma.config.ts` at the repo root (`defineConfig({ datasource: { url: env("DATABASE_URL") } })`, using `env`/`defineConfig` from `prisma/config`, with `import "dotenv/config"` at the top so the CLI loads `.env`). `schema.prisma`'s datasource block now only declares `provider = "sqlite"`. Added `dotenv` as an explicit devDependency since `prisma.config.ts` imports it directly.
  2. `new PrismaClient()` with no arguments now throws (`PrismaClientInitializationError: ... A driver adapter is required`) — Prisma 7 requires an explicit driver adapter at runtime, even for SQLite. Installed `@prisma/adapter-better-sqlite3` and pass `new PrismaBetterSqlite3({ url: process.env.DATABASE_URL })` as the `adapter` option to `PrismaClient` in `lib/db.ts`.
  3. A local SQLite `file:` URL in `prisma.config.ts`/`.env` resolves relative to the **repo root** (where `prisma.config.ts` lives), not relative to `schema.prisma`'s directory as in older Prisma versions. `DATABASE_URL` was set to `file:./prisma/dev.db` (not `file:./dev.db`) to keep the database file under `prisma/` as plan.md's Project Structure intends.
- **Test infrastructure fix (discovered during US2)**: contract/integration tests share the real `prisma/dev.db` (no separate test database — a deliberate simplicity trade-off for this mini app). Vitest's default parallel-file execution let one test file's `beforeEach` `deleteMany()` race another file's still-running assertions against the same SQLite file, intermittently failing an update with "record not found." Fixed by setting `fileParallelism: false` in `vitest.config.ts` so test files run sequentially.
- **Dev-server-restart gotcha (discovered during Phase 7)**: `lib/db.ts` deliberately caches its `PrismaClient` singleton on `globalThis` to survive Next.js dev hot-reloads (research.md decision #2). That singleton is built from the `@prisma/client` module loaded into the process at startup — if the *underlying generated client* changes (i.e., you ran `prisma migrate`/`prisma generate` for a schema change) while the dev server is still running, the cached singleton keeps using the old client shape and throws `PrismaClientValidationError: Unknown argument <field>` even though `tsc`/tests (fresh processes) are correct. **After any `prisma migrate dev`/`prisma generate`, restart `npm run dev`** — hot-reloading route handler code is not enough.
- **Also useful, not a bug**: Prisma 7's generated types don't live in `node_modules/@prisma/client/index.d.ts` (that file just re-exports `.prisma/client/default`) — the actual per-project generated types are in `node_modules/.prisma/client/index.d.ts`. An IDE's TS language server can show a stale "property does not exist" error right after a schema change even when `npx tsc --noEmit` is already clean; that's editor cache lag, not a real error — restarting the TS server (or waiting) resolves it.
