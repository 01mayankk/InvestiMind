"use client";

import React, { useState, useEffect } from "react";
import { Search, Sun, Moon, Cpu, ShieldCheck } from "lucide-react";
import DashboardView from "../components/DashboardView";
import { ResearchResponse } from "../types/research";

const POPULAR_SUGGESTIONS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "XOM", name: "Exxon Mobil Corp." },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<ResearchResponse | null>(null);
  const [isDark, setIsDark] = useState(true);

  // Initialize Dark Mode by default
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  // Loading indicator step cycle
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
      const filtered = POPULAR_SUGGESTIONS.filter(
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
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      alert(`Error running research: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getLoadingText = (step: number) => {
    switch (step) {
      case 0:
        return "FinancialResearchNode: Querying Yahoo Finance for fundamental metrics...";
      case 1:
        return "NewsAggregationNode: Sequentially fetching recent articles and headlines...";
      case 2:
        return "InvestmentScoringNode: Computing deterministic score metrics against sector baselines...";
      default:
        return "AIExplanationNode & ReportGenerationNode: Running explanation synthesis via Gemini...";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Header Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow shadow-indigo-600/30">
              <Cpu className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider text-slate-900 dark:text-white uppercase leading-none">
                InvestiMind AI
              </span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                Explainable Research Agent
              </span>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300"
            title="Toggle theme mode"
          >
            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {/* 2. Main Page Body */}
      <main className="max-w-7xl mx-auto py-12">
        {!report && !loading ? (
          // Initial Search State View
          <div className="max-w-2xl mx-auto px-4 flex flex-col items-center text-center space-y-8 mt-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Deterministic Decision Guardrails
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 dark:text-white bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-indigo-500 bg-clip-text text-transparent">
                Explainable Investment Research
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-medium">
                Enter any company name or stock ticker to analyze metrics, risk, and coverage deterministically. AI is used solely for narrative explanations.
              </p>
            </div>

            {/* Search Input Widget */}
            <div className="w-full relative">
              <div className="flex items-center bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-2 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3" />
                <input
                  type="text"
                  placeholder="Enter ticker (e.g., TSLA, AAPL) or name..."
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && executeSearch(query)}
                  className="w-full bg-transparent border-0 outline-none focus:ring-0 text-sm font-semibold text-slate-800 dark:text-slate-200 ml-3 placeholder-slate-400"
                />
                <button
                  onClick={() => executeSearch(query)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-indigo-600/10"
                >
                  Analyze Ticker
                </button>
              </div>

              {/* Autocomplete Dropdown list */}
              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-left">
                  {suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => executeSearch(item.symbol)}
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer flex justify-between items-center"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-slate-500">
                        {item.symbol}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Popular Grid Suggestion list */}
            <div className="w-full space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-left">
                Suggested Companies
              </span>
              <div className="grid grid-cols-3 gap-3">
                {POPULAR_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => executeSearch(item.symbol)}
                    className="p-3 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl text-left transition-all flex flex-col justify-between h-[65px] group shadow-sm hover:shadow"
                  >
                    <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-full font-semibold">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : loading ? (
          // Loading Sequence State View
          <div className="max-w-md mx-auto px-4 flex flex-col items-center justify-center text-center py-20 space-y-6">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin" />
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">
                Executing LangGraph State Pipeline
              </span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Running Research for &ldquo;{query.toUpperCase()}&rdquo;
              </h3>
              <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mt-2 leading-relaxed animate-pulse">
                {getLoadingText(loadingStep)}
              </p>
            </div>
          </div>
        ) : (
          // Dashboard Report View
          <DashboardView report={report!} onReset={() => setReport(null)} />
        )}
      </main>
    </div>
  );
}
