"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { ResearchResponse } from "../types/research";

interface ConfidenceBreakdownProps {
  report: ResearchResponse;
}

export default function ConfidenceBreakdownView({ report }: ConfidenceBreakdownProps) {
  const { dataQuality, confidenceScore, confidenceCategory, missingDataImpact } = report;

  const components = [
    { name: "Financial Data Coverage", value: dataQuality.financialCoverage, max: 100 },
    { name: "Recent News Coverage", value: dataQuality.newsCoverage, max: 100 },
    { name: "API Provider Reliability", value: dataQuality.providerReliability, max: 100 },
    { name: "Information Freshness", value: dataQuality.dataFreshness, max: 100 },
    { name: "Industry Benchmark Availability", value: dataQuality.industryCoverage, max: 100 },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Confidence & Quality metrics
          </h3>
        </div>

        <div className="space-y-3.5 mb-6">
          {components.map((c, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>{c.name}</span>
              <span className="font-mono text-slate-900 dark:text-slate-50">
                {c.value} <span className="text-slate-400 font-normal">/ {c.max}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Calculated Confidence
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            Category: {confidenceCategory}
          </span>
          {missingDataImpact.confidenceImpact > 0 && (
            <span className="text-[10px] font-semibold text-rose-500 mt-0.5">
              Penalized: -{missingDataImpact.confidenceImpact} pts (Missing Data)
            </span>
          )}
        </div>
        <span className="text-3xl font-black text-slate-900 dark:text-slate-50 font-mono">
          {confidenceScore}
        </span>
      </div>
    </div>
  );
}
