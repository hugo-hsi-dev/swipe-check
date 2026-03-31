# Swipe Check Product Spec

## Product Summary

Swipe Check is a local-first, `MBTI-style` personality journal built around a fast daily swipe interaction.

Instead of asking the user to complete a long personality test in one sitting, the app establishes an initial baseline during onboarding and then continues through small daily check-ins. The product is meant to feel lightweight, repeatable, and reflective rather than academic or exhausting.

## Product Goals

- Make daily personality reflection quick and low-friction
- Encourage repeat use through short sessions and clear interaction patterns
- Help users understand their current type and how it changes over time
- Keep the MVP simple, offline-capable, and usable without accounts

## MVP Overview

The MVP includes:

- A one-time onboarding assessment
- A daily `Today` experience with swipe-based answering
- A `Journal` for reviewing completed entries
- An `Insights` area for current type and trend visibility
- A full-screen `Settings` page for app info and clear-data controls
- Local persistence using `SQLite`

The MVP does not include:

- Accounts, auth, or cloud sync
- Reminders or notification scheduling
- Editing past answers or backfilling missed days
- Notes, mood tags, export, sharing, or social features
- Advanced interpretation beyond the core score and trend model

## Core Product Rules

- All answers are binary: `Agree` or `Disagree`
- Onboarding must be completed before the user enters the main app
- Onboarding contains `12` questions
- Daily check-ins contain `3` questions per local calendar day
- There is at most one daily session per local day
- Missed days are skipped in MVP
- No undo is provided during active sessions in MVP
- Completed historical answers are read-only in MVP
- The app presents a single `Current Type` derived from the user's accumulated answer history

## Primary User Flows

### First Launch

The user completes onboarding, receives an initial `Current Type`, and then enters the main app.

### Returning Daily Use

The user opens `Today`, completes that day's check-in, and then sees a completed state rather than a new set of questions.

### History Review

The user can browse completed entries in `Journal` and open a specific entry to review that day's questions, answers, and stored type state.

### Insights Review

The user can open `Insights` to see their `Current Type`, axis-level summary, and time-based changes.

### App Controls

The user can open `Settings` to view app information or clear local data.

## Information Architecture

The MVP product surfaces are:

- `Today`
- `Journal`
- `Insights`
- `Settings`
- An entry detail destination for viewing a specific completed day

## Detailed Requirements By Epic

Detailed product requirements live in the epic documents:

- `EPIC_01_QUESTION_BANK_AND_ASSESSMENT_RULES.md`: question contract, onboarding set, daily selection, scoring, and snapshots
- `EPIC_02_LOCAL_DATA_PLATFORM.md`: local persistence, session durability, and clear-data support
- `EPIC_03_APP_SHELL_AND_NAVIGATION.md`: routing, app shell, and top-level navigation
- `EPIC_04_ONBOARDING_EXPERIENCE.md`: first-run onboarding flow and onboarding completion behavior
- `EPIC_05_DAILY_SWIPE_CHECK_IN.md`: `Today` screen behavior, swipe submission, resume, and completed-day state
- `EPIC_06_JOURNAL_AND_ENTRY_DETAIL.md`: read-only history browsing and per-entry detail behavior
- `EPIC_07_INSIGHTS_AND_TYPE_VISUALIZATION.md`: current type, axis strength, and trend visibility
- `EPIC_08_SETTINGS_AND_LOCAL_DATA_CONTROLS.md`: settings behavior and clear local data flow

## Product Notes

- Swipe Check should be described as `MBTI-style`, not as the official MBTI assessment
- Public-facing copy should avoid official proprietary MBTI questionnaire language
- Detailed question logic, scoring rules, persistence design, and screen-level acceptance criteria belong in the epic documents rather than in this overview
