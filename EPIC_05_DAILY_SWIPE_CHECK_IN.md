# Epic 05: Daily Swipe Check-In

This document defines the core recurring interaction of Swipe Check. It is derived from `PRODUCT_SPEC.md` in the project root.

This epic describes the user-visible behavior and business rules for the daily check-in. It does not prescribe a specific gesture library setup, animation system, component decomposition, or persistence implementation beyond what is already required by the product.

## Project Context

Swipe Check is built around a simple daily loop:

- the user answers exactly `3` questions per day
- each question uses only `Agree` or `Disagree`
- the preferred interaction is a swipe gesture

The daily check-in is the product's main habit-forming experience and is the default home of the app after onboarding.

## Epic Goal

Deliver the complete `Today` experience so that an onboarded user can open the app, complete today's `3` questions quickly, and immediately see that today's check-in is done.

At the end of this epic, the core product promise should be real: a user can come back every day, answer a small number of swipeable prompts, and leave with confidence that their answers were saved and their profile was updated.

## Why This Epic Matters

This is the defining loop of the product.

If this epic fails, the app is no longer a daily journal. It becomes either a broken quiz or a generic personality dashboard without a habit loop.

This epic must make the daily action feel:

- fast
- obvious
- reliable
- worth repeating tomorrow

## In Scope

- The `Today` screen behavior for onboarded users
- Creation or loading of today's daily session
- Display of one question at a time
- Clear `Agree` and `Disagree` submission behavior
- Swipe-based answering as the primary interaction
- Immediate persistence of submitted answers
- Visible progress through today's `3` questions
- Resume of unfinished daily sessions after interruption
- Completed-today state after the third answer
- Same-day reopen behavior after completion
- Presentation of today's submitted answers and updated current type in the completed state

## Out of Scope

- The one-time onboarding flow
- Full Journal browsing of previous days
- Full Insights visualizations beyond what is needed for the completed-today state
- Reminder scheduling
- Editing historical answers

## Required Outcomes

### 1. Exactly One Daily Session Per Day

For an onboarded user, the app must support at most one daily session per local calendar day.

That session must contain exactly `3` questions.

### 2. Primary Swipe-Based Submission

The daily check-in should feel built around swiping.

The app must make it obvious that:

- swiping right means `Agree`
- swiping left means `Disagree`

The user should not need to guess which direction means what.

### 3. Immediate Answer Persistence

Once the user submits an answer, the app should treat it as recorded.

If the user leaves the app partway through the daily session, previously submitted answers must remain intact.

### 4. Resume of Incomplete Sessions

If the user closes or backgrounds the app before finishing today's `3` questions, the next app open on that same day should return them to the unfinished session rather than generate a new one.

### 5. Completed-Today State

After the third answer is submitted, the `Today` surface must stop behaving like an active question flow and instead show a completed state for that day.

That completed state should make it clear that:

- today's questions are finished
- today's answers can be reviewed easily
- the user's current type is available and updated

### 6. Missed-Day Behavior

If the user does not open the app or does not complete a check-in on a given day, that day is missed.

The product does not support backfilling missed daily sessions in MVP.

## Product Constraints

- The daily session contains exactly `3` questions
- All daily answers use binary `Agree` or `Disagree`
- Swipe is the primary interaction mode
- No undo is provided after a daily answer is submitted
- The user can submit answers only once per question shown in today's session
- Completed daily sessions are read-only in MVP
- Missed days are skipped permanently
- The `Current Type` is based on all answers to date, including onboarding and completed daily responses

## UX Expectations

The daily flow should feel significantly lighter than a typical quiz.

That means:

- only one question should compete for the user's attention at a time
- progress should be obvious
- the action mapping for swipe directions should always be visible or otherwise unmistakable
- the completed-today state should feel final rather than ambiguous

## Edge Cases To Handle

- The user opens the app before answering any of today's questions
- The user answers one or two questions and leaves
- The user returns later the same day after completion
- The user misses a day entirely
- The user completes onboarding and lands in `Today` for the first time

The epic should resolve these states cleanly without creating duplicate daily sessions or confusing progress.

## Cross-Epic Dependencies

This epic depends on:

- Epic 01 for daily selection and scoring rules
- Epic 02 for persistent session state
- Epic 03 for the `Today` route and product shell

This epic produces data and behavior consumed by:

- Journal
- Insights
- Settings clear-data validation

## Isolation Guidance

This epic can be executed largely in isolation from Journal and Insights as long as the developer can:

- create or load today's session
- move through the `3` questions
- save answers
- show the completed-today state

The completed-today state may initially use lightweight or placeholder supporting visuals as long as the product behavior is correct.

## Acceptance Criteria

1. An onboarded user receives at most one daily session per local calendar day.
2. Today's session contains exactly `3` questions.
3. The `Today` experience makes the `Agree` and `Disagree` directions unambiguous.
4. The user can submit each of today's answers through the intended swipe-based interaction.
5. Each submitted answer is saved immediately enough that progress is not lost if the app is interrupted.
6. An unfinished daily session can be resumed on the same day without generating a new set of questions.
7. After the third answer, the `Today` screen shows a completed state rather than continuing to behave like an unfinished session.
8. The completed state makes today's answers easy to review and shows the user's updated current type.
9. Reopening the app later on the same day does not generate a second completed session for that day.
10. Missing a day does not create a backfillable session and does not block future daily sessions.

## Validation Notes

The person completing this epic should be able to demonstrate at least the following:

- first daily session after onboarding
- answering all `3` questions in one sitting
- partial progress, app close, and resume
- completed-today reopen behavior
- a missed day followed by a later successful daily session

## Definition of Done

This epic is done when the app's main daily habit loop is functional, trustworthy, and clearly limited to one completed `3`-question session per day.
