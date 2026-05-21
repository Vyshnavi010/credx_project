# Developer Log

Weekly progress log tracking the design, build, and validation of the AI Spend Audit project.

---

## Day 1 — 2026-05-15
**Hours worked:** 3
**What I did:**
- Carefully parsed the Round 1 Intern Assignment PDF file to extract all required constraints, feature items, and document configurations.
- Researched Next.js 15 (App Router) + TypeScript + Tailwind CSS as the core stack to handle API routes, server actions, and rapid Vercel deploys.
- Sketched out the initial data schemas, system layout, and user flows.
- Created the initial repository skeleton and drafted the structural blueprints.

**What I learned:**
- Discovered that Next.js Server Components are excellent for rendering Open Graph metadata on the server-side, which is crucial for making the shareable public URLs populate correct Twitter/LinkedIn card previews dynamically.

**Blockers / what I'm stuck on:**
- Unsure about how to handle databases dynamically so the application can run in a zero-configuration environment for the grading team, while still supporting Supabase.
- *Plan to resolve:* Design a database interface with a built-in local JSON file adapter that triggers automatically if Supabase environment variables are missing.

**Plan for tomorrow:**
- Compile all pricing models for the 8 AI vendor tools and write the `PRICING_DATA.md` file.
- Establish the data models in TypeScript.

---

## Day 2 — 2026-05-16
**Hours worked:** 4
**What I did:**
- Searched and verified current licensing plans and pricing for Cursor, GitHub Copilot, Claude.ai, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf.
- Created `src/data/pricingData.ts` to hold these values programmatically.
- Wrote `PRICING_DATA.md` referencing official URLs and verifying numbers.
- Drafted the core financial formulas for double-billing overlaps and seat volume pricing.

**What I learned:**
- Found out that Claude Team has a strict 5-seat minimum ($125/mo), while ChatGPT Team has a 2-seat minimum ($50/mo or $60/mo depending on annual billing). Single-user teams utilizing team plans are severely overpaying and can save instantly by downgrading.

**Blockers / what I'm stuck on:**
- The Windsurf pricing page is slightly ambiguous regarding enterprise licensing.
- *Resolution:* Modeled Windsurf Free and Pro ($15/mo) accurately, and decided to flag Windsurf Team plan at $30/mo as per latest verified data.

**Plan for tomorrow:**
- Taking a scheduled rest day to recharge.

---

## Day 3 — 2026-05-17
**Hours worked:** 0
**What I did:**
- Rest day. Took time off away from screens to recharge.

**What I learned:**
- Taking a clean break helped clarify how to keep the frontend layout clean and avoid visual clutter with large form fields.

**Blockers / what I'm stuck on:**
- None.

**Plan for tomorrow:**
- Implement the core mathematical audit engine and set up automated tests.

---

## Day 4 — 2026-05-18
**Hours worked:** 5
**What I did:**
- Wrote `src/utils/auditEngine.ts` incorporating seat checks, duplicate plugin/editor cancellations, and Credex credit suggestions.
- Set up a lightweight, automated testing suite using the native Node.js test runner (`node:test`) and strict assertions.
- Implemented 5 test cases in `src/tests/audit.test.ts` covering the core features.
- Configured `npm run test` script to compile and run TypeScript tests on the fly using `tsx`.

**What I learned:**
- Writing deterministic financial code is best tested with strict assertions rather than fuzzy integration tests. Node's native test runner runs in under 400ms and has zero compiler configurations.

**Blockers / what I'm stuck on:**
- Encountered a small typing discrepancy inside the tools iterator where plan objects were returning undefined during map lookups.
- *Resolution:* Fixed by adding explicit plan metadata safeguards and fallback checking inside the helper functions.

**Plan for tomorrow:**
- Create the backend Next.js App Router API endpoints (`/api/audit`, `/api/audit/[id]`, and `/api/audit/summary`).
- Build the database persistence layer.

---

## Day 5 — 2026-05-19
**Hours worked:** 5
**What I did:**
- Created `src/utils/db.ts` which uses Supabase in production and automatically falls back to a locally written JSON file in development or on testing pipelines.
- Implemented `/api/audit` endpoint with rate-limiting (in-memory sliding window) and form honeypot checks for basic abuse protection.
- Built `/api/audit/[id]` endpoint to load report data while stripping personal metadata (emails/company names) from public responses.
- Implemented `/api/audit/summary` supporting Anthropic messages, OpenAI fallback, and rule-based paragraph text synthesizers.
- Wrote `src/utils/email.ts` to dispatch transactional summary reports via Resend (falling back to server log prints when API keys are absent).
- Documented LLM prompting strategies in `PROMPTS.md`.

**What I learned:**
- Dynamic routes in Next.js 15 must wait on `params` which are now treated as promises. Had to adjust code to await params before querying database records.

**Blockers / what I'm stuck on:**
- Resend API throws unauthorized warnings without a verified custom domain.
- *Resolution:* Made sure email system handles key verification and falls back gracefully to standard console logging so that local testing runs successfully without blocking.

**Plan for tomorrow:**
- Develop the frontend layout, spend form, and audit results page.

---

## Day 6 — 2026-05-20
**Hours worked:** 6
**What I did:**
- Styled the dark charcoal landing page system inside `src/app/globals.css`, defining glassmorphic elements and print media classes.
- Created `src/components/SpendForm.tsx` supporting plan selection, seat sizing, and price adjustments with LocalStorage persistence.
- Built `src/components/AuditResultsView.tsx` which presents total monthly/annual savings, compares costs side-by-side using custom CSS bars, displays tool card tables, fetches AI summaries, and captures lead forms.
- Integrated `canvas-confetti` to celebrate savings results.

**What I learned:**
- Using custom pure HTML/CSS bars for the financial comparison chart is much safer than heavy graphing libraries (e.g. Recharts) when deploying inside React 19 / Server Components due to SSR hydration clashes.
- Styled `@media print` tags inside global CSS to format a clean PDF copy when the user hits the browser print command.

**Blockers / what I'm stuck on:**
- Form state values were reverting on page reloads because local storage parsing didn't check for array indexes correctly.
- *Resolution:* Refined the structure to save active tool records as map keys and added sanitization on loading hook.

**Plan for tomorrow:**
- Compile go-to-market strategies, metrics checklists, and unit economics.
- Conduct user research interviews.
- Perform production build checks and verify Lighthouse guidelines.

---

## Day 7 — 2026-05-21
**Hours worked:** 4
**What I did:**
- Set up the GitHub Actions CI pipeline configuration inside `.github/workflows/ci.yml`.
- Wrote `GTM.md` outlining cold-outreach distribution channels, customer profiles, and traction indicators.
- Modeled the financials inside `ECONOMICS.md` outlining CAC, consultation bookings, and ARR projections.
- Interviewed 3 startup managers/founders and logged notes in `USER_INTERVIEWS.md`.
- Wrote `LANDING_COPY.md` and `METRICS.md` documenting core marketing and engineering analytics.
- Completed final compilation, verified that the test suite is green, and confirmed `npm run build` succeeds under Turbopack.

**What I learned:**
- User interviews highlighted that many managers actually dread logging into developer tool dashboards to check seat counts. Providing a simple self-input tool with immediate value is highly friction-free.

**Blockers / what I'm stuck on:**
- None. The build compiles successfully. All 5 test cases pass successfully.
