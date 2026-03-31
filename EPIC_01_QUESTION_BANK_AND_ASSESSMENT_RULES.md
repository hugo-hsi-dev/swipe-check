# Epic 01: Question Bank and Assessment Rules

This document defines the product and domain outcomes for the question system that powers Swipe Check. It is derived from `PRODUCT_SPEC.md` in the project root.

This epic intentionally describes outcomes and constraints, not a prescribed implementation. A developer should be able to complete this work using the repository's existing conventions while still meeting the product goals.

## Project Context

Swipe Check is a daily `MBTI-style` personality journal.

The app experience is built around two assessment modes:

- A one-time onboarding assessment made up of `12` binary questions
- A recurring daily check-in made up of `3` binary questions per day

All questions use only two possible responses:

- `Agree`
- `Disagree`

The app is not intended to reproduce the official MBTI instrument. It should be treated as `MBTI-style` and should avoid official proprietary question wording.

## Epic Goal

Create the complete assessment ruleset for the app so that every other epic has a clear, reliable foundation for:

- what questions exist
- how questions are categorized
- how onboarding differs from daily questions
- how daily questions are selected over time
- how answers contribute to a user's current type and axis strength

At the end of this epic, another developer should be able to build onboarding, daily sessions, Journal, and Insights without needing to invent or reinterpret the underlying personality logic.

## Why This Epic Matters

This is the domain core of the product. If the question system is vague or inconsistent, the rest of the app will produce contradictory behavior, unstable insights, and poor user trust.

This epic is responsible for turning the product concept into a usable assessment model that is:

- simple enough for daily use
- balanced enough to feel intentional rather than random
- deterministic enough to support reliable scoring and history
- flexible enough for the UI and persistence layers to consume

## In Scope

- Define the canonical question structure for all assessments
- Define the `12` onboarding questions and their intended axis coverage
- Define the reusable daily question pool and its coverage expectations
- Define how each question maps to one MBTI axis pair
- Define which side of an axis is supported by `Agree`
- Define expectations for direct and reverse-coded prompts
- Define the daily question selection rules
- Define the scoring rules used to compute the user's `Current Type`
- Define the axis strength or confidence outputs needed by Insights
- Define how completed sessions should produce type snapshots that can be stored or reconstructed later

## Out of Scope

- Screen implementation
- Navigation or route structure
- Local storage implementation
- Charts and visualization
- Settings behavior
- Reminders, sync, or auth

## Required Outcomes

### 1. Canonical Question Contract

Every active question in the system must have enough information to answer all of the following without ambiguity:

- What is the prompt text?
- Which axis pair does it belong to?
- Which pole does `Agree` support?
- Is it part of onboarding or the daily pool?
- Is it currently active and available for selection?

The system must make it possible for a downstream developer to reason about a question without relying on hidden assumptions.

### 2. Onboarding Assessment Definition

The onboarding assessment must be fixed, not dynamically generated.

It must include exactly:

- `12` questions total
- `3` questions for each axis pair: `E/I`, `S/N`, `T/F`, `J/P`

The onboarding set should give the user a credible initial result while staying lightweight and finishable.

### 3. Daily Question Pool Definition

The daily pool must be fully distinct from the onboarding set.

Onboarding questions must never be selected for daily sessions.

The daily pool must be large and balanced enough that:

- the user does not see obvious repetition too quickly
- all four axis pairs receive recurring exposure over time
- the daily selection logic has enough options to avoid repeating yesterday's question when alternatives exist

The exact daily pool size is not mandated by this epic, but the final set must support balanced recurring use rather than feeling exhausted after a few days.

### 4. Daily Selection Rules

Daily questions must not be chosen as pure random draws from the full bank.

The daily selection rules are:

- exactly `3` daily questions are shown on a given day
- each day includes one question from each of the `3` axis pairs with the lowest cumulative daily exposure across completed daily sessions to date
- if multiple axis pairs are tied on exposure, the tied axis that was least recently shown is selected first
- if axis pairs are still tied after recent-use comparison, use fixed axis order: `E/I`, `S/N`, `T/F`, `J/P`
- within each selected axis pair, choose the least-recently-used active daily question
- avoid repeating yesterday's question when another valid question exists for that axis pair
- when multiple valid questions remain for an axis pair, prefer the coding direction that has been used less often for that axis pair over time

The output of this logic must be stable enough that another developer can implement it and verify that it matches the spec.

### 5. Scoring Rules

The system must clearly define how a binary answer changes personality scores.

At minimum, the rules must support:

- incrementing one side of one axis per answer
- computing a user's `Current Type` from all answers to date
- computing axis strength using the gap between the two poles on each axis
- generating a type snapshot after a completed session

The same answer history must always produce the same scoring result.

### 6. Tie and Low-Data Behavior

This epic must account for edge cases where:

- one or more axes are tied
- there is very little data available
- the user has completed onboarding but very few daily sessions

The tie behavior is:

- the fixed `3` onboarding questions per axis pair create the user's initial non-tied baseline
- if an axis pair later becomes tied, that axis pair retains its previously established letter rather than flipping or becoming unknown
- all screens that present type information must use this same tie rule

Low-data behavior must remain truthful and consistent across screens without inventing extra personality certainty beyond the available answer history.

## Product Constraints

- The app is `MBTI-style`, not the official MBTI assessment
- No five-point scale exists in MVP
- All answers are binary only
- Onboarding is fixed and one-time per install unless local data is cleared
- Daily questions must come from a pool fully separate from onboarding questions
- Daily questions must be balanced over time rather than purely random
- The `Current Type` is based on all answers to date, not just today's answers

## Quality Expectations

The question system should feel intentional and credible to the user.

That means:

- prompts should be easy to answer quickly
- prompts should not feel duplicated or trivially reworded
- the polarity of each prompt should be unambiguous
- reverse-coded prompts should reduce obvious response bias
- the scoring model should avoid surprising or contradictory outcomes

## Cross-Epic Dependencies

This epic can be completed before any screen or storage work exists.

Other epics depend on this epic for:

- the list of onboarding questions
- the daily question pool
- the question metadata contract
- the daily question selection policy
- the scoring and snapshot rules

## Isolation Guidance

This epic should be executable in isolation because it is primarily a domain-definition task.

A developer working on this epic does not need to wait for:

- final navigation
- final UI components
- final SQLite schema
- final charts

What matters is that the outputs of this epic are explicit enough for other developers to consume without reinterpretation.

## Acceptance Criteria

1. A developer unfamiliar with the project can identify the full onboarding question set and confirm that it contains exactly `12` questions with `3` questions per axis pair.
2. Every active question in the system unambiguously identifies its axis pair and which pole is supported by `Agree`.
3. The daily question pool is fully distinct from onboarding and documented well enough that another developer can implement balanced recurring selection without inventing additional product rules.
4. The daily selection rules guarantee exactly `3` questions per day by choosing one question from each of the `3` least-exposed axis pairs, with deterministic tie-breakers.
5. The scoring rules deterministically produce the same `Current Type` for the same history of answers.
6. The system defines outputs that are sufficient for Journal and Insights to show a per-day type snapshot and a current overall type.
7. Tie behavior and low-data behavior are documented well enough that different screens cannot present contradictory results, including retaining the previous axis value when a later tie occurs.
8. The resulting question system does not rely on a five-point scale, cloud state, or official MBTI proprietary wording.

## Validation Notes

The person completing this epic should be able to demonstrate at least the following:

- a clear list of onboarding questions and their metadata
- a clear description of the daily pool and its coverage
- example answer histories and the resulting type outputs
- example daily selection scenarios showing balanced behavior across recent days
- example tied-axis histories showing that the prior axis value is retained

## Definition of Done

This epic is done when the product's assessment model is explicit enough that other developers can build the app's flows and data features without making new domain decisions on their own.
