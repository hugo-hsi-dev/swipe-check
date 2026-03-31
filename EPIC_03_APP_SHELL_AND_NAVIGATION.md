# Epic 03: App Shell and Navigation

This document defines the top-level product structure for Swipe Check. It is derived from `PRODUCT_SPEC.md` in the project root.

This epic is about getting the app into the right places at the right times. It intentionally avoids dictating component structure or exact navigation implementation details, as long as the product behavior is correct and consistent.

## Project Context

The current repository already contains an Expo Router application shell with starter tabs and demo content.

The product, however, needs a purpose-built information architecture centered around:

- onboarding for first-time users
- a `Today` experience for the daily check-in
- a `Journal` area for historical answers
- an `Insights` area for current type and trends
- a dedicated full-screen `Settings` page
- an entry detail destination for viewing a specific completed day

## Epic Goal

Replace the starter shell with the real product shell so that a user with no prior state always lands in the correct flow and a returning user always lands in the correct product surface.

At the end of this epic, the app should have a clear, product-aligned structure even if individual screens still use placeholder content.

## Why This Epic Matters

If the app shell is wrong, the rest of the work becomes difficult to validate.

This epic establishes:

- where onboarding lives
- where the main product surfaces live
- how Settings is reached
- how historical detail is reached
- which screen is the product's primary home
- whether a user is incorrectly shown starter/demo content

## In Scope

- Define the product route structure
- Replace starter navigation labels with product labels
- Gate first-time users into onboarding
- Route onboarded users into the main app
- Establish the main tab structure for `Today`, `Journal`, and `Insights`
- Expose `Settings` as a separate full-screen page
- Expose a destination for viewing an individual journal entry or completed day
- Ensure loading and transition states do not briefly expose the wrong screen

## Out of Scope

- Final onboarding UX details
- Final swipe interaction implementation
- Final Journal content rendering
- Final Insights visualizations
- Final Settings controls beyond route availability

## Required Outcomes

### 1. Correct First-Launch Routing

When the app is opened by a brand-new user, the app must direct that user into the onboarding flow rather than the main product tabs.

### 2. Correct Returning-User Routing

When the app is opened by an onboarded user, the default destination should be the main app, with `Today` functioning as the primary home screen.

### 3. Product-Aligned Main Navigation

The main app navigation should reflect the actual product structure rather than generic starter naming.

The user-facing primary destinations for MVP are:

- `Today`
- `Journal`
- `Insights`

### 4. Dedicated Settings Destination

Settings should be a separate full-screen page, not a primary tab and not a transient modal.

Users should be able to access it from the main app in a way that feels natural from the `Today` experience.

### 5. Entry Detail Destination

The shell must make room for a dedicated destination that can show the details of a specific completed day from Journal.

### 6. No Starter Surface Leakage

Starter routes, placeholder labels, or demo screens should not remain part of the user-facing product flow once this epic is complete.

## Product Constraints

- The `Today` screen is the main daily home of the app
- The app must support both first-run and returning-user entry paths
- Settings is a full-screen page
- Journal and Insights are primary surfaces in MVP
- Older completed days should be reachable from Journal through a dedicated detail destination

## Current Repository Context

As of this document, the repository contains starter-style screens and tabs. This epic should treat those as scaffolding rather than as part of the product definition.

The outcome should be a navigation structure that matches the product vocabulary in `PRODUCT_SPEC.md`.

## Cross-Epic Dependencies

This epic depends on the app being able to determine onboarding state, whether through real persistence or temporary mocks.

This epic unlocks clean validation for:

- onboarding flow work
- daily check-in work
- Journal work
- Insights work
- Settings work

## Isolation Guidance

This epic can be completed in isolation using placeholder screen content and mocked state if necessary.

A developer working on this epic does not need the final versions of:

- question selection
- scoring
- persistence internals
- charting

The routing and navigation outcomes should still be correct even if the screen bodies are incomplete.

## Acceptance Criteria

1. A brand-new user is directed into onboarding rather than the main product tabs.
2. An onboarded user lands in the main product flow with `Today` as the default home surface.
3. The app exposes primary product navigation for `Today`, `Journal`, and `Insights`.
4. `Settings` is available as a separate full-screen page rather than a main tab or temporary modal.
5. The app provides a route or destination capable of showing details for an individual completed journal entry.
6. Starter/demo route names and demo-first navigation labels are no longer part of the user-facing product shell.
7. Loading or initialization states do not flash the wrong destination before redirecting the user.

## Validation Notes

The person completing this epic should be able to demonstrate at least the following:

- app launch for a brand-new user
- app launch for an onboarded user
- access to `Today`, `Journal`, and `Insights`
- access to `Settings` from the main app
- navigation from Journal into a day detail destination

## Definition of Done

This epic is done when the app's outer structure matches the product's information architecture and users are always routed into the correct top-level flow.
