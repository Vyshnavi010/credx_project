"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const faqs: FAQItem[] = [
    {
      question: "Is my data safe? Do you require code repository access?",
      answer: "Yes, your data is 100% secure. Unlike other developer productivity tools, we do not require OAuth access to your GitHub or Cursor configurations, and we do not request read permissions to your private codebases. The audit runs entirely based on the high-level licensing details (seats, plans, and spend) you self-input."
    },
    {
      question: "How does the savings engine calculate optimizations?",
      answer: "The engine runs a deterministic, financial-grade logic matrix updated weekly with the latest vendor prices. It scans for: (1) Seat Inefficiencies: Downgrading to Pro plans when a Team tier minimum is not met (e.g., Claude Team requires 5 seats). (2) Redundant Overlaps: Standardizing on single editors (e.g., detecting if the same seat has both Cursor and GitHub Copilot licenses). (3) Volume Discount Opportunities: Transitioning direct, retail API spends to pooled Credex discounts."
    },
    {
      question: "What is Credex, and how is this tool free?",
      answer: "Credex sources bulk, discounted AI infrastructure credits (Cursor, Claude, OpenAI, ChatGPT Enterprise) from companies that overforecasted their needs or pivoted. We offer these credits to startups at substantial discounts. This tool is free because it serves as an educational and lead-generation portal for us: when we detect startups with high API or enterprise seat spends, we showcase Credex as the vehicle to capture more savings."
    },
    {
      question: "Can I share these results with my team or finance head?",
      answer: "Absolutely. Once your audit is calculated, you can input your email to unlock a unique public URL. This link strips out identifying details (like your company name or email address) for privacy, while preserving the tool breakdown and savings numbers so you can present it to your finance team. You can also export the report as a print-ready PDF."
    },
    {
      question: "How often are the pricing tiers updated?",
      answer: "We update our pricing databases weekly based on official vendor pricing pages (tracked in our public PRICING_DATA.md repository). We verify the costs for Cursor, Copilot, ChatGPT, Claude, and Gemini to ensure your report reflects the current market reality."
    }
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-4xl mx-auto py-16 px-4 no-print border-t border-zinc-800/80">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 text-indigo-400 border border-zinc-700/50 text-xs font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          Got Questions?
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
          Learn how our audit engine works, how we secure your data, and how Credex helps startups recapture wasted capital.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <div
              key={index}
              className="glass-panel rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
              >
                <span className="font-semibold text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-zinc-500 transition-transform duration-300 flex-shrink-0 ${
                    isOpen ? "rotate-180 text-indigo-400" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 text-zinc-400 leading-relaxed text-sm border-t border-zinc-800/40 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
