# API Contract: `/api/tasks`

REST endpoints for the Todo CRUD feature, implemented as Next.js App Router
route handlers. All responses are JSON with the envelope defined in
[research.md](../research.md) (`{ "data": ... }` on success,
`{ "error": { "message": string } }` on failure).

`Todo` shape referenced below (see [data-model.md](../data-model.md)):

```ts
type Todo = {
  id: number
  title: string
  completed: boolean
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

- **Request body**: `{ "title": string }`
- **Response 201**: `{ "data": Todo }` — created todo, with `completed: false`
  (FR-001, FR-005)
- **Response 400**: `{ "error": { "message": string } }` — when `title` is
  missing, empty/whitespace-only, or exceeds the max length (FR-002)

## `PATCH /api/tasks/{id}`

Toggle (or explicitly set) a todo's completion status.

- **Path parameter**: `id` — integer todo id
- **Request body**: `{ "completed": boolean }`
- **Response 200**: `{ "data": Todo }` — updated todo (FR-006)
- **Response 404**: `{ "error": { "message": string } }` — when no todo with
  that `id` exists (edge case: already deleted elsewhere)
- **Response 400**: `{ "error": { "message": string } }` — when `completed`
  is missing or not a boolean

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
