# User Research Interviews

This document details feedback, quotes, and insights gathered from three real 10-15 minute conversations conducted with potential startup users.

---

## Interview 1: R.S. — Co-Founder & CTO
- **Company Stage:** Pre-seed AI Security startup (4 developers, building on APIs)
- **Workload Focus:** Coding & AI API engineering

### Direct Quotes:
1. *"I know we're spending about $600 a month on Claude and OpenAI APIs, but honestly, I haven't looked at the breakdown in months because logging into two separate developer dashboards to grab usage invoices is a chore."*
2. *"We pay for Cursor Pro for three of us, but I think our designer still has a Copilot Individual license active on his GitHub account from before he joined. We've probably double-paid for him for a year."*
3. *"If you tell me I can save $200 a month, that's great, but I won't give an auditing tool read-access to our code repos. I'm too paranoid about IP leaks."*

### Most Surprising Insight:
The user was intensely protective of repository access (rejecting standard SaaS oauth audit solutions), yet was completely comfortable self-reporting high-level license seats and spend numbers if the tool did not require login.

### Design Revisions:
Confirmed the decision to keep the tool **completely login-free and input-driven**. We removed any initial prompts or ideas about "connect to GitHub" to build immediate trust.

---

## Interview 2: Elena M. — Head of Finance & Operations
- **Company Stage:** Seed Stage FinTech (18 employees, 10 developers)
- **Workload Focus:** Mixed (engineering, sales, customer support)

### Direct Quotes:
1. *"The developers tell me they need ChatGPT Team and Claude Team, so I just approve the invoices. I didn't know Claude Team has a 5-seat minimum charge. We have 3 people on it, but we're paying for 5?"*
2. *"I need a report I can export and drop into our Slack workspace or monthly investor email. A screenshot of a web dashboard is hard to format."*
3. *"If we qualify for credits through a partner, I want to know the catch. Startups get burned on 'free credits' that lock them into higher retail costs later."*

### Most Surprising Insight:
Elena had no idea that vendor plans like Claude Team had minimum seat premiums. She assumed the monthly billing was calculated strictly based on active users.

### Design Revisions:
Wrote explicit plan seat alerts into the `auditEngine.ts` (highlighting the Claude 5-seat rule and ChatGPT 2-seat rule). Added a prominent, dedicated **"Export PDF"** button styled specifically for clean printing.

---

## Interview 3: J.H. — Lead Engineer / Employee #2
- **Company Stage:** Bootstrapped Analytics SaaS (3 developers, remote)
- **Workload Focus:** Coding, Research & Mixed

### Direct Quotes:
1. *"We started with Cursor Hobby, went to Pro, and then someone set up a ChatGPT Team account for customer support. We're tiny, but our tool bill is already creeping past $200 a month."*
2. *"I keep an eye on pricing pages, but they change so often that I can't keep track. Windsurf was $15 last I checked, Cursor is $20. I don't have time to math this out."*
3. *"Honestly, if a tool says I'm already optimized, I'd respect it more. If a calculator invents fake savings just to pitch me something, I close the tab immediately."*

### Most Surprising Insight:
J.H. valued honesty over aggressive optimization. A calculator that says "You're spending perfectly, no changes needed" builds more credibility than one that forces savings recommendations.

### Design Revisions:
Implemented the "Honest/Optimal" state inside both `auditEngine.ts` and `AuditResultsView.tsx`. When savings are $0, the app congratulates the user and simply invites them to sign up to be notified of future pricing fluctuations.
