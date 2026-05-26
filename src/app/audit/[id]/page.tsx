import { getAudit } from "@/utils/db";
import AuditResultsView from "@/components/AuditResultsView";
import { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AuditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AuditPageProps): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) {
    return {
      title: "Audit Report Not Found | Credex",
      description: "This spend audit report could not be found or has expired."
    };
  }

  const savings = audit.total_savings || 0;
  const teamSize = audit.team_size || 1;
  const title = `AI Tool Spend Audit: Save $${savings.toLocaleString()}/mo | Credex`;
  const description = `This team of ${teamSize} discovered $${savings.toLocaleString()}/mo ($${(savings * 12).toLocaleString()}/yr) in potential savings across Cursor, Claude, ChatGPT, and APIs. View the breakdown.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `/api/og?savings=${savings}&team=${teamSize}`, // Optional dynamic image generator
          width: 1200,
          height: 630,
          alt: "AI Spend Audit Chart"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function AuditPage({ params }: AuditPageProps) {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-white min-h-[70vh] px-4 text-center">
        <h1 className="text-3xl font-black mb-2">Audit Report Not Found</h1>
        <p className="text-zinc-400 text-sm max-w-md">
          The requested audit report ID does not exist or may have been deleted.
        </p>
        <Link
          href="/"
          className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-all"
        >
          Run a New Audit
        </Link>
      </div>
    );
  }

  // Strip private user data for rendering public view
  const publicData = {
    team_size: audit.team_size,
    primary_use_case: audit.primary_use_case,
    total_current_spend: audit.total_current_spend,
    total_optimized_spend: audit.total_optimized_spend,
    total_savings: audit.total_savings,
    audit_results: audit.audit_results,
    ai_summary: audit.ai_summary
  };

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100 min-h-screen py-10">
      {/* Brand logo link */}
      <div className="max-w-4xl mx-auto px-4 mb-4 flex items-center justify-between no-print">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/10">
            C
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">
            cred<span className="text-indigo-400">ex</span> spend.
          </span>
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-xxs font-bold text-indigo-400 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          Public Share Link
        </div>
      </div>

      <AuditResultsView
        auditId={id}
        initialData={publicData}
        isPublicView={true}
      />
    </div>
  );
}
