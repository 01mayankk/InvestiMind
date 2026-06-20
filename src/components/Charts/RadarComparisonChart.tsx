"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { FinancialData } from "../../types/research";
import { getBenchmarkForSector } from "../../config/industryBenchmarks";

interface RadarComparisonChartProps {
  financials: FinancialData | null;
}

export default function RadarComparisonChart({ financials }: RadarComparisonChartProps) {
  if (!financials || financials.peRatio === null) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[240px] bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">Radar Chart Unavailable</span>
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">Financial metrics are required.</span>
      </div>
    );
  }

  const benchmark = getBenchmarkForSector(financials.sector);

  // Normalize metrics so they are plotted on a 0-100 scale where 100 means target fully met
  const normalizeGrowth = financials.revenueGrowth != null && benchmark.revenueGrowthTarget > 0
    ? Math.min(100, Math.max(0, (financials.revenueGrowth / benchmark.revenueGrowthTarget) * 100))
    : 0;

  const normalizeProfit = financials.netProfitMargin != null && benchmark.profitMarginTarget > 0
    ? Math.min(100, Math.max(0, (financials.netProfitMargin / benchmark.profitMarginTarget) * 100))
    : 0;

  const normalizeGross = financials.grossMargin != null && benchmark.grossMarginTarget > 0
    ? Math.min(100, Math.max(0, (financials.grossMargin / benchmark.grossMarginTarget) * 100))
    : 0;

  const normalizePE = financials.peRatio != null && financials.peRatio > 0 && benchmark.peTarget > 0
    ? Math.min(100, Math.max(10, (benchmark.peTarget / financials.peRatio) * 100))
    : 20; // Default lower if negative PE or unprofitable

  const normalizeDE = financials.debtToEquity != null && benchmark.debtToEquityTarget > 0
    ? Math.min(100, Math.max(0, (benchmark.debtToEquityTarget / financials.debtToEquity) * 100))
    : 50;

  const data = [
    { subject: "Rev Growth", Company: Math.round(normalizeGrowth), Industry: 80 },
    { subject: "Net Profit Margin", Company: Math.round(normalizeProfit), Industry: 80 },
    { subject: "Gross Margin", Company: Math.round(normalizeGross), Industry: 80 },
    { subject: "P/E Valuation", Company: Math.round(normalizePE), Industry: 80 },
    { subject: "Solvency (D/E)", Company: Math.round(normalizeDE), Industry: 80 },
  ];

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(148, 163, 184, 0.15)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 9 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={financials.ticker}
            dataKey="Company"
            stroke="#4F46E5"
            fill="#4F46E5"
            fillOpacity={0.25}
          />
          <Radar
            name="Sector Baseline"
            dataKey="Industry"
            stroke="#06B6D4"
            fill="#06B6D4"
            fillOpacity={0.1}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.15)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff", fontWeight: "bold", fontSize: 11 }}
            itemStyle={{ fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 10, fontWeight: "semibold", marginTop: 5 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
