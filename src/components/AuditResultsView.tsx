"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Download, Share2, Mail, Check, Copy, Sparkles, 
  TrendingDown, CheckCircle2, AlertTriangle, BadgeAlert, BookOpen
} from "lucide-react";
import confetti from "canvas-confetti";

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

interface AuditResultsViewProps {
  auditId: string;
  initialData: {
    team_size: number;
    primary_use_case: string;
    total_current_spend: number;
    total_optimized_spend: number;
    total_savings: number;
    audit_results: ToolAuditResult[];
    ai_summary?: string;
  };
  isPublicView?: boolean;
  onBackToEdit?: () => void;
}

export default function AuditResultsView({
  auditId,
  initialData,
  isPublicView = false,
  onBackToEdit
}: AuditResultsViewProps) {
  const [aiSummary, setAiSummary] = useState<string>(initialData.ai_summary || "");
  const [loadingSummary, setLoadingSummary] = useState<boolean>(!initialData.ai_summary);
  
  // Lead form states
  const [email, setEmail] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [leadSaved, setLeadSaved] = useState<boolean>(false);
  const [savingLead, setSavingLead] = useState<boolean>(false);

  // Copy share state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Confetti trigger on load if savings found
  useEffect(() => {
    if (initialData.total_savings > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#22d3ee", "#10b981"]
      });
    }
  }, [initialData.total_savings]);

  // Fetch AI summary in background if not present
  useEffect(() => {
    if (!initialData.ai_summary) {
      const fetchSummary = async () => {
        try {
          const res = await fetch("/api/audit/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ auditId })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.summary) {
              setAiSummary(data.summary);
            }
          }
        } catch (e) {
          console.error("Failed to load AI summary:", e);
        } finally {
          setLoadingSummary(false);
        }
      };
      fetchSummary();
    }
  }, [auditId, initialData.ai_summary]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSavingLead(true);

    try {
      // Re-submit the audit values along with the lead capture metadata
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamSize: initialData.team_size,
          primaryUseCase: initialData.primary_use_case,
          tools: initialData.audit_results.reduce<Record<string, { selectedPlan: string; seats: number; monthlySpend: number }>>((acc, curr) => {
            acc[curr.toolId] = {
              selectedPlan: curr.recommendedPlan === "none" ? "hobby" : curr.recommendedPlan,
              seats: curr.recommendedSeats || 1,
              monthlySpend: curr.currentSpend
            };
            return acc;
          }, {}),
          email,
          companyName,
          role
        })
      });

      if (res.ok) {
        setLeadSaved(true);
        confetti({
          particleCount: 40,
          spread: 40,
          origin: { y: 0.8 }
        });
      }
    } catch (e) {
      console.error("Failed to save lead info:", e);
    } finally {
      setSavingLead(false);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/audit/${auditId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const currentSpend = initialData.total_current_spend;
  const optimizedSpend = initialData.total_optimized_spend;
  const monthlySavings = initialData.total_savings;
  const annualSavings = monthlySavings * 12;
  const savingsPercent = currentSpend > 0 ? Math.round((monthlySavings / currentSpend) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 print-container">
      
      {/* Header controls (No print) */}
      <div className="flex items-center justify-between no-print">
        {onBackToEdit ? (
          <button
            onClick={onBackToEdit}
            className="flex items-center gap-2 text-zinc-400 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Spend Auditor
          </button>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-white font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Audit a New Stack
          </Link>
        )}

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg border border-zinc-700/50 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-semibold rounded-lg border border-indigo-500/30 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                Copied Link
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Header and Info (Print Layout supports) */}
      <div className="text-center md:text-left border-b border-zinc-800/80 pb-6">
        <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
          AI Spend Audit Report
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">
          Optimization Summary
        </h1>
        <p className="text-zinc-500 text-xs mt-2 font-mono">
          Audit ID: {auditId} • Computed for {initialData.team_size}-member team ({initialData.primary_use_case} use-case)
        </p>
      </div>

      {/* Giant Hero savings banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Savings */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between border-green-500/20 shadow-lg shadow-green-500/2">
          <div>
            <span className="text-zinc-400 font-semibold text-sm">Monthly Savings</span>
            <h2 className="text-4xl font-black text-green-400 mt-1">
              ${monthlySavings.toLocaleString()}
            </h2>
          </div>
          <p className="text-zinc-500 text-xs mt-4 border-t border-zinc-800/60 pt-3">
            Equivalent to {savingsPercent}% overall cost reduction
          </p>
          <TrendingDown className="absolute right-4 top-4 w-12 h-12 text-green-500/10 pointer-events-none" />
        </div>

        {/* Annual Savings */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between border-indigo-500/20 shadow-lg shadow-indigo-500/2">
          <div>
            <span className="text-zinc-400 font-semibold text-sm">Annualized Savings</span>
            <h2 className="text-4xl font-black text-indigo-400 mt-1">
              ${annualSavings.toLocaleString()}
            </h2>
          </div>
          <p className="text-zinc-500 text-xs mt-4 border-t border-zinc-800/60 pt-3">
            Wasted software capital recaptured
          </p>
          <TrendingDown className="absolute right-4 top-4 w-12 h-12 text-indigo-500/10 pointer-events-none" />
        </div>

        {/* Spend Comparison Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <span className="text-zinc-400 font-semibold text-sm mb-4">Spend Comparison</span>
          <div className="space-y-3">
            {/* Current Spend Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-400">
                <span>Current</span>
                <span>${currentSpend.toLocaleString()}/mo</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3.5 overflow-hidden">
                <div className="bg-red-500 h-full rounded-full transition-all duration-1000" style={{ width: "100%" }}></div>
              </div>
            </div>
            
            {/* Optimized Spend Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-400">
                <span>Optimized</span>
                <span>${optimizedSpend.toLocaleString()}/mo</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3.5 overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${currentSpend > 0 ? (optimizedSpend / currentSpend) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Card */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-indigo-500/15">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h3 className="font-bold text-white text-lg">AI Spend Analysis</h3>
        </div>
        {loadingSummary ? (
          <div className="space-y-2.5 animate-pulse pt-1">
            <div className="h-4 bg-zinc-800 rounded w-full"></div>
            <div className="h-4 bg-zinc-800 rounded w-[96%]"></div>
            <div className="h-4 bg-zinc-800 rounded w-[90%]"></div>
          </div>
        ) : (
          <p className="text-zinc-300 text-sm leading-relaxed font-medium">
            {aiSummary}
          </p>
        )}
      </div>

      {/* Breakdowns per tool */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white px-1">Detailed Breakdown</h3>
        <div className="grid grid-cols-1 gap-4">
          {initialData.audit_results.map((result) => {
            const hasSavings = result.monthlySavings > 0;
            return (
              <div
                key={result.toolId}
                className={`p-5 rounded-xl border transition-all duration-200 ${
                  hasSavings 
                    ? "bg-zinc-800/20 border-amber-500/20 hover:border-amber-500/40" 
                    : "bg-zinc-900/10 border-zinc-800/80"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Tool metadata & suggestion */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-lg">{result.toolName}</span>
                      {result.actionType === "standardize" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                          <BadgeAlert className="w-3.5 h-3.5" />
                          Double Paying
                        </span>
                      )}
                      {result.actionType === "downgrade" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Unoptimized Plan
                        </span>
                      )}
                      {result.actionType === "credex_discount" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                          <Sparkles className="w-3.5 h-3.5" />
                          Credex Discount Available
                        </span>
                      )}
                      {result.actionType === "no_change" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Optimal Spend
                        </span>
                      )}
                    </div>
                    
                    <p className="text-zinc-300 text-sm font-semibold pr-2 leading-relaxed">
                      {result.reason}
                    </p>
                  </div>

                  {/* Financial changes */}
                  <div className="flex md:flex-col justify-between md:justify-center md:items-end flex-shrink-0 border-t md:border-t-0 border-zinc-800/80 pt-3 md:pt-0">
                    <div className="text-zinc-400 text-xs">
                      Current Spend: <strong className="text-white">${result.currentSpend.toLocaleString()}/mo</strong>
                    </div>
                    {hasSavings ? (
                      <>
                        <div className="text-zinc-400 text-xs md:mt-1">
                          Recommended Spend: <strong className="text-green-400">${result.recommendedSpend.toLocaleString()}/mo</strong>
                        </div>
                        <div className="text-xs text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 mt-1 md:mt-2 self-start md:self-auto">
                          Save ${result.monthlySavings.toLocaleString()}/mo
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-zinc-500 font-bold mt-1">
                        Fully Optimized
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Capture and Share Block (No Print) */}
      {!isPublicView && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print pt-4 border-t border-zinc-800/60">
          {/* Lead capture form */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                Unlock Shareable Report Link
              </h3>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                Save your progress. We will email you the full report and notify you of any price updates or secondary market credits matching your tool stack.
              </p>
            </div>

            {leadSaved ? (
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl text-center text-indigo-300 font-semibold text-sm mt-4">
                <Check className="w-5 h-5 inline mr-1 text-indigo-400" /> Report Saved! Shareable link is unlocked.
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your business email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Your Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  {savingLead ? "Saving..." : "Save Audit Report"}
                </button>
              </form>
            )}
          </div>

          {/* Share link card */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                Share Confidential Audit
              </h3>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                This link allows anyone on your team or finance desk to view the savings breakdown, with all identifying company details and your email address automatically stripped.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 select-all overflow-hidden text-ellipsis whitespace-nowrap text-zinc-400 text-sm">
                {typeof window !== "undefined" ? `${window.location.origin}/audit/${auditId}` : `/audit/${auditId}`}
              </div>
              <button
                onClick={copyShareLink}
                className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg text-sm border border-zinc-700/50 transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copied Link!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link to Clipboard
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credex Highlight Lead Gen Area */}
      {monthlySavings >= 500 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border-2 border-amber-500/30 p-6 md:p-8 rounded-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Qualified for Credex Pooled Discounts
              </span>
              <h3 className="font-extrabold text-white text-xl md:text-2xl leading-snug">
                Capture up to 25-30% additional discount on your stack.
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                Because your monthly AI tooling and API spend exceeds $500/mo, you qualify to purchase enterprise licenses and direct API credits from our secondary discount pools.
              </p>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-sm transition-all duration-300 text-center shadow-lg shadow-amber-500/15 flex-shrink-0 cursor-pointer self-start md:self-auto no-print"
            >
              Book Credex Consultation
            </a>
          </div>
        </div>
      )}

      {/* Optimal Spend / Honest banner */}
      {monthlySavings === 0 && (
        <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-2xl text-center">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <h3 className="font-bold text-white text-lg">Your stack is fully optimized!</h3>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto mt-1 leading-relaxed">
            We checked for seat overlaps, minimum volume violations, and credit opportunities. You are spending efficiently. Subscribe to updates below to stay optimized when vendor prices change.
          </p>
        </div>
      )}
    </div>
  );
}
