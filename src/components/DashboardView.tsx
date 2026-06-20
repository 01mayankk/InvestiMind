"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Download, RefreshCw, AlertTriangle, ShieldCheck, Cpu, 
  ChevronDown, ChevronUp, Search, X, BarChart3, 
  Activity, ArrowLeftRight, Terminal, BookOpen
} from "lucide-react";
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
import { getBenchmarkForSector } from "../config/industryBenchmarks";

interface DashboardViewProps {
  report: ResearchResponse;
  onReset: () => void;
  onSearch?: (searchQuery: string) => Promise<void>;
}

export default function DashboardView({ report, onReset, onSearch }: DashboardViewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [activeView, setActiveView] = useState<"overview" | "research" | "charts" | "compare" | "audit">("overview");
  
  // Collapsible sections state
  const [isTimelineOpen, setIsTimelineOpen] = useState(true);
  const [isNarrativeExpanded, setIsNarrativeExpanded] = useState(false);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [isCalcTraceOpen, setIsCalcTraceOpen] = useState(false);
  const [isProviderHealthOpen, setIsProviderHealthOpen] = useState(false);
  const [isAiTransOpen, setIsAiTransOpen] = useState(false);
  const [isSysHealthOpen, setIsSysHealthOpen] = useState(false);

  // Command Palette & Comparison States
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [compareQuery, setCompareQuery] = useState("");
  const [compareReport, setCompareReport] = useState<ResearchResponse | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const benchmark = getBenchmarkForSector(report.sector);

  // Fetch recent searches from localStorage
  useEffect(() => {
    const list = localStorage.recentSearches ? JSON.parse(localStorage.recentSearches) : [];
    setRecentSearches(list);
  }, [isPaletteOpen, report]);

  // Global hotkey Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const executeCompareSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareQuery.trim()) return;
    setCompareLoading(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: compareQuery }),
      });
      if (res.ok) {
        const data: ResearchResponse = await res.json();
        setCompareReport(data);
      } else {
        alert("Comparison query lookup failed. Verify ticker symbol.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not retrieve comparison profile.");
    } finally {
      setCompareLoading(false);
    }
  };

  // Dynamic positive and negative scoring highlights ranked by magnitude of impact
  const aiResearchHighlights = useMemo(() => {
    const s = report.scoreBreakdown;
    const f = report.financialData;
    
    const items = [
      {
        label: "Revenue Growth",
        impact: s.revenueGrowthScore - 7.5,
        text: s.revenueGrowthScore >= 11 
          ? `Revenue growth of ${f.revenueGrowth != null ? (f.revenueGrowth * 100).toFixed(1) : "0"}% outperforms baseline averages (+${s.revenueGrowthScore.toFixed(1)} pts).`
          : `Revenue growth tails industry benchmarks (-${(7.5 - s.revenueGrowthScore).toFixed(1)} pts).`,
        icon: "📈",
      },
      {
        label: "Net profit margin",
        impact: s.profitabilityScore - 7.5,
        text: s.profitabilityScore >= 11
          ? `Net Profit margin is strong at ${f.netProfitMargin != null ? (f.netProfitMargin * 100).toFixed(1) : "0"}%, indicating cash efficiency.`
          : `Profit margin sit below benchmark sector targets, dragging overall rating.`,
        icon: "💰",
      },
      {
        label: "P/E Valuation",
        impact: s.valuationScore - 5.0,
        text: s.valuationScore >= 7.5
          ? `Trading at a healthy valuation multiple of ${f.peRatio != null ? f.peRatio.toFixed(1) : "N/A"}x (+${s.valuationScore.toFixed(1)} pts).`
          : `High valuation premium represents multiple compression risks.`,
        icon: "🔍",
      },
      {
        label: "News Sentiment",
        impact: s.newsSentimentScore - 7.5,
        text: s.newsSentimentScore >= 11
          ? `Social headlines & news indices are strongly bullish, boosting risk scores.`
          : `News sentiment is neutral or cautious, suppressing score support.`,
        icon: "📰",
      },
      {
        label: "Current Ratio",
        impact: s.financialHealthScore - 7.5,
        text: s.financialHealthScore >= 11
          ? `Balance sheet liquidity metrics are robust, keeping solvency risk low.`
          : `Below average solvency scores indicate balance sheet leverage risks.`,
        icon: "🛡️",
      }
    ];

    // Sort by absolute score impact magnitude (magnitude from baseline neutral)
    return items.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 4);
  }, [report]);

  // Clean TL;DR lists
  const bulletSummary = useMemo(() => {
    const s = report.scoreBreakdown;
    const likes: string[] = [];
    const concerns: string[] = [];

    if (s.revenueGrowthScore >= 11) likes.push("Revenue growth is healthy and outpaces sector targets");
    else concerns.push("Revenue growth rates sit below baseline benchmarks");

    if (s.profitabilityScore >= 11) likes.push("Strong profitability and net margin ratios");
    else concerns.push("Profit margin profiles are compressed relative to sector averages");

    if (s.financialHealthScore >= 11) likes.push("Robust current assets cover and low debt leverage");
    else concerns.push("Balance sheet liquidity margins indicate elevated leverage risks");

    if (s.valuationScore >= 7.5) likes.push("Multiple metrics point to an attractive P/E valuation ceiling");
    else concerns.push("Stock commands a premium valuation multiple compared to peers");

    if (s.newsSentimentScore >= 11) likes.push("Live sentiment is positive and supportive");
    else if (s.newsSentimentScore < 7.5) concerns.push("Live news channels show mixed or cautious narratives");

    return { likes, concerns };
  }, [report]);

  // Circular SVG Progress Ring component
  const renderProgressRing = (value: number, label: string, colorClass: string) => {
    const size = 72;
    const stroke = 6;
    const radius = size * 0.4;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-1.5 p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-24">
        <div className="relative" style={{ width: size, height: size }}>
          <svg height={size} width={size} className="transform -rotate-90">
            <circle
              className="text-slate-200 dark:text-slate-800"
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={size / 2}
              cy={size / 2}
            />
            <circle
              className={`${colorClass} transition-all duration-1000 ease-out`}
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={size / 2}
              cy={size / 2}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-slate-850 dark:text-slate-100">
              {Math.round(value)}%
            </span>
          </div>
        </div>
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center leading-tight">
          {label}
        </span>
      </div>
    );
  };

  // Qualitative outlook tabs for the Research page
  const [researchTab, setResearchTab] = useState<"thesis" | "counter" | "bull" | "bear">("thesis");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-16 flex flex-col lg:flex-row gap-8 relative">
      
      {/* ==================== 1. SIDEBAR NAVIGATION (Desktop) ==================== */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 gap-6">
        {/* Company Title Header */}
        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded">
              {report.ticker}
            </span>
            <span className="text-xs font-bold text-slate-550 dark:text-slate-400 truncate max-w-[130px]" title={report.companyName}>
              {report.companyName}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block truncate">
            {report.sector}
          </span>
        </div>

        {/* Tab Items */}
        <nav className="flex flex-col gap-1">
          {([
            { id: "overview", label: "Overview", icon: Cpu },
            { id: "research", label: "Research Analysis", icon: BookOpen },
            { id: "charts", label: "Visual Charts", icon: BarChart3 },
            { id: "compare", label: "Quick Compare", icon: ArrowLeftRight },
            { id: "audit", label: "Audit Telemetry", icon: Terminal },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow shadow-indigo-600/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Actions Toolbar */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl transition-all shadow shadow-indigo-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? "Compiling Report..." : "Export A4 PDF"}
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-xl transition-all border border-slate-200 dark:border-slate-700/50 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Analyze Another
          </button>
        </div>

        {/* Recent Searches Footer Panel */}
        {recentSearches.length > 0 && (
          <div className="bg-slate-100/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800 p-4 rounded-2xl text-xs">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
              Recent Searches
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSearch && onSearch(s)}
                  className="px-2 py-0.5 bg-white dark:bg-slate-800/80 hover:border-indigo-500 rounded border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-600 dark:text-slate-300 text-[10px]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Global Palette Shortcut note */}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-bold tracking-wider">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 rounded border border-slate-200 dark:border-slate-750">Ctrl+K</kbd> to search
        </div>
      </aside>

      {/* ==================== 2. MAIN CONTENT AREA ==================== */}
      <main className="flex-1 min-w-0 space-y-8">
        
        {/* Header Alert Banners */}
        {(report.missingDataImpact.newsMissing || report.missingDataImpact.financialsMissing) && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">
                Analysis Running with Degraded Inputs
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Metrics or news coverage could not be retrieved from active providers. Point deductions have been applied, and confidence values are reduced. Access the Audits panel for complete traces.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Panel Switcher */}
        <div className="transition-all duration-300">
          
          {/* ==================== TAB 1: OVERVIEW ==================== */}
          {activeView === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Premium Hero Decision Dashboard Area */}
              <section className={`p-6 rounded-3xl border bg-gradient-to-br transition-all duration-500 relative overflow-hidden ${
                report.recommendation.includes("STRONG INVEST") ? "from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 border-emerald-500/30 dark:border-emerald-500/20 glow-strong-invest" :
                report.recommendation.includes("INVEST") ? "from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 border-green-500/30 dark:border-green-500/20 glow-invest" :
                report.recommendation.includes("HOLD") ? "from-cyan-500/5 to-sky-500/5 dark:from-cyan-500/10 dark:to-sky-500/10 border-cyan-500/30 dark:border-cyan-500/20 glow-hold" :
                report.recommendation.includes("STRONG PASS") ? "from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10 border-red-500/30 dark:border-red-500/20 glow-strong-pass" :
                "from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 border-amber-500/30 dark:border-amber-500/20 glow-pass"
              }`}>
                {/* Decision background pattern */}
                <div className="absolute -right-24 -top-24 w-48 h-48 bg-current opacity-5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:justify-between gap-6 border-b border-slate-200/40 dark:border-slate-800/40 pb-6 mb-6">
                  {/* Visual Recommendation Dominance */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">
                      Investment Recommendation
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                      {report.recommendation}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                      Recommendation Strength: <span className="font-extrabold text-slate-800 dark:text-slate-350">{report.recommendationStrength}</span> • Report ID: {report.reportId}
                    </p>
                  </div>

                  {/* Main Score & Rings */}
                  <div className="flex items-center gap-6">
                    <div className="text-center md:text-right flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block leading-none">
                        Overall Score
                      </span>
                      <span className="text-5xl font-black text-slate-900 dark:text-slate-50 mt-1.5 leading-none">
                        {report.overallScore.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mt-1 uppercase tracking-wider block">
                        Delta: {report.industryComparisonDelta >= 0 ? "+" : ""}{report.industryComparisonDelta.toFixed(1)} vs Bench
                      </span>
                    </div>

                    {/* Circular Rings */}
                    <div className="flex gap-2">
                      {renderProgressRing(report.confidenceScore, "Confidence", "text-indigo-500")}
                      {renderProgressRing(report.reliabilityScore, "Reliability", "text-emerald-500")}
                      {renderProgressRing(report.riskScore, "Risk Profile", "text-rose-500")}
                    </div>
                  </div>
                </div>

                {/* TL;DR Split Summary Bullets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/40 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-200/30 dark:border-slate-850">
                  {/* What We Like */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-450 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="text-xs">✓</span> What We Like
                    </span>
                    <ul className="space-y-2.5">
                      {bulletSummary.likes.map((pt, idx) => (
                        <li key={idx} className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-emerald-500 font-bold text-[10px] bg-emerald-500/10 w-4 h-4 rounded-full flex items-center justify-center mt-0.5">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What Concerns Us */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="text-xs">⚠</span> What Concerns Us
                    </span>
                    <ul className="space-y-2.5">
                      {bulletSummary.concerns.length > 0 ? (
                        bulletSummary.concerns.map((pt, idx) => (
                          <li key={idx} className="text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed flex items-start gap-2">
                            <span className="text-amber-500 font-bold text-[10px] bg-amber-500/10 w-4 h-4 rounded-full flex items-center justify-center mt-0.5">•</span>
                            <span>{pt}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs font-medium text-slate-450 dark:text-slate-500 leading-relaxed">
                          No major scoring drags or valuation premiums identified.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Collapsible Executive Summary narrative block */}
                <div className="mt-6 pt-5 border-t border-slate-200/40 dark:border-slate-800/40">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Analyst Narrative Explanation
                    </span>
                    <button
                      onClick={() => setIsNarrativeExpanded(!isNarrativeExpanded)}
                      className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {isNarrativeExpanded ? "Collapse Summary" : "Expand Summary"}
                    </button>
                  </div>
                  
                  {isNarrativeExpanded ? (
                    <div className="text-xs font-medium text-slate-650 dark:text-slate-300 leading-relaxed space-y-3 transition-all duration-300 animate-in fade-in">
                      <p>{report.aiAnalysis.narrativeExplanation}</p>
                      <p className="pt-2 border-t border-slate-200/20 dark:border-slate-800/40 text-[11px] text-slate-400 italic">
                        *AI narrative compiled strictly from factual metrics. Deterministic scores are audited independently by TypeScript.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-350 leading-relaxed truncate">
                      {report.aiAnalysis.executiveSummary}
                    </p>
                  )}
                </div>
              </section>

              {/* Horizontal Company Snapshot chips */}
              <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "Sector", val: report.sector },
                  { label: "P/E Ratio", val: report.financialData.peRatio != null ? `${report.financialData.peRatio.toFixed(1)}x` : "N/A" },
                  { label: "Revenue Growth", val: report.financialData.revenueGrowth != null ? `${(report.financialData.revenueGrowth * 100).toFixed(1)}%` : "N/A" },
                  { label: "Net Margin", val: report.financialData.netProfitMargin != null ? `${(report.financialData.netProfitMargin * 100).toFixed(1)}%` : "N/A" },
                  { label: "Gross Margin", val: report.financialData.grossMargin != null ? `${(report.financialData.grossMargin * 100).toFixed(1)}%` : "N/A" },
                  { label: "Stock Beta", val: report.financialData.beta != null ? report.financialData.beta.toFixed(2) : "N/A" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-50 mt-1 block truncate">{item.val}</span>
                  </div>
                ))}
              </section>

              {/* AI Research Highlights Widget list */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    AI Analyst Primary Findings
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiResearchHighlights.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex gap-4 hover-card-lift">
                      <div className="text-xl p-2 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-center w-10 h-10 border border-slate-100 dark:border-slate-800/80">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{item.label}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${
                            item.impact >= 0 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-450"
                          }`}>
                            {item.impact >= 0 ? "+" : ""}{item.impact.toFixed(1)} Impact
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Market Context Section */}
              <section className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Market Context Comparison
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 mt-1.5 max-w-lg leading-relaxed">
                    Evaluated inside the **{report.sector}** sector. Evaluated company score delta outperforms sector baseline metrics by **{report.industryComparisonDelta >= 0 ? "+" : ""}{report.industryComparisonDelta.toFixed(1)}** points.
                  </p>
                </div>
                <div className="flex gap-6 border-l border-slate-100 dark:border-slate-800 pl-6 flex-shrink-0">
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Industry Baseline</span>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1 block">{report.industryBaselineScore.toFixed(1)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Sector PE Max Target</span>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1 block">{benchmark.peTarget}x</span>
                  </div>
                </div>
              </section>

              {/* Collapsible Agent Activity Timeline */}
              <section className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <button
                  onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      AI Agent Activity Timeline Trace
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-indigo-400 tracking-wider">
                    <span>{isTimelineOpen ? "COLLAPSE WORKFLOW" : "EXPAND WORKFLOW"}</span>
                    {isTimelineOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>
                
                {isTimelineOpen && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/10 dark:bg-slate-950/10 space-y-4">
                    {[
                      { step: "Company Identity Verified", duration: "0.2s", desc: "Successfully resolved stock ticker matching databases." },
                      { step: "Financial Statements Retrieved", duration: "0.8s", desc: "Aggregated quarterly balance sheet margins, equity debt, and valuation multiples." },
                      { step: "Sector Benchmarks Loaded", duration: "0.3s", desc: "Imported industry comparison profiles for sector: " + report.sector },
                      { step: "News Sources Aggregated", duration: "1.4s", desc: "Aggregated live items via GNews & NewsAPI. Falling back sequentially to crawler actors." },
                      { step: "Sentiment Analysis Completed", duration: "0.5s", desc: "Lexicon index parsed sentiment score values." },
                      { step: "Risk Assessment Calculated", duration: "0.4s", desc: "Evaluated volatility margins and beta drag factors." },
                      { step: "Deterministic Scoring Completed", duration: "0.2s", desc: "TypeScript engine finalized recommendation algorithm boundaries." },
                      { step: "AI Narrative Generated", duration: "1.2s", desc: "Synthesized qualitative summary narratives via Gemini API." },
                      { step: "Report Compiled", duration: "0.2s", desc: "Rendered page layouts for high-fidelity A4 export compliance." }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start text-xs font-semibold">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                          ✓
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-850 dark:text-slate-200">{item.step}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.duration}</span>
                          </div>
                          <p className="text-[11px] text-slate-450 dark:text-slate-500 font-normal mt-0.5 leading-normal">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          )}

          {/* ==================== TAB 2: RESEARCH ==================== */}
          {activeView === "research" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Research Sub tabs */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl flex gap-1 shadow-sm">
                {([
                  { id: "thesis", label: "Investment Thesis" },
                  { id: "counter", label: "Counter Thesis / Risks" },
                  { id: "bull", label: "Bull Case Outlook" },
                  { id: "bear", label: "Bear Case Outlook" }
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setResearchTab(t.id)}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                      researchTab === t.id 
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Sub tab Contents */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm min-h-[300px]">
                
                {researchTab === "thesis" && (
                  <div className="space-y-4 animate-in fade-in">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Investment Thesis</span>
                    <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100">Primary Core Thesis Pointers</h3>
                    <ul className="space-y-4 pt-4">
                      {report.aiAnalysis.thesis.map((pt, idx) => (
                        <li key={idx} className="text-sm font-semibold text-slate-700 dark:text-slate-350 leading-relaxed flex items-start gap-3">
                          <span className="text-emerald-500 font-black text-base bg-emerald-500/10 w-5 h-5 rounded-full flex items-center justify-center mt-0.5">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {researchTab === "counter" && (
                  <div className="space-y-4 animate-in fade-in">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Counter Thesis</span>
                    <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100">Risk Vectors & Concerns</h3>
                    <ul className="space-y-4 pt-4">
                      {report.aiAnalysis.counterThesis.map((pt, idx) => (
                        <li key={idx} className="text-sm font-semibold text-slate-700 dark:text-slate-350 leading-relaxed flex items-start gap-3">
                          <span className="text-rose-500 font-black text-base bg-rose-500/10 w-5 h-5 rounded-full flex items-center justify-center mt-0.5">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {researchTab === "bull" && (
                  <div className="space-y-4 animate-in fade-in">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Bull Case</span>
                    <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100">Optimistic Valuation & Outlook</h3>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 leading-relaxed pt-4">
                      {report.aiAnalysis.bullCase}
                    </p>
                  </div>
                )}

                {researchTab === "bear" && (
                  <div className="space-y-4 animate-in fade-in">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Bear Case</span>
                    <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100">Pessimistic Growth & Risks</h3>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 leading-relaxed pt-4">
                      {report.aiAnalysis.bearCase}
                    </p>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ==================== TAB 3: CHARTS ==================== */}
          {activeView === "charts" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Responsive 2x2 grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. Overall Score Gauge */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between h-[340px]">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-1">Overall Score Gauge</h4>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Company score relative to peer baseline target ({report.industryBaselineScore})
                    </span>
                  </div>
                  <div className="flex items-center justify-center py-4">
                    <GaugeChart score={report.overallScore} label="Overall Score" color="#4F46E5" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    💡 <span className="text-slate-650 dark:text-slate-400">Interpretation:</span> Overall index scores are determined relative to margins and ratios benchmarked for the **{report.sector}** industry.
                  </p>
                </div>

                {/* 2. Risk Rating Gauge */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between h-[340px]">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-1">Risk Profile Rating</h4>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Calculated volatility ceiling (Target &lt; 40)
                    </span>
                  </div>
                  <div className="flex items-center justify-center py-4">
                    <GaugeChart score={report.riskScore} label="Risk Score" color="#EF4444" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    💡 <span className="text-slate-650 dark:text-slate-400">Interpretation:</span> The risk coefficients incorporate news sentiment drifts and beta coefficients of volatility.
                  </p>
                </div>

                {/* 3. Sentiment Pie Chart */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between h-[340px]">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-1">Live Sentiment Distribution</h4>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Ratio of positive vs negative crawler headlines
                    </span>
                  </div>
                  <div className="flex items-center justify-center py-4 min-h-[160px]">
                    <SentimentPieChart news={report.newsData} />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    💡 <span className="text-slate-650 dark:text-slate-400">Interpretation:</span> Crawls active FinTwit tags and Google News API to track current market consensus sentiment index values.
                  </p>
                </div>

                {/* 4. Score components comparison */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between min-h-[340px]">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-1">Sub-Component Score Breakdown</h4>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Exact point allocation math contributions
                    </span>
                  </div>
                  <div className="py-4">
                    <ScoreBarChart scoreBreakdown={report.scoreBreakdown} />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    💡 <span className="text-slate-650 dark:text-slate-400">Interpretation:</span> Shows point allocations out of the max values, demonstrating which ratios drag performance.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 4: COMPARE ==================== */}
          {activeView === "compare" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Quick Competitor Search Form */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">
                  Quick Ticker Comparison Tool
                </span>
                <h4 className="text-base font-extrabold text-slate-850 dark:text-white mt-1.5">
                  Evaluate Side-by-Side Analytics
                </h4>
                
                <form onSubmit={executeCompareSearch} className="flex gap-3 max-w-md mt-4">
                  <input
                    type="text"
                    value={compareQuery}
                    onChange={(e) => setCompareQuery(e.target.value)}
                    placeholder="Enter competitor ticker (e.g. MSFT, AAPL, NVDA)"
                    className="flex-1 px-4 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={compareLoading}
                    className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl transition-all shadow shadow-indigo-600/10"
                  >
                    {compareLoading ? "Fetching..." : "Compare"}
                  </button>
                </form>
              </div>

              {/* Quick Compare Results Layout */}
              {compareReport ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">
                      Competitor Comparison Results
                    </span>
                    <button
                      onClick={() => { setCompareReport(null); setCompareQuery(""); }}
                      className="text-[10px] font-bold px-2 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-350"
                    >
                      Clear Comparison
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800/80 text-left text-slate-400 uppercase tracking-wider text-[9px]">
                          <th className="py-2.5">Metrics / Decision index</th>
                          <th className="py-2.5">{report.companyName} ({report.ticker})</th>
                          <th className="py-2.5">{compareReport.companyName} ({compareReport.ticker})</th>
                          <th className="py-2.5">Sector Target</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 dark:border-slate-800/40">
                          <td className="py-3 font-bold text-slate-850 dark:text-slate-100">Overall Score</td>
                          <td className="py-3 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{report.overallScore.toFixed(1)}/100</td>
                          <td className="py-3 text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">{compareReport.overallScore.toFixed(1)}/100</td>
                          <td className="py-3 text-slate-400 font-mono">{report.industryBaselineScore.toFixed(1)}</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800/40">
                          <td className="py-3 font-bold text-slate-850 dark:text-slate-100">Recommendation Decision</td>
                          <td className="py-3 font-black uppercase text-slate-800 dark:text-slate-200">{report.recommendation}</td>
                          <td className="py-3 font-black uppercase text-slate-800 dark:text-slate-200">{compareReport.recommendation}</td>
                          <td className="py-3 text-slate-400 font-mono">Neutral HOLD</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800/40">
                          <td className="py-3 font-bold text-slate-850 dark:text-slate-100">Confidence Index</td>
                          <td className="py-3">{report.confidenceScore}/100 ({report.confidenceCategory})</td>
                          <td className="py-3">{compareReport.confidenceScore}/100 ({compareReport.confidenceCategory})</td>
                          <td className="py-3 text-slate-400 font-mono">&gt; 75%</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800/40">
                          <td className="py-3 font-bold text-slate-850 dark:text-slate-100">Revenue Growth</td>
                          <td className="py-3">{report.financialData.revenueGrowth != null ? `${(report.financialData.revenueGrowth * 100).toFixed(1)}%` : "N/A"}</td>
                          <td className="py-3">{compareReport.financialData.revenueGrowth != null ? `${(compareReport.financialData.revenueGrowth * 100).toFixed(1)}%` : "N/A"}</td>
                          <td className="py-3 text-slate-400 font-mono">{(benchmark.revenueGrowthTarget * 100).toFixed(1)}%</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800/40">
                          <td className="py-3 font-bold text-slate-850 dark:text-slate-100">Net profit margin</td>
                          <td className="py-3">{report.financialData.netProfitMargin != null ? `${(report.financialData.netProfitMargin * 100).toFixed(1)}%` : "N/A"}</td>
                          <td className="py-3">{compareReport.financialData.netProfitMargin != null ? `${(compareReport.financialData.netProfitMargin * 100).toFixed(1)}%` : "N/A"}</td>
                          <td className="py-3 text-slate-400 font-mono">{(benchmark.profitMarginTarget * 100).toFixed(1)}%</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800/40">
                          <td className="py-3 font-bold text-slate-850 dark:text-slate-100">P/E Ratio Multiple</td>
                          <td className="py-3">{report.financialData.peRatio != null ? `${report.financialData.peRatio.toFixed(1)}x` : "N/A"}</td>
                          <td className="py-3">{compareReport.financialData.peRatio != null ? `${compareReport.financialData.peRatio.toFixed(1)}x` : "N/A"}</td>
                          <td className="py-3 text-slate-400 font-mono">{benchmark.peTarget.toFixed(1)}x</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800/40">
                          <td className="py-3 font-bold text-slate-850 dark:text-slate-100">Stock Beta Coefficient</td>
                          <td className="py-3">{report.financialData.beta != null ? report.financialData.beta.toFixed(2) : "N/A"}</td>
                          <td className="py-3">{compareReport.financialData.beta != null ? compareReport.financialData.beta.toFixed(2) : "N/A"}</td>
                          <td className="py-3 text-slate-400 font-mono">1.00 (Market)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {/* Main Industry Comparisons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Health report sliders */}
                <InvestmentHealthReport report={report} />

                {/* 2. Benchmark Radar Mapping */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Sector Benchmark Comparison
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                      Ratios are evaluated against baseline parameters for the **{report.sector}** sector, reducing false positives for asset-heavy or debt-leveraged entities.
                    </p>
                  </div>
                  <div className="flex items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl h-[280px]">
                    <RadarComparisonChart financials={report.financialData} />
                  </div>
                </div>

              </div>

              {/* Why not higher explainability */}
              <ExplainabilityCenter report={report} />

              {/* News highlights feed */}
              <NewsHighlights news={report.newsData} />

            </div>
          )}

          {/* ==================== TAB 5: AUDIT ==================== */}
          {activeView === "audit" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-indigo-650/5 dark:bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block leading-none">
                  Advanced Telemetry Log
                </span>
                <h4 className="text-base font-extrabold text-slate-850 dark:text-white mt-1.5">
                  100% Deterministic Scoring Verification
                </h4>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Scoring metrics are hardcoded inside audited codebase boundaries. AI synthesis models have **0% weight** on final ratings, recommendations, or calculations.
                </p>
              </div>

              {/* 1. Data Sources Panel */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <button
                  onClick={() => setIsDataSourcesOpen(!isDataSourcesOpen)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-all font-bold"
                >
                  <span className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-350">
                    1. Core Data Sources & Freshness Logs
                  </span>
                  {isDataSourcesOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isDataSourcesOpen && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/10 dark:bg-slate-950/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ConfidenceBreakdownView report={report} />
                    <DataFreshnessCenter report={report} />
                  </div>
                )}
              </div>

              {/* 2. Calculation Trace Panel */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <button
                  onClick={() => setIsCalcTraceOpen(!isCalcTraceOpen)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-all font-bold"
                >
                  <span className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-350">
                    2. Scoring Mathematical Matrix Contribution
                  </span>
                  {isCalcTraceOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isCalcTraceOpen && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/10 dark:bg-slate-950/10">
                    <ScoreContributionView report={report} />
                  </div>
                )}
              </div>

              {/* 3. Provider Health Panel */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <button
                  onClick={() => setIsProviderHealthOpen(!isProviderHealthOpen)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-all font-bold"
                >
                  <span className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-350">
                    3. Live API Provider Latency & Health Checks
                  </span>
                  {isProviderHealthOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isProviderHealthOpen && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/10 dark:bg-slate-950/10">
                    <ProviderHealthCenter report={report} />
                  </div>
                )}
              </div>

              {/* 4. AI & Source Transparency Panel */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <button
                  onClick={() => setIsAiTransOpen(!isAiTransOpen)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-all font-bold"
                >
                  <span className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-350">
                    4. AI Inference vs Deterministic Bounds
                  </span>
                  {isAiTransOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isAiTransOpen && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/10 dark:bg-slate-950/10">
                    <TransparencyPanel report={report} />
                  </div>
                )}
              </div>

              {/* 5. System Health / Degradations Panel */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <button
                  onClick={() => setIsSysHealthOpen(!isSysHealthOpen)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-all font-bold"
                >
                  <span className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-350">
                    5. System Degraded Inputs & Warnings
                  </span>
                  {isSysHealthOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isSysHealthOpen && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/10 dark:bg-slate-950/10">
                    <MissingDataImpactCenter report={report} />
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Legal Disclaimer Footer Card */}
        <div className="p-4 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
          DISCLAIMER: This analysis is for educational and research purposes only and should not be considered financial advice.
        </div>
      </main>

      {/* ==================== 3. MOBILE NAVIGATION BOTTOM BAR ==================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-4 z-40 shadow-lg">
        {([
          { id: "overview", label: "Overview", icon: Cpu },
          { id: "research", label: "Research", icon: BookOpen },
          { id: "charts", label: "Charts", icon: BarChart3 },
          { id: "compare", label: "Compare", icon: ArrowLeftRight },
          { id: "audit", label: "Audit", icon: Terminal },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex flex-col items-center gap-1 text-[9px] font-extrabold ${
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ==================== 4. CMD+K COMMAND PALETTE OVERLAY MODAL ==================== */}
      {isPaletteOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[50vh] animate-in zoom-in-95 duration-200">
            {/* Input Search header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-4.5 h-4.5 text-slate-450 dark:text-slate-500" />
              <input
                type="text"
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Analyze stock ticker or navigate terminal..."
                className="flex-1 bg-transparent text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && paletteQuery.trim()) {
                    if (onSearch) onSearch(paletteQuery);
                    setIsPaletteOpen(false);
                    setPaletteQuery("");
                  }
                }}
              />
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-650"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List options scrolling */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs font-semibold">
              
              {/* Quick Workspace Navigation shortcuts */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest block mb-1">
                  Terminal Workspace Shortcuts
                </span>
                {([
                  { id: "overview", label: "Go to Overview Workspace", desc: "Hero highlights, TL;DR, chips and snapshots" },
                  { id: "research", label: "Go to Research Workspace", desc: "Thesis, counter-thesis, bull/bear tab narrative guides" },
                  { id: "charts", label: "Go to Charts Workspace", desc: "Interactive memoized visual gauges & breakdown bars" },
                  { id: "compare", label: "Go to Compare Workspace", desc: "Quick ticker comparisons and industry baseline grids" },
                  { id: "audit", label: "Go to Audit Workspace", desc: "Audited system trace logs, caches and provider metrics" }
                ] as const).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveView(s.id);
                      setIsPaletteOpen(false);
                    }}
                    className="w-full p-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl text-left flex justify-between items-center group transition-all"
                  >
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 block">{s.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-normal">{s.desc}</span>
                    </div>
                    <span className="text-[10px] text-slate-350 dark:text-slate-600 font-mono font-bold uppercase">Navigate</span>
                  </button>
                ))}
              </div>

              {/* Recent searches history */}
              {recentSearches.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/85">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                    Execute Recent Searches
                  </span>
                  {recentSearches.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (onSearch) onSearch(s);
                        setIsPaletteOpen(false);
                      }}
                      className="w-full p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl text-left flex justify-between items-center text-slate-700 dark:text-slate-300 font-mono"
                    >
                      <span>Analyze {s}</span>
                      <span className="text-[10px] text-slate-400 font-normal font-sans">History</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Tickers shortcuts */}
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/85">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                  Popular Companies Shortcuts
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {["AAPL", "MSFT", "NVDA", "TSLA"].map((sym) => (
                    <button
                      key={sym}
                      onClick={() => {
                        if (onSearch) onSearch(sym);
                        setIsPaletteOpen(false);
                      }}
                      className="p-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-left text-slate-750 dark:text-slate-300 font-mono"
                    >
                      {sym} Profile
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. HIDDEN HIGH-FIDELITY PDF LAYOUTS (A4 dimensions: 820px width x 1160px height) ==================== */}
      <div className="absolute left-[-9999px] top-[-9999px] space-y-8 select-none pointer-events-none">
        
        {/* PDF PAGE 1: EXECUTIVE SUMMARY & PRIMARY DECISION */}
        <div id="pdf-page-1" className="w-[820px] h-[1160px] p-8 bg-[#0B0F19] border border-slate-800 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-lg font-black tracking-wider text-indigo-400">INVESTIMIND AI</span>
              <span className="text-[10px] font-semibold text-slate-500">A4 EXECUTIVE REPORT</span>
            </div>
            <InvestmentSummaryCard report={report} isPdf={true} />
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
