# Epic 06: Journal and Entry Detail

This document defines the read-only history experience for Swipe Check. It is derived from `PRODUCT_SPEC.md` in the project root.

This epic is about helping the user look back at what they answered and how their result appeared on a given day. It does not prescribe a specific list design, grouping strategy, or layout implementation beyond the product outcomes described here.

## Project Context

Swipe Check is a daily journal, not just a current-score dashboard.

Users need a place where they can review prior completed days without editing them. The product spec defines two important expectations:

- today's answers should be easy to access
- earlier answers should be accessible through some kind of list or menu flow

Journal is the part of the app that makes the product feel cumulative rather than disposable.

## Epic Goal

Provide a clear, read-only history experience where users can browse completed days and inspect the details of a specific entry.

At the end of this epic, a user should be able to move beyond the current day, open a past date, and understand what they answered and what type snapshot existed at that time.

## Why This Epic Matters

Without Journal, the app cannot feel like a journal.

The user needs evidence that:

- their answers are being retained
- previous days remain accessible
- personality history can be reviewed rather than guessed

Journal is also the bridge between the raw act of answering questions and the later experience of spotting patterns.

## In Scope

- A Journal destination in the main product flow
- A browsable list or menu of completed days
- Clear surfacing of today's completed answers when available
- A dedicated detail view for an individual completed day
- Read-only display of the questions shown on that day
- Read-only display of the user's answers for that day
- Read-only display of that day's type snapshot or equivalent personality summary
- Reasonable empty states when little or no daily history exists yet

## Out of Scope

- Editing past answers
- Adding notes or mood tags
- Advanced analytics or charting beyond a single day's snapshot
- Reminder-related states
- Backfilling missed days

## Required Outcomes

### 1. Browsable Completed-Day History

The user must be able to see that prior completed days exist and choose one to inspect.

The product does not require a specific visual pattern, but the resulting experience must make older entries discoverable rather than hidden behind unclear navigation.

### 2. Clear Access to Today's Answers

When the current day has been completed, today's answers should be easy to access.

This does not require Journal to be the only place where today's answers are visible, but Journal must not make today's entry harder to find than older ones.

### 3. Dedicated Entry Detail View

Opening a completed day should reveal enough detail for the user to understand exactly what happened on that date.

At minimum, a day detail view must show:

- the date
- the questions answered that day
- the user's answers
- the day's type snapshot or equivalent result summary

### 4. Read-Only Historical State

Completed history is not editable in MVP.

The Journal experience should communicate review, not revision.

### 5. Graceful Early-Lifecycle States

The app must handle users with little or no history.

Examples include:

- a user who finished onboarding but has not completed any daily sessions yet
- a user with only one or two completed daily sessions

## Product Constraints

- Journal is a primary surface in MVP
- Past completed answers are read-only
- Missed days are skipped, not backfilled
- The app should not suggest that the user can edit or create entries for past missed dates

## UX Expectations

Journal should help the user answer simple questions such as:

- What did I answer yesterday?
- How did I show up last week?
- What type did the app assign on a given day?

The experience should feel like browsing a real timeline of completed participation, not a debug log of raw database records.

## Edge Cases To Handle

- No completed daily sessions yet
- Only one completed daily session
- Today completed but older history unavailable
- Older history available across multiple dates
- A missed day between completed days

The presence of missed days must not imply that the user can go back and fill them in.

## Cross-Epic Dependencies

This epic depends on:

- Epic 02 for persistent history data
- Epic 03 for route structure and entry-detail navigation
- Epic 05 for completed daily sessions to exist

This epic provides an important read-only companion to the `Today` flow and supports the user's trust in the product.

## Isolation Guidance

This epic can be designed and developed largely against mocked or seeded history data.

It does not require the final onboarding UI or final insights charts to be complete.

What matters is that the Journal experience can consume completed-day data and present it in a coherent, read-only way.

## Acceptance Criteria

1. The app provides a Journal destination where the user can browse completed daily entries.
2. Completed days are discoverable through a clear list or menu flow rather than being hidden behind unclear navigation.
3. Today's completed answers, when available, are easy to locate from the Journal experience.
4. Opening a completed day reveals the date, the questions shown that day, the user's answers, and that day's type snapshot or equivalent summary.
5. Historical entries are read-only and do not present editing affordances in MVP.
6. The Journal experience handles users with little or no history gracefully.
7. The Journal experience does not imply that missed days can be backfilled.

## Validation Notes

The person completing this epic should be able to demonstrate at least the following:

- Journal with no daily history
- Journal with one completed day
- Journal with multiple completed days
- navigation from the Journal list into a day detail view
- confirmation that past answers are reviewable but not editable

## Definition of Done

This epic is done when users can treat Swipe Check as a real history of completed daily check-ins rather than a one-screen experience with no durable record.
