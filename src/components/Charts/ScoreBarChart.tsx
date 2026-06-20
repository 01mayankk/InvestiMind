"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ScoreBreakdown } from "../../types/research";

interface ScoreBarChartProps {
  scoreBreakdown: ScoreBreakdown;
}

export default function ScoreBarChart({ scoreBreakdown }: ScoreBarChartProps) {
  const data = [
    { name: "Revenue Growth", score: scoreBreakdown.revenueGrowthScore, max: 15 },
    { name: "Profitability", score: scoreBreakdown.profitabilityScore, max: 15 },
    { name: "Financial Health", score: scoreBreakdown.financialHealthScore, max: 15 },
    { name: "Valuation", score: scoreBreakdown.valuationScore, max: 10 },
    { name: "Market Position", score: scoreBreakdown.marketPositionScore, max: 10 },
    { name: "News Sentiment", score: scoreBreakdown.newsSentimentScore, max: 15 },
    { name: "Business Risk", score: scoreBreakdown.businessRiskScore, max: 10 },
    { name: "Recent Events", score: scoreBreakdown.recentEventsScore, max: 10 },
  ];

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
          barSize={18}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 15]}
            tick={{ fill: "#64748b", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.15)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}
            itemStyle={{ color: "#06B6D4", fontSize: 12 }}
            formatter={(value, _name, props) => [
              `${value} / ${(props.payload as { max: number }).max} pts`,
              "Score",
            ]}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => {
              const pct = entry.score / entry.max;
              // Color based on performance: positive green, moderate cyan, weak yellow/orange
              const color =
                pct >= 0.75
                  ? "#10B981" // Emerald Accent
                  : pct >= 0.5
                  ? "#06B6D4" // Cyan Secondary
                  : "#F59E0B"; // Amber Warning
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
