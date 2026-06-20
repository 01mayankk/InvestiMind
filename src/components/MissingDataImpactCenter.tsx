"use client";

import React from "react";
import { AlertOctagon } from "lucide-react";
import { ResearchResponse } from "../types/research";

interface MissingDataImpactCenterProps {
  report: ResearchResponse;
}

export default function MissingDataImpactCenter({ report }: MissingDataImpactCenterProps) {
  const { missingDataImpact } = report;

  if (!missingDataImpact.newsMissing && !missingDataImpact.financialsMissing) {
    return null; // Return nothing if there is no missing data!
  }

  return (
    <div className="p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
        <AlertOctagon className="w-5 h-5" />
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Missing Data Impact Center
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* News Missing Warning */}
        {missingDataImpact.newsMissing && (
          <div className="p-4 bg-white/40 dark:bg-slate-900/60 border border-amber-500/20 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-800 dark:text-slate-200">News Coverage: UNAVAILABLE</span>
              <span className="text-rose-500">-12 Points</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 space-y-1">
              <div>
                <span className="font-semibold text-slate-400">Affected Sections: </span>
                <span className="font-mono">News Sentiment, Recent Events</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Reliability Impact: </span>
                <span className="text-amber-500 dark:text-amber-400 font-semibold">Risk Analysis Reliability Reduced</span>
              </div>
              <p className="mt-2 text-slate-500">
                The scoring engine has fallback rules that skip sentiment metrics. The final risk score remains mathematical but does not factor in current market sentiment.
              </p>
            </div>
          </div>
        )}

        {/* Financials Missing Warning */}
        {missingDataImpact.financialsMissing && (
          <div className="p-4 bg-white/40 dark:bg-slate-900/60 border border-amber-500/20 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-800 dark:text-slate-200">Financial Data: MISSING</span>
              <span className="text-rose-500">-25 Points</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 space-y-1">
              <div>
                <span className="font-semibold text-slate-400">Affected Sections: </span>
                <span className="font-mono">Financial Health, Valuation, Position</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Reliability Impact: </span>
                <span className="text-red-500 dark:text-red-400 font-semibold">Recommendation Reliability Reduced</span>
              </div>
              <p className="mt-2 text-slate-500">
                The scoring engine is missing fundamental balance sheet ratios. The investment decision default-flags to HOLD/PASS with minimal confidence scores.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
