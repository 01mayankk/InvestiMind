"use client";

import React, { useState } from "react";
import { Download, RefreshCw, AlertTriangle, ShieldCheck, Cpu, ChevronDown, ChevronUp } from "lucide-react";
import { ResearchResponse } from "../types/research";
import InvestmentSummaryCard from "./InvestmentSummaryCard";
import ExecutiveSummary from "./ExecutiveSummary";
import ExplainabilityCenter from "./ExplainabilityCenter";
import InvestmentHealthReport from "./InvestmentHealthReport";
import ScoreContributionView from "./ScoreContributionView";
import MissingDataImpactCenter from "./MissingDataImpactCenter";
import ConfidenceBreakdownView from "./ConfidenceBreakdownView";
import DataFreshnessCenter from "./DataFreshnessCenter";
import TransparencyPanel from "./TransparencyPanel";
import ProviderHealthCenter from "./ProviderHealthCenter";
import NewsHighlights from "./NewsHighlights";

// Charts
import GaugeChart from "./Charts/GaugeChart";
import ScoreBarChart from "./Charts/ScoreBarChart";
import SentimentPieChart from "./Charts/SentimentPieChart";
import RadarComparisonChart from "./Charts/RadarComparisonChart";

import { exportDashboardToPDF } from "../lib/pdfExporter";

interface DashboardViewProps {
  report: ResearchResponse;
  onReset: () => void;
}

export default function DashboardView({ report, onReset }: DashboardViewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportDashboardToPDF(report.ticker);
    } catch {
      alert("Failed to export PDF report. Please verify connection.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto px-4 pb-16">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Analysis Complete • {report.companyName} ({report.ticker})
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-xl transition-all border border-slate-200 dark:border-slate-750/50 w-full sm:w-auto shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Analyze Another
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl transition-all w-full sm:w-auto shadow shadow-indigo-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? "Compiling Report..." : "Export A4 PDF"}
          </button>
        </div>
      </div>

      {/* 2. Missing Data Alert Banner */}
      {(report.missingDataImpact.newsMissing || report.missingDataImpact.financialsMissing) && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">
              Analysis Running with Degraded Inputs
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Some metrics or news coverage items could not be retrieved from active providers. Point deductions have been applied, and confidence values are reduced. Expand the Advanced logs below for impact reports.
            </p>
          </div>
        </div>
      )}

      {/* 3. Executive Dashboard Content Grid (Primary Executive View) */}
      <div className="space-y-8">
        {/* Row 1: Recommendation summary card (Hero section) */}
        <div className="hover-card-lift">
          <InvestmentSummaryCard report={report} />
        </div>

        {/* Row 2: Qualitative Executive Summary */}
        <ExecutiveSummary report={report} />

        {/* Row 3: Explainability Center (Top positive drivers & Concerns checklist) */}
        <ExplainabilityCenter report={report} />

        {/* Row 4: Visual Analytics / Gauges Panel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Visual Research Analytics
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-4">Overall Score</span>
              <GaugeChart score={report.overallScore} label="Overall Score" color="#4F46E5" />
            </div>
            <div className="flex flex-col items-center p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-4">Risk Rating</span>
              <GaugeChart score={report.riskScore} label="Risk Rating" color="#EF4444" />
            </div>
            <div className="flex flex-col items-center p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-4">News Sentiment Ratio</span>
              <SentimentPieChart news={report.newsData} />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest block mb-4">Sub-Components breakdown</span>
            <ScoreBarChart scoreBreakdown={report.scoreBreakdown} />
          </div>
        </div>

        {/* Row 5: News Highlights titles list */}
        <NewsHighlights news={report.newsData} />

        {/* Row 6: Qualitative Thesis & Bull/Bear Outlooks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Thesis */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-450 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              Investment Thesis
            </h4>
            <ul className="space-y-3">
              {report.aiAnalysis.thesis.map((pt, idx) => (
                <li key={idx} className="text-xs font-medium text-slate-600 dark:text-slate-350 leading-relaxed flex items-start gap-2">
                  <span className="text-emerald-500 font-bold text-sm mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Counter Thesis */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-450 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              Counter Thesis / Key Risks
            </h4>
            <ul className="space-y-3">
              {report.aiAnalysis.counterThesis.map((pt, idx) => (
                <li key={idx} className="text-xs font-medium text-slate-600 dark:text-slate-350 leading-relaxed flex items-start gap-2">
                  <span className="text-rose-500 font-bold text-sm mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bull / Bear Narratives Panel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300 space-y-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Bull Case Outlook</span>
            <p className="text-xs font-medium text-slate-650 dark:text-slate-350 leading-relaxed mt-1.5">
              {report.aiAnalysis.bullCase}
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Bear Case Outlook</span>
            <p className="text-xs font-medium text-slate-650 dark:text-slate-350 leading-relaxed mt-1.5">
              {report.aiAnalysis.bearCase}
            </p>
          </div>
        </div>

        {/* Row 7: Industry Comparison (Radar mapping & Benchmarks list) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InvestmentHealthReport report={report} />
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Sector Benchmark Comparison
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                Ratios are mapped compared to peer metrics for the **{report.sector}** sector. This limits wrong recommendations for asset-heavy or high-leverage entities.
              </p>
            </div>
            <div className="flex items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl h-[280px]">
              <RadarComparisonChart financials={report.financialData} />
            </div>
          </div>
        </div>

        {/* Row 8: Collapsible Advanced Analysis Accordion */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all duration-300">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="w-full flex justify-between items-center p-6 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-150">
                  Advanced Audit Log & System Trace
                </h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-semibold">
                  Detailed score calculations, data fresh index, API provider latencies, and governance transparency.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black tracking-wider text-indigo-650 dark:text-indigo-400">
              <span>{isAdvancedOpen ? "COLLAPSE AUDITS" : "EXPAND AUDITS"}</span>
              {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isAdvancedOpen && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-950/10 space-y-8 transition-all">
              {/* Score breakdown table */}
              <ScoreContributionView report={report} />

              {/* Missing data impact details */}
              <MissingDataImpactCenter report={report} />

              {/* Confidence breakdown & freshness values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ConfidenceBreakdownView report={report} />
                <DataFreshnessCenter report={report} />
              </div>

              {/* Provider Health index */}
              <ProviderHealthCenter report={report} />

              {/* Source & AI Governance transparency */}
              <TransparencyPanel report={report} />
            </div>
          )}
        </div>

        {/* Legal Disclaimer Row */}
        <div className="p-4 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
          DISCLAIMER: This analysis is for educational and research purposes only and should not be considered financial advice.
        </div>
      </div>

      {/* 4. HIDDEN HIGH-FIDELITY PDF LAYOUTS (A4 dimensions: 820px width x 1160px height) */}
      <div className="absolute left-[-9999px] top-[-9999px] space-y-8 select-none pointer-events-none">
        
        {/* PDF PAGE 1: EXECUTIVE SUMMARY & PRIMARY DECISION */}
        <div id="pdf-page-1" className="w-[820px] h-[1160px] p-8 bg-[#0B0F19] border border-slate-800 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-lg font-black tracking-wider text-indigo-400">INVESTIMIND AI</span>
              <span className="text-[10px] font-semibold text-slate-500">A4 EXECUTIVE REPORT</span>
            </div>
            <InvestmentSummaryCard report={report} />
            <ExecutiveSummary report={report} />
          </div>
          <div className="border-t border-slate-800 pt-4 text-[9px] text-slate-500 flex justify-between">
            <span>Report ID: {report.reportId}</span>
            <span>Page 1 of 5</span>
          </div>
        </div>

        {/* PDF PAGE 2: AI THESIS & RISK COMMENTARY */}
        <div id="pdf-page-2" className="w-[820px] h-[1160px] p-8 bg-[#0B0F19] border border-slate-800 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-sm font-bold text-indigo-400">ANALYSIS THESIS & NARRATIVES</span>
              <span className="text-[10px] font-semibold text-slate-500">{report.ticker}</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Thesis */}
              <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Investment Thesis</span>
                <ul className="space-y-3 mt-3 text-xs text-slate-300">
                  {report.aiAnalysis.thesis.map((pt, idx) => (
                    <li key={idx}>• {pt}</li>
                  ))}
                </ul>
              </div>

              {/* Counter Thesis */}
              <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Counter Thesis</span>
                <ul className="space-y-3 mt-3 text-xs text-slate-300">
                  {report.aiAnalysis.counterThesis.map((pt, idx) => (
                    <li key={idx}>• {pt}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-800 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Bull Case Outlook</span>
                <p className="text-xs text-slate-300 leading-relaxed mt-1.5">{report.aiAnalysis.bullCase}</p>
              </div>
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Bear Case Outlook</span>
                <p className="text-xs text-slate-300 leading-relaxed mt-1.5">{report.aiAnalysis.bearCase}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4 text-[9px] text-slate-500 flex justify-between">
            <span>Report ID: {report.reportId}</span>
            <span>Page 2 of 5</span>
          </div>
        </div>

        {/* PDF PAGE 3: DETAILED DECISION ENGINE & CONTRIBUTIONS */}
        <div id="pdf-page-3" className="w-[820px] h-[1160px] p-8 bg-[#0B0F19] border border-slate-800 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-sm font-bold text-indigo-400">DECISION ENGINE & TRACE DETAILS</span>
              <span className="text-[10px] font-semibold text-slate-500">DETERMINISTIC MATRIX</span>
            </div>
            <ScoreContributionView report={report} />
            <ExplainabilityCenter report={report} />
          </div>
          <div className="border-t border-slate-800 pt-4 text-[9px] text-slate-500 flex justify-between">
            <span>Report ID: {report.reportId}</span>
            <span>Page 3 of 5</span>
          </div>
        </div>

        {/* PDF PAGE 4: CHARTS & COMPARISONS */}
        <div id="pdf-page-4" className="w-[820px] h-[1160px] p-8 bg-[#0B0F19] border border-slate-800 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-sm font-bold text-indigo-400">VISUAL RATIO MAPPINGS</span>
              <span className="text-[10px] font-semibold text-slate-500">INDUSTRY COMPARISONS</span>
            </div>

            <div className="grid grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center p-4 bg-slate-900/30 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Investment Score Gauge</span>
                <GaugeChart score={report.overallScore} label="Overall Score" color="#4F46E5" />
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-900/30 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Benchmark Mapping</span>
                <RadarComparisonChart financials={report.financialData} />
              </div>
            </div>

            <InvestmentHealthReport report={report} />
          </div>
          <div className="border-t border-slate-800 pt-4 text-[9px] text-slate-500 flex justify-between">
            <span>Report ID: {report.reportId}</span>
            <span>Page 4 of 5</span>
          </div>
        </div>

        {/* PDF PAGE 5: AUDITING, TRANSPARENCY & DATA COMPLIANCE */}
        <div id="pdf-page-5" className="w-[820px] h-[1160px] p-8 bg-[#0B0F19] border border-slate-800 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-sm font-bold text-indigo-400">GOVERNANCE & SYSTEM AUDITING</span>
              <span className="text-[10px] font-semibold text-slate-500">TRANSPARENCY REPORT</span>
            </div>

            <TransparencyPanel report={report} />
            <ProviderHealthCenter report={report} />

            <div className="grid grid-cols-2 gap-6">
              <ConfidenceBreakdownView report={report} />
              <DataFreshnessCenter report={report} />
            </div>

            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-[10px] space-y-1 font-semibold text-slate-400">
              <span className="text-xs text-white uppercase block mb-1">Audit Metadata Log</span>
              <div>Report ID: {report.reportId}</div>
              <div>Generated Date: {report.timestamp}</div>
              <div>Ticker Lookup: {report.ticker} ({report.companyName})</div>
              <div>Version: 1.0.0 (Vercel Production Target)</div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4 text-[9px] text-slate-500 flex flex-col gap-2">
            <div className="text-[8px] text-slate-600 leading-normal text-center">
              DISCLAIMER: This analysis is for educational and research purposes only and should not be considered financial advice.
            </div>
            <div className="flex justify-between items-center">
              <span>Report ID: {report.reportId}</span>
              <span>Page 5 of 5</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
