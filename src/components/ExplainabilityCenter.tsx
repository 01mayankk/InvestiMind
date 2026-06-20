"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { ResearchResponse } from "../types/research";

interface ExplainabilityCenterProps {
  report: ResearchResponse;
}

export default function ExplainabilityCenter({ report }: ExplainabilityCenterProps) {
  const { scoreBreakdown, missingDataImpact } = report;
  const { financialsMissing } = missingDataImpact;

  // Compute "Why Not Higher" (items with score < 75% of max weight) and "Why Not Lower" (items with score >= 75%)
  const factors = [
    { name: "Revenue Growth", score: scoreBreakdown.revenueGrowthScore, max: 15, desc: `YoY revenue growth is ${(report.financialData.revenueGrowth != null ? (report.financialData.revenueGrowth * 100).toFixed(1) + "%" : "N/A")}.` },
    { name: "Profitability", score: scoreBreakdown.profitabilityScore, max: 15, desc: `Net profit margin stands at ${(report.financialData.netProfitMargin != null ? (report.financialData.netProfitMargin * 100).toFixed(1) + "%" : "N/A")}.` },
    { name: "Financial Health", score: scoreBreakdown.financialHealthScore, max: 15, desc: `Current ratio is ${report.financialData.currentRatio || "N/A"} and Debt-to-Equity is ${report.financialData.debtToEquity || "N/A"}.` },
    { name: "Valuation", score: scoreBreakdown.valuationScore, max: 10, desc: `Trailing P/E ratio is ${report.financialData.peRatio || "N/A"}.` },
    { name: "Market Position", score: scoreBreakdown.marketPositionScore, max: 10, desc: `Gross profit margin is ${(report.financialData.grossMargin != null ? (report.financialData.grossMargin * 100).toFixed(1) + "%" : "N/A")}.` },
    { name: "News Sentiment", score: scoreBreakdown.newsSentimentScore, max: 15, desc: "Public news sentiment score is evaluated from recent media coverage." },
    { name: "Business Risk", score: scoreBreakdown.businessRiskScore, max: 10, desc: `Market beta index of volatility is ${report.financialData.beta || "N/A"}.` },
    { name: "Recent Events", score: scoreBreakdown.recentEventsScore, max: 10, desc: `Price relative to 52-week high/low range.` },
  ];

  const positiveDrivers = factors.filter((f) => (f.score / f.max) >= 0.75 && f.score > 0);
  const concernDrivers = factors.filter((f) => (f.score / f.max) < 0.75);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <HelpCircle className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Explainability Center
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why Not Lower? (Strengths) */}
        <div className="flex flex-col">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 mb-3">
            <CheckCircle2 className="w-4 h-4" /> Why Not Lower?
          </h4>
          {financialsMissing ? (
            <span className="text-xs text-slate-400">Financial data was unavailable to determine support levels.</span>
          ) : positiveDrivers.length === 0 ? (
            <span className="text-xs text-slate-400">No metrics significantly outperforming targets.</span>
          ) : (
            <ul className="space-y-2">
              {positiveDrivers.map((driver, idx) => (
                <li key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800/60 flex items-start justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{driver.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{driver.desc}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 px-2 py-0.5 rounded bg-emerald-500/10">
                    +{driver.score.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Why Not Higher? (Weaknesses) */}
        <div className="flex flex-col">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 mb-3">
            <AlertTriangle className="w-4 h-4" /> Why Not Higher?
          </h4>
          {financialsMissing ? (
            <span className="text-xs text-slate-400">Financial data was unavailable to determine drag factors.</span>
          ) : concernDrivers.length === 0 ? (
            <span className="text-xs text-slate-400">All metrics fully optimized to maximum score levels.</span>
          ) : (
            <ul className="space-y-2">
              {concernDrivers.map((driver, idx) => {
                const deduction = driver.max - driver.score;
                return (
                  <li key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800/60 flex items-start justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{driver.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{driver.desc}</span>
                    </div>
                    <span className="text-xs font-bold text-rose-500 px-2 py-0.5 rounded bg-rose-500/10">
                      -{deduction.toFixed(1)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
