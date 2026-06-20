"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { NewsItem } from "../../types/research";

interface SentimentPieChartProps {
  news: NewsItem[];
}

export default function SentimentPieChart({ news }: SentimentPieChartProps) {
  if (!news || news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[220px] bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">News Sentiment Unavailable</span>
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">No headlines found to analyze.</span>
      </div>
    );
  }

  const positiveWords = ["growth", "gain", "bullish", "profit", "record", "beat", "upgrade", "buy", "rise", "expansion", "success", "strong", "innovative", "surge", "positive", "dividend", "outperform"];
  const negativeWords = ["decline", "loss", "bearish", "drop", "fail", "miss", "downgrade", "sell", "fall", "contraction", "layoff", "regulatory", "lawsuit", "debt", "negative", "risk", "underperform", "slowdown", "investigation", "fine"];

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  news.forEach((item) => {
    const text = item.title.toLowerCase();
    let pos = 0;
    let neg = 0;

    positiveWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      const matches = text.match(regex);
      if (matches) pos += matches.length;
    });

    negativeWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      const matches = text.match(regex);
      if (matches) neg += matches.length;
    });

    if (pos > neg) {
      positiveCount++;
    } else if (neg > pos) {
      negativeCount++;
    } else {
      neutralCount++;
    }
  });

  const data = [
    { name: "Positive Headlines", value: positiveCount, color: "#10B981" },
    { name: "Neutral Headlines", value: neutralCount, color: "#06B6D4" },
    { name: "Negative Headlines", value: negativeCount, color: "#EF4444" },
  ].filter(item => item.value > 0);

  // Fallback if all counts are 0
  const chartData = data.length > 0 ? data : [{ name: "Neutral Headlines", value: news.length, color: "#06B6D4" }];

  return (
    <div className="flex flex-col items-center justify-center w-full h-[220px]">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="75%"
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.15)",
              borderRadius: "8px",
            }}
            itemStyle={{ color: "#fff", fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-xs font-semibold mt-1">
        {chartData.map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 dark:text-slate-400">{entry.name} ({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
