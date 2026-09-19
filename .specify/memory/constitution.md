<!--
Sync Impact Report
- Version change: (none, template) → 1.0.0
- Rationale: Initial ratification. No prior constitution existed (only unfilled template
  placeholders were present), so this is the first concrete governance document — MAJOR
  version 1.0.0 per semantic versioning rules for initial adoption.
- Modified principles: n/a (all five principles newly defined)
  - I. [PRINCIPLE_1_NAME] → I. Simplicity First (NON-NEGOTIABLE)
  - II. [PRINCIPLE_2_NAME] → II. End-to-End Type Safety
  - III. [PRINCIPLE_3_NAME] → III. SQLite as Single Source of Truth
  - IV. [PRINCIPLE_4_NAME] → IV. Test-First for Core Logic
  - V. [PRINCIPLE_5_NAME] → V. Consistent API & UI Contracts
- Added sections: Technology Constraints, Development Workflow, Governance (all newly
  populated from template placeholders)
- Removed sections: none
- Deferred/TODO placeholders: none — no bracketed tokens remain unfilled.
- Note: derived from repository inspection (package.json, README.md, app/ directory,
  git history) since no user-supplied principles were provided in this session. The user
  should review and amend if these defaults do not match intent.
- Templates requiring follow-up: none checked in this run (scope limited to the
  constitution file itself per command instructions); downstream templates
  (plan/spec/tasks) read this file at runtime and were not modified here.
-->

# Mini Todo SQLite Constitution

## Core Principles

### I. Simplicity First (NON-NEGOTIABLE)
This is a small, single-purpose todo application. Every change MUST favor the simplest
solution that satisfies the requirement. Do not introduce additional frameworks, state
management libraries, ORMs, or backend services beyond Next.js and SQLite unless a
concrete, current requirement cannot be met without them. Speculative abstractions,
configuration options, or extensibility hooks for hypothetical future features are
prohibited (YAGNI). Three similar lines of code are preferred over a premature
abstraction.
**Rationale**: The project's name and scope ("mini" todo app) signal that its value comes
from being easy to read, run, and modify end-to-end. Complexity added "just in case"
defeats that purpose and slows down the one or few people maintaining it.

### II. End-to-End Type Safety
TypeScript strict mode MUST remain enabled. Data flowing from the SQLite database through
API route handlers to React components MUST be represented by explicit, shared types —
`any` and unchecked type assertions are prohibited outside of narrowly justified
third-party interop. A todo item's shape (fields, nullability) MUST be defined once and
reused, not redefined ad hoc per file.
**Rationale**: With no dedicated backend team and a small codebase, type errors caught at
compile time are the cheapest defense against data-shape bugs traveling from the database
to the UI.

### III. SQLite as Single Source of Truth
All persistent todo data MUST live in the SQLite database; the UI and route handlers MUST
NOT maintain independent persistent state (e.g., separate JSON files, in-memory stores
that outlive a request) that could drift from it. Schema changes MUST be expressed as
explicit, reviewable migration steps (SQL or a migration script) rather than ad hoc
`ALTER`/manual edits, so the schema's history stays reconstructable from the repo.
**Rationale**: A todo app's only real state is its list of todos; keeping one authoritative
store avoids sync bugs and makes the data model easy to reason about.

### IV. Test-First for Core Logic
Core todo logic — creating, listing, updating, completing, and deleting todos, and any
SQLite query/data-access functions — MUST have tests written before or alongside the
implementation, and MUST fail before the implementation makes them pass. Purely
presentational UI (styling, layout) is exempt, but any component containing branching
logic (filtering, validation, derived state) is not.
**Rationale**: Automated coverage on the data-mutating paths is what lets a small project
be refactored confidently without a large manual QA pass on every change.

### V. Consistent API & UI Contracts
Next.js route handlers MUST return a consistent, documented response shape (success and
error cases) for a given resource, and MUST validate request input at the boundary before
touching the database. UI code MUST consume the API through a single typed client/helper
per resource rather than scattering raw `fetch` calls with inline shape assumptions across
components.
**Rationale**: Consistent contracts let the frontend and backend evolve independently and
make it obvious, from one place, what a route promises to callers.

## Technology Constraints

The stack is fixed to: Next.js (App Router) with TypeScript, React, Tailwind CSS for
styling, and SQLite for persistence. Introducing a different database engine, a separate
backend framework/server process, or a state-management library requires updating this
constitution first (see Governance) — it is a deliberate architectural change, not an
implementation detail. Environment-specific configuration (e.g., database file location)
MUST be read from environment variables with sensible local defaults, never hard-coded
absolute paths.

## Development Workflow

Before a change is considered done: `npm run lint` and `npm run build` MUST pass, and any
tests covering the touched logic (per Principle IV) MUST pass. Pull requests/commits that
touch the database schema MUST describe the migration in the commit message or an
accompanying migration file. Spec Kit artifacts (spec, plan, tasks) for a feature MUST
stay consistent with this constitution; where they conflict, this constitution governs
until amended.

## Governance

This constitution supersedes any conflicting ad hoc practice for this repository. Amending
it requires: (1) recording the proposed change and rationale, (2) updating the version
per the policy below, and (3) updating the `Last Amended` date. Versioning follows
semantic versioning: MAJOR for backward-incompatible principle removals or redefinitions,
MINOR for new principles or materially expanded guidance, PATCH for wording/clarification
fixes with no rule change. Every feature spec and implementation plan produced via Spec
Kit commands MUST be checked against these principles; deviations MUST be justified in the
plan's Complexity Tracking section or rejected.

**Version**: 1.0.0 | **Ratified**: 2026-09-19 | **Last Amended**: 2026-09-19
