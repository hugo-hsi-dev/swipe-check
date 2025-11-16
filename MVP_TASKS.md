# MVP Task List - Daily Personality Tracker

This document outlines all tasks required to reach MVP. Each task is issue-sized and includes detailed implementation steps.

---

## Current Project Status

### ✅ Already Completed
- **SvelteKit 2 with Svelte 5** - Fully configured and working
- **Drizzle ORM** - Set up with PostgreSQL connection
- **Database Connection** - PostgreSQL configured with connection pooling
- **TypeScript** - Full setup with proper configuration
- **Remote Functions** - Enabled and configured in `svelte.config.js`
- **Example Schema** - Users and todos tables (demo/template)

### 🔄 Partially Complete
- **Database Schema** - Has example users/todos tables, needs MVP-specific tables (questions, responses, user_stats, personality_snapshots)

### ❌ Not Yet Started (MVP Requirements)
- Tailwind CSS v4 (can use `npx sv add tailwindcss`)
- Prettier (can use `npx sv add prettier`)
- ESLint (can use `npx sv add eslint`)
- Schema validation library (Zod or Valibot)
- Bits UI, Tabler Icons, LayerChart
- vite-plugin-pwa
- Better Auth
- All personality tracker features (quiz, streaks, personality calculation, etc.)

**Note:** Tailwind CSS v4 uses CSS-first configuration with the `@theme` directive instead of `tailwind.config.js`

### 📦 Available SvelteKit CLI Commands
The `sv` CLI provides quick setup for common dependencies:
- `npx sv add tailwindcss` - Adds Tailwind v4 with Vite plugin (CSS-first config)
- `npx sv add prettier` - Adds and configures Prettier for Svelte
- `npx sv add eslint` - Adds and configures ESLint for Svelte 5
- `npx sv add vitest` - Adds Vitest for testing (optional)
- `npx sv add playwright` - Adds Playwright for E2E testing (optional)

---

## Phase 1: Foundation & Setup

### Task 1: Project Dependencies & Configuration
**Priority:** P0 (Critical)
**Estimated Time:** 2-3 hours

#### Implementation Steps
- [ ] Install and configure Tailwind CSS v4
  - Run `npx sv add tailwindcss` (installs Tailwind v4 with Vite plugin)
  - Configure custom theme in your main CSS file using `@theme` directive
  - Define vibrant, playful color palette (e.g., sunset-orange, purple, etc.)
  - Add custom spacing/animations for game-like design
  - Example CSS configuration:
    ```css
    @import "tailwindcss";

    @theme {
      --color-primary: oklch(68% 0.1 250);
      --color-secondary: oklch(75% 0.15 350);
      --color-accent: oklch(80% 0.2 50);
      /* Add more custom colors and design tokens */
    }
    ```
  - Note: v4 uses CSS-first config, no `tailwind.config.js` needed
- [ ] Set up development tooling with SvelteKit CLI
  - Run `npx sv add prettier` (auto-configures for Svelte)
  - Run `npx sv add eslint` (auto-configures for Svelte 5)
  - Review and customize `.prettierrc` and `.eslintrc` if needed
- [ ] Install schema validation library
  - Run `pnpm add zod` (recommended) OR `pnpm add valibot` (lighter alternative)
  - Required for validating remote function inputs (form and command functions)
  - See REMOTE_FUNCTIONS.md for usage examples
- [ ] Install UI dependencies
  - Run `pnpm add bits-ui` for headless component primitives
  - Run `pnpm add @tabler/icons-svelte` for icon library
  - Run `pnpm add layerchart` for data visualization
- [ ] Install PWA dependencies
  - Run `pnpm add -D vite-plugin-pwa`
  - Configure in `vite.config.ts`
  - Set up service worker configuration
  - Create `public/manifest.json` with app metadata
- [ ] Configure TypeScript paths (if needed)
  - Update `tsconfig.json` with additional path aliases
  - Configure stricter TypeScript options
- [ ] Add VS Code workspace settings (optional)
  - Create `.vscode/settings.json` for team consistency
  - Configure format-on-save, recommended extensions

#### Acceptance Criteria
- All dependencies installed without conflicts
- Tailwind CSS compiles with custom theme
- TypeScript compilation works without errors
- Development server starts successfully

#### Technical Notes
- Use pnpm for package management
- Tailwind v4 uses CSS-first configuration (@theme directive) instead of tailwind.config.js
- Use OKLCH color format for vibrant, accessible colors
- **Schema Validation:** Zod is recommended (shown in REMOTE_FUNCTIONS.md), Valibot is a lighter alternative
  - Required for all form and command remote functions
  - Validates user inputs before processing
  - Provides type safety and runtime validation
- Document custom design tokens and utility patterns in CLAUDE.md
- Ensure all packages are compatible with Svelte 5
- Tailwind v4 requires modern browsers (Safari 16.4+, Chrome 111+, Firefox 128+)

---

### Task 2: Database Schema & Migrations
**Priority:** P0 (Critical)
**Estimated Time:** 3-4 hours
**Status:** 🔄 Partially Complete (Drizzle setup done, needs MVP-specific tables)

#### Implementation Steps
- [ ] Note: User table will come from Better Auth (Task 3)
  - Better Auth generates the user table automatically
  - Can extend with custom fields if needed in Task 3
  - Remove the existing example users table from schema.ts
- [ ] Create `questions` table schema
  - id (UUID primary key)
  - text (question content)
  - targetDimension (enum: 'E', 'I', 'S', 'N', 'T', 'F', 'J', 'P')
    - Directly indicates which dimension an "agree" response supports
    - Example: targetDimension='E' means agreeing indicates Extraversion
    - Example: targetDimension='I' means agreeing indicates Introversion
  - createdAt timestamp
- [ ] Create `responses` table schema
  - id (UUID primary key)
  - userId (foreign key to Better Auth's user table)
  - questionId (foreign key to questions)
  - answer (boolean: true=agree, false=disagree)
  - respondedAt (date, indexed)
  - createdAt timestamp
  - Composite unique index on (userId, questionId, respondedAt)
- [ ] Create `user_stats` table schema
  - userId (UUID primary key, foreign key to Better Auth's user table)
  - currentStreak (integer, default 0)
  - longestStreak (integer, default 0)
  - totalDaysCompleted (integer, default 0)
  - lastCompletedDate (date, nullable)
  - hasCompletedOnboarding (boolean, default false)
  - updatedAt timestamp
- [ ] Create `personality_snapshots` table schema (optional, for historical tracking)
  - id (UUID primary key)
  - userId (foreign key to Better Auth's user table)
  - personalityType (varchar(4), e.g., 'INFJ')
  - dimensionScores (JSONB with E/I/S/N/T/F/J/P percentages)
  - calculatedAt (date, indexed)
  - windowStart, windowEnd dates
- [ ] Generate migration files
  - Run `pnpm db:generate`
  - Review generated SQL
- [ ] Test migrations
  - Run `pnpm db:push` on development database
  - Verify tables created correctly with proper indexes
  - Test foreign key constraints

#### Acceptance Criteria
- All tables created with proper schema
- Indexes are in place for performance
- Foreign keys enforce referential integrity
- Migrations run successfully
- Drizzle Studio can visualize schema

#### Technical Notes
- Drizzle ORM is already configured with PostgreSQL ✓
- **IMPORTANT:** Keep app schemas separate from Better Auth schemas
  - App schemas go in `/src/lib/server/db/schema.ts`
  - Better Auth schemas will be in `/src/lib/server/db/auth-schema.ts` (Task 3)
  - This prevents Better Auth from overwriting app schemas when regenerating
- **User Table:**
  - Better Auth will generate the user table (Task 3)
  - Remove the existing example users/todos tables from schema.ts
  - All app tables reference Better Auth's user table via foreign keys
  - No need for a separate user table in app schema
- Use UUID for all primary keys (existing schema already does this)
- Add proper indexes on frequently queried fields
- Use timestamps for all created/updated tracking
- Consider server timezone for date fields
- Can test schema changes with `pnpm db:studio` to visualize in Drizzle Studio

---

### Task 3: Authentication System with Better Auth
**Priority:** P0 (Critical)
**Estimated Time:** 4-5 hours

#### Implementation Steps
- [ ] Install Better Auth
  - Add `better-auth` package
  - Add required peer dependencies
- [ ] Configure Better Auth server
  - Create `/src/lib/server/auth/index.ts`
  - Configure database adapter for Drizzle
  - Set up email/password authentication
  - Configure session management
  - Add social OAuth providers (optional for MVP)
- [ ] Generate Better Auth schema (separate from app schema)
  - Run `npx @better-auth/cli generate --output ./src/lib/server/db/auth-schema.ts`
  - This creates Better Auth tables (including user table) in a separate file to avoid conflicts
  - **This is the only user table** - all app tables will reference Better Auth's user table
  - Can extend the user table with custom fields if needed (add directly to auth-schema.ts)
  - Update `drizzle.config.ts` to include both schema files:
    ```typescript
    schema: ['./src/lib/server/db/schema.ts', './src/lib/server/db/auth-schema.ts']
    ```
  - Update `/src/lib/server/db/index.ts` to import both schemas:
    ```typescript
    import * as schema from './schema';
    import * as authSchema from './auth-schema';

    export const db = drizzle(client, {
      schema: { ...schema, ...authSchema }
    });
    ```
  - Run `pnpm db:generate` to generate migration files
  - Run `pnpm db:migrate` or `pnpm db:push` to apply migrations
- [ ] Create authentication remote functions
  - Create `/src/routes/auth.remote.ts`
  - Define validation schemas using Zod for auth forms
  - Implement `signUp` form function with email/password validation
  - Implement `signIn` form function with input validation
  - Implement `signOut` command function
  - Implement `getSession` query function
  - Ensure all form/command functions validate inputs before processing
- [ ] Create auth UI components
  - Create `/src/lib/components/auth/LoginForm.svelte`
  - Create `/src/lib/components/auth/SignUpForm.svelte`
  - Style with Tailwind (playful, game-like design)
  - Add form validation
  - Add error handling and user feedback
- [ ] Create auth pages
  - Create `/src/routes/login/+page.svelte`
  - Create `/src/routes/signup/+page.svelte`
  - Add redirect logic after successful auth
- [ ] Implement auth middleware
  - Create session store for client-side state
  - Add protected route guards
  - Handle unauthorized access redirects
- [ ] Test authentication flow
  - Test user registration
  - Test login/logout
  - Test session persistence
  - Test protected routes

#### Acceptance Criteria
- Users can register with email/password
- Users can log in and out
- Sessions persist across page refreshes
- Protected routes redirect to login
- Auth state is accessible throughout app
- Forms have proper validation and error messages

#### Technical Notes
- **IMPORTANT:** Keep Better Auth schema in separate file (`auth-schema.ts`)
  - Better Auth regenerates its schema file, which would delete app schemas if mixed
  - Use `--output` flag when running `npx @better-auth/cli generate`
  - Update `drizzle.config.ts` to include both schema files
  - Spread both schemas when initializing the db instance
- **User Table:** Better Auth's user table is the ONLY user table
  - All foreign keys in app tables reference Better Auth's user table
  - No separate user table in schema.ts
  - Can extend Better Auth's user table with custom fields if needed
  - Remove the existing example users table from schema.ts (Task 2)
- **Input Validation:** Use Zod to validate all auth form inputs
  - Email format validation
  - Password strength requirements
  - Sanitize inputs before processing
  - Return clear validation error messages to UI
- Store session token securely
- Use HTTP-only cookies for session
- Implement CSRF protection
- Follow Better Auth best practices
- Consider rate limiting for auth endpoints

---

## Phase 2: Core Data & Logic

### Task 4: Question Bank & MBTI Framework
**Priority:** P0 (Critical)
**Estimated Time:** 3-4 hours

#### Implementation Steps
- [ ] Research and compile MBTI questions
  - Research validated MBTI question sets
  - Ensure even distribution across all 8 dimensions (E, I, S, N, T, F, J, P)
  - Aim for 60-100 questions minimum for variety (roughly 7-12 per dimension)
- [ ] Create question seed data
  - Create `/src/lib/server/db/seeds/questions.ts`
  - Format questions with targetDimension (E, I, S, N, T, F, J, or P)
  - Ensure even distribution across all 8 dimensions
  - Validate question quality and clarity
- [ ] Create seed script
  - Create database seeding script
  - Add npm script: `pnpm db:seed`
  - Implement idempotent seeding (don't duplicate)
- [ ] Create question remote functions
  - Create `/src/routes/quiz.remote.ts`
  - Implement `getQuestions` query function for fetching daily questions
  - Implement `submitAnswer` form/command function with Zod validation
    - Validate questionId, answer (boolean), and userId
    - Store response in database with proper timestamp
  - Implement question selection algorithm
  - Ensure even coverage of dimensions
- [ ] Implement question rotation logic
  - Track which dimensions have least recent data
  - Select questions from under-represented dimensions
  - Randomize within selected dimensions
  - Exclude recently answered questions
- [ ] Test question selection
  - Verify even distribution over time
  - Test edge cases (new users, all dimensions covered)
  - Ensure no duplicate questions in same session

#### Acceptance Criteria
- Question bank has 60-100 quality questions
- Questions evenly distributed across all 8 dimensions (E, I, S, N, T, F, J, P)
- Seed script populates database successfully
- Question selection algorithm works correctly
- No duplicate questions in daily quiz

#### Technical Notes
- Store questions in database, not hardcoded
- **MBTI Dimension Mapping:**
  - 4 dimension pairs: E/I (Extraversion/Introversion), S/N (Sensing/Intuition), T/F (Thinking/Feeling), J/P (Judging/Perceiving)
  - Each question targets one of 8 dimensions directly (E, I, S, N, T, F, J, P)
  - Agreeing with a question counts toward its targetDimension
  - Disagreeing counts toward the opposite dimension in the pair
- Ensure roughly equal number of questions for each of the 8 dimensions
- Consider question difficulty/clarity
- Plan for future question additions

---

### Task 5: Personality Calculation Engine
**Priority:** P0 (Critical)
**Estimated Time:** 4-5 hours

#### Implementation Steps
- [ ] Design personality calculation algorithm
  - Define 7-day rolling window logic
  - Equal weighting for all days in window
  - Handle partial data (fewer than 7 days)
- [ ] Create personality calculation utilities
  - Create `/src/lib/server/personality/calculator.ts`
  - Implement `calculatePersonalityType` function
  - Implement `getDimensionScores` function
  - Implement `getPersonalityDescription` function
- [ ] Map MBTI types to 16personalities.com
  - Create personality type metadata
  - Store type names, descriptions, URLs
  - Create `/src/lib/personality/types.ts`
- [ ] Create personality remote functions
  - Create `/src/routes/personality.remote.ts`
  - Implement `getCurrentPersonality` query function
  - Implement `getPersonalityHistory` query function (Phase 2)
- [ ] Implement dimension score calculation
  - Query responses from last 7 days with their question's targetDimension
  - Calculate percentage for each dimension pair (E/I, S/N, T/F, J/P)
  - For each response: if answer=agree, count toward targetDimension; if disagree, count toward opposite
  - Example: Question with targetDimension='E', answer=agree → +1 to E
  - Example: Question with targetDimension='E', answer=disagree → +1 to I
  - Handle edge cases (no responses, all one side)
- [ ] Create personality change detection
  - Compare current type to previous calculation
  - Flag when type changes
  - Store change notification for UI
- [ ] Test calculation accuracy
  - Create test cases with known outcomes
  - Test edge cases (new users, incomplete data)
  - Verify percentages add to 100%

#### Acceptance Criteria
- Personality type calculated correctly from 7-day window
- All dimension scores are accurate percentages
- Type changes are detected properly
- Works with incomplete data (<7 days)
- Links to correct 16personalities.com pages

#### Technical Notes
- Cache calculation results to avoid recomputation
- Update calculations after each quiz completion
- Consider timezone issues with "day" boundaries
- Document calculation formula clearly

---

### Task 6: Streak Tracking System
**Priority:** P0 (Critical)
**Estimated Time:** 3-4 hours

#### Implementation Steps
- [ ] Design streak logic
  - Define "day complete" criteria (all questions answered)
  - Use server timezone for daily reset
  - Define streak break conditions
- [ ] Create streak utilities
  - Create `/src/lib/server/streak/tracker.ts`
  - Implement `updateStreak` function
  - Implement `checkStreakBreak` function
  - Implement `getStreakMilestone` function
- [ ] Implement streak update logic
  - Update streak on quiz completion
  - Check for consecutive days
  - Update `user_stats` table
  - Handle midnight/day boundary logic
- [ ] Create streak remote functions
  - Update `quiz.remote.ts` with streak updates
  - Implement `getStreakInfo` query function
  - Return current streak, longest streak, total days
- [ ] Define milestone celebrations
  - Create milestone thresholds (7, 30, 60, 100, etc.)
  - Design celebration data structure
  - Plan for UI celebration triggers
- [ ] Implement streak recovery checks
  - Check if user missed a day on login
  - Break streak if necessary
  - Provide feedback about streak status
- [ ] Test streak logic
  - Test consecutive day completions
  - Test streak breaks
  - Test milestone detection
  - Test timezone edge cases

#### Acceptance Criteria
- Streaks increment on consecutive days
- Streaks reset when day is missed
- Longest streak is preserved
- Total days completed tracks accurately
- Milestones are detected correctly
- Server timezone is used consistently

#### Technical Notes
- Use server time, not client time
- Consider user traveling across timezones
- Atomic updates to prevent race conditions
- Document timezone assumptions clearly

---

## Phase 3: User Interface

### Task 7: Swipe Quiz Interface
**Priority:** P0 (Critical)
**Estimated Time:** 6-8 hours

#### Implementation Steps
- [ ] Create swipe component foundation
  - Create `/src/lib/components/quiz/SwipeCard.svelte`
  - Implement touch event handlers
  - Implement mouse drag handlers (desktop)
  - Add gesture detection logic
- [ ] Implement swipe animations
  - Add CSS transforms for card movement
  - Add rotation on swipe
  - Add smooth transitions
  - Add "agree/disagree" indicators
- [ ] Create quiz container component
  - Create `/src/lib/components/quiz/QuizContainer.svelte`
  - Manage question queue
  - Handle answer submission
  - Show progress indicator
- [ ] Implement answer submission
  - Call `submitAnswer` remote function on swipe complete
  - Remote function validates inputs and stores answer in database
  - Update UI optimistically
  - Handle validation errors and display to user
  - Handle network errors gracefully
- [ ] Create question card UI
  - Design playful, card-based layout
  - Add visual feedback (swipe direction hints)
  - Add vibrant colors and rounded corners
  - Make text large and readable
- [ ] Add progress indicators
  - Show current question number (e.g., "2/3")
  - Add visual progress bar
  - Show completion celebration
- [ ] Implement quiz completion flow
  - Detect when all questions answered
  - Show completion message
  - Update streak immediately
  - Show personality update if changed
- [ ] Create quiz page
  - Create `/src/routes/quiz/+page.svelte`
  - Load daily questions
  - Handle already-completed state
  - Redirect to dashboard when done
- [ ] Add mobile optimizations
  - Optimize touch sensitivity
  - Add haptic feedback (if available)
  - Ensure smooth 60fps animations
  - Test on various screen sizes
- [ ] Test swipe interactions
  - Test on mobile devices
  - Test on desktop with mouse
  - Test edge cases (rapid swipes, cancels)
  - Test accessibility with keyboard

#### Acceptance Criteria
- Swipe gestures feel smooth and responsive
- Works on both touch and mouse input
- Visual feedback is clear and delightful
- Questions save correctly on swipe
- Progress is visible throughout quiz
- Completion triggers streak update
- Mobile performance is excellent

#### Technical Notes
- Use CSS transforms for performance
- Debounce rapid swipe attempts
- Consider reduced motion preferences
- Make keyboard accessible (arrow keys)
- Add loading states for network requests

---

### Task 8: Dashboard & Personality Display
**Priority:** P0 (Critical)
**Estimated Time:** 5-6 hours

#### Implementation Steps
- [ ] Create dashboard layout
  - Create `/src/routes/dashboard/+page.svelte`
  - Design card-based layout
  - Make responsive (mobile-first)
  - Add navigation to quiz
- [ ] Create personality display component
  - Create `/src/lib/components/personality/PersonalityCard.svelte`
  - Show 4-letter type (large, prominent)
  - Show full type name
  - Show short description
  - Link to 16personalities.com
- [ ] Create dimension breakdown component
  - Create `/src/lib/components/personality/DimensionBreakdown.svelte`
  - Show all 4 dimensions with percentages
  - Use progress bars or visual indicators
  - Use LayerChart for visualization
  - Make data engaging and clear
- [ ] Create streak display component
  - Create `/src/lib/components/streak/StreakCard.svelte`
  - Show current streak (prominent)
  - Show longest streak
  - Show total days participated
  - Add streak fire/celebration icons
- [ ] Implement type change indicator
  - Show badge/notification when type changed
  - Highlight what changed
  - Add celebratory animation
  - Make dismissible
- [ ] Create quick action area
  - Add "Take Today's Quiz" button
  - Show quiz completion status
  - Disable if already completed
  - Show time until next quiz (countdown)
- [ ] Add data loading states
  - Show skeletons while loading
  - Handle loading errors
  - Add retry mechanisms
  - Optimize load performance
- [ ] Style with game-like design
  - Use vibrant colors from Tailwind config
  - Add rounded corners everywhere
  - Add subtle shadows and depth
  - Include micro-interactions
- [ ] Test dashboard functionality
  - Test with different data states
  - Test on various screen sizes
  - Test loading and error states
  - Verify all links work

#### Acceptance Criteria
- Dashboard shows all key information clearly
- Personality type is prominent and accurate
- Dimension percentages are visualized well
- Streak information is engaging
- Quick access to daily quiz
- Type changes are celebrated
- Responsive on all devices
- Loading states are smooth

#### Technical Notes
- Cache personality calculations
- Use optimistic UI updates
- Preload quiz route for faster navigation
- Consider using LayerChart for beautiful visualizations
- Make data refresh automatic (polling or real-time)

---

### Task 9: Onboarding Flow
**Priority:** P0 (Critical)
**Estimated Time:** 4-5 hours

#### Implementation Steps
- [ ] Design onboarding experience
  - Plan 3-step flow: Welcome → First Quiz → Dashboard Tour
  - Keep it short and engaging
  - Emphasize playful, game-like nature
- [ ] Create welcome screen
  - Create `/src/routes/onboarding/+page.svelte`
  - Explain app concept briefly
  - Show example swipe interaction
  - Add "Get Started" CTA
- [ ] Create first quiz experience
  - Route new users to 10-question quiz
  - Add extra guidance for first swipe
  - Show encouraging messages
  - Celebrate first completion
- [ ] Create post-quiz explanation
  - Explain what personality type means
  - Show initial personality result
  - Explain 7-day rolling window
  - Explain daily 3-question format
- [ ] Add dashboard tour (optional)
  - Highlight key dashboard features
  - Show where to find quiz
  - Explain streak system
  - Make skippable
- [ ] Implement onboarding state management
  - Track onboarding completion in `user_stats`
  - Redirect logic based on state
  - Never show onboarding twice
- [ ] Create onboarding components
  - Create `/src/lib/components/onboarding/WelcomeCard.svelte`
  - Create `/src/lib/components/onboarding/ExplainerCard.svelte`
  - Use consistent playful design
  - Add illustrations/icons
- [ ] Test onboarding flow
  - Test with fresh account
  - Test skip/dismiss options
  - Test on mobile and desktop
  - Verify state persistence

#### Acceptance Criteria
- New users see onboarding once
- Onboarding is quick and engaging (<2 min)
- First quiz is 10 questions
- Users understand core concept after onboarding
- Onboarding never shows again after completion
- Can be skipped if desired

#### Technical Notes
- Make onboarding optional/skippable
- Store completion state server-side
- Use same swipe component as main quiz
- Keep copy concise and friendly
- Consider adding animated illustrations

---

## Phase 4: PWA & Polish

### Task 10: PWA Configuration
**Priority:** P1 (High)
**Estimated Time:** 3-4 hours

#### Implementation Steps
- [ ] Configure vite-plugin-pwa
  - Update `vite.config.ts` with PWA options
  - Set app name, description, theme color
  - Configure service worker strategy
  - Set up offline fallback
- [ ] Create app manifest
  - Define app icons (multiple sizes)
  - Set display mode to "standalone"
  - Configure start URL
  - Set orientation preferences
  - Add shortcuts (quick actions)
- [ ] Design and generate app icons
  - Create base icon design (512x512)
  - Generate all required sizes
  - Add maskable icon variant
  - Include favicon set
- [ ] Configure service worker
  - Set up runtime caching strategies
  - Cache static assets
  - Cache API responses (stale-while-revalidate)
  - Configure offline page
- [ ] Create offline experience
  - Create `/src/routes/offline/+page.svelte`
  - Show friendly offline message
  - Cache previously viewed data
  - Enable viewing cached personality data
- [ ] Add install prompt
  - Create install prompt component
  - Show on mobile when installable
  - Make dismissible
  - Track installation analytics
- [ ] Test PWA functionality
  - Test installation on Android/iOS
  - Test offline mode
  - Test service worker updates
  - Verify all icons display correctly
  - Test in standalone mode

#### Acceptance Criteria
- App is installable on mobile devices
- Works offline (at least for viewing data)
- Service worker caches effectively
- All PWA icons display correctly
- Lighthouse PWA score > 90
- Standalone mode works properly

#### Technical Notes
- Ensure HTTPS in production (PWA requirement)
- Test on real devices, not just browser DevTools
- Consider background sync for offline answers
- Plan for service worker updates
- Document PWA testing process

---

### Task 11: UI/UX Polish & Animations
**Priority:** P1 (High)
**Estimated Time:** 4-5 hours

#### Implementation Steps
- [ ] Create animation utilities
  - Create `/src/lib/utils/animations.ts`
  - Define standard transitions
  - Create keyframe animations
  - Set up animation presets
- [ ] Add page transitions
  - Smooth transitions between routes
  - Fade in/out effects
  - Slide transitions for quiz
  - Respect prefers-reduced-motion
- [ ] Implement streak celebration animations
  - Create confetti or particle effect
  - Trigger on milestone achievements
  - Add celebratory sound (optional)
  - Make skippable
- [ ] Add personality type change celebration
  - Special animation when type changes
  - Highlight new type
  - Compare old vs new
  - Make memorable and fun
- [ ] Create micro-interactions
  - Button hover/active states
  - Card hover effects
  - Loading spinners
  - Success/error feedback animations
- [ ] Add quiz completion celebration
  - Satisfying completion animation
  - Show streak update
  - Reveal personality (if changed)
  - Encourage return tomorrow
- [ ] Polish swipe interactions
  - Add spring physics to card return
  - Smooth rotation curves
  - Add swipe trail effect (optional)
  - Perfect timing and easing
- [ ] Create loading skeletons
  - Design skeleton screens for all major views
  - Animated shimmer effect
  - Match actual content layout
- [ ] Add haptic feedback (mobile)
  - Vibrate on swipe complete
  - Vibrate on milestone
  - Vibrate on errors
  - Make configurable
- [ ] Test animations
  - Ensure 60fps performance
  - Test on low-end devices
  - Test with reduced motion preference
  - Verify no animation jank

#### Acceptance Criteria
- All animations are smooth (60fps)
- Celebrations are delightful and engaging
- Reduced motion preference is respected
- No animation jank or performance issues
- Micro-interactions enhance usability
- Loading states are pleasant

#### Technical Notes
- Use CSS transforms and opacity for performance
- Avoid animating layout properties
- Use `will-change` sparingly
- Consider `prefers-reduced-motion` media query
- Test on older mobile devices

---

### Task 12: Responsive Design & Mobile Optimization
**Priority:** P1 (High)
**Estimated Time:** 3-4 hours

#### Implementation Steps
- [ ] Implement mobile-first layouts
  - Review all components for mobile usability
  - Use Tailwind responsive utilities
  - Test on small screens (320px+)
  - Ensure touch targets are 44px+
- [ ] Optimize for tablet sizes
  - Test on iPad/tablet viewports
  - Adjust layouts for medium screens
  - Ensure good use of space
- [ ] Optimize for desktop
  - Add max-width containers
  - Center content appropriately
  - Enhance with desktop-specific features
  - Support keyboard navigation
- [ ] Add responsive typography
  - Use fluid type scales
  - Ensure readability at all sizes
  - Adjust line heights for mobile
- [ ] Test touch interactions
  - Ensure swipe gestures are reliable
  - Test on various touch devices
  - Verify no accidental clicks
  - Test gesture conflicts
- [ ] Optimize for different orientations
  - Test portrait and landscape
  - Adjust layouts for landscape when needed
  - Lock orientation where appropriate
- [ ] Test on real devices
  - Test on iOS devices
  - Test on Android devices
  - Test on various screen sizes
  - Document device compatibility
- [ ] Optimize bundle size
  - Tree-shake unused code
  - Lazy load non-critical components
  - Optimize images
  - Review Lighthouse performance score
- [ ] Add responsive images
  - Use appropriate image sizes
  - Implement lazy loading
  - Use modern formats (WebP)
  - Add proper alt text

#### Acceptance Criteria
- Works perfectly on mobile (320px+)
- Tablet experience is optimized
- Desktop experience is polished
- Touch targets are appropriately sized
- No horizontal scroll on any screen size
- Lighthouse mobile score > 90

#### Technical Notes
- Use Tailwind's responsive prefixes (sm:, md:, lg:)
- Test on BrowserStack or real devices
- Consider mobile data constraints
- Optimize critical rendering path
- Use Chrome DevTools device mode

---

## Phase 5: Launch

### Task 13: Testing & Quality Assurance
**Priority:** P0 (Critical)
**Estimated Time:** 4-6 hours

#### Implementation Steps
- [ ] Create manual test plan
  - Document all user flows
  - Create test cases for each feature
  - Include edge cases and error scenarios
  - Assign test priority levels
- [ ] Test authentication flows
  - Sign up with valid/invalid data
  - Login with correct/incorrect credentials
  - Logout and session termination
  - Password requirements
  - Error message clarity
- [ ] Test quiz functionality
  - Complete full daily quiz
  - Test swipe gestures thoroughly
  - Test answer persistence
  - Test already-completed state
  - Test question rotation algorithm
- [ ] Test personality calculations
  - Verify accuracy with known inputs
  - Test with < 7 days of data
  - Test all 16 personality types can be achieved
  - Verify dimension percentages
  - Test type change detection
- [ ] Test streak system
  - Test consecutive day completions
  - Test streak breaks
  - Test milestone achievements
  - Test timezone edge cases
  - Verify longest streak preservation
- [ ] Test onboarding flow
  - Complete as new user
  - Verify 10-question first quiz
  - Test skip options
  - Verify never shows again
- [ ] Cross-browser testing
  - Test on Chrome
  - Test on Firefox
  - Test on Safari (iOS and macOS)
  - Test on Edge
  - Document any browser-specific issues
- [ ] Cross-device testing
  - Test on iOS (iPhone)
  - Test on Android phones
  - Test on tablets
  - Test on desktop
  - Test on various screen sizes
- [ ] Performance testing
  - Run Lighthouse audits
  - Test on slow 3G connection
  - Test on low-end devices
  - Measure Core Web Vitals
  - Optimize as needed
- [ ] Accessibility testing
  - Test keyboard navigation
  - Test screen reader compatibility
  - Verify color contrast ratios
  - Test with zoom/large text
  - Fix any WCAG violations
- [ ] Security testing
  - Test authentication security
  - Verify CSRF protection
  - Test for SQL injection vulnerabilities
  - Test XSS prevention
  - Review sensitive data handling
- [ ] Create bug tracking process
  - Document all found bugs
  - Prioritize and assign
  - Fix critical bugs before launch
  - Plan post-launch bug fixes

#### Acceptance Criteria
- All critical user flows work correctly
- No critical bugs remaining
- Lighthouse scores > 90 across metrics
- Cross-browser compatibility verified
- Accessibility standards met (WCAG AA)
- Performance is acceptable on low-end devices

#### Technical Notes
- Use systematic testing approach
- Document all test results
- Create regression test list
- Consider adding automated tests post-MVP
- Involve external testers if possible

---

### Task 14: Production Deployment
**Priority:** P0 (Critical)
**Estimated Time:** 3-4 hours

#### Implementation Steps
- [ ] Set up production database
  - Create PostgreSQL instance on host
  - Configure connection pooling
  - Set up automated backups
  - Configure performance settings
- [ ] Configure environment variables
  - Set DATABASE_URL
  - Set Better Auth secrets
  - Set session secrets
  - Set any API keys
  - Configure timezone settings
- [ ] Run production migrations
  - Test migrations on staging DB first
  - Run migrations on production DB
  - Verify schema correctness
  - Seed question data
- [ ] Configure Dokploy deployment
  - Create new project in Dokploy
  - Link Git repository
  - Configure build settings
  - Set environment variables
  - Configure auto-deploy on push
- [ ] Set up SSL/HTTPS
  - Configure SSL certificate
  - Ensure HTTPS redirect
  - Verify certificate renewal
- [ ] Configure domain
  - Point domain to Dokploy instance
  - Configure DNS settings
  - Verify domain propagation
  - Test HTTPS on domain
- [ ] Build and deploy
  - Run production build locally first
  - Fix any build errors
  - Deploy to Dokploy
  - Monitor deployment logs
  - Verify successful deployment
- [ ] Smoke test production
  - Test sign up flow
  - Test login flow
  - Complete a quiz
  - Verify database writes
  - Test PWA installation
  - Verify all features work
- [ ] Set up monitoring
  - Configure error tracking (Sentry, etc.)
  - Set up uptime monitoring
  - Configure performance monitoring
  - Set up database monitoring
  - Create alert rules
- [ ] Create rollback plan
  - Document rollback procedure
  - Test rollback process
  - Keep previous version accessible
  - Plan for database rollbacks

#### Acceptance Criteria
- App is live on production domain
- HTTPS is working correctly
- All environment variables configured
- Database is secure and backed up
- Monitoring and alerts are active
- Deployment process is documented
- Rollback plan is in place

#### Technical Notes
- Test on staging environment first
- Have rollback plan ready
- Monitor closely after initial deployment
- Keep deployment checklist
- Document all production configs

---

### Task 15: Post-Launch Monitoring & Iteration
**Priority:** P1 (High)
**Estimated Time:** Ongoing

#### Implementation Steps
- [ ] Monitor error rates
  - Check error tracking dashboard daily
  - Prioritize and fix critical errors
  - Track error trends
  - Set up error alerts
- [ ] Monitor performance
  - Track Core Web Vitals
  - Monitor server response times
  - Check database query performance
  - Optimize bottlenecks
- [ ] Monitor user engagement
  - Track daily active users
  - Monitor quiz completion rates
  - Track streak statistics
  - Identify drop-off points
- [ ] Gather user feedback
  - Create feedback mechanism
  - Monitor social media mentions
  - Track support requests
  - Identify common issues
- [ ] Plan first iteration
  - Prioritize bug fixes
  - Plan first improvements
  - Consider Phase 2 features
  - Create roadmap
- [ ] Database maintenance
  - Monitor database size
  - Optimize slow queries
  - Review index usage
  - Plan for scaling
- [ ] Security monitoring
  - Monitor for security issues
  - Apply security patches
  - Review authentication logs
  - Update dependencies
- [ ] Performance optimization
  - Analyze bundle size
  - Optimize images
  - Review caching strategies
  - Improve load times
- [ ] Documentation updates
  - Update README if needed
  - Document known issues
  - Create user guide
  - Update technical docs

#### Acceptance Criteria
- Error rate remains low (<1%)
- Performance metrics are healthy
- User engagement is growing
- Critical bugs are fixed quickly
- Feedback mechanism is working
- Plans for iteration are clear

#### Technical Notes
- Be responsive to early user feedback
- Don't over-optimize prematurely
- Focus on critical issues first
- Plan for sustainable growth
- Keep documentation updated

---

## Summary

### Total Estimated Time
- **Phase 1:** 9-12 hours
- **Phase 2:** 10-13 hours
- **Phase 3:** 15-19 hours
- **Phase 4:** 10-13 hours
- **Phase 5:** 7-10 hours + ongoing
- **Total:** 51-67 hours + ongoing monitoring

### Critical Path
1. Tasks 1-3 (Foundation) must complete first
2. Tasks 4-6 (Core Logic) depend on foundation
3. Tasks 7-9 (UI) depend on core logic
4. Tasks 10-12 (PWA & Polish) can partially parallel UI work
5. Tasks 13-15 (Launch) happen sequentially at the end

### Recommended Approach
- Complete Phase 1 fully before moving on
- Work on Phase 2 tasks in parallel where possible
- Start Phase 4 PWA config early to allow time for testing
- Don't skip Phase 5 testing - it's critical for quality
- Involve users/testers early for feedback

### Phase 2 Features (Post-MVP)
- Historical personality charts (LayerChart visualizations)
- Email/push notifications for daily reminders
- Social features (share types, compare with friends)
- Advanced analytics and insights
- More sophisticated question algorithm
- Custom themes and personalization
- Achievement system beyond streaks
