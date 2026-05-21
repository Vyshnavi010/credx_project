# Reflection and Retrospective

This document contains a structured reflection on the engineering decisions, tool usage, rating self-evaluation, and future plans for the AI Spend Audit project.

---

## 1. The Hardest Bug & How I Debugged It
The most challenging bug occurred in the dynamic routing path `/audit/[id]/page.tsx` during page build testing. The page crashed during generation, reporting: `"TypeError: Cannot read properties of undefined (reading 'id')"`.

### Hypotheses Formed:
1. The dynamic routing parameters were not being passed correctly to the server component.
2. In Next.js 15, `params` is an asynchronous promise. Accessing `params.id` synchronously was returning `undefined`, causing database lookups to fail.
3. The database lookup itself was throwing a silent network error because the database Client wasn't fully initialized during build-time prerendering.

### Actions Taken:
- **Test 1:** Logged the type of `params` inside the page function. It returned `[object Promise]`, confirming hypothesis 2. Next.js 15 App Router treats route parameters as promises that must be explicitly resolved.
- **Test 2:** Modified the code to await the parameter lookup: `const { id } = await params`. This resolved the immediate routing error, but the build still failed during prerender because Next.js tried to compile `/audit/[id]` statically without mock parameters.
- **Test 3:** Added dynamic rendering configurations. By declaring `/audit/[id]` as a fully dynamic path (`export const dynamic = 'force-dynamic'`), I instructed Next.js to bypass static prerendering for this route, resolving the build crash and ensuring that dynamic Open Graph metatags load correctly at runtime.

---

## 2. A Decision I Reversed Mid-Week
Mid-week, I reversed the choice of utilizing `Recharts` for the spend comparison visualization. I had already designed a chart page using their `<ResponsiveContainer>` and `<BarChart>` wrappers.

### Reason for Reversal:
During testing, I observed hydration mismatches inside the browser console. Because Next.js server-renders the HTML, and `Recharts` uses SVG responsive boundaries computed dynamically in the browser, the server-generated markup didn't align with the client-rendered output. This caused flickering during load. Furthermore, certain dependencies inside standard plotting libraries have peer warnings with React 19, which is the baseline in Next.js 15.

To guarantee high Lighthouse metrics (Accessibility ≥ 90, Best Practices ≥ 90) and ensure zero compilation conflicts under React 19, I abandoned the chart library entirely. I replaced it with a custom-engineered HTML/CSS bar chart powered by Tailwind. The custom bars load instantly, support responsive flexbox structures, avoid client-side javascript overhead, and render clean SVG icons. This reduced my first-paint bundle size, improving performance scores.

---

## 3. What I Would Build in Week 2
If given a second week to develop this product, I would prioritize:
1. **Interactive Sandbox Benchmark Mode:** Introduce a database-driven comparator showing how the user's spending scales against anonymous data from similar-sized startups. For instance, displaying: *"A 10-person coding startup typically spends $350/mo on AI seats. You spend $600/mo (90th percentile)."* This gamifies optimization and increases conversions.
2. **One-Click Invoice Upload (OCR):** Integrate an OCR scanning endpoint (via PDF parser or Gemini Multimodal API) allowing founders to drag-and-drop their PDF invoices (from Cursor, OpenAI, or Vercel). The engine would automatically parse seat numbers, tiers, and invoice amounts, eliminating manual data entry.
3. **Embeddable Savings Widget:** Create a lightweight, iframe-compatible widget (`<script>` based) that SaaS bloggers, venture firms, or accelerators can embed directly on their pages, bringing traffic to the Credex brand.
4. **Resend-based Scheduled Re-Auditing:** Save the user's stack structure and, every quarter, check for vendor pricing drops or new Credex credit opportunities, emailing them a "re-optimized report" to drive continuous lead reactivation.

---

## 4. How I Used AI Tools
AI was used extensively throughout the development cycle to write boilerplate configurations and accelerate component layouts.

### What AI Was Used For:
- Writing the tailwind utilities for the glassmorphism layout and setting up the basic Tailwind color theme mappings.
- Compiling the initial unit test boilerplates for the `node:test` runner.
- Assisting in the syntax structure of the Resend transactional email HTML.

### What I Didn't Trust AI With:
- **The Financial Audit Rules:** AI was not permitted to handle mathematical optimization or comparison logic, as small syntax errors or hallucinations would invalidate the report's credibility. All calculation algorithms are hardcoded in TypeScript.
- **Database Adapters:** Writing raw filesystem file manipulation blocks alongside Supabase drivers was handled manually to ensure that file handles are securely released.

### Specific Time the AI Was Wrong:
The AI suggested importing `next/headers` inside a client-side component to read IP addresses for rate-limiting. I caught this immediately: client-side modules cannot import server headers, and doing so throws compiling crashes in Next.js. I corrected this by shifting the rate-limiter and header read exclusively into the `/api/audit` server route handler.

---

## 5. Self-Rating (1-10 Scale)

- **Discipline (9/10):** Maintained consistent, clean commits across distinct calendar days, documented every design detour in the devlog, and respected rest cycles to avoid fatigue.
- **Code Quality (9/10):** Leveraged TypeScript strict modes, separated database utilities from API layers, and wrote fully green automated tests with zero console leaks.
- **Design Sense (8/10):** Created a premium, dark-mode visual interface with clean glassmorphic components, subtle accents, and responsive print support, though layout polish can always improve.
- **Problem Solving (9/10):** Designed a robust local JSON fallback database module that allows the grader to run the codebase locally with zero configuration out-of-the-box.
- **Entrepreneurial Thinking (10/10):** Focused on high-impact lead-generation features, designed shareable public routes that strip private user data to encourage viral sharing, and formulated realistic CAC/ARR economics.
