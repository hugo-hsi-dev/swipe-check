# Epic 01.6 Validation Examples

These examples are concrete, deterministic checks for onboarding scoring, daily selection behavior, and edge cases.

## 1) Onboarding scoring output example

### Input history (12 onboarding answers)

- E/I: `q-001 agree`, `q-002 disagree`, `q-003 disagree` → E=2, I=1
- S/N: `q-004 agree`, `q-005 disagree`, `q-006 agree` → S=3, N=0
- T/F: `q-007 agree`, `q-008 agree`, `q-009 disagree` → T=1, F=2
- J/P: `q-010 agree`, `q-011 disagree`, `q-012 disagree` → J=2, P=1

### Expected output

- `typeCode`: `ESFJ`
- `isComplete`: `true`
- `axesWithMinimumData`: `4`
- `totalAnswers`: `12`

This scenario is covered by automated tests in `__tests__/scoring-test.ts`.

## 2) Daily selection examples

### A. Full tie on exposure and recency fallback

When all axes have identical exposure and no recent-usage signal, selection order uses the fixed axis order:

1. `e-i`
2. `s-n`
3. `t-f`
4. `j-p`

Expected selected axes for the day: `['e-i', 's-n', 't-f']`.

### B. Exposure tie broken by least-recently-used axis

If exposures are tied but axis recency differs, the least recently shown axis is selected first.

Example recency ranking: `j-p` least recent, then `t-f`, then `s-n`, and `e-i` most recent.

Expected selected axes for the day: `['j-p', 't-f', 's-n']`.

### C. Avoid repeating yesterday when alternatives exist

If yesterday used `q-013`, `q-014`, `q-015`, selection for the same axes should choose alternatives on those axes when available.

Expected: selected IDs for `e-i`, `s-n`, and `t-f` do **not** include those three IDs.

These scenarios are covered by automated tests in `__tests__/daily-selection-test.ts`.

## 3) Edge-case examples

### A. Tied axis retains prior letter

- Baseline: E/I has E=3, I=0 → letter `E`
- Later history: E/I becomes E=3, I=3 (tied)
- Expected display letter remains `E` using retention tie-breaker.

### B. Low-data honesty

- With no answers: type is `XXXX`, `axesWithMinimumData=0`, `isComplete=false`
- With only two answers on one axis: that axis has `hasMinimumData=false`

These scenarios are covered by automated tests in `__tests__/scoring-test.ts`.
