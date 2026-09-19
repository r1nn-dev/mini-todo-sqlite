# Quickstart: Validate Todo CRUD

Prerequisites: Node.js and npm installed (already required to run this
Next.js project); no external services or accounts needed.

## 1. Install and configure

```bash
npm install prisma @prisma/client
```

Create `.env` (git-ignored) at the repo root:

```
DATABASE_URL="file:./dev.db"
```

## 2. Apply the schema

After `prisma/schema.prisma` exists (see [data-model.md](./data-model.md) for
the `Todo` model), create and apply the first migration:

```bash
npx prisma migrate dev --name init
```

This generates `prisma/migrations/` (reviewable SQL) and `prisma/dev.db`.

## 3. Run the app

```bash
npm run dev
```

## 4. Validate each user story against the running app

Use the API directly (`curl`) and/or the UI at `http://localhost:3000`.

**User Story 1 — Add a todo and see it in the list**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"우유 사기"}'

curl http://localhost:3000/api/tasks
```
Expected: the `POST` returns the new todo with `completed: false`; the
subsequent `GET` includes it in `data`. Reload the UI and confirm it's
visible there too.

Also confirm rejection of a blank title:

```bash
curl -i -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"   "}'
```
Expected: HTTP 400 with an `error.message`, and no new todo appears in a
follow-up `GET`.

**User Story 2 — Toggle completion**

```bash
curl -X PATCH http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```
Expected: HTTP 200, returned todo has `completed: true`; toggling again with
`{"completed":false}` reverts it, and other todos are unaffected.

**User Story 3 — Delete a todo**

```bash
curl -i -X DELETE http://localhost:3000/api/tasks/1
curl http://localhost:3000/api/tasks
```
Expected: HTTP 204 on delete; the follow-up `GET` no longer includes that
todo, and other todos remain.

**Edge case — acting on a todo that no longer exists**

```bash
curl -i -X DELETE http://localhost:3000/api/tasks/999999
```
Expected: HTTP 404 with an `error.message`, no server crash.

## 5. Run automated tests

```bash
npx vitest run
```
Expected: contract tests for all four endpoints and unit tests for
`lib/validation.ts` pass (see [contracts/tasks-api.md](./contracts/tasks-api.md)).
