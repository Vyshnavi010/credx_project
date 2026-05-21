# Unit Economics and Financial Projections

This document details the financial modeling, conversion funnels, Customer Acquisition Cost (CAC), and growth assumptions required to make the AI Spend Audit tool a profitable lead-generation machine for Credex.

---

## 1. Value of a Converted Lead to Credex (LTV)

Credex operates on a secondary broker margin by buying overforecasted enterprise AI seat licenses and API credits at an average of **60% discount** and reselling them to startups at a **30% discount**. 

### Average Transaction Profile:
- **Product:** pooled Anthropic/OpenAI API credits or Cursor Enterprise licenses.
- **Client Size:** 15-person developer team.
- **Monthly Spend:** $2,000 retail spend.
- **Discounted Price via Credex:** $1,400 (30% savings for the startup).
- **Cost to Acquire Credits for Credex:** $800 (60% discount from offloader).
- **Credex Net Monthly Margin:** $600/month.
- **Average Customer Retention (Life Span):** 12 months (since startups review stacks annually).
- **Customer Lifetime Value (LTV):** $600/mo * 12 months = **$7,200 Net Margin per Converted Lead**.

---

## 2. Customer Acquisition Cost (CAC) by Channel

Since our Go-To-Market plan leverages $0 paid budget channels, the cost of acquisition is modeled in engineering and outreach time:

1. **Fractional CTO Outreach:**
   - *Time investment:* 15 hours of LinkedIn curation and messaging (valued at $50/hour internal cost = $750).
   - *Resulting leads:* 45 audits completed, converting to 3 consultations, and 1 closed deal.
   - **CTO Channel CAC:** **$750 per closed deal**.

2. **X/Reddit Active Monitoring:**
   - *Time investment:* 20 hours over a month responding to threads (valued at $1,000).
   - *Resulting leads:* 25 audits completed, converting to 1 closed deal.
   - **X/Reddit Channel CAC:** **$1,000 per closed deal**.

3. **VC Operations Partnerships:**
   - *Time investment:* 8 hours pitches to VC portfolio managers (valued at $400).
   - *Resulting leads:* 40 audits, 2 consultations, 1 closed deal.
   - **VC Partner Channel CAC:** **$400 per closed deal**.

- **Blended CAC Target:** **$716 per customer**.
- **LTV:CAC Ratio:** $7,200 / $716 = **10.05x** (Highly viable business model).

---

## 3. Profitability Conversion Funnel

We need to calculate the minimum conversion thresholds to cover hosting, API costs, and team labor.

### Operational Cost Baseline:
- Serverless hosting + DB (Supabase Pro tier): $25/month.
- LLM API Summary cost: ~$0.005 per audit (10,000 audits = $50/month).
- Blended monthly operations cost: **$100/month** (ignoring initial setup labor).

### Target Funnel:
1. **Audits Completed:** 1,000 / month
2. **Audit to Lead Conversion (Email Captured):** 30% = 300 leads
3. **Lead to Consultation Booked Rate:** 5% = 15 consultations
4. **Consultation to Credit Purchase (Close Rate):** 20% = 3 customers

### Profitability Math:
- Total Cost: $100 server costs + 3 * $716 CAC = $2,248.
- Total Return: 3 closed deals * $7,200 LTV = $21,600.
- Net Profit: **$19,352/month**.
- **Break-even Threshold:** We only need to convert **1 user every 2 months** (0.5 closed deals/month) from the funnel to remain profitable.

---

## 4. Road to $1M ARR in 18 Months

To achieve $1,000,000 in Annual Recurring Revenue ($83,333/month in net margin) in 1.5 years, the following conditions must be met:

1. **Active Customer Count:**
   - Average client generates $600/month net margin.
   - We require: $83,333 / $600 = **139 active concurrent customers**.

2. **Required Traffic Scale:**
   - Assuming a 0.3% overall conversion rate from cold site visitor to closed buyer:
   - We need: 139 customers / 0.003 = 46,333 unique startup audits over 18 months.
   - This scales to **~2,574 audits completed per month** (approx. 85 audits per day).

3. **Operational Milestones:**
   - **Month 1–6:** Secure partnerships with 15 Fractional CTO agencies and 5 VC firms to seed the funnel.
   - **Month 7–12:** Automate invoice upload parsing (OCR) to increase audit-completion rates to 45%.
   - **Month 13–18:** Establish a secondary reseller API widget integrated directly into startup bookkeeping platforms (e.g., Mercury or Brex), driving automatic audit checks on invoice payouts.
