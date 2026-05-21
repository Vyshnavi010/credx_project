# AI Spend Audit | Credex Take-Home Round 1

A free, secure web application designed to help startups, engineering managers, and finance teams audit their AI software spend. The tool calculates seat overlaps, plan mismatches, and direct API inefficiencies across popular tools, serving as a high-value lead-generation asset for Credex.

---

## Deployed Project
- **Live Deployed URL:** [Update with your Vercel/Netlify URL, e.g., https://credx-spend-audit.vercel.app]
- **Demo Walkthrough Video:** [Update with Loom/YouTube link]

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd credx-project
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Create a `.env.local` file at the root of the project:
```env
# (Optional) For storing audits. Falls back to a local JSON file if not provided.
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# (Optional) For transactional confirmation emails. Falls back to console log prints.
RESEND_API_KEY=

# (Optional) For AI Personalized Summaries. Falls back to rule-based template logic.
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Run Automated Tests
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
```

---

## 🛠️ Five Core Engineering Decisions & Trade-offs

1. **Next.js 15 App Router over SPA (Vite):**
   - *Decision:* Built a full-stack Next.js application instead of a standalone React SPA.
   - *Why:* Dynamic Open Graph preview cards are a critical viral loop for this product. Next.js server-side renders the public `/audit/[id]` pages, allowing us to fetch the audit from the database and inject savings figures directly into the `<meta>` tags on the server before serving the client.

2. **Dual-Layer Database (Supabase + Local JSON Fallback):**
   - *Decision:* Implemented an adapter that writes to a local `db_fallback.json` file in development, but connects to PostgreSQL via Supabase in production.
   - *Why:* This ensures the grading team can run, test, and audit the application locally without performing any database setup, while still maintaining enterprise-grade persistence in production.

3. **Deterministic Financial Math over LLM Auditing:**
   - *Decision:* Performed all financial calculations, plan comparisons, and seat constraint checks in a hardcoded TypeScript engine rather than asking an LLM to evaluate the spend.
   - *Why:* Large Language Models are prone to hallucinating numbers and math calculations. Using TypeScript ensures 100% accurate, unit-tested auditing, while restricting the LLM exclusively to synthesizing a final personalized prose summary.

4. **Tailwind HTML/CSS Chart over Graphing Library (Recharts):**
   - *Decision:* Hand-crafted comparison charts using CSS flexbox widths and Tailwind animations instead of importing Recharts.
   - *Why:* Heavy graphing libraries often throw hydration mismatches inside Next.js SSR and cause rendering warnings in React 19. Custom HTML/CSS charts are fully responsive, performant, and guarantee 100% hydration compatibility.

5. **In-Memory Rate Limiter with Local File Persistence:**
   - *Decision:* Implemented IP-based rate limiting directly in Next.js Serverless Route Handlers with a fallback console warn.
   - *Why:* Protects the API routes from bot spam and raw API cost spikes with zero infrastructure overhead. It can be easily scaled to Redis in production.
