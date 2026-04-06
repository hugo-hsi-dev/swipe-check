# Epic 09: Screen Hierarchy and Navigation Refresh

This document defines the front-facing screen organization for Swipe Check. It updates how the app presents the daily habit flow, history, insights, and app-level metadata so the primary action feels obvious and secondary surfaces stay out of the way.

## Project Context

Swipe Check is a daily habit app first. The product needs to make the daily check-in feel like the most important thing the user can do, while still keeping the rest of the app easy to find.

The current route structure contains several surfaces:

- `Today` for the daily habit dashboard and check-in entry point
- `Insights` for current type and trend visualization
- `Journal` for historical review
- `Settings` for version/app information and local data controls
- `Session` and `Onboarding` for full-screen flows

The problem is not that the app lacks destinations. The problem is that the hierarchy does not clearly communicate priority. Settings is too visually prominent on Today, Journal is too exposed for a secondary surface, and the app still needs a dedicated place for lower-priority meta information.

This epic introduces a `More` tab as the home for secondary navigation and app metadata.

## Epic Goal

Deliver a cleaner, habit-first app hierarchy where:

- `Today` is the primary daily action surface
- `Insights` remains a top-level destination
- `More` becomes the home for secondary app information and utility links
- `Journal` and `Settings` are reachable, but no longer compete with the primary flow

At the end of this epic, a user should be able to open the app and immediately understand what to do now, where to see patterns, and where to find everything else.

## Why This Epic Matters

The app should feel intentional, not crowded.

Without a clearer hierarchy:

- the daily check-in competes with app management concerns
- users have to hunt for secondary destinations
- Today becomes a dumping ground for unrelated actions
- future utility features have no obvious home

This epic creates room for future metadata and utility items without bloating the primary experience.

## In Scope

- Reworking the primary tab set so the app surface is centered on habit use
- Keeping `Today` focused on the status summary first and the daily check-in CTA second
- Keeping `Insights` as a prominent destination
- Adding a `More` tab for app/version/meta information
- Moving `Journal` behind `More`
- Moving `Settings` behind `More`
- Keeping the settings experience minimal rather than making it a full settings hub
- Preserving routing to `Session` and `Journal/[id]`
- Leaving room for future secondary items such as export and local data reset

## Out of Scope

- Implementing data export
- Implementing new local data reset flows inside More
- Rebuilding the daily session logic itself
- Rewriting the core scoring model
- Turning More into a full configuration center
- Renaming the app’s existing core concepts such as Today, Journal, Insights, or Settings

## Required Outcomes

### 1. Habit-First App Entry

The app should present `Today` as the most important destination.

The user should see their current state before they are asked to act, so the screen feels informative and intentional rather than top-heavy with a CTA.

### 2. Secondary Surfaces Are Still Reachable

`Journal` and `Settings` should not disappear.

They should move into a secondary navigation space, where users can still find them without the app making them look as important as the daily check-in flow.

### 3. More Becomes the Utility Hub

`More` should be the home for non-core app information.

At minimum, it should support:

- app version or equivalent metadata
- access to Journal
- access to Settings
- space for future utility actions

### 4. Minimal Settings Presence

Settings should remain available, but it should stay lightweight.

The app should not imply that Settings is a major destination or a place with many active controls in MVP.

### 5. Existing Core Flows Keep Working

The navigation update must not break:

- onboarding entry
- launch-time routing
- session flow entry and completion
- journal entry detail routes

## Product Constraints

- The daily check-in remains the primary action
- `Insights` stays prominent at the top level
- `More` should not feel like a settings dump
- `Journal` should be discoverable but not promoted above the main habit surface
- `Settings` should stay accessible but visually de-emphasized
- Future export and local-data reset work belongs in `More`, but not necessarily in this epic
- Keep the existing core labels: `Today`, `Journal`, `Insights`, `Settings`, and `More`

## UX Expectations

The revised hierarchy should feel like this:

- `Today` = what should I do now?
- `Insights` = what does it mean?
- `More` = everything else

The user should not have to guess where to go for core activity versus app-level information.

## Edge Cases To Handle

- First launch before onboarding is complete
- Returning users landing on the tab shell
- Users with no journal history yet
- Users opening Journal directly by deep route
- Users returning to the app after a settings/data action
- Users on older sessions or partially completed flows

## Cross-Epic Dependencies

This epic depends on the existing screen and data surfaces already present in the repo:

- the onboarding and launch routing logic
- the daily session flow
- the journal data/history views
- the current settings data controls

It complements those surfaces by reorganizing how users reach them.

## Isolation Guidance

This epic can be implemented in staged passes:

1. update the navigation shell
2. refocus Today
3. add the More tab and secondary links
4. validate the new screen hierarchy end to end

The route and tab changes should be kept as small and localized as possible so the app remains stable while the hierarchy is reshaped.

## Acceptance Criteria

1. The primary tab bar reflects the new hierarchy with `Today`, `Insights`, and `More`.
2. `Today` prioritizes the status summary before the check-in CTA.
3. `More` shows app metadata and exposes `Journal` and `Settings`.
4. `Journal` is no longer a primary tab.
5. `Settings` is no longer a primary tab and remains lightweight.
6. The app still supports onboarding, session, and journal detail navigation.
7. Future data export and reset work has a clear home in `More`.

## Validation Notes

The person completing this epic should be able to demonstrate at least the following:

- the tab bar shows the new top-level hierarchy
- Today opens with summary-first content
- More contains app metadata and links to secondary surfaces
- Journal and Settings are reachable from More
- direct route access to existing screens still works

## Definition of Done

This epic is done when the app’s navigation and screen hierarchy clearly communicate that the daily habit flow is primary, Insights is a first-class destination, and everything else lives behind More without feeling lost.