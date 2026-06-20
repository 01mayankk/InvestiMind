"use client";

import React from "react";
import { Newspaper, ExternalLink, Calendar } from "lucide-react";
import { NewsItem } from "../types/research";

interface NewsHighlightsProps {
  news: NewsItem[];
}

export default function NewsHighlights({ news }: NewsHighlightsProps) {
  if (!news || news.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center h-[200px]">
        <Newspaper className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-3" />
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          News Coverage Unavailable
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          No recent media headlines could be collected for this ticker due to key restrictions or API timeouts.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Newspaper className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          News Highlights & Media Sentiment
        </h3>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {news.map((item, idx) => {
          let dateStr = "Recent";
          if (item.publishedAt) {
            try {
              dateStr = new Date(item.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            } catch {}
          }

          return (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-start gap-4 group">
              <div className="space-y-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5 leading-snug"
                >
                  {item.title}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </a>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                  <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                    {item.source}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
