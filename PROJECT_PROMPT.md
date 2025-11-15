# Project Prompt: Daily Personality Tracker

Build a web application where users answer 3 questions daily to track their personality over time, based on the 16 personalities (MBTI) framework.

## Tech Stack
- **Framework**: SvelteKit 2 with Svelte 5
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **UI**: Bits UI (headless components) + Tailwind CSS
- **Styling**: Custom playful, game-like design
- **Icons**: Tabler Icons (Svelte package)
- **Charts**: LayerChart
- **PWA**: vite-pwa
- **Deployment**: Dokploy
- **Architecture**: Use Svelte remote functions (no load functions or form actions)

## Core Requirements

### Personality Model
- 4 dimensions: E/I, S/N, T/F, J/P = 16 possible personality types
- Personality type calculated from rolling 7-day window of responses
- All days in the 7-day window weighted equally

### Daily Quiz Flow
- **New users**: 10 questions on first day (onboarding assessment)
- **Returning users**: 3 questions per day
- **Answer format**: Swipe interface (like dating apps)
  - Swipe right = Agree
  - Swipe left = Disagree
  - Should feel quick, casual, and effortless (not like taking a test)
  - Mobile-friendly touch gestures, also works with click/drag on desktop
- Question selection: Pick from the 3 dimensions with least recent data to keep coverage even
- "Today" defined by server timezone (not user's local time)

### Streak System
- Track consecutive days of quiz completion
- Display current streak and longest streak
- Missing a day breaks the streak (no make-up questions)
- Visual celebrations at milestones (7, 30, 60 days, etc.)

### Personality Display
- Show current 4-letter type (e.g., INFJ)
- Display full personality type name
- Show short description
- Display percentage breakdown for each dimension (e.g., 65% I / 35% E)
- Link to corresponding 16personalities.com page for detailed info
- Indicate when type changes from previous week

### Historical Data (Phase 2)
- Charts showing each dimension's score over time
- Week-by-week historical personality types
- Date range selector for viewing past data

### User Features
- Authentication via Better Auth (email/password, social logins)
- Dashboard showing:
  - Current personality type
  - Current streak
  - Total days participated
  - Quick access to today's questions

## MVP Scope

**Include:**
- Auth & user accounts
- Daily 3-question quiz with swipe interface (10 for onboarding)
- Streak tracking
- Current personality type display with percentages
- Basic dashboard
- Question rotation algorithm
- PWA functionality (installable, offline support for basic features)

**Exclude (Phase 2):**
- Historical charts
- Email/push notifications
- Social features
- Advanced analytics

## Design Notes
- Mobile-first PWA with web support
- Playful, game-like aesthetic with custom styling (not default component themes)
- Use Bits UI for headless component primitives, style completely custom
- Smooth swipe gestures optimized for mobile
- Simple, frictionless quiz experience (should feel like a game, not a test)
- Delightful animations for streak celebrations and type changes
- Clean data visualization for personality breakdown
- Fast, app-like experience on mobile devices
- Vibrant colors, rounded corners, fun micro-interactions

## Additional Context
- Questions will be generated separately (not part of initial build)
- Each question targets one dimension and has a direction (positive/negative) indicating which end of the spectrum agreement represents
- Server timezone determines daily reset time (like games with daily resets)
- Use Svelte remote functions for all server interactions (components directly import and call server functions)
