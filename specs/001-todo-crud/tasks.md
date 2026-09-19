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

- [ ] T001 Create `prisma/`, `lib/`, `tests/contract/`, `tests/integration/`, `tests/unit/` directories per plan.md Project Structure
- [ ] T002 Install runtime dependencies: `npm install prisma @prisma/client`
- [ ] T003 Install test dependency: `npm install -D vitest`
- [ ] T004 [P] Add a `"test": "vitest run"` script to `package.json` and create `vitest.config.ts` at the repo root
- [ ] T005 [P] Create `.env` (git-ignored) at the repo root with `DATABASE_URL="file:./dev.db"` (research.md decision #3), and confirm `.env` and `prisma/dev.db` are covered by `.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Define the `Todo` model in `prisma/schema.prisma` with a SQLite datasource reading `env("DATABASE_URL")`: `id Int @id @default(autoincrement())`, `title String`, `completed Boolean @default(false)`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt` (data-model.md)
- [ ] T007 Run `npx prisma migrate dev --name init` to generate the initial reviewable migration in `prisma/migrations/` and create `prisma/dev.db` (depends on T006)
- [ ] T008 [P] Create a Prisma client singleton in `lib/db.ts`, cached on `globalThis` in development so hot reloads reuse one instance (research.md decision #2)
- [ ] T009 [P] Define shared types in `lib/types.ts`: re-export Prisma's generated `Todo` type, plus `ApiSuccess<T> = { data: T }` and `ApiError = { error: { message: string } }` envelope types (research.md decision #5)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Add a todo and see it in the list (Priority: P1) 🎯 MVP

**Goal**: A user can add a todo by title and immediately see it in the list; blank titles are rejected; an empty list shows a clear empty state.

**Independent Test**: Open the app with an empty list, add a todo, and confirm it appears as incomplete; confirm a blank-title submission is rejected and adds nothing.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Unit tests in `tests/unit/validation.test.ts` for the title validator: a normal title is accepted; an empty string is rejected; a whitespace-only string is rejected; a title over 200 characters is rejected; a title of exactly 200 characters is accepted (data-model.md: "reject if empty or whitespace-only after trimming"; "reject if longer than 200 characters")
- [ ] T011 [P] [US1] Contract test in `tests/contract/tasks-get.test.ts` for `GET /api/tasks`: returns `{ "data": [] }` when no todos exist (FR-004); returns `{ "data": Todo[] }` ordered by `createdAt` ascending once todos exist (contracts/tasks-api.md)
- [ ] T012 [P] [US1] Contract test in `tests/contract/tasks-post.test.ts` for `POST /api/tasks`: a valid `title` returns 201 `{ "data": Todo }` with `completed: false` (FR-001, FR-005); a missing, empty, or whitespace-only `title` returns 400 `{ "error": { "message": string } }` (FR-002); a `title` over 200 characters returns 400 (contracts/tasks-api.md)
- [ ] T013 [US1] Integration test in `tests/integration/add-todo.test.ts` covering spec User Story 1 acceptance scenarios: starting from an empty list, adding a todo makes it appear in the list; adding a second todo leaves the first unchanged; submitting a blank title adds nothing

### Implementation for User Story 1

- [ ] T014 [US1] Implement the title validator in `lib/validation.ts`: reject titles that are empty or whitespace-only after trimming, and reject titles longer than 200 characters (data-model.md) — makes T010 pass
- [ ] T015 [US1] Implement `GET` and `POST` handlers in `app/api/tasks/route.ts` using `lib/db.ts` and `lib/validation.ts`, returning the `{ data }` / `{ error }` envelope from contracts/tasks-api.md (depends on T006-T009, T014) — makes T011, T012 pass
- [ ] T016 [US1] Implement `listTodos()` and `addTodo(title)` in `lib/api-client.ts`, wrapping `fetch` against `/api/tasks` with the shared types from `lib/types.ts`
- [ ] T017 [US1] Update `app/page.tsx` to render the todo list (title + completed state) and an add-todo form via `lib/api-client.ts`, showing an empty-list state when there are no todos (FR-004) and a clear message when an add is rejected (FR-002) — makes T013 pass end-to-end

**Checkpoint**: User Story 1 is fully functional and independently testable — this is the MVP.

---

## Phase 4: User Story 2 - Toggle a todo's completion status (Priority: P2)

**Goal**: A user can mark any todo complete or incomplete, independent of every other todo.

**Independent Test**: With a todo already in the list, toggle it to complete and confirm the status change; toggle it back and confirm; confirm other todos are unaffected.

### Tests for User Story 2 ⚠️

- [ ] T018 [P] [US2] Contract test in `tests/contract/tasks-patch.test.ts` for `PATCH /api/tasks/{id}`: toggling `completed` from `false`→`true` and `true`→`false` returns 200 `{ "data": Todo }` with the updated status (FR-006); an unknown `id` returns 404 `{ "error": { "message": string } }`; a missing or non-boolean `completed` returns 400 (contracts/tasks-api.md)
- [ ] T019 [US2] Integration test in `tests/integration/toggle-todo.test.ts` covering spec User Story 2 acceptance scenarios: toggling one todo of several changes only that todo's status, in both directions

### Implementation for User Story 2

- [ ] T020 [US2] Implement the `PATCH` handler in `app/api/tasks/[id]/route.ts`: validate `completed` is a boolean, return 404 if the todo doesn't exist, otherwise update it via Prisma (depends on T006-T009) — makes T018 pass
- [ ] T021 [US2] Implement `toggleTodo(id, completed)` in `lib/api-client.ts`
- [ ] T022 [US2] Add a toggle control per todo in `app/page.tsx` calling `toggleTodo` and reflecting the new status immediately — makes T019 pass end-to-end

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Delete a todo (Priority: P3)

**Goal**: A user can permanently remove a todo without affecting any other todo.

**Independent Test**: With multiple todos in the list, delete one and confirm it's gone while the others remain; deleting the last todo shows the empty-list state.

### Tests for User Story 3 ⚠️

- [ ] T023 [P] [US3] Contract test in `tests/contract/tasks-delete.test.ts` for `DELETE /api/tasks/{id}`: deleting an existing todo returns 204 with no body (FR-007); deleting an unknown `id` returns 404 `{ "error": { "message": string } }` (contracts/tasks-api.md edge case)
- [ ] T024 [US3] Integration test in `tests/integration/delete-todo.test.ts` covering spec User Story 3 acceptance scenarios: deleting one of several todos removes only that one; deleting the last remaining todo results in the empty-list state

### Implementation for User Story 3

- [ ] T025 [US3] Implement the `DELETE` handler in `app/api/tasks/[id]/route.ts`: return 204 on success, 404 when the todo doesn't exist (depends on T006-T009) — makes T023 pass
- [ ] T026 [US3] Implement `deleteTodo(id)` in `lib/api-client.ts`
- [ ] T027 [US3] Add a delete control per todo in `app/page.tsx` calling `deleteTodo` and removing it from the displayed list immediately — makes T024 pass end-to-end

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality gates that span all user stories

- [ ] T028 [P] Run `npm run lint` and `npx tsc --noEmit`, fixing any issues across touched files (constitution Development Workflow gate)
- [ ] T029 [P] Run `npm run build` to confirm the production build succeeds (constitution Development Workflow gate)
- [ ] T030 Walk through [quickstart.md](./quickstart.md) end-to-end (curl + UI) to validate all four operations and the "act on an already-deleted todo" edge case

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

## Notes

- [P] tasks touch different files and have no unresolved dependencies between them
- [Story] labels map every user-story-phase task back to spec.md for traceability
- Each user story phase is independently completable and testable per its "Independent Test" line
- Verify each test fails before writing the implementation that makes it pass
- Commit after each task or logical group
