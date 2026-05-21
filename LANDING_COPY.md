# Landing Page Copy

This document outlines the high-converting copy, headers, call-to-actions, and FAQ built into the landing page of the AI Spend Audit tool.

## 1. Hero Block
- **Hero Headline:** Stop Overpaying for AI Tools. Audit Your Spend Instantly.
- **Subheadline:** Calculate seat inefficiencies, double-billing, and plan mismatches across your team's developer tools in 60 seconds. Free, confidential, and instant.
- **Primary CTA Copy:** Audit Your Stack Now

## 2. Social Proof / Traction Block
- **Headline:** Trusted by finance and engineering teams at high-growth startups
- **Mocked Testimonials:**
  1. *"We thought our AI spend was optimized until we ran this audit. We standardized on Cursor and saved $340/month in duplicate Copilot seats in 5 minutes."*  
     — **Sarah L.**, VP of Engineering at Voxel AI (Mocked)
  2. *"The Claude Team plan minimum seat warning saved us $105/month. This is the Mint.com for developer tools."*  
     — **Alex K.**, CTO at Stealth SaaS (Mocked)

## 3. Frequently Asked Questions (FAQ)

### Q1: Is my data safe? Do you require code repository access?
**A:** Yes, your data is 100% secure. Unlike other developer productivity tools, we do not require OAuth access to your GitHub or Cursor configurations, and we do not request read permissions to your private codebases. The audit runs entirely based on the high-level licensing details (seats, plans, and spend) you self-input.

### Q2: How does the savings engine calculate optimizations?
**A:** The engine runs a deterministic, financial-grade logic matrix updated weekly with the latest vendor prices. It scans for:
1. **Seat Inefficiencies:** Downgrading to Pro plans when a Team tier minimum is not met (e.g., Claude Team requires 5 seats).
2. **Redundant Overlaps:** Standardizing on single editors (e.g., detecting if the same seat has both Cursor and GitHub Copilot licenses).
3. **Volume Discount Opportunities:** Transitioning direct, retail API spends to pooled Credex discounts.

### Q3: What is Credex, and how is this tool free?
**A:** Credex sources bulk, discounted AI infrastructure credits (Cursor, Claude, OpenAI, ChatGPT Enterprise) from companies that overforecasted their needs or pivoted. We offer these credits to startups at substantial discounts. This tool is free because it serves as an educational and lead-generation portal for us: when we detect startups with high API or enterprise seat spends, we showcase Credex as the vehicle to capture more savings.

### Q4: Can I share these results with my team or finance head?
**A:** Absolutely. Once your audit is calculated, you can input your email to unlock a unique public URL. This link strips out identifying details (like your company name or email address) for privacy, while preserving the tool breakdown and savings numbers so you can present it to your finance team. You can also export the report as a print-ready PDF.

### Q5: How often are the pricing tiers updated?
**A:** We update our pricing databases weekly based on official vendor pricing pages (tracked in our public `PRICING_DATA.md` repository). We verify the costs for Cursor, Copilot, ChatGPT, Claude, and Gemini to ensure your report reflects the current market reality.
