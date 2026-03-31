# Epic 07: Insights and Type Visualization

This document defines the personality-summary and trend-viewing experience for Swipe Check. It is derived from `PRODUCT_SPEC.md` in the project root.

This epic focuses on what the user must be able to understand from their accumulated answers. It does not prescribe a specific chart library, visual style, or axis component design as long as the resulting experience is clear, truthful, and aligned with the product model.

## Project Context

Swipe Check is not only a daily answer collection app. It also promises that users will be able to see:

- their current type
- the strength of each axis
- how their personality profile changes over time

The product uses binary answers and a running score model, so Insights must communicate useful patterns without overstating certainty or pretending the user is taking an official clinical instrument.

## Epic Goal

Deliver an Insights experience that translates raw answer history into understandable personality feedback.

At the end of this epic, a user should be able to open Insights and answer questions like:

- What is my current type?
- Which letter on each axis is stronger right now?
- Has my profile shifted over time?

## Why This Epic Matters

The app's promise is not just convenience. It is meaningful reflection.

Without Insights, the app would collect answers without returning enough value. Users need a place where their accumulated participation is translated into something coherent and worth revisiting.

## In Scope

- A dedicated `Insights` destination in the main product flow
- Display of the user's current overall type
- Display of the four MBTI-style axis pairs:
- `E / I`
- `S / N`
- `T / F`
- `J / P`
- Display of axis strength or confidence based on score differences
- At least one time-based view that shows how personality results have changed over time
- Graceful handling of limited-data states, such as a user with onboarding only or very little daily history

## Out of Scope

- Narrative AI interpretations
- Social comparisons
- Export/share features
- Reminders
- Advanced research-style statistics or scientific claims

## Required Outcomes

### 1. Clear Current Type Summary

The user must be able to see a single `Current Type` derived from all answers to date.

That includes:

- onboarding answers
- completed daily answers

The current type shown in Insights must match the type used elsewhere in the product.

### 2. Axis-Level Understanding

The user must be able to see how the current type is formed across the four axis pairs.

The product should make it possible to understand not just the letters, but how strongly the user's answer history currently leans toward one side of each axis.

### 3. Time-Based Change Visibility

The user must be able to see some form of change over time.

The MVP does not require a complex analytics suite, but it does require at least one meaningful time-based view that helps the user understand movement rather than only a static snapshot.

### 4. Honest Handling of Limited Data

Insights must still function sensibly for users who have:

- only completed onboarding
- only completed a small number of daily sessions
- sparse history overall

The experience should avoid implying false precision when little data exists.

When an axis pair is tied, Insights must use the shared product tie rule and retain the previously established axis letter rather than inventing a separate display rule.

## Product Constraints

- The app presents a single `Current Type`
- Type calculation is based on all answers to date
- Axis strength is based on the scoring gap between poles
- Tied axis pairs must retain their previously established value according to the shared scoring model
- Insights is an MVP surface, so the initial visualizations should stay simple and understandable
- The product is `MBTI-style`, not the official MBTI assessment

## UX Expectations

Insights should make the user feel informed, not lectured.

The experience should:

- be easy to scan quickly
- explain what is current versus historical
- avoid overclaiming certainty
- reinforce the idea that the profile is built from repeated small check-ins over time

## Edge Cases To Handle

- Onboarding completed but no daily sessions yet
- Only one or two daily sessions completed
- Larger history with multiple snapshots over time
- Axis values that are very close or tied

The screen should remain coherent in all of these cases.

## Cross-Epic Dependencies

This epic depends on:

- Epic 01 for scoring and axis rules
- Epic 02 for historical snapshots and current score availability
- Epic 03 for the main `Insights` destination
- Epic 05 for daily data to accumulate over time

This epic complements Journal by focusing on interpretation and trend visibility rather than raw day-by-day review.

## Isolation Guidance

This epic can be built in isolation using mocked or seeded score histories.

It does not require the final swipe interaction to be complete as long as representative data exists.

What matters is that the Insights experience can correctly consume the score model and communicate it clearly.

## Acceptance Criteria

1. The app provides an `Insights` destination where the user can see their current overall type.
2. The current type shown in Insights matches the score model used throughout the rest of the app.
3. The user can view all four axis pairs and understand which side of each axis currently has the stronger score.
4. The screen presents axis strength or confidence in a way that reflects score differences rather than only showing four letters with no supporting context.
5. The screen includes at least one meaningful time-based view that shows how the user's results have changed over time.
6. The screen remains usable and understandable for users with minimal history, including users with onboarding only.
7. The Insights experience does not imply that the app is using the official MBTI questionnaire or making stronger claims than the available data supports.

## Validation Notes

The person completing this epic should be able to demonstrate at least the following:

- a user with onboarding only
- a user with a few completed daily sessions
- a user with longer history and multiple snapshots
- visible axis strength information
- a time-based view that communicates change over time

## Definition of Done

This epic is done when users can open Insights and understand both their current personality profile and how that profile has evolved through repeated daily participation.
