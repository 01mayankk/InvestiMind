"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeChartProps {
  score: number;
  maxScore?: number;
  label: string;
  subLabel?: string;
  color: string;
}

export default function GaugeChart({
  score,
  maxScore = 100,
  label,
  subLabel,
  color,
}: GaugeChartProps) {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  
  // Data for a semi-circle gauge: [value, remaining, spacer]
  // Spacer at the bottom represents the 180 degrees that are hidden
  const data = [
    { value: percentage },
    { value: 100 - percentage },
    { value: 100 }, // hidden bottom half
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-[220px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="75%"
            startAngle={180}
            endAngle={0}
            innerRadius="65%"
            outerRadius="90%"
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="rgba(148, 163, 184, 0.15)" /> {/* background track */}
            <Cell fill="transparent" /> {/* hidden bottom spacer */}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Central Overlay for Text */}
      <div className="absolute bottom-[28%] flex flex-col items-center text-center">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          {score.toFixed(1)}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
}
