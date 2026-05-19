import { NextRequest, NextResponse } from "next/server";
import { getAudit, saveAudit, AuditRecord } from "@/utils/db";
import { ToolAuditResult } from "@/utils/auditEngine";

// Fallback rule-based summary generator
function generateRuleBasedSummary(audit: AuditRecord): string {
  const useCase = audit.primary_use_case || "mixed";
  const teamSize = audit.team_size || 1;
  const savings = audit.total_savings || 0;
  const breakdown: ToolAuditResult[] = audit.audit_results || [];

  if (savings <= 0) {
    return `Your AI tooling stack is fully optimized. For a team of ${teamSize} focusing on ${useCase} workloads, your spending matches the current market benchmarks, and there is no double-paying or seat inefficiency detected. Keep auditing your stack regularly as new pricing updates occur.`;
  }

  // Identify the primary savers
  const standardizations = breakdown.filter((b: ToolAuditResult) => b.actionType === "standardize");
  const downgrades = breakdown.filter((b: ToolAuditResult) => b.actionType === "downgrade");
  const apiDiscounts = breakdown.filter((b: ToolAuditResult) => b.actionType === "credex_discount" && b.toolId.includes("api"));
  const seatDiscounts = breakdown.filter((b: ToolAuditResult) => b.actionType === "credex_discount" && !b.toolId.includes("api"));

  const recommendations: string[] = [];

  if (standardizations.length > 0) {
    const toolsStr = standardizations.map((s: ToolAuditResult) => s.toolName).join(" & ");
    recommendations.push(`eliminating redundant tool duplication by standardizing on a single editor platform (${toolsStr})`);
  }

  if (downgrades.length > 0) {
    const details = downgrades.map((d: ToolAuditResult) => `${d.toolName} to ${d.recommendedPlan}`).join(", ");
    recommendations.push(`downgrading inactive or under-utilized seats on ${details} (avoiding minimum team seat premiums)`);
  }

  if (apiDiscounts.length > 0) {
    recommendations.push(`migrating your raw pay-as-you-go API consumption to discounted bulk credits via Credex`);
  }

  if (seatDiscounts.length > 0) {
    recommendations.push(`sourcing discounted software seat licenses from our partner pools`);
  }

  return `We analyzed your team's AI tool spend and discovered $${savings.toLocaleString()}/mo in potential savings. For a team size of ${teamSize} running ${useCase} tasks, you can optimize your costs by: ${recommendations.join("; and ")}. Applying these changes will increase your capital efficiency. Since your optimization opportunities qualify, we recommend scheduling a brief call with a Credex advisor to capture these savings.`;
}

export async function POST(req: NextRequest) {
  try {
    const { auditId } = await req.json();
    if (!auditId) {
      return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
    }

    const audit = await getAudit(auditId);
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Check if summary already exists
    if (audit.ai_summary) {
      return NextResponse.json({ summary: audit.ai_summary });
    }

    // Default fallback summary
    let summaryText = generateRuleBasedSummary(audit);

    // Try Anthropic API
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 200,
            system: "You are an expert SaaS financial auditor. Write a concise, personalized 80-120 word summary paragraph highlighting where the user is overspending and what specific action they should take. Be direct, professional, and use numbers. Do not mention system details, JSON structure, or use conversational filler. Focus strictly on their audit results.",
            messages: [
              {
                role: "user",
                content: `Here are the audit results for a startup team of ${audit.team_size} focusing on "${audit.primary_use_case}" use cases:
Total Current Monthly Spend: $${audit.total_current_spend}
Total Potential Monthly Savings: $${audit.total_savings}
Tool-by-tool breakdown:
${audit.audit_results.map((r: ToolAuditResult) => `- ${r.toolName}: Currently spending $${r.currentSpend}/mo. Recommendation: ${r.reason} (Recommended Spend: $${r.recommendedSpend}/mo).`).join("\n")}
Please output a single, high-impact, professional summary paragraph.`
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.content?.[0]?.text) {
            summaryText = data.content[0].text.trim();
          }
        } else {
          console.warn("Anthropic API returned status:", response.status);
        }
      } catch (err) {
        console.error("Failed to generate summary with Anthropic:", err);
      }
    } 
    // Try OpenAI API as secondary fallback
    else if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            max_tokens: 200,
            messages: [
              {
                role: "system",
                content: "You are a professional SaaS finance consultant. Write a concise, actionable 80-120 word summary paragraph highlighting the startup's AI overspend and recommendation actions. Focus on metrics, standardizations, and direct numbers from the audit. Be direct, authoritative, and brief."
              },
              {
                role: "user",
                content: `Startup with team size ${audit.team_size} and primary use-case: ${audit.primary_use_case}.
Total Current Spend: $${audit.total_current_spend}/mo
Potential Savings: $${audit.total_savings}/mo
Tool breakdowns:
${audit.audit_results.map((r: ToolAuditResult) => `- ${r.toolName}: Current Spend $${r.currentSpend}, Rec Spend $${r.recommendedSpend}. Rec action: ${r.reason}`).join("\n")}`
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.choices?.[0]?.message?.content) {
            summaryText = data.choices[0].message.content.trim();
          }
        }
      } catch (err) {
        console.error("Failed to generate summary with OpenAI:", err);
      }
    }

    // Save summary back to the database record
    audit.ai_summary = summaryText;
    
    // Save updated record
    await saveAudit(audit);

    return NextResponse.json({ summary: summaryText });

  } catch (err) {
    console.error("Error in /api/audit/summary:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
