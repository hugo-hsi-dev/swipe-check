# Epic 08: Settings and Local Data Controls

This document defines the MVP settings experience for Swipe Check. It is derived from `PRODUCT_SPEC.md` in the project root.

This epic is intentionally limited to the controls already included in MVP. It does not prescribe how the page is laid out or how confirmation interactions are implemented, only what user-visible outcomes must exist.

## Project Context

Swipe Check includes a dedicated full-screen `Settings` page in MVP.

The purpose of Settings in MVP is operational, not expansive. It exists so the user can:

- view basic app information
- clear local app data entirely

The product explicitly keeps reminders, cloud sync, and account management out of MVP.

## Epic Goal

Provide a dedicated, trustworthy settings area where users can access app information and safely perform the limited local-data actions supported in MVP.

At the end of this epic, a user should be able to open Settings from the main app, understand what controls are available, and perform the destructive local-data action without being left in a confusing or contradictory state.

## Why This Epic Matters

Even a small MVP needs a place for app-level controls.

Without Settings:

- local-data controls are hidden or unavailable
- local data cannot be safely cleared
- testing and QA flows become harder
- the product has no obvious place for future non-core controls

This epic also establishes the boundary between the current MVP and future features such as reminders and Supabase sync.

## In Scope

- A dedicated full-screen `Settings` page
- Access to Settings from the main app
- Basic app information, including version or equivalent app identity information
- A user-facing action to clear all local data
- Confirmation or other explicit user intent handling for destructive actions
- Coherent post-action app state after clear-data operations

## Out of Scope

- Local reminders
- Notification permissions
- Account creation or sign-in
- Supabase or cloud sync controls
- Theme customization
- Notes, export, or social settings

## Required Outcomes

### 1. Dedicated Full-Screen Settings Experience

Settings must be its own full-screen destination rather than a modal or primary tab.

It should feel like a deliberate app-level destination rather than an incidental overlay.

### 2. Basic App Information

The user should be able to see basic app-level information such as version or equivalent identifying details.

This helps both real users and QA flows understand what build they are using.

### 3. Clear Local Data Action

The app must provide a full local wipe action that returns the app to a fresh-install state.

After this action, the user should experience the app as though it has no existing local history.

### 4. Safe Destructive Flows

Clear local data is a destructive action.

The app must require explicit user intent before carrying it out.

## Product Constraints

- Settings is part of MVP
- Settings is a full-screen page
- Local reminders are post-MVP and must not appear as shipped MVP commitments
- The app must remain coherent after clear-data actions
- Clear local data must return the app to first-launch behavior

## UX Expectations

Settings should feel calm and trustworthy.

The page should make it easy for the user to understand:

- what the action does
- whether it is reversible
- what state the app will be in afterward

The destructive action should never feel accidental.

## Edge Cases To Handle

- Clear local data from any current app state
- Returning to the app immediately after a destructive action

The user must never see contradictory state after clearing data. Once the wipe completes, the app should behave like a fresh install.

## Cross-Epic Dependencies

This epic depends on:

- Epic 02 for persistent data clear capabilities
- Epic 03 for routing to Settings from the main app

This epic is intentionally light on dependencies from the feature surfaces. It can be developed and validated independently once the necessary data actions exist.

## Isolation Guidance

This epic can be completed largely in isolation from Journal and Insights.

The main requirement is that the settings surface can trigger the correct product-level state transitions and that those transitions are reflected clearly when the user returns to the app.

## Acceptance Criteria

1. The app provides a separate full-screen `Settings` destination reachable from the main product flow.
2. Settings shows basic app information such as version or equivalent identifying details.
3. Settings provides a clear local data action.
4. After clearing local data, the app behaves like a fresh install with no prior local history.
5. Destructive actions require explicit user intent before they are executed.
6. The MVP Settings page does not expose post-MVP features such as reminders, sync, or account management as if they were already supported.

## Validation Notes

The person completing this epic should be able to demonstrate at least the following:

- opening Settings from the main app
- viewing app information
- triggering clear local data and observing the resulting first-launch state
- confirmation behavior before destructive actions complete

## Definition of Done

This epic is done when the app has a dedicated settings surface that safely exposes the limited local controls required for MVP and leaves the app in a coherent state after clear local data is used.
