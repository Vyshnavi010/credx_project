import { test } from "node:test";
import assert from "node:assert/strict";
import { runSpendAudit, AuditInput } from "../utils/auditEngine";

test("Audit Engine - Double paying for editor tools (Cursor + Copilot)", () => {
  const input: AuditInput = {
    teamSize: 5,
    primaryUseCase: "coding",
    tools: {
      cursor: {
        selectedPlan: "pro",
        seats: 5,
        monthlySpend: 100
      },
      copilot: {
        selectedPlan: "business",
        seats: 5,
        monthlySpend: 95
      }
    }
  };

  const result = runSpendAudit(input);
  
  // Verify current spend is sum of both (100 + 95 = 195)
  assert.equal(result.totalCurrentSpend, 195);
  
  // Copilot should be flagged to cancel (recommendedSpend = 0)
  const copilotAudit = result.breakdown.find(b => b.toolId === "copilot");
  assert.ok(copilotAudit);
  assert.equal(copilotAudit.recommendedSpend, 0);
  assert.equal(copilotAudit.actionType, "standardize");
  
  // Cursor should be kept
  const cursorAudit = result.breakdown.find(b => b.toolId === "cursor");
  assert.ok(cursorAudit);
  assert.equal(cursorAudit.recommendedSpend, 100);
  
  // Total monthly savings should be 95
  assert.equal(result.totalMonthlySavings, 95);
  assert.equal(result.totalAnnualSavings, 95 * 12);
});

test("Audit Engine - Claude Team 5-seat minimum violation", () => {
  const input: AuditInput = {
    teamSize: 2,
    primaryUseCase: "mixed",
    tools: {
      claude: {
        selectedPlan: "team",
        seats: 2,
        monthlySpend: 125 // they are paying the minimum 5-seat pricing
      }
    }
  };

  const result = runSpendAudit(input);

  // Claude Team minimum seat cost is $125.
  // Recommended is downgrade to Pro: 2 seats * $20 = $40.
  const claudeAudit = result.breakdown.find(b => b.toolId === "claude");
  assert.ok(claudeAudit);
  assert.equal(claudeAudit.recommendedPlan, "pro");
  assert.equal(claudeAudit.recommendedSpend, 40);
  assert.equal(claudeAudit.monthlySavings, 85);
  assert.equal(claudeAudit.actionType, "downgrade");
});

test("Audit Engine - ChatGPT Team 2-seat minimum violation for single user", () => {
  const input: AuditInput = {
    teamSize: 1,
    primaryUseCase: "writing",
    tools: {
      chatgpt: {
        selectedPlan: "team",
        seats: 1,
        monthlySpend: 50 // minimum 2-seat price on Team
      }
    }
  };

  const result = runSpendAudit(input);

  const chatgptAudit = result.breakdown.find(b => b.toolId === "chatgpt");
  assert.ok(chatgptAudit);
  assert.equal(chatgptAudit.recommendedPlan, "plus");
  assert.equal(chatgptAudit.recommendedSpend, 20);
  assert.equal(chatgptAudit.monthlySavings, 30);
  assert.equal(chatgptAudit.actionType, "downgrade");
});

test("Audit Engine - High API spend discount via Credex", () => {
  const input: AuditInput = {
    teamSize: 10,
    primaryUseCase: "coding",
    tools: {
      openai_api: {
        selectedPlan: "direct",
        seats: 1,
        monthlySpend: 800
      }
    }
  };

  const result = runSpendAudit(input);

  // Credex API direct discount is 25% (800 * 0.25 = 200 savings)
  const apiAudit = result.breakdown.find(b => b.toolId === "openai_api");
  assert.ok(apiAudit);
  assert.equal(apiAudit.recommendedSpend, 600);
  assert.equal(apiAudit.monthlySavings, 200);
  assert.equal(apiAudit.actionType, "credex_discount");
  assert.equal(result.useCredexLead, true);
});

test("Audit Engine - No changes for already optimized stack", () => {
  const input: AuditInput = {
    teamSize: 1,
    primaryUseCase: "mixed",
    tools: {
      cursor: {
        selectedPlan: "pro",
        seats: 1,
        monthlySpend: 20
      }
    }
  };

  const result = runSpendAudit(input);

  assert.equal(result.totalMonthlySavings, 0);
  assert.equal(result.savingsTier, "optimal");
  assert.equal(result.useCredexLead, false);
});
