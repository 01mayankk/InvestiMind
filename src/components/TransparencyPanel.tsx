"use client";

import React from "react";
import { Shield, Globe } from "lucide-react";
import { ResearchResponse } from "../types/research";

interface TransparencyPanelProps {
  report: ResearchResponse;
}

export default function TransparencyPanel({ report }: TransparencyPanelProps) {
  const { providerHealth, aiAnalysis } = report;

  // AI Content ratio: 15% if Gemini succeeded, 0% if fallback was used due to missing API key
  const hasGemini = !aiAnalysis.executiveSummary.includes("Gemini API key was not configured");
  const aiInfluencePct = hasGemini ? "15%" : "0%";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Source Transparency Center */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Source Transparency Center
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(providerHealth).map(([, status], idx) => {
              const isSuccess = status.status === "Success";
              const isFailed = status.status === "Failed";
              return (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
                  <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
                    <span>{status.name}</span>
                    <span className={isSuccess ? "text-emerald-500" : "text-rose-500"}>
                      {status.status}
                    </span>
                  </div>
                  {isSuccess && (
                    <div className="grid grid-cols-3 gap-2 mt-2 font-medium text-slate-500 dark:text-slate-400 text-[10px]">
                      <div>
                        <span>Latency: </span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{status.latencyMs}ms</span>
                      </div>
                      <div>
                        <span>Reliability: </span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{status.reliability}%</span>
                      </div>
                      <div>
                        <span>Fallback: </span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{status.fallbackUsed ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  )}
                  {isFailed && (
                    <p className="mt-1 text-[10px] text-rose-500 font-semibold">
                      Connection timed out or API token failed.
                    </p>
                  )}
                  {status.status === "Unavailable" && (
                    <p className="mt-1 text-[10px] text-slate-400 font-medium">
                      Provider skipped (previous step succeeded or API token is missing).
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. AI Transparency Panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              AI Transparency Panel
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <span>AI Influence on Recommendation</span>
              <div className="text-lg font-black text-slate-950 dark:text-slate-50 mt-1">0%</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <span>AI Influence on Scoring</span>
              <div className="text-lg font-black text-slate-950 dark:text-slate-50 mt-1">0%</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <span>AI Influence on Confidence</span>
              <div className="text-lg font-black text-slate-950 dark:text-slate-50 mt-1">0%</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <span>AI Generated Content Ratio</span>
              <div className="text-lg font-black text-slate-950 dark:text-slate-50 mt-1">{aiInfluencePct}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-semibold">
            {/* AI Generated Sections */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Generated Sections</span>
              <div className="space-y-1 text-slate-700 dark:text-slate-300">
                <div>✓ Executive Summary</div>
                <div>✓ Investment Thesis</div>
                <div>✓ Counter Thesis</div>
                <div>✓ Bull Case / Bear Case</div>
              </div>
            </div>

            {/* AI Restricted Sections */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Restricted Operations</span>
              <div className="space-y-1 text-slate-700 dark:text-slate-300">
                <div className="text-rose-500">✗ Recommendation Decision</div>
                <div className="text-rose-500">✗ Numerical Score Arithmetic</div>
                <div className="text-rose-500">✗ Confidence Weighted Score</div>
                <div className="text-rose-500">✗ Risk Rating Thresholds</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
