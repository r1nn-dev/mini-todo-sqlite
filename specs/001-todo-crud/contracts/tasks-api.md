# API Contract: `/api/tasks`

REST endpoints for the Todo CRUD feature, implemented as Next.js App Router
route handlers. All responses are JSON with the envelope defined in
[research.md](../research.md) (`{ "data": ... }` on success,
`{ "error": { "message": string } }` on failure).

`Todo` shape referenced below (see [data-model.md](../data-model.md)):

```ts
type Priority = "LOW" | "MEDIUM" | "HIGH"

type Todo = {
  id: number
  title: string
  completed: boolean
  priority: Priority
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}
```

## `GET /api/tasks`

List all todos, ordered by `createdAt` ascending.

- **Request**: no body, no parameters
- **Response 200**: `{ "data": Todo[] }` — empty array when there are no
  todos (spec FR-004 empty state)

## `POST /api/tasks`

Create a new todo.

- **Request body**: `{ "title": string, "priority"?: Priority }`
- **Response 201**: `{ "data": Todo }` — created todo, with `completed: false`
  (FR-001, FR-005) and `priority` set to the given value, or `"MEDIUM"` when
  `priority` is omitted (FR-009)
- **Response 400**: `{ "error": { "message": string } }` — when `title` is
  missing, empty/whitespace-only, or exceeds the max length (FR-002); or when
  `priority` is present but not exactly `"LOW"`, `"MEDIUM"`, or `"HIGH"`

## `PATCH /api/tasks/{id}`

Update a todo's completion status and/or priority. At least one of
`completed`/`priority` must be present; either or both may be provided in a
single request.

- **Path parameter**: `id` — integer todo id
- **Request body**: `{ "completed"?: boolean, "priority"?: Priority }`
- **Response 200**: `{ "data": Todo }` — updated todo, reflecting whichever
  fields were provided (FR-006, FR-010)
- **Response 404**: `{ "error": { "message": string } }` — when no todo with
  that `id` exists (edge case: already deleted elsewhere)
- **Response 400**: `{ "error": { "message": string } }` — when neither
  `completed` nor `priority` is present; when `completed` is present but not
  a boolean; or when `priority` is present but not exactly `"LOW"`,
  `"MEDIUM"`, or `"HIGH"`

## `DELETE /api/tasks/{id}`

Delete a todo.

- **Path parameter**: `id` — integer todo id
- **Response 204**: no body — todo removed (FR-007)
- **Response 404**: `{ "error": { "message": string } }` — when no todo with
  that `id` exists (edge case: already deleted elsewhere; treated as a
  client-visible no-op error rather than a silent success, so the UI can
  refresh its list)

## Error handling notes

- All 4xx errors use the same `{ "error": { "message": string } }` shape
  (Principle V — consistent contract).
- Route handlers validate input via `lib/validation.ts` before touching the
  database (Principle V — "validate request input at the boundary").
