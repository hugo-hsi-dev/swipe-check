# Task 4: Question Bank & MBTI Framework - Setup Guide

This document provides setup instructions for Task 4.

## What Was Implemented

### 1. Question Bank (80 MBTI Questions)
- ✅ Created comprehensive MBTI question bank with 80 questions
- ✅ Even distribution: 10 questions per dimension (E, I, S, N, T, F, J, P)
- ✅ Questions based on validated MBTI assessment patterns
- ✅ Stored in `/src/lib/server/db/seed.ts`

### 2. Database Seed Script
- ✅ Created seed script with automatic question distribution verification
- ✅ Uses drizzle-orm to insert curated MBTI questions
- ✅ Uses tsx's `--env-file` flag for environment variable loading (no dotenv needed)
- ✅ Run with: `pnpm db:seed`
- ℹ️ Note: Uses curated questions instead of drizzle-seed's random generation to ensure psychologically validated MBTI questions

### 3. Quiz Remote Functions
- ✅ Created `/src/routes/quiz.remote.ts` with full quiz functionality
- ✅ Implements intelligent question rotation algorithm
- ✅ Zod validation for all inputs
- ✅ Automatic streak tracking on quiz completion

### 4. Question Rotation Logic
The intelligent question rotation algorithm:
- Tracks dimension coverage from last 7 days of responses
- Prioritizes under-represented dimensions
- Avoids recently answered questions (30-day window)
- Randomizes within selected dimensions
- Ensures even coverage over time

## Setup Instructions

### 1. Database Setup

Before running the seed script, you need to configure your database connection:

1. **Update `.env` file** with your PostgreSQL database credentials:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database
   BETTER_AUTH_SECRET=your-secret-key-here
   ```

2. **Apply database migrations** (if not already done):
   ```bash
   pnpm db:push
   # or
   pnpm db:migrate
   ```

### 2. Seed the Database

Run the seed script to populate the questions table:

```bash
pnpm db:seed
```

**Note:** The script uses tsx with `--env-file=.env` flag to automatically load environment variables from your `.env` file. No additional dotenv package needed!

This will:
- Load DATABASE_URL from .env file
- Clear any existing questions
- Insert all 80 MBTI questions
- Display distribution verification
- Confirm successful seeding

### 3. Verify the Setup

You can verify the questions were seeded correctly by:

1. **Using Drizzle Studio**:
   ```bash
   pnpm db:studio
   ```
   Then navigate to the `questions` table to view all questions.

2. **Checking the console output** from the seed script, which shows:
   - Total questions inserted
   - Distribution by dimension

## Remote Functions Available

### `getCurrentUser()` (from auth.remote.ts)
Query function to retrieve the current authenticated user.

**Location:** `/src/routes/auth.remote.ts`
**Can be imported by:** Any remote function file for session validation

**Parameters:**
- None (uses session automatically)

**Returns:**
- User object with `id`, `name`, `email` if authenticated
- `null` if not authenticated

**Usage:**
```typescript
import { getCurrentUser } from './auth.remote';

export const someFunction = query(async () => {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  // Use user.id, user.name, user.email
});
```

**Note:** This query is deduped by SvelteKit for performance optimization. Multiple calls in the same request only execute once.

### `getQuestions()`
Query function to fetch daily questions for the current user.

**Parameters:**
- `date`: Date in YYYY-MM-DD format
- `isOnboarding`: Boolean (optional, default: false)

**Returns:**
- 3 questions for daily quiz
- 10 questions for onboarding quiz
- Intelligently selected based on dimension coverage
- Uses `getCurrentUser()` query internally for session validation

### `submitAnswer()`
Form function to submit an answer to a question.

**Parameters:**
- `questionId`: UUID of the question
- `answer`: Boolean (true = agree, false = disagree)
- `respondedAt`: Date in YYYY-MM-DD format

**Returns:**
- Success/error status
- Quiz completion status
- Automatically updates user streak when quiz is completed
- Uses `getCurrentUser()` query internally for session validation

## Testing the Implementation

### Manual Testing Steps

1. **Test Session Validation**:
   - Call `getCurrentUser()` to verify session
   - Should return user object when authenticated
   - Should return `null` when not authenticated

2. **Test Question Selection**:
   - Call `getQuestions()` with a date (user ID comes from session)
   - Verify 3 questions are returned
   - Check that questions are from different dimensions when possible

3. **Test Answer Submission**:
   - Submit answers using `submitAnswer()`
   - Verify answers are saved to database
   - Complete all 3 questions and verify streak update

4. **Test Question Rotation**:
   - Complete multiple daily quizzes
   - Verify questions rotate intelligently
   - Check that under-represented dimensions are prioritized

### Edge Cases to Test

- New users (no previous responses)
- Users with partial 7-day window (< 7 days of data)
- All dimensions equally covered
- Same-day duplicate submissions
- Invalid question IDs
- Invalid date formats

## Next Steps

Task 4 implementation is complete! The next task (Task 5) will focus on:
- Personality Calculation Engine
- Calculating MBTI type from responses
- Mapping to 16personalities.com
- Detecting personality type changes

## Files Created/Modified

- ✅ `/src/lib/server/db/seed.ts` - Question bank and seed script
- ✅ `/src/routes/quiz.remote.ts` - Quiz remote functions with rotation logic
- ✅ `/src/routes/auth.remote.ts` - Added `getCurrentUser()` query for session validation
- ✅ `.env` - Created from .env.example (needs your database credentials)

## Architecture Pattern

The `getCurrentUser()` query is centralized in `auth.remote.ts` and can be imported by any other remote function file that needs session validation. This follows the pattern:

1. **Session validation** lives in `auth.remote.ts` as a reusable query
2. **Quiz logic** in `quiz.remote.ts` imports and uses `getCurrentUser()`
3. **Future remote functions** can import `getCurrentUser()` for consistent session handling
4. **Query deduplication** ensures session is validated only once per request, even if multiple functions call it

## Troubleshooting

### Seed Script Fails
- Verify DATABASE_URL is set correctly in `.env`
- Ensure PostgreSQL is running
- Check that migrations have been applied
- Verify database user has necessary permissions

### Questions Not Rotating Properly
- Check that responses are being saved with correct `respondedAt` date
- Verify the 7-day window calculation
- Check dimension distribution in existing responses

### Streak Not Updating
- Verify user_stats record exists for the user
- Check that all required questions are answered
- Verify date format is consistent (YYYY-MM-DD)
