"use client";

import React, { useState, useEffect } from "react";
import { Search, Sun, Moon, Cpu, ShieldCheck, Layers, TrendingUp } from "lucide-react";
import DashboardView from "../components/DashboardView";
import SkeletonDashboard from "../components/SkeletonDashboard";
import { ResearchResponse } from "../types/research";

const POPULAR_COMPANIES = [
  { symbol: "AAPL", name: "Apple", desc: "Consumer Tech & Cloud" },
  { symbol: "MSFT", name: "Microsoft", desc: "Software, Cloud & Enterprise AI" },
  { symbol: "NVDA", name: "NVIDIA", desc: "Semiconductors & GPU Computing" },
  { symbol: "TSLA", name: "Tesla", desc: "Electric Vehicles & Energy Storage" },
  { symbol: "AMZN", name: "Amazon", desc: "Retail Logistics & AWS Cloud" },
  { symbol: "GOOGL", name: "Google", desc: "Search Services & AI Models" },
  { symbol: "META", name: "Meta", desc: "Social Networks & Metaverse Tech" },
  { symbol: "NFLX", name: "Netflix", desc: "Digital Streaming & Media Production" },
];

const SUGGESTED_SEARCHES = [
  { label: "Analyze Apple", query: "AAPL" },
  { label: "Compare Microsoft", query: "MSFT" },
  { label: "Check Tesla", query: "TSLA" },
];

const EXAMPLE_INSIGHTS = [
  {
    title: "Deterministic Engine Guardrails",
    desc: "Mathematical metrics, benchmarks, and risk ratings are 100% hardcoded in audited TypeScript algorithms. Generative models only synthesize narrative explainers.",
    icon: ShieldCheck,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    title: "Chained News Resilience",
    desc: "Automatically cascade through GNews, NewsAPI, and live FinTwit scraper actors via Apify to sustain news coverage under third-party connection timeouts.",
    icon: Layers,
    color: "text-indigo-500 bg-indigo-500/10",
  },
  {
    title: "Double-Score Verification",
    desc: "Maintains two independent indices: Data Confidence evaluates source completeness, while Recommendation Reliability tracks mathematical validity.",
    icon: Cpu,
    color: "text-cyan-500 bg-cyan-500/10",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string; desc: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<ResearchResponse | null>(null);
  const [isDark, setIsDark] = useState(true);

  // Initialize theme mode on mount to avoid hydration mismatch
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      localStorage.theme = "light";
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.theme = "dark";
      setIsDark(true);
    }
  };

  // Loading progress text stepper
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 0) {
      const filtered = POPULAR_COMPANIES.filter(
        (s) =>
          s.symbol.toLowerCase().includes(val.toLowerCase()) ||
          s.name.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSuggestions([]);
    setQuery(searchQuery);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Analysis request failed.");
      }

      const data: ResearchResponse = await res.json();
      setReport(data);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Error running research: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const getLoadingText = (step: number) => {
    switch (step) {
      case 0:
        return "FinancialResearchNode: Querying Yahoo Finance for fundamental balances & sector ratios...";
      case 1:
        return "NewsAggregationNode: Cascading news fallbacks and crawling social sentiment...";
      case 2:
        return "InvestmentScoringNode: Mapping fundamentals against dynamic sector targets...";
      default:
        return "AIExplanationNode & ReportGenerationNode: Generating qualitative explainers via Gemini...";
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* 1. Sticky Navigation Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setReport(null); setQuery(""); }}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow shadow-indigo-500/20">
              <Cpu className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider uppercase leading-none">
                InvestiMind AI
              </span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                Explainable Research Agent
              </span>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 shadow-sm"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Moon className="w-4.5 h-4.5 text-indigo-400" />
            ) : (
              <Sun className="w-4.5 h-4.5 text-amber-500" />
            )}
          </button>
        </div>
      </header>

      {/* 2. Main Page Area */}
      <main className="max-w-7xl mx-auto py-10">
        {!report && !loading ? (
          // Redesigned Premium Landing Page
          <div className="max-w-4xl mx-auto px-4 space-y-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Explainable Analytics Core
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Explainable Investment <br />
                <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  Research Platform
                </span>
              </h1>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
                Query any equity, company, or stock ticker. Our deterministic engine maps metrics against dynamic benchmarks, while AI synthesizes auditable explanations.
              </p>
            </div>

            {/* Search Input Box */}
            <div className="w-full max-w-2xl mx-auto relative">
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg focus-within:shadow-lg focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-all duration-300 p-2 rounded-2xl">
                <Search className="w-5 h-5 text-slate-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search ticker (e.g. AAPL, MSFT) or company name..."
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && executeSearch(query)}
                  className="w-full bg-transparent border-0 outline-none focus:ring-0 text-sm font-semibold text-slate-800 dark:text-slate-200 ml-3 placeholder-slate-400"
                />
                <button
                  onClick={() => executeSearch(query)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all shadow shadow-indigo-600/10 flex-shrink-0"
                >
                  Run Analysis
                </button>
              </div>

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-left">
                  {suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => executeSearch(item.symbol)}
                      className="px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer flex justify-between items-center transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-slate-500">
                        {item.symbol}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Suggested Searches list pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs max-w-2xl mx-auto pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Suggested Searches:
              </span>
              {SUGGESTED_SEARCHES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => executeSearch(item.query)}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-full font-semibold text-slate-600 dark:text-slate-300 transition-all text-xs hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Popular/Trending Companies Grid buttons */}
            <div className="space-y-4 max-w-3xl mx-auto pt-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Trending Indices & Tech Stocks</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {POPULAR_COMPANIES.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => executeSearch(item.symbol)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-left hover-card-lift transition-all flex flex-col justify-between h-[85px] group shadow-sm"
                  >
                    <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500">
                      {item.symbol}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block truncate leading-none">
                        {item.name}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block truncate mt-1">
                        {item.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Example Insights / Value Showcase cards */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-10 space-y-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">
                System Governance & Guardrail Features
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {EXAMPLE_INSIGHTS.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm">
                      <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                        <IconComp className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : loading ? (
          // Redesigned Shimmer Loading View
          <div className="space-y-6 max-w-7xl mx-auto px-4">
            {/* Steps Loader Display */}
            <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin flex-shrink-0" />
              <div>
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  LangGraph Pipeline Executing
                </span>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  Running analysis for {query.toUpperCase()}...
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                  {getLoadingText(loadingStep)}
                </p>
              </div>
            </div>
            {/* Dashboard Mock Grid Shimmer */}
            <SkeletonDashboard />
          </div>
        ) : (
          // Dashboard Report View
          <DashboardView report={report!} onReset={() => { setReport(null); setQuery(""); }} />
        )}
      </main>
    </div>
  );
}
