import { PRICING_DATA } from "../data/pricingData";

export interface ToolInput {
  selectedPlan: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditInput {
  teamSize: number;
  primaryUseCase: "coding" | "writing" | "data" | "research" | "mixed";
  tools: { [toolId: string]: ToolInput };
}

export interface ToolAuditResult {
  toolId: string;
  toolName: string;
  currentSpend: number;
  recommendedPlan: string;
  recommendedSeats: number;
  recommendedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  actionType: "downgrade" | "consolidate" | "credex_discount" | "no_change" | "standardize";
}

export interface AuditSummary {
  totalCurrentSpend: number;
  totalOptimizedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  breakdown: ToolAuditResult[];
  savingsTier: "high" | "medium" | "low" | "optimal";
  useCredexLead: boolean;
}

export function runSpendAudit(input: AuditInput): AuditSummary {
  const breakdown: ToolAuditResult[] = [];
  let totalCurrentSpend = 0;
  let totalOptimizedSpend = 0;

  const tools = input.tools;
  const useCase = input.primaryUseCase || "mixed";

  // Check for coding editor overlap (Cursor and Copilot and Windsurf)
  const hasCursor = tools.cursor && tools.cursor.monthlySpend > 0;
  const hasCopilot = tools.copilot && tools.copilot.monthlySpend > 0;
  const hasWindsurf = tools.windsurf && tools.windsurf.monthlySpend > 0;

  // Check for chat assistant overlap (ChatGPT and Claude)
  const hasChatGPT = tools.chatgpt && tools.chatgpt.monthlySpend > 0;
  const hasClaude = tools.claude && tools.claude.monthlySpend > 0;

  for (const [toolId, toolInput] of Object.entries(tools)) {
    const currentSpend = toolInput.monthlySpend || 0;
    if (currentSpend <= 0) continue;

    totalCurrentSpend += currentSpend;
    const toolMeta = PRICING_DATA[toolId];
    if (!toolMeta) {
      // Unrecognized tool fallback
      breakdown.push({
        toolId,
        toolName: toolId.toUpperCase(),
        currentSpend,
        recommendedPlan: toolInput.selectedPlan,
        recommendedSeats: toolInput.seats,
        recommendedSpend: currentSpend,
        monthlySavings: 0,
        annualSavings: 0,
        reason: "No optimizations available for this custom tool.",
        actionType: "no_change"
      });
      totalOptimizedSpend += currentSpend;
      continue;
    }

    const planMeta = toolMeta.plans[toolInput.selectedPlan];
    const seats = toolInput.seats || 1;

    let recommendedPlan = toolInput.selectedPlan;
    let recommendedSeats = seats;
    let recommendedSpend = currentSpend;
    let reason = "Your plan is optimized for your current usage.";
    let actionType: ToolAuditResult["actionType"] = "no_change";

    // 1. Editor Overlap Rules
    if (toolId === "copilot" && hasCopilot && (hasCursor || hasWindsurf)) {
      // If they have Cursor or Windsurf, they don't need Copilot.
      recommendedSpend = 0;
      recommendedSeats = 0;
      recommendedPlan = "none";
      reason = `You are double-paying for coding assistants. Cancel Copilot and standardize on ${hasCursor ? "Cursor" : "Windsurf"}.`;
      actionType = "standardize";
    } 
    // 2. Claude Team Minimum Seats Rule
    else if (toolId === "claude" && toolInput.selectedPlan === "team" && seats < 5) {
      // Claude Team charges $25/seat, min 5 seats. If they have less, they pay $125/mo minimum.
      // Downgrading to Claude Pro at $20/seat would cost seats * $20.
      const proCost = seats * 20;
      if (proCost < 125) {
        recommendedPlan = "pro";
        recommendedSpend = proCost;
        reason = `Claude Team requires a 5-seat minimum ($125/mo). Downgrade to Claude Pro ($20/user) to save $${125 - proCost}/mo.`;
        actionType = "downgrade";
      }
    }
    // 3. ChatGPT Team Minimum Seats Rule
    else if (toolId === "chatgpt" && toolInput.selectedPlan === "team" && seats < 2) {
      // ChatGPT Team is $25-$30/seat, min 2 seats = $50 minimum.
      // Downgrade to Plus at $20/seat.
      const plusCost = seats * 20;
      recommendedPlan = "plus";
      recommendedSpend = plusCost;
      reason = `ChatGPT Team has a 2-seat minimum. Downgrade to ChatGPT Plus ($20/mo) for single-user accounts.`;
      actionType = "downgrade";
    }
    // 4. Copilot Business Single User Rule
    else if (toolId === "copilot" && toolInput.selectedPlan === "business" && seats === 1) {
      recommendedPlan = "individual";
      recommendedSpend = 10;
      reason = `You're paying for Copilot Business for a single seat. Downgrade to Copilot Individual to save $9/mo.`;
      actionType = "downgrade";
    }
    // 5. Chat Assistant Consolidation (Claude and ChatGPT overlap)
    else if (toolId === "chatgpt" && hasChatGPT && hasClaude && useCase === "coding") {
      // For coding-focused workloads, Claude (especially Sonnet 3.5) is superior, they don't need ChatGPT Plus.
      recommendedSpend = 0;
      recommendedSeats = 0;
      recommendedPlan = "none";
      reason = "For coding-heavy teams, Claude offers superior reasoning. Save money by canceling ChatGPT and standardizing on Claude.";
      actionType = "consolidate";
    }
    // 6. Direct API spend vs Credex Credits
    else if ((toolId === "openai_api" || toolId === "anthropic_api") && currentSpend >= 100) {
      // Credex discounts: save 25% on raw API usage through bulk credits
      const discountRate = 0.25;
      recommendedSpend = Math.round(currentSpend * (1 - discountRate));
      reason = `Purchase bulk API credits via Credex to receive an immediate 25% discount off retail rates.`;
      actionType = "credex_discount";
    }
    // 7. General high usage or enterprise seats via Credex
    else if (seats >= 10 && planMeta && planMeta.pricePerSeat > 0 && currentSpend >= 200) {
      // Credex matches startups with discounted seats (20% savings)
      recommendedSpend = Math.round(currentSpend * 0.8);
      reason = `Consolidate your ${seats} seats through Credex's secondary license market to shave 20% off retail pricing.`;
      actionType = "credex_discount";
    }
    // 8. Gemini Inefficiencies
    else if (toolId === "gemini" && (toolInput.selectedPlan === "business" || toolInput.selectedPlan === "enterprise") && seats === 1) {
      recommendedPlan = "advanced";
      recommendedSpend = 20;
      reason = `Downgrade to Gemini Advanced ($20/mo) for single-seat workspace accounts to save on administrative overhead.`;
      actionType = "downgrade";
    }

    const monthlySavings = Math.max(0, currentSpend - recommendedSpend);
    const annualSavings = monthlySavings * 12;

    breakdown.push({
      toolId,
      toolName: toolMeta.name,
      currentSpend,
      recommendedPlan,
      recommendedSeats,
      recommendedSpend,
      monthlySavings,
      annualSavings,
      reason,
      actionType
    });

    totalOptimizedSpend += recommendedSpend;
  }

  const totalMonthlySavings = Math.max(0, totalCurrentSpend - totalOptimizedSpend);
  const totalAnnualSavings = totalMonthlySavings * 12;

  // Determine savings tier
  let savingsTier: AuditSummary["savingsTier"] = "optimal";
  if (totalMonthlySavings > 500) {
    savingsTier = "high";
  } else if (totalMonthlySavings > 100) {
    savingsTier = "medium";
  } else if (totalMonthlySavings > 0) {
    savingsTier = "low";
  }

  // Use Credex Lead if savings are high (>$500/mo) or they have Credex discounts available
  const hasCredexDiscounts = breakdown.some(b => b.actionType === "credex_discount");
  const useCredexLead = totalMonthlySavings >= 500 || hasCredexDiscounts;

  return {
    totalCurrentSpend,
    totalOptimizedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    breakdown,
    savingsTier,
    useCredexLead
  };
}
