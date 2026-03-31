# Epic 04: Onboarding Experience

This document defines the first-run assessment experience for Swipe Check. It is derived from `PRODUCT_SPEC.md` in the project root.

This epic focuses on the user experience and product behavior of onboarding. It does not prescribe a specific screen layout, animation approach, or state management pattern as long as the required outcomes are achieved.

## Project Context

Swipe Check is not a one-time quiz app. It is a daily `MBTI-style` journal that begins with a short onboarding assessment.

The onboarding assessment exists to:

- explain the app's core concept
- establish the user's initial baseline
- prevent the user from entering the main app without enough data to produce an initial type

The onboarding assessment is fixed and includes exactly `12` questions.

## Epic Goal

Deliver a fast, understandable, one-time onboarding flow that introduces the product and creates the user's first `Current Type`.

At the end of this epic, a brand-new user should be able to open the app, understand what they are about to do, complete all `12` onboarding questions, and enter the main app with an initial personality result already available.

## Why This Epic Matters

Onboarding is the user's first trust-building moment.

If it is confusing, too long, or too abstract, users may leave before the daily habit loop ever begins.

This epic should create an experience that feels:

- lightweight
- focused
- comprehensible to a first-time user
- aligned with the daily low-friction product promise

## In Scope

- The first-run onboarding entry experience
- Introductory product framing for a new user
- The `12` onboarding question flow
- Visible progress through the onboarding session
- Binary answer collection for onboarding questions
- Persistence and resumption of an unfinished onboarding session
- Completion behavior that generates the user's initial type and sends them into the main app

## Out of Scope

- Daily check-in flow after onboarding
- Journal browsing
- Insights screen design beyond whatever is needed to confirm onboarding success
- Settings behavior
- Reminder-related messaging

## Required Outcomes

### 1. First-Run Orientation

The onboarding flow must tell the user what kind of app this is and what they are about to do.

A user with no prior knowledge should understand that:

- the app is a daily personality journal
- onboarding is the initial baseline setup
- answers are simple `Agree` or `Disagree` responses
- the app will later present only `3` questions per day

### 2. Fixed `12`-Question Assessment

The onboarding session must contain exactly `12` questions.

Those questions are fixed by the assessment rules and are not replaced by a random daily draw.

### 3. Clear Progress Through the Flow

The user should always understand that onboarding is finite and where they currently are within it.

The flow should feel finishable.

### 4. Durable Partial Progress

If the app is interrupted during onboarding, the user should be able to return to the same onboarding session without losing valid completed answers.

### 5. Valid Completion Transition

When onboarding is completed:

- the app must consider the user onboarded
- the app must generate an initial personality result using the onboarding answers
- the user must be able to enter the main app with that result available

## Product Constraints

- Onboarding happens once per install unless local data is cleared
- The onboarding assessment uses binary responses only
- Onboarding contains exactly `12` questions
- No undo is provided after an onboarding answer is submitted
- The result produced at the end of onboarding becomes the user's initial `Current Type`
- The app should not imply the user is taking the official MBTI assessment

## UX Expectations

The onboarding flow should reinforce the app's low-friction premise.

That means:

- the flow should feel quick rather than academic
- the answer choice should be obvious on every question
- the user should not feel dropped into the main app without understanding what happened
- completion should feel like a meaningful transition into the daily experience

## Cross-Epic Dependencies

This epic depends on:

- Epic 01 for the onboarding question set and scoring rules
- Epic 02 for durable session state or an equivalent persistent state source
- Epic 03 for being routed into the onboarding flow correctly

This epic provides a critical handoff into:

- the main `Today` experience
- the initial `Current Type` shown elsewhere in the app

## Isolation Guidance

This epic can be built and validated largely in isolation from the daily check-in and history surfaces.

It does not require finished versions of:

- the daily swipe flow
- the journal list
- the insights charts

As long as the developer can start, resume, complete, and exit onboarding correctly, the epic can be considered independently successful.

## Acceptance Criteria

1. A brand-new user is required to complete onboarding before entering the main app.
2. The onboarding experience explains the product clearly enough that a first-time user understands the purpose of the assessment and the app's daily habit model.
3. The onboarding session contains exactly `12` questions.
4. The user can answer each onboarding question using the app's binary response model without ambiguity.
5. The onboarding flow clearly communicates progress so the user understands that the flow is finite.
6. If the user leaves or closes the app mid-onboarding, the same unfinished onboarding session can be resumed later.
7. Completing onboarding marks the user as onboarded and produces an initial `Current Type` that is available to the rest of the app.
8. After onboarding completion, the user is transitioned into the main app rather than left in an undefined or repeated onboarding state.

## Validation Notes

The person completing this epic should be able to demonstrate at least the following:

- first-ever launch into onboarding
- visible progress through all `12` questions
- interruption during onboarding and successful resume
- final completion producing an initial type
- entry into the main app after successful onboarding

## Definition of Done

This epic is done when a brand-new user can complete a one-time onboarding flow that establishes their initial personality baseline and cleanly hands them off into the daily product experience.
