# Automated Tests Documentation

This document describes the automated testing suite implemented to ensure the reliability and correctness of the **AI Spend Audit** engine.

## 1. Test Suite Information

- **Test Runner:** Node.js native test runner (`node:test`)
- **Assertion Library:** Node.js strict assertion library (`node:assert/strict`)
- **Compilation Tool:** `tsx` (TypeScript Execute)
- **Target File:** `src/tests/audit.test.ts`
- **Coverage Target:** `src/utils/auditEngine.ts`

---

## 2. Test Cases Breakdown

We have implemented 5 comprehensive test cases covering crucial aspects of our audit calculations:

### Test 1: Double paying for editor tools (Cursor + Copilot)
- **Path/Location:** `src/tests/audit.test.ts` (lines 4-37)
- **Objective:** Asserts that when a developer or startup is paying for seats on both Cursor Pro and GitHub Copilot Business, the engine flags this redundancy.
- **Verification:**
  - Asserts total current spend equals the sum of both ($195/mo).
  - Asserts that Copilot is flagged with `actionType: "standardize"` and recommended spend is reduced to `$0`.
  - Asserts that the total monthly savings equals Copilot's cost ($95).

### Test 2: Claude Team 5-seat minimum violation
- **Path/Location:** `src/tests/audit.test.ts` (lines 39-59)
- **Objective:** Asserts that when users pay for the Claude Team plan ($25/seat) but register under 5 seats, they are charged the 5-seat minimum ($125).
- **Verification:**
  - Asserts the engine recommends a downgrade to Claude Pro ($20/seat).
  - Asserts that for 2 seats, the recommended cost is $40 instead of $125.
  - Asserts that the savings computed are exactly $85.

### Test 3: ChatGPT Team 2-seat minimum violation for a single user
- **Path/Location:** `src/tests/audit.test.ts` (lines 61-80)
- **Objective:** Asserts that ChatGPT Team requires a 2-seat minimum ($50/mo total). A single-user setup should be downgraded.
- **Verification:**
  - Asserts the recommended plan changes to "plus" ($20/mo).
  - Asserts savings equals $30.

### Test 4: High API spend discount via Credex
- **Path/Location:** `src/tests/audit.test.ts` (lines 82-102)
- **Objective:** Asserts that raw, direct pay-as-you-go API consumption (e.g. OpenAI/Anthropic) triggers a lead generation recommendation.
- **Verification:**
  - Asserts that for $800/mo spend, the engine applies the 25% discount, reducing recommended spend to $600.
  - Asserts that the savings is exactly $200/mo.
  - Asserts that `useCredexLead` is flagged as `true`.

### Test 5: No changes for already optimized stack
- **Path/Location:** `src/tests/audit.test.ts` (lines 104-122)
- **Objective:** Asserts that the engine is honest and does not manufacture savings if the user has an optimal setup.
- **Verification:**
  - Asserts savings equals 0.
  - Asserts `savingsTier` is marked as `"optimal"`.

---

## 3. How to Run the Tests

You can execute the test suite locally using the following commands:

### Running via npm script (recommended):
```bash
npm run test
```

### Running directly with tsx:
```bash
npx tsx --test src/tests/audit.test.ts
```

### Output expectations:
```text
✔ Audit Engine - Double paying for editor tools (Cursor + Copilot) (2.3298ms)
✔ Audit Engine - Claude Team 5-seat minimum violation (0.3585ms)
✔ Audit Engine - ChatGPT Team 2-seat minimum violation for single user (0.3188ms)
✔ Audit Engine - High API spend discount via Credex (0.2849ms)
✔ Audit Engine - No changes for already optimized stack (0.3103ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 362.9033
```
