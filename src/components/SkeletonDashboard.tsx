"use client";

import React from "react";

export default function SkeletonDashboard() {
  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto px-4 pb-16 animate-pulse">
      {/* 1. Shimmer Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-200/40 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-300/40 dark:border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-800" />
          <div className="h-4 w-48 bg-slate-300 dark:bg-slate-800 rounded" />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="h-9 w-28 bg-slate-300 dark:bg-slate-800 rounded-xl" />
          <div className="h-9 w-28 bg-slate-300 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* 2. Hero Section: Summary Card Skeleton */}
      <div className="h-[220px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Executive Summary Text Block Skeleton */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>

      {/* 4. Drivers & Concerns Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-3">
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-3">
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 5. Chart Visualization Grid Skeleton */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-4">
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-32 h-32 rounded-full border-8 border-slate-200 dark:border-slate-800 flex items-center justify-center" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
