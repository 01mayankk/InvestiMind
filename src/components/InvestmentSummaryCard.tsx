"use client";

import React from "react";
import { ResearchResponse } from "../types/research";

interface InvestmentSummaryCardProps {
  report: ResearchResponse;
}

export default function InvestmentSummaryCard({ report }: InvestmentSummaryCardProps) {
  // Recommendation colors
  const getRecommendationColors = (rec: string) => {
    switch (rec) {
      case "STRONG INVEST":
        return "from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400";
      case "INVEST":
        return "from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-400";
      case "HOLD":
        return "from-cyan-50 to-sky-50 dark:from-cyan-500/10 dark:to-sky-500/10 border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-400";
      case "PASS":
        return "from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400";
      default:
        return "from-red-50 to-rose-50 dark:from-red-500/10 dark:to-rose-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-400";
    }
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 90) return "text-emerald-700 dark:text-emerald-400";
    if (reliability >= 75) return "text-green-700 dark:text-green-400";
    if (reliability >= 55) return "text-cyan-700 dark:text-cyan-400";
    if (reliability >= 35) return "text-amber-700 dark:text-amber-400";
    return "text-red-700 dark:text-red-400";
  };

  const getRiskColor = (score: number) => {
    if (score <= 20) return "text-emerald-700 dark:text-emerald-400";
    if (score <= 40) return "text-green-700 dark:text-green-400";
    if (score <= 60) return "text-cyan-700 dark:text-cyan-400";
    if (score <= 80) return "text-amber-700 dark:text-amber-400";
    return "text-red-700 dark:text-red-400";
  };

  const recColorClass = getRecommendationColors(report.recommendation);
  const deltaSign = report.industryComparisonDelta >= 0 ? "+" : "";

  return (
    <div className={`p-6 rounded-2xl border bg-gradient-to-br ${recColorClass} shadow-xl backdrop-blur-sm relative overflow-hidden`}>
      {/* Background Micro Glow */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-current opacity-5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-5 border-b border-slate-200/10 dark:border-slate-800/50">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {report.companyName}
          </h2>
          <div className="flex flex-wrap gap-2 items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{report.ticker}</span>
            <span>•</span>
            <span>{report.sector}</span>
            <span>•</span>
            <span className="font-mono text-slate-400 dark:text-slate-500">Report ID: {report.reportId}</span>
          </div>
        </div>

        {/* Dynamic Recommendation Badge */}
        <div className="flex flex-col md:items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Platform Decision
          </span>
          <span className="text-xl font-black tracking-wider uppercase mt-0.5">
            {report.recommendation}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Strength: {report.recommendationStrength}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Overall Score */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Overall score
          </span>
          <span className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1">
            {report.overallScore.toFixed(1)}<span className="text-sm font-semibold text-slate-400">/100</span>
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Delta: {deltaSign}{report.industryComparisonDelta.toFixed(1)} vs Bench
          </span>
        </div>

        {/* Confidence Score */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Confidence
          </span>
          <span className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1">
            {report.confidenceScore}<span className="text-sm font-semibold text-slate-400">/100</span>
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Category: {report.confidenceCategory}
          </span>
        </div>

        {/* Recommendation Reliability */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Reliability
          </span>
          <span className={`text-3xl font-black mt-1 ${getReliabilityColor(report.reliabilityScore)}`}>
            {report.reliabilityScore}<span className="text-sm font-semibold text-slate-400">/100</span>
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Category: {report.reliabilityCategory}
          </span>
        </div>

        {/* Risk Score */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Risk Profile
          </span>
          <span className={`text-3xl font-black mt-1 ${getRiskColor(report.riskScore)}`}>
            {report.riskScore.toFixed(1)}<span className="text-sm font-semibold text-slate-400">/100</span>
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Category: {report.riskCategory}
          </span>
        </div>
      </div>

      {/* Driver/Concern Footer Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-200/10 dark:border-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <div>
          <span className="text-slate-400">Top Positive Driver: </span>
          <span className="text-emerald-500 dark:text-emerald-400">{report.topPositiveDriver}</span>
        </div>
        <div>
          <span className="text-slate-400">Primary Concern: </span>
          <span className="text-rose-500 dark:text-rose-400">{report.topConcern}</span>
        </div>
        <div className="md:text-right">
          <span className="text-slate-400">Data Freshness: </span>
          <span className="text-slate-800 dark:text-slate-200">{report.dataFreshnessScore}% ({report.dataFreshnessCategory})</span>
        </div>
      </div>
    </div>
  );
}
