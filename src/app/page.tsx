"use client";

import { useState } from "react";
import Link from "next/link";
import SpendForm from "@/components/SpendForm";
import AuditResultsView, { ToolAuditResult } from "@/components/AuditResultsView";
import FAQ from "@/components/FAQ";
import { Sparkles, BarChart2, ShieldCheck, Mail } from "lucide-react";

interface AuditViewData {
  team_size: number;
  primary_use_case: string;
  total_current_spend: number;
  total_optimized_spend: number;
  total_savings: number;
  audit_results: ToolAuditResult[];
  ai_summary?: string;
}

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [auditData, setAuditData] = useState<AuditViewData | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);

  const handleAuditSubmit = async (formData: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.summary && data.auditId) {
          setAuditId(data.auditId);
          setAuditData({
            team_size: Number(formData.teamSize),
            primary_use_case: String(formData.primaryUseCase),
            total_current_spend: data.summary.totalCurrentSpend,
            total_optimized_spend: data.summary.totalOptimizedSpend,
            total_savings: data.summary.totalMonthlySavings,
            audit_results: data.summary.breakdown,
            ai_summary: data.summary.ai_summary
          });
          // Scroll to top of results
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to calculate audit. Please try again.");
      }
    } catch (e) {
      console.error("Error submitting audit:", e);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setAuditData(null);
    setAuditId(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 font-sans text-zinc-100">
      {/* Header / Navbar */}
      <header className="border-b border-zinc-800/80 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-50 py-4 px-6 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/10">
              C
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">
              cred<span className="text-indigo-400">ex</span> spend.
            </span>
          </Link>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-zinc-400 hover:text-white px-3.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            Visit credex.rocks
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1">
        {auditData && auditId ? (
          <AuditResultsView
            auditId={auditId}
            initialData={auditData}
            onBackToEdit={handleBack}
          />
        ) : (
          <div className="space-y-16 py-12 md:py-20">
            {/* Hero Section */}
            <section className="max-w-5xl mx-auto text-center px-4 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Credex Audit Tool Release
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight max-w-3xl mx-auto">
                Stop Overpaying for <span className="gradient-text">AI Tools</span>. Audit Your Spend Instantly.
              </h1>
              
              <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                Calculate seat inefficiencies, double-billing, and plan mismatches across your team&apos;s developer tools in 60 seconds. Free, confidential, and instant.
              </p>

              {/* Brief Benefits Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-zinc-400 font-semibold">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  Instant Math
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  No OAuth / Safe
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  PDF Exportable
                </div>
              </div>
            </section>

            {/* Spend Auditor Form Section */}
            <section className="max-w-6xl mx-auto px-4">
              <div className="gradient-border max-w-4xl mx-auto">
                <div className="bg-zinc-950 p-1 rounded-2xl">
                  <SpendForm onAuditSubmit={handleAuditSubmit} isLoading={loading} />
                </div>
              </div>
            </section>

            {/* Social Proof Section */}
            <section className="max-w-4xl mx-auto px-4 py-8 text-center space-y-8">
              <div className="border-t border-zinc-800/80 pt-12">
                <h3 className="text-zinc-500 uppercase tracking-widest text-xs font-bold">
                  Trusted by finance and engineering teams at high-growth startups
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="glass-panel p-6 rounded-2xl text-left border border-zinc-800/50">
                    <p className="text-zinc-300 text-sm italic">
                      &quot;We thought our AI spend was optimized until we ran this audit. We standardized on Cursor and saved $340/month in duplicate Copilot seats in 5 minutes.&quot;
                    </p>
                    <span className="block text-zinc-500 text-xs font-bold uppercase mt-4">
                      — Sarah L., VP of Engineering at Voxel AI (Mocked)
                    </span>
                  </div>
                  <div className="glass-panel p-6 rounded-2xl text-left border border-zinc-800/50">
                    <p className="text-zinc-300 text-sm italic">
                      &quot;The Claude Team plan minimum seat warning saved us $105/month. This is the Mint.com for developer tools.&quot;
                    </p>
                    <span className="block text-zinc-500 text-xs font-bold uppercase mt-4">
                      — Alex K., CTO at Stealth SaaS (Mocked)
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Component */}
            <FAQ />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-8 px-6 text-center text-zinc-500 text-xs mt-12 no-print">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Credex Audit. Sourcing discounted AI infrastructure credits.</p>
          <div className="flex gap-4">
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300">
              credex.rocks
            </a>
            <span>•</span>
            <a href="/PRICING_DATA.md" target="_blank" className="hover:text-zinc-300">
              Pricing Data
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
