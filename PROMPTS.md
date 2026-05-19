# LLM Prompts and AI Strategy

This document details the LLM prompt design, rationale, and fallback mechanisms engineered for the **AI Spend Audit** personalized summary generator.

## 1. System Prompt

Our system instructions align the model to behave as an expert SaaS financial auditor, producing clean, metrics-driven insights.

```text
You are an expert SaaS financial auditor. Write a concise, personalized 80-120 word summary paragraph highlighting where the user is overspending and what specific action they should take. Be direct, professional, and use numbers. Do not mention system details, JSON structure, or use conversational filler. Focus strictly on their audit results.
```

### Design Decisions:
- **Tone Restriction:** Prevents standard conversational greetings (e.g. "Sure, here is your summary...") which dilutes the professional SaaS dashboard feeling.
- **Word-Count Bound:** Standardized to `80-120 words` to keep the audit report layout clean, compact, and highly readable on screens and PDF exports.
- **Strict Format Constraint:** Prevents formatting like markdown bullets or lists, since the frontend renders the summary as a fluid narrative paragraph.

---

## 2. User Prompt

We feed the LLM a structured summary of the audit inputs (team size, use case) and results (current spend, tool list, cost per tool, and savings action).

```text
Here are the audit results for a startup team of {{team_size}} focusing on "{{primary_use_case}}" use cases:
Total Current Monthly Spend: ${{total_current_spend}}
Total Potential Monthly Savings: ${{total_savings}}
Tool-by-tool breakdown:
{{#each audit_results}}
- {{toolName}}: Currently spending ${{currentSpend}}/mo. Recommendation: {{reason}} (Recommended Spend: ${{recommendedSpend}}/mo).
{{/each}}
Please output a single, high-impact, professional summary paragraph.
```

### Design Decisions:
- **Pre-computed Reasoning:** Rather than asking the LLM to perform mathematical audits (which is prone to calculation errors and hallucinated prices), we perform all financial math inside the deterministic TypeScript engine and feed the results directly to the LLM. 
- **Context Injection:** Feeding the use case ("coding", "writing") and team size enables the LLM to justify the transitions (e.g. "For a coding-heavy team of 5, standardizing on Cursor Pro...").

---

## 3. Iterative Refinement & What Didn't Work

1. **Attempting Math in Prompt:** Initially, we tried to supply pricing data lists and let the LLM calculate the savings. The LLM regularly hallucinated pricing calculations, forgot the seat minimum requirements for Claude Team, or failed to compute the 25% bulk credit discounts correctly. 
   - *Fix:* Shifted calculation responsibility fully to a robust, unit-tested TypeScript engine, keeping the LLM focused solely on copywriting and synthesizing the final recommendations.
2. **Standard Bullet Lists:** The LLM loved responding with bullet points. This broke the paragraph layout on the results cards. 
   - *Fix:* Explicitly forced "a single, high-impact, professional summary paragraph" in both the system and user prompts.

---

## 4. Graceful Fallback Strategy

To guarantee that the application remains fully functional and displays a high-quality audit recommendation even under API failures, rate-limiting, or missing keys, we implemented a deterministic rule-based template builder in `src/app/api/audit/summary/route.ts` that matches the LLM's style:

- Parses the categorization of audit savings (Standardizations, Downgrades, API discounts, Seat discounts).
- Computes savings totals.
- Synthesizes a fluid, customized paragraph indicating precisely what items to target to claim the savings.
