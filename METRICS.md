# Metrics Framework

This document outlines the North Star, driver inputs, instrumentation plan, and pivot thresholds for the AI Spend Audit tool.

---

## 1. The North Star Metric
Our single North Star metric is **Total Identified Qualified Savings (TIQS)** per month.

### Why this metric?
As a lead-generation asset for Credex, the goal of this tool is twofold: deliver immediate value to the user (demonstrating how much they can save) and identify high-value targets for Credex's secondary credit market. 
- Measuring simple "Signups" or "Page Views" does not correlate with revenue. A single company saving $1,500/mo is worth 100 times more to Credex than 50 hobbyists saving $10/mo.
- TIQS aligns both values: the higher the savings we identify, the more value we provide to founders, and the higher the quality of leads flowing to the Credex consultation funnel.

---

## 2. Three Input Metrics (Drivers)
To drive our North Star metric, we track three key input metrics:

1. **Average Audit Value (AAV):** The average monthly savings detected per audit. This measures whether we are attracting our high-value ICP (startups with multi-seat stacks and high API bills) vs. single developers.
2. **Audit Completion Rate (ACR):** The percentage of landing page visitors who select at least one tool and hit "Audit Your Stack". This monitors form friction and headline effectiveness.
3. **Lead Capture Conversion Rate (LCCR):** The percentage of audited users who input their business email to unlock the shareable link. This measures the perceived value of the audit results.

---

## 3. First Instrumentation Plan
We will instrument the following tracking points using a lightweight, privacy-focused tool (such as **Plausible** or **Mixpanel**):

1. **Page Entry & Form Interactions:** Track clicks on checkboxes to identify which AI tools are most commonly audited.
2. **Audit Success Event:** Log server-side events when an audit is saved, recording:
   - `team_size`
   - `total_savings`
   - `primary_use_case`
3. **CTA Clicks:** Track clicks on the "Copy Shareable Link" and "Book Consultation" buttons to measure engagement.

---

## 4. Pivot Trigger Metric
We will trigger a product pivot if the **High-Savings Lead Ratio (HSLR)** — the percentage of audits showing >$500/mo in savings that convert to a booked consultation — falls below **3%** over a 30-day window (with a minimum sample of 100 high-savings audits).

### What would this tell us?
If high-value leads are identifying savings but refusing to book consultations or engage with Credex, it indicates that:
- The audit report lacks financial authority (users don't believe the recommendations).
- The transition friction to buy credits through Credex is perceived as too high or risky.
- We are attracting non-decision-makers who cannot approve enterprise credit purchases.

### Pivot Actions:
We would either pivot the tool's UX to focus on automatic optimization scripts (rather than manual consultation pitches) or change the distribution channel to target CFOs/Finance directors directly rather than engineering leads.
