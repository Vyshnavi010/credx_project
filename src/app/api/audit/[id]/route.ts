import { NextRequest, NextResponse } from "next/server";
import { getAudit } from "@/utils/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Audit ID is required" },
        { status: 400 }
      );
    }

    const audit = await getAudit(id);

    if (!audit) {
      return NextResponse.json(
        { error: "Audit report not found" },
        { status: 404 }
      );
    }

    // Strip private user data for public shareable link
    const publicAudit = {
      id: audit.id,
      created_at: audit.created_at,
      team_size: audit.team_size,
      primary_use_case: audit.primary_use_case,
      tools_data: audit.tools_data,
      total_current_spend: audit.total_current_spend,
      total_optimized_spend: audit.total_optimized_spend,
      total_savings: audit.total_savings,
      audit_results: audit.audit_results,
      ai_summary: audit.ai_summary
    };

    return NextResponse.json(publicAudit);

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`API Error in /api/audit/[id]:`, errorMsg);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
