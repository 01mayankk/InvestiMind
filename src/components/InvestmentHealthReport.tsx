"use client";

import React from "react";
import { Activity } from "lucide-react";
import { ResearchResponse } from "../types/research";
import { getBenchmarkForSector } from "../config/industryBenchmarks";

interface InvestmentHealthReportProps {
  report: ResearchResponse;
}

export default function InvestmentHealthReport({ report }: InvestmentHealthReportProps) {
  const { financialData, scoreBreakdown } = report;
  const benchmark = getBenchmarkForSector(financialData.sector);

  const healthMetrics = [
    {
      label: "Financial Strength",
      companyValue: Math.round((scoreBreakdown.totalFinancialScore / 65) * 100),
      industryValue: 80, // Default baseline target
      unit: "/100",
      formatter: (v: number) => `${v}/100`,
    },
    {
      label: "Profitability (Net Margin)",
      companyValue: financialData.netProfitMargin != null ? Math.round(financialData.netProfitMargin * 1000) / 10 : 0,
      industryValue: Math.round(benchmark.profitMarginTarget * 1000) / 10,
      unit: "%",
      formatter: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      label: "Valuation (P/E Ratio)",
      companyValue: financialData.peRatio != null ? Math.round(financialData.peRatio * 10) / 10 : 0,
      industryValue: benchmark.peTarget,
      unit: "x",
      formatter: (v: number) => `${v.toFixed(1)}x`,
      inverse: true, // Lower PE is better
    },
    {
      label: "Market Position (Gross Margin)",
      companyValue: financialData.grossMargin != null ? Math.round(financialData.grossMargin * 1000) / 10 : 0,
      industryValue: Math.round(benchmark.grossMarginTarget * 1000) / 10,
      unit: "%",
      formatter: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      label: "Risk Profile Score",
      companyValue: Math.round(scoreBreakdown.riskScore),
      industryValue: 40, // Standard neutral risk profile baseline
      unit: "/100",
      formatter: (v: number) => `${v}/100`,
      inverse: true, // Lower Risk Score is better
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Investment Health Report
        </h3>
      </div>

      <div className="space-y-6">
        {healthMetrics.map((metric, idx) => {
          const isBetter = metric.inverse
            ? metric.companyValue <= metric.industryValue
            : metric.companyValue >= metric.industryValue;

          // Normalize for slider visual range (0 to 100)
          // For PE, cap max scale at 60x for display safety
          const maxVal = metric.inverse && metric.label.includes("P/E") ? Math.max(metric.companyValue, metric.industryValue, 40) : Math.max(metric.companyValue, metric.industryValue, 100);
          const compPercent = Math.min(100, Math.max(0, (metric.companyValue / maxVal) * 100));
          const indPercent = Math.min(100, Math.max(0, (metric.industryValue / maxVal) * 100));

          return (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-slate-700 dark:text-slate-300">{metric.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-950 dark:text-slate-50">
                    {metric.formatter(metric.companyValue)}
                  </span>
                  <span className="text-slate-400 font-normal">vs</span>
                  <span className="text-slate-500">
                    {metric.formatter(metric.industryValue)} (Bench)
                  </span>
                </div>
              </div>

              {/* Slider Track */}
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden">
                {/* Company value bar */}
                <div
                  className={`h-full rounded-full transition-all ${
                    isBetter ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${compPercent}%` }}
                />
                {/* Industry Benchmark indicator pin */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-cyan-400 dark:bg-cyan-300 shadow"
                  style={{ left: `${indPercent}%` }}
                  title="Industry Benchmark Target"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
