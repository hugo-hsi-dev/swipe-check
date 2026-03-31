# Epic 02: Local Data Platform

This document defines the persistent data foundation for Swipe Check. It is derived from `PRODUCT_SPEC.md` in the project root.

This epic intentionally focuses on outcomes, data responsibilities, and product constraints rather than prescribing a specific repository layout, migration style, or query implementation.

## Project Context

Swipe Check is a local-first mobile app in MVP.

The product requires durable storage for:

- question definitions
- onboarding progress
- daily sessions
- individual answers
- type snapshots over time
- lightweight app preferences

The MVP explicitly excludes auth, cloud sync, and backend dependency. The chosen storage direction for MVP is `SQLite`.

## Epic Goal

Create a persistent local data layer that makes the rest of the product possible.

At the end of this epic, the app must be able to treat local data as the source of truth for:

- whether onboarding is complete
- what today's session is
- whether a session is unfinished or completed
- what the user's answer history contains
- what the user's current type and past snapshots are
- whether the app has been cleared

## Why This Epic Matters

Every user-facing epic depends on durable state.

Without this layer, the app cannot reliably:

- resume interrupted onboarding
- resume interrupted daily sessions
- enforce one daily session per local day
- show history in Journal
- show trends in Insights
- support destructive controls in Settings

This epic should give downstream developers confidence that the product can be closed, reopened, and used over time without losing state or creating contradictory records.

## In Scope

- Establish the persistent data structures needed for MVP
- Persist question data or seeded question content in a way the app can consume reliably
- Persist onboarding completion state
- Persist onboarding sessions and responses
- Persist daily sessions and responses
- Persist derived type snapshots over time
- Persist minimal app-level preferences required by MVP
- Support initialization on first launch
- Support recovery of in-progress sessions after app restart
- Support queries needed by Today, Journal, Insights, and Settings
- Support a full clear-data flow at the data level

## Out of Scope

- Cloud sync or multi-device consistency
- User accounts or authentication
- Notification scheduling
- Analytics pipelines
- Any UI implementation beyond what is needed for data validation

## Required Outcomes

### 1. Reliable First-Launch Initialization

A clean install must initialize the app into a valid first-run state.

That valid state must make it possible for the rest of the product to determine:

- the app has not yet completed onboarding
- the question catalog is available
- no invalid partial records exist before the user starts interacting

### 2. Durable Session History

The platform must persist both onboarding and daily sessions in a way that supports:

- starting a session
- resuming a session
- completing a session
- loading a session by date or type
- distinguishing in-progress from completed work

### 3. Durable Answer History

The platform must preserve each displayed question and each submitted answer so that the app can later reconstruct:

- what the user saw
- what the user answered
- when the answer was recorded
- which completed day the answer belongs to

### 4. Durable Type State

The app must be able to store or reconstruct the user's personality state over time.

That includes:

- the current accumulated type
- axis-level scores or strength values
- per-day type snapshots that power Journal and Insights

### 5. Correct Daily Session Behavior

The data layer must support the product rules that:

- there is at most one daily session per local calendar day
- a missed day is simply missed and does not create a backfillable gap
- once a daily session is completed, no additional daily questions are created for that same day

### 6. Destructive State Controls

The data layer must make it possible to:

- clear all local app data

This action must leave the app in a coherent state rather than a partially cleared one.

## Product Constraints

- MVP storage is local-first and based on `SQLite`
- The app must work without a network connection
- Missed days are skipped permanently
- Past completed answers are read-only in MVP
- Daily sessions must be based on the user's local calendar day
- The app must survive close and reopen behavior without losing valid work

## Data Responsibilities

At a minimum, the data platform must support the following product concepts:

- app preferences and onboarding state
- question catalog
- onboarding sessions
- daily sessions
- session items or equivalent records linking questions to a specific session
- recorded answers
- type snapshots or equivalent derived state for history and insights

The exact shape of the persistence model is left open as long as it cleanly supports the product behaviors.

## Quality Expectations

The data platform should favor correctness and recoverability.

That means:

- the app should not accidentally generate duplicate daily sessions
- partial progress should not vanish after a restart
- historical records should be queryable without hidden in-memory state
- destructive actions should fully resolve into a known product state

## Cross-Epic Dependencies

This epic depends on Epic 01 for the question and scoring contracts.

Other epics depend on this epic for:

- onboarding persistence
- daily session persistence
- journal history queries
- insights history and current type queries
- settings clear-data actions

## Isolation Guidance

This epic can be completed largely in isolation.

A developer working on this epic does not need finished versions of:

- the onboarding screen
- the swipe UI
- the journal UI
- the insights UI
- the settings screen

The work can be validated through seeded data, controlled flows, and direct product state transitions.

## Acceptance Criteria

1. A clean install initializes into a valid first-run state with onboarding incomplete and question data available.
2. The app can persist onboarding progress so an interrupted onboarding flow can be resumed later without data loss.
3. The app can persist a daily session so an interrupted daily check-in can be resumed later without data loss.
4. The system enforces at most one daily session per local calendar day.
5. Once a daily session is completed, reopening the app on the same day does not create a second session for that day.
6. Completed sessions and their answers can be queried later by other parts of the product without relying on transient in-memory state.
7. The data platform supports the product's ability to show both current overall type and historical daily snapshots.
8. Clear local data returns the app to a fresh-install experience.
9. The data layer works offline and does not require a backend service.

## Validation Notes

The person completing this epic should be able to demonstrate at least the following scenarios:

- first launch before onboarding
- partial onboarding, app close, and resume
- partial daily session, app close, and resume
- completed daily session and same-day reopen
- multiple consecutive days with distinct completed sessions
- clear data returning the app to first-launch behavior

## Definition of Done

This epic is done when the rest of the product can rely on local persistent data as the source of truth for onboarding state, daily check-ins, history, insights, and destructive clear-data behavior.
