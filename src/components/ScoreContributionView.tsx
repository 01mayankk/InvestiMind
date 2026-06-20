"use client";

import React from "react";
import { TrendingUp, TrendingDown, Layers } from "lucide-react";
import { ResearchResponse } from "../types/research";
import { getBenchmarkForSector } from "../config/industryBenchmarks";

interface ScoreContributionProps {
  report: ResearchResponse;
}

export default function ScoreContributionView({ report }: ScoreContributionProps) {
  const { scoreBreakdown, financialData } = report;
  const benchmark = getBenchmarkForSector(financialData.sector);

  const items = [
    {
      name: "Revenue Growth",
      score: scoreBreakdown.revenueGrowthScore,
      max: 15,
      weight: "15%",
      contrib: ((scoreBreakdown.revenueGrowthScore / 100) * 100).toFixed(1) + "%",
      impact: scoreBreakdown.revenueGrowthScore >= 11 ? "Positive" : "Negative",
      companyRaw: financialData.revenueGrowth != null ? (financialData.revenueGrowth * 100).toFixed(1) + "%" : "N/A",
      industryRaw: (benchmark.revenueGrowthTarget * 100).toFixed(1) + "%",
      deltaRaw: financialData.revenueGrowth != null
        ? `${((financialData.revenueGrowth - benchmark.revenueGrowthTarget) * 100).toFixed(1)}%`
        : "N/A",
      reason: financialData.revenueGrowth != null && financialData.revenueGrowth >= benchmark.revenueGrowthTarget
        ? "Exceeds sector benchmark targets."
        : "Trails sector benchmark expectations.",
    },
    {
      name: "Profitability",
      score: scoreBreakdown.profitabilityScore,
      max: 15,
      weight: "15%",
      contrib: ((scoreBreakdown.profitabilityScore / 100) * 100).toFixed(1) + "%",
      impact: scoreBreakdown.profitabilityScore >= 11 ? "Positive" : "Negative",
      companyRaw: financialData.netProfitMargin != null ? (financialData.netProfitMargin * 100).toFixed(1) + "%" : "N/A",
      industryRaw: (benchmark.profitMarginTarget * 100).toFixed(1) + "%",
      deltaRaw: financialData.netProfitMargin != null
        ? `${((financialData.netProfitMargin - benchmark.profitMarginTarget) * 100).toFixed(1)}%`
        : "N/A",
      reason: financialData.netProfitMargin != null && financialData.netProfitMargin >= benchmark.profitMarginTarget
        ? "Net margin shows strong capital efficiency."
        : "Profit margins trail industry standards.",
    },
    {
      name: "Financial Health",
      score: scoreBreakdown.financialHealthScore,
      max: 15,
      weight: "15%",
      contrib: ((scoreBreakdown.financialHealthScore / 100) * 100).toFixed(1) + "%",
      impact: scoreBreakdown.financialHealthScore >= 11 ? "Positive" : "Negative",
      companyRaw: `CR: ${financialData.currentRatio || "N/A"}, D/E: ${financialData.debtToEquity || "N/A"}`,
      industryRaw: `CR: 2.0, D/E: ${benchmark.debtToEquityTarget}`,
      deltaRaw: "N/A",
      reason: financialData.debtToEquity != null && financialData.debtToEquity <= benchmark.debtToEquityTarget
        ? "Solvency risk remains low."
        : "Debt load exceeds typical sector standards.",
    },
    {
      name: "Valuation",
      score: scoreBreakdown.valuationScore,
      max: 10,
      weight: "10%",
      contrib: ((scoreBreakdown.valuationScore / 100) * 100).toFixed(1) + "%",
      impact: scoreBreakdown.valuationScore >= 7.5 ? "Positive" : "Negative",
      companyRaw: financialData.peRatio != null ? `${financialData.peRatio.toFixed(1)}x` : "N/A",
      industryRaw: `${benchmark.peTarget.toFixed(1)}x`,
      deltaRaw: financialData.peRatio != null ? `${(financialData.peRatio - benchmark.peTarget).toFixed(1)}x` : "N/A",
      reason: financialData.peRatio != null && financialData.peRatio <= benchmark.peTarget
        ? "Trading at a relative valuation discount."
        : "Trading at a premium valuation.",
    },
    {
      name: "Market Position",
      score: scoreBreakdown.marketPositionScore,
      max: 10,
      weight: "10%",
      contrib: ((scoreBreakdown.marketPositionScore / 100) * 100).toFixed(1) + "%",
      impact: scoreBreakdown.marketPositionScore >= 7.5 ? "Positive" : "Negative",
      companyRaw: financialData.grossMargin != null ? (financialData.grossMargin * 100).toFixed(1) + "%" : "N/A",
      industryRaw: (benchmark.grossMarginTarget * 100).toFixed(1) + "%",
      deltaRaw: financialData.grossMargin != null
        ? `${((financialData.grossMargin - benchmark.grossMarginTarget) * 100).toFixed(1)}%`
        : "N/A",
      reason: financialData.grossMargin != null && financialData.grossMargin >= benchmark.grossMarginTarget
        ? "Pricing power is well maintained."
        : "Gross margin trails sector benchmarks.",
    },
    {
      name: "News Sentiment",
      score: scoreBreakdown.newsSentimentScore,
      max: 15,
      weight: "15%",
      contrib: ((scoreBreakdown.newsSentimentScore / 100) * 100).toFixed(1) + "%",
      impact: scoreBreakdown.newsSentimentScore >= 11 ? "Positive" : "Negative",
      companyRaw: "Analyzed",
      industryRaw: "Neutral",
      deltaRaw: "N/A",
      reason: scoreBreakdown.newsSentimentScore >= 10
        ? "Media coverage shows favorable sentiment."
        : "Media mentions show cautious or negative sentiment.",
    },
    {
      name: "Business Risk",
      score: scoreBreakdown.businessRiskScore,
      max: 10,
      weight: "10%",
      contrib: ((scoreBreakdown.businessRiskScore / 100) * 100).toFixed(1) + "%",
      impact: scoreBreakdown.businessRiskScore >= 7.5 ? "Positive" : "Negative",
      companyRaw: financialData.beta != null ? financialData.beta.toFixed(2) : "N/A",
      industryRaw: "1.00",
      deltaRaw: financialData.beta != null ? (financialData.beta - 1.0).toFixed(2) : "N/A",
      reason: financialData.beta != null && financialData.beta <= 1.0
        ? "Market volatility exposure is low."
        : "Systematic market beta is elevated.",
    },
    {
      name: "Recent Events",
      score: scoreBreakdown.recentEventsScore,
      max: 10,
      weight: "10%",
      contrib: ((scoreBreakdown.recentEventsScore / 100) * 100).toFixed(1) + "%",
      impact: scoreBreakdown.recentEventsScore >= 7.5 ? "Positive" : "Negative",
      companyRaw: "Calculated",
      industryRaw: "Neutral",
      deltaRaw: "N/A",
      reason: scoreBreakdown.recentEventsScore >= 7.5
        ? "Solid momentum near 52-week highs."
        : "Momentum trails near 52-week support levels.",
    },
  ];

  // Resolve positive / negative driver panels
  const topPos = items.find((item) => item.name === report.topPositiveDriver) || items[0];
  const topNeg = items.find((item) => item.name === report.topConcern) || items[3];

  return (
    <div className="flex flex-col gap-6">
      {/* Table Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Score Breakdown Matrices
          </h3>
        </div>

        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
              <th className="py-2.5">Metric Component</th>
              <th className="py-2.5">Raw Data</th>
              <th className="py-2.5">Calculated Score</th>
              <th className="py-2.5">Weight</th>
              <th className="py-2.5">Contribution %</th>
              <th className="py-2.5">Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-700 dark:text-slate-300">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                <td className="py-3 font-semibold">{item.name}</td>
                <td className="py-3 font-mono">{item.companyRaw}</td>
                <td className="py-3 font-bold text-slate-950 dark:text-slate-50">
                  {item.score.toFixed(1)} <span className="font-normal text-slate-400">/ {item.max}</span>
                </td>
                <td className="py-3 font-medium text-slate-500">{item.weight}</td>
                <td className="py-3 font-bold text-slate-600 dark:text-slate-400">{item.contrib}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                    item.impact === "Positive"
                      ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-500 dark:text-rose-400"
                  }`}>
                    {item.impact}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Positive Driver Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Top Positive Driver</span>
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-slate-50 mt-1">
                {topPos.name}
              </h4>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-2xl font-black text-emerald-500">+{topPos.score.toFixed(1)}</span>
              <span className="text-[10px] font-bold text-slate-400">{topPos.contrib} of score</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div>
              <span className="font-semibold text-slate-400">Benchmark Target: </span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{topPos.industryRaw}</span>
            </div>
            {topPos.deltaRaw !== "N/A" && (
              <div>
                <span className="font-semibold text-slate-400">Difference: </span>
                <span className="font-mono text-emerald-500 font-bold">+{topPos.deltaRaw}</span>
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-400">Reason: </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{topPos.reason}</span>
            </div>
          </div>
        </div>

        {/* Top Concern Driver Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
                <TrendingDown className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Top Concern</span>
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-slate-50 mt-1">
                {topNeg.name}
              </h4>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-2xl font-black text-rose-500">
                -{(topNeg.max - topNeg.score).toFixed(1)}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{(topNeg.score / 100 * 100).toFixed(1)}% of score</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div>
              <span className="font-semibold text-slate-400">Benchmark Target: </span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{topNeg.industryRaw}</span>
            </div>
            {topNeg.deltaRaw !== "N/A" && (
              <div>
                <span className="font-semibold text-slate-400">Difference: </span>
                <span className="font-mono text-rose-500 font-bold">{topNeg.deltaRaw.startsWith("-") ? "" : "+"}{topNeg.deltaRaw}</span>
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-400">Reason: </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{topNeg.reason}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
