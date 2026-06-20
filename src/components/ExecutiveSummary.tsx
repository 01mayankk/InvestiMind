"use client";

import React from "react";
import { Cpu } from "lucide-react";
import { ResearchResponse } from "../types/research";

interface ExecutiveSummaryProps {
  report: ResearchResponse;
}

export default function ExecutiveSummary({ report }: ExecutiveSummaryProps) {
  const summary = report.aiAnalysis.executiveSummary;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      {/* Dynamic Header */}
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Executive Summary
        </h3>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
          AI Generated
        </span>
      </div>

      {/* Main Paragraph */}
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
        {summary}
      </p>

      {/* Dynamic Warning if keys are missing */}
      {report.aiAnalysis.executiveSummary.includes("Gemini API key was not configured") && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-semibold text-amber-500 dark:text-amber-400">
          ⚠️ Environment Setup Required: The executive summary is showing fallback data. To enable live AI-driven analysis, configure the GEMINI_API_KEY environment variable.
        </div>
      )}
    </div>
  );
}
