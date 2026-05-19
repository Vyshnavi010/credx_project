import { NextRequest, NextResponse } from "next/server";
import { runSpendAudit } from "@/utils/auditEngine";
import { saveAudit } from "@/utils/db";
import { sendAuditConfirmationEmail } from "@/utils/email";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Filter out timestamps older than the window
  const activeTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (activeTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Abuse Protection: Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 2. Abuse Protection: Honeypot Validation
    // A bot will usually fill out all fields including the invisible 'website' honeypot field.
    if (body.website) {
      return NextResponse.json(
        { error: "Spam detected." },
        { status: 400 }
      );
    }

    const { teamSize, primaryUseCase, tools, email, companyName, role } = body;

    // Validate request structure
    if (!teamSize || !primaryUseCase || !tools) {
      return NextResponse.json(
        { error: "Missing required fields (teamSize, primaryUseCase, tools)" },
        { status: 400 }
      );
    }

    // 3. Run server-side audit to verify values & prevent tampering
    const auditSummary = runSpendAudit({
      teamSize,
      primaryUseCase,
      tools
    });

    // 4. Save to Database
    const savedRecord = await saveAudit({
      team_size: teamSize,
      primary_use_case: primaryUseCase,
      tools_data: tools,
      total_current_spend: auditSummary.totalCurrentSpend,
      total_optimized_spend: auditSummary.totalOptimizedSpend,
      total_savings: auditSummary.totalMonthlySavings,
      audit_results: auditSummary.breakdown,
      email: email || undefined,
      company_name: companyName || undefined,
      role: role || undefined
    });

    // 5. Send Transactional Email if email captured
    if (email) {
      // Run async to not block client response
      sendAuditConfirmationEmail({
        to: email,
        auditId: savedRecord.id,
        savingsMonthly: auditSummary.totalMonthlySavings,
        savingsAnnual: auditSummary.totalAnnualSavings
      }).catch(err => console.error("Email send background task error:", err));
    }

    return NextResponse.json({
      success: true,
      auditId: savedRecord.id,
      summary: auditSummary
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("API Error in /api/audit:", err);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
