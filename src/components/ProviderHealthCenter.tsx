"use client";

import React from "react";
import { Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ResearchResponse } from "../types/research";

interface ProviderHealthCenterProps {
  report: ResearchResponse;
}

export default function ProviderHealthCenter({ report }: ProviderHealthCenterProps) {
  const { providerHealth } = report;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Provider Health Center
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(providerHealth).map(([pName, status], idx) => {
          const isSuccess = status.status === "Success";
          const isFailed = status.status === "Failed";

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between h-[110px] text-xs transition-all ${
                isSuccess
                  ? "bg-emerald-500/5 border-emerald-500/10 dark:border-emerald-500/20"
                  : isFailed
                  ? "bg-rose-500/5 border-rose-500/10 dark:border-rose-500/20"
                  : "bg-slate-50 border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/40"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">{pName}</span>
                {isSuccess ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : isFailed ? (
                  <XCircle className="w-4 h-4 text-rose-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                )}
              </div>

              <div className="mt-2 space-y-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <div>
                  Status:{" "}
                  <span
                    className={
                      isSuccess
                        ? "text-emerald-500"
                        : isFailed
                        ? "text-rose-500"
                        : "text-slate-400"
                    }
                  >
                    {status.status}
                  </span>
                </div>
                {isSuccess && (
                  <>
                    <div>
                      Latency:{" "}
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {status.latencyMs}ms
                      </span>
                    </div>
                    <div>
                      Reliability:{" "}
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {status.reliability}%
                      </span>
                    </div>
                  </>
                )}
                {!isSuccess && (
                  <div className="text-[9px] text-slate-400 font-normal italic mt-1">
                    {isFailed ? "Offline / Rate-limited" : "Token Not Provided"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
