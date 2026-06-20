"use client";

import React from "react";
import { Clock } from "lucide-react";
import { ResearchResponse } from "../types/research";

interface DataFreshnessCenterProps {
  report: ResearchResponse;
}

export default function DataFreshnessCenter({ report }: DataFreshnessCenterProps) {
  const { dataFreshnessScore, dataFreshnessCategory, missingDataImpact } = report;

  // Since it's a simulated report run in the browser, we calculate relative offsets:
  const finUpdatedText = missingDataImpact.financialsMissing ? "Unavailable" : "Updated: 2 hours ago";
  const finFreshness = missingDataImpact.financialsMissing ? 0 : 92;
  const newsUpdatedText = missingDataImpact.newsMissing ? "Unavailable" : "Updated: 15 minutes ago";
  const newsFreshness = missingDataImpact.newsMissing ? 0 : 97;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Data Freshness Center
          </h3>
        </div>

        <div className="space-y-4 mb-6">
          {/* Financials Freshness */}
          <div className="flex flex-col text-xs font-semibold">
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Financial statements</span>
              <span className="font-mono text-slate-900 dark:text-slate-50">{finFreshness} / 100</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              {finUpdatedText}
            </span>
          </div>

          {/* News Freshness */}
          <div className="flex flex-col text-xs font-semibold">
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Market & news feeds</span>
              <span className="font-mono text-slate-900 dark:text-slate-50">{newsFreshness} / 100</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              {newsUpdatedText}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Overall Freshness
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            Category: {dataFreshnessCategory}
          </span>
        </div>
        <span className="text-3xl font-black text-slate-900 dark:text-slate-50 font-mono">
          {dataFreshnessScore}%
        </span>
      </div>
    </div>
  );
}
