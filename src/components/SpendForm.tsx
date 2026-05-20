"use client";

import React, { useState, useEffect } from "react";
import { PRICING_DATA, ToolPricing } from "@/data/pricingData";
import { Calculator, ArrowRight, Settings, Users, Briefcase } from "lucide-react";

interface SpendFormProps {
  onAuditSubmit: (formData: {
    teamSize: number;
    primaryUseCase: string;
    tools: Record<string, { selectedPlan: string; seats: number; monthlySpend: number }>;
    website?: string;
  }) => void;
  isLoading: boolean;
}

export default function SpendForm({ onAuditSubmit, isLoading }: SpendFormProps) {
  // Metadata states
  const [teamSize, setTeamSize] = useState<number>(5);
  const [primaryUseCase, setPrimaryUseCase] = useState<string>("coding");

  // Tools states
  const [activeTools, setActiveTools] = useState<Record<string, boolean>>({
    cursor: true,
    copilot: true,
    claude: true,
    openai_api: false
  });

  const [toolInputs, setToolInputs] = useState<Record<string, { plan: string; seats: number; spend: number }>>({
    cursor: { plan: "pro", seats: 5, spend: 100 },
    copilot: { plan: "business", seats: 5, spend: 95 },
    claude: { plan: "team", seats: 5, spend: 125 },
    chatgpt: { plan: "plus", seats: 2, spend: 40 },
    anthropic_api: { plan: "direct", seats: 1, spend: 200 },
    openai_api: { plan: "direct", seats: 1, spend: 300 },
    gemini: { plan: "advanced", seats: 1, spend: 20 },
    windsurf: { plan: "pro", seats: 1, spend: 15 }
  });

  // Honeypot state for bot prevention
  const [websiteHoneypot, setWebsiteHoneypot] = useState<string>("");

  // Load from localstorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("credx_audit_form_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
        if (parsed.primaryUseCase) setPrimaryUseCase(parsed.primaryUseCase);
        if (parsed.activeTools) setActiveTools(parsed.activeTools);
        if (parsed.toolInputs) setToolInputs(parsed.toolInputs);
      }
    } catch (e) {
      console.error("Failed to load form state from localStorage:", e);
    }
  }, []);

  // Save to localstorage on change
  const saveFormState = (
    updatedTeamSize: number,
    updatedUseCase: string,
    updatedActiveTools: Record<string, boolean>,
    updatedInputs: Record<string, { plan: string; seats: number; spend: number }>
  ) => {
    try {
      localStorage.setItem("credx_audit_form_state", JSON.stringify({
        teamSize: updatedTeamSize,
        primaryUseCase: updatedUseCase,
        activeTools: updatedActiveTools,
        toolInputs: updatedInputs
      }));
    } catch (e) {
      console.error("Failed to save form state to localStorage:", e);
    }
  };

  const handleTeamSizeChange = (val: number) => {
    const size = Math.max(1, val);
    setTeamSize(size);
    
    // Auto-update seat counts for active tools if they match team size
    const updatedInputs = { ...toolInputs };
    Object.keys(updatedInputs).forEach(toolId => {
      // If tool seats was equal to old team size, or we want to align it
      // Let's only auto-adjust seats for non-api tools to match team size if they are active
      const toolMeta = PRICING_DATA[toolId];
      if (toolMeta && toolMeta.category !== "api") {
        updatedInputs[toolId].seats = size;
        
        // Auto-calculate spend
        const planId = updatedInputs[toolId].plan;
        const planMeta = toolMeta.plans[planId];
        if (planMeta) {
          if (planId === "team" && toolId === "claude") {
            updatedInputs[toolId].spend = Math.max(5, size) * planMeta.pricePerSeat;
          } else if (planId === "team" && toolId === "chatgpt") {
            updatedInputs[toolId].spend = Math.max(2, size) * planMeta.pricePerSeat;
          } else {
            updatedInputs[toolId].spend = size * planMeta.pricePerSeat;
          }
        }
      }
    });
    setToolInputs(updatedInputs);
    saveFormState(size, primaryUseCase, activeTools, updatedInputs);
  };

  const handleUseCaseChange = (val: string) => {
    setPrimaryUseCase(val);
    saveFormState(teamSize, val, activeTools, toolInputs);
  };

  const toggleTool = (toolId: string) => {
    const updatedActive = { ...activeTools, [toolId]: !activeTools[toolId] };
    setActiveTools(updatedActive);
    saveFormState(teamSize, primaryUseCase, updatedActive, toolInputs);
  };

  const handleToolInput = (toolId: string, field: "plan" | "seats" | "spend", value: string | number) => {
    const updatedInputs = { ...toolInputs };
    const currentInput = { ...updatedInputs[toolId] };

    if (field === "plan") {
      const planStr = typeof value === "string" ? value : String(value);
      currentInput.plan = planStr;
      const toolMeta = PRICING_DATA[toolId];
      const planMeta = toolMeta?.plans[planStr];
      
      // Auto-update price when plan changes
      if (planMeta) {
        if (toolMeta.category === "api") {
          // APIs don't have default seats pricing
        } else {
          // Adjust seats if plan requires a minimum
          if (value === "team" && toolId === "claude" && currentInput.seats < 5) {
            currentInput.seats = 5;
          } else if (value === "team" && toolId === "chatgpt" && currentInput.seats < 2) {
            currentInput.seats = 2;
          }
          currentInput.spend = currentInput.seats * planMeta.pricePerSeat;
        }
      }
    } else if (field === "seats") {
      const seatsVal = Math.max(1, typeof value === "number" ? Math.floor(value) : (parseInt(value) || 1));
      currentInput.seats = seatsVal;
      
      // Enforce minimum seats if needed
      const planId = currentInput.plan;
      const toolMeta = PRICING_DATA[toolId];
      const planMeta = toolMeta?.plans[planId];
      if (planMeta) {
        let calculatedSpend = seatsVal * planMeta.pricePerSeat;
        if (planId === "team" && toolId === "claude" && seatsVal < 5) {
          calculatedSpend = 125; // 5 * 25
        } else if (planId === "team" && toolId === "chatgpt" && seatsVal < 2) {
          calculatedSpend = 50; // 2 * 25
        }
        currentInput.spend = calculatedSpend;
      }
    } else if (field === "spend") {
      currentInput.spend = Math.max(0, typeof value === "number" ? value : (parseFloat(value) || 0));
    }

    updatedInputs[toolId] = currentInput;
    setToolInputs(updatedInputs);
    saveFormState(teamSize, primaryUseCase, activeTools, updatedInputs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare clean tools payload
    const submissionTools: Record<string, { selectedPlan: string; seats: number; monthlySpend: number }> = {};
    let activeCount = 0;

    Object.keys(activeTools).forEach(toolId => {
      if (activeTools[toolId]) {
        submissionTools[toolId] = {
          selectedPlan: toolInputs[toolId].plan,
          seats: toolInputs[toolId].seats,
          monthlySpend: toolInputs[toolId].spend
        };
        activeCount++;
      }
    });

    if (activeCount === 0) {
      alert("Please select at least one AI tool to audit.");
      return;
    }

    onAuditSubmit({
      teamSize,
      primaryUseCase,
      tools: submissionTools,
      website: websiteHoneypot // Honeypot field
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-8 no-print">
      {/* Honeypot field (hidden from users, bot protection) */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name="website"
          value={websiteHoneypot}
          onChange={(e) => setWebsiteHoneypot(e.target.value)}
          tabIndex={-1}
          placeholder="Do not fill this if you are human"
        />
      </div>

      {/* Meta Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Size */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <label htmlFor="teamSizeInput" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Team Size
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="teamSizeInput"
                type="number"
                min="1"
                required
                value={teamSize}
                onChange={(e) => handleTeamSizeChange(parseInt(e.target.value) || 1)}
                className="w-24 bg-zinc-800/80 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-white font-bold text-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
              />
              <span className="text-zinc-500 text-sm font-medium">members</span>
            </div>
          </div>
        </div>

        {/* Primary Use Case */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <label htmlFor="useCaseSelect" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Primary AI Use Case
            </label>
            <select
              id="useCaseSelect"
              value={primaryUseCase}
              onChange={(e) => handleUseCaseChange(e.target.value)}
              className="mt-1 w-full bg-zinc-800/80 border border-zinc-700/60 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="coding">Software Development & Coding</option>
              <option value="writing">Content Writing & Marketing</option>
              <option value="data">Data Analysis & Modeling</option>
              <option value="research">Academic & Market Research</option>
              <option value="mixed">General Mixed Workloads</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tool Selection Section */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Your AI Software Stack
          </h3>
          <p className="text-zinc-400 text-sm mt-1">
            Select the tools you are currently paying for and input your active plans and monthly costs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {Object.values(PRICING_DATA).map((tool: ToolPricing) => {
            const isActive = !!activeTools[tool.id];
            const inputs = toolInputs[tool.id];

            return (
              <div
                key={tool.id}
                className={`p-5 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "bg-zinc-800/40 border-indigo-500/50 shadow-md shadow-indigo-500/5"
                    : "bg-zinc-900/20 border-zinc-800/80 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Tool Checkbox & Name */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleTool(tool.id)}
                      className="w-5 h-5 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500 bg-zinc-900"
                    />
                    <div>
                      <span className="font-bold text-white text-lg block leading-tight">
                        {tool.name}
                      </span>
                      <span className="text-xs text-zinc-500 capitalize">
                        {tool.category.replace("-", " ")}
                      </span>
                    </div>
                  </label>

                  {/* Input settings (only show if checked) */}
                  {isActive && (
                    <div className="grid grid-cols-1 sm:flex items-center gap-4 flex-1 justify-end">
                      {/* Plan Dropdown */}
                      <div className="flex flex-col">
                        <label htmlFor={`plan-select-${tool.id}`} className="text-xxs font-bold text-zinc-500 uppercase tracking-wider mb-1">Plan</label>
                        <select
                          id={`plan-select-${tool.id}`}
                          value={inputs.plan}
                          onChange={(e) => handleToolInput(tool.id, "plan", e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 text-sm font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          {Object.entries(tool.plans).map(([planId, planMeta]) => (
                            <option key={planId} value={planId}>
                              {planMeta.name} {planMeta.pricePerSeat > 0 ? `($${planMeta.pricePerSeat}/mo)` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Seats input (hide for APIs) */}
                      {tool.category !== "api" && (
                        <div className="flex flex-col w-20">
                          <label htmlFor={`seats-input-${tool.id}`} className="text-xxs font-bold text-zinc-500 uppercase tracking-wider mb-1">Seats</label>
                          <input
                            id={`seats-input-${tool.id}`}
                            type="number"
                            min="1"
                            value={inputs.seats}
                            onChange={(e) => handleToolInput(tool.id, "seats", e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-center text-zinc-200 text-sm font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      )}

                      {/* Spend Input */}
                      <div className="flex flex-col w-28">
                        <label htmlFor={`spend-input-${tool.id}`} className="text-xxs font-bold text-zinc-500 uppercase tracking-wider mb-1">Monthly Spend</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-semibold">$</span>
                          <input
                            id={`spend-input-${tool.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={inputs.spend}
                            onChange={(e) => handleToolInput(tool.id, "spend", e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg pl-6 pr-2.5 py-1.5 text-right text-zinc-200 text-sm font-bold w-full focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Submission Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Auditing Spend...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              Audit Your Stack Now
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
