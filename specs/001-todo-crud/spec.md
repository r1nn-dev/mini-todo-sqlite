# Feature Specification: Todo CRUD (Add, View, Toggle, Delete)

**Feature Branch**: `001-todo-crud`

**Created**: 2026-09-19

**Status**: Draft

**Input**: User description: "사용자가 할 일을 추가하고, 목록을 확인하고, 완료 여부를 토글하고, 삭제할 수 있는 기능이 필요하다. 할 일에는 제목(필수)과 완료 여부가 있다."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a todo and see it in the list (Priority: P1)

A user wants to capture something they need to do so they don't forget it, and
immediately see it reflected in their list of todos.

**Why this priority**: Without the ability to add and see todos, the application has
no value at all — this is the minimum capability needed for the app to be useful.

**Independent Test**: Can be fully tested by opening the app with an empty list,
entering a title, submitting it, and confirming the new todo appears in the list as
incomplete. Delivers value on its own (a place to capture tasks).

**Acceptance Scenarios**:

1. **Given** the todo list is empty, **When** the user adds a todo with the title
   "우유 사기", **Then** the todo appears in the list with that title and is marked
   as incomplete.
2. **Given** the todo list already has one or more todos, **When** the user adds
   another todo, **Then** the new todo appears in the list alongside the existing
   ones without removing or altering them.
3. **Given** the user leaves the title field empty (or only whitespace), **When**
   they attempt to submit it, **Then** the system rejects the submission with a
   clear message and no todo is added.

---

### User Story 2 - Toggle a todo's completion status (Priority: P2)

A user wants to mark a todo as done when they finish it, and be able to mark it
back as not done if they change their mind or made a mistake.

**Why this priority**: Tracking progress is the second most essential capability of
a todo app — it's what turns a list into a usable checklist — but it depends on
todos already existing (Story 1).

**Independent Test**: Can be fully tested by adding a todo, toggling it to
complete, confirming its status changed, then toggling it back to incomplete and
confirming that too. Delivers value on its own (progress tracking).

**Acceptance Scenarios**:

1. **Given** an incomplete todo in the list, **When** the user toggles its status,
   **Then** the todo is shown as complete.
2. **Given** a completed todo in the list, **When** the user toggles its status
   again, **Then** the todo is shown as incomplete again.
3. **Given** multiple todos in the list, **When** the user toggles one todo's
   status, **Then** all other todos' statuses remain unchanged.

---

### User Story 3 - Delete a todo (Priority: P3)

A user wants to permanently remove a todo they no longer need, whether it was
added by mistake or is simply no longer relevant.

**Why this priority**: Deletion keeps the list useful over time by letting users
remove clutter, but the app is still usable without it (Stories 1 and 2 already
deliver a working checklist), so it's the lowest priority of the three.

**Independent Test**: Can be fully tested by adding a todo, deleting it, and
confirming it no longer appears anywhere in the list. Delivers value on its own
(keeping the list relevant).

**Acceptance Scenarios**:

1. **Given** a todo in the list, **When** the user deletes it, **Then** the todo
   no longer appears in the list.
2. **Given** multiple todos in the list, **When** the user deletes one, **Then**
   the remaining todos are still present and unchanged.
3. **Given** the user deletes the only todo in the list, **When** the deletion
   completes, **Then** the list is shown in its empty state.

---

### Edge Cases

- What happens when the user tries to add a todo with an empty or whitespace-only
  title? The system MUST reject it and MUST NOT add a blank todo (see FR-002).
- What happens when the todo list has no todos at all (first use, or after
  deleting everything)? The system MUST show a clear empty-list state rather than
  a blank or broken screen.
- What happens when the user tries to toggle or delete a todo that was already
  deleted (e.g., removed in another browser tab)? The system MUST handle this
  gracefully without crashing, treating the action as a no-op and keeping the
  displayed list consistent with what actually exists.
- What happens with a very long title? The system MUST accept it up to a
  reasonable maximum length (see Assumptions) and MUST reject titles beyond that
  length with a clear message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a user to add a new todo by providing a title.
- **FR-002**: System MUST require a non-empty, non-whitespace-only title to add a
  todo, and MUST reject submissions that don't meet this with a clear message.
- **FR-003**: System MUST display the full list of todos, showing each todo's
  title and current completion status.
- **FR-004**: System MUST show a clear empty-list state when there are no todos.
- **FR-005**: A newly added todo MUST default to "incomplete" status.
- **FR-006**: Users MUST be able to toggle any individual todo between
  "incomplete" and "complete" status, independent of other todos.
- **FR-007**: Users MUST be able to delete any individual todo, permanently
  removing it from the list without affecting other todos.
- **FR-008**: System MUST persist todos (additions, toggles, deletions) so the
  list reflects the latest state whenever the user views it again.
- **FR-009**: System MUST allow a user to set a todo's priority to one of
  High, Medium, or Low, defaulting to Medium when not specified at creation.
- **FR-010**: Users MUST be able to change a todo's priority after creation,
  independent of its title or completion status.

### Key Entities

- **Todo**: A single task the user is tracking. Attributes: title (required
  text, must be non-empty), completion status (boolean, defaults to
  incomplete/false), priority (one of High, Medium, Low; defaults to Medium).
  Each todo is independent — creating, toggling, editing the priority of, or
  deleting one has no effect on any other todo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A newly added todo appears in the list within 1 second of
  submission.
- **SC-002**: Users can go from an empty list to a list with a visible todo in
  a single add action, with no additional steps required.
- **SC-003**: Users can change a todo's completion status in a single action
  (e.g., one click or tap), and the change is reflected within 1 second.
- **SC-004**: Users can remove an unwanted todo in a single action, and it is
  fully gone from the list within 1 second.
- **SC-005**: 100% of attempts to add a todo with a blank title are rejected,
  with zero blank todos ever appearing in the list.
- **SC-006**: 100% of todos display a completion status that matches the most
  recent toggle action performed on them.
- **SC-007**: 100% of todos created without an explicit priority are recorded
  as Medium priority.
- **SC-008**: Users can change a todo's priority in a single action, and the
  change is reflected within 1 second.

## Assumptions

- Single-user context: the app has no accounts, login, or per-user data
  separation — all todos belong to whoever is using the app on that device.
- No confirmation prompt is required before deleting a todo; deletion is
  immediate. (If accidental-deletion protection is desired later, that would be
  a separate enhancement.)
- Todos are displayed in a consistent order (e.g., the order they were created),
  with no user-configurable sorting or filtering in this feature — this
  includes priority: the list is not sorted or grouped by priority, which is
  shown only as a per-todo label.
- Priority values are the exact strings High/Medium/Low (case-sensitive at
  the API boundary); no case-insensitive matching or synonyms are supported.
- A reasonable maximum title length (e.g., 200 characters) is enforced to
  prevent unreasonably large input; the exact limit is a presentation detail
  left to planning.
- Todos persist across sessions (closing and reopening the app still shows
  previously added todos) rather than existing only in memory for the current
  session.
