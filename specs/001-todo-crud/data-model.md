# Phase 1 Data Model: Todo CRUD (Add, View, Toggle, Delete)

## Entity: Todo

Represents a single task the user is tracking (spec Key Entities: Todo).

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | Integer | yes (system-assigned) | autoincrement | Primary key; used as the REST resource identifier (`/api/tasks/:id`) |
| `title` | String | yes | — | Must be non-empty after trimming whitespace (FR-002); max length 200 characters (spec Assumptions) |
| `completed` | Boolean | yes | `false` | Toggled between `false`/`true` (FR-005, FR-006); never any other value |
| `createdAt` | DateTime | yes (system-assigned) | now() | Used to order the list consistently (spec Assumptions: "order they were created") |
| `updatedAt` | DateTime | yes (system-assigned) | now(), auto-updated | Set on every toggle/edit; not currently surfaced in the UI but kept for auditability and future use |

### Validation rules

- `title`: reject if empty or whitespace-only after trimming (FR-002); reject
  if longer than 200 characters (spec Assumptions edge case).
- `completed`: boolean only; no third state.

### State transitions

```
[created] --(add, title valid)--> completed = false
completed = false --(toggle)--> completed = true
completed = true  --(toggle)--> completed = false
completed = false | true --(delete)--> [removed]
```

Each Todo's state transitions are independent of every other Todo's (FR-006,
FR-007: toggling/deleting one has no effect on others).

### Relationships

None — Todo is a standalone entity with no relationships to other entities
in this feature.

### Ordering

The list is returned in `createdAt` ascending order (oldest first), matching
the spec's assumption of "the order they were created" with no
user-configurable sorting in this feature.

## Prisma schema sketch

For reference during implementation (not the literal file to commit as-is —
`schema.prisma` is created as an implementation task). Note: Prisma 7 no
longer allows a `url` in the `datasource` block (see research.md #3) — the
connection string lives in `prisma.config.ts`/`.env` instead.

```prisma
datasource db {
  provider = "sqlite"
}

model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
