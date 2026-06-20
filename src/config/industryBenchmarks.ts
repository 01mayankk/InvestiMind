export interface SectorBenchmark {
  peTarget: number;
  profitMarginTarget: number;
  revenueGrowthTarget: number;
  grossMarginTarget: number;
  debtToEquityTarget: number;
  baselineScore: number;
}

export const INDUSTRY_BENCHMARKS: Record<string, SectorBenchmark> = {
  "Technology": {
    peTarget: 25.0,
    profitMarginTarget: 0.20, // 20%
    revenueGrowthTarget: 0.15, // 15%
    grossMarginTarget: 0.50, // 50%
    debtToEquityTarget: 0.8,
    baselineScore: 68.0,
  },
  "Healthcare": {
    peTarget: 22.0,
    profitMarginTarget: 0.15, // 15%
    revenueGrowthTarget: 0.10, // 10%
    grossMarginTarget: 0.45, // 45%
    debtToEquityTarget: 0.7,
    baselineScore: 66.0,
  },
  "Financial Services": {
    peTarget: 14.0,
    profitMarginTarget: 0.25, // 25%
    revenueGrowthTarget: 0.06, // 6%
    grossMarginTarget: 0.60, // 60%
    debtToEquityTarget: 2.5, // Financial services have higher leverage
    baselineScore: 64.0,
  },
  "Consumer Cyclical": {
    peTarget: 20.0,
    profitMarginTarget: 0.08, // 8%
    revenueGrowthTarget: 0.08, // 8%
    grossMarginTarget: 0.35, // 35%
    debtToEquityTarget: 1.0,
    baselineScore: 62.0,
  },
  "Consumer Defensive": {
    peTarget: 18.0,
    profitMarginTarget: 0.06, // 6%
    revenueGrowthTarget: 0.04, // 4%
    grossMarginTarget: 0.28, // 28%
    debtToEquityTarget: 1.2,
    baselineScore: 61.0,
  },
  "Industrials": {
    peTarget: 17.0,
    profitMarginTarget: 0.09, // 9%
    revenueGrowthTarget: 0.06, // 6%
    grossMarginTarget: 0.25, // 25%
    debtToEquityTarget: 0.9,
    baselineScore: 63.0,
  },
  "Utilities": {
    peTarget: 16.0,
    profitMarginTarget: 0.12, // 12%
    revenueGrowthTarget: 0.03, // 3%
    grossMarginTarget: 0.38, // 38%
    debtToEquityTarget: 1.5, // Asset heavy
    baselineScore: 60.0,
  },
  "Energy": {
    peTarget: 12.0,
    profitMarginTarget: 0.10, // 10%
    revenueGrowthTarget: 0.05, // 5%
    grossMarginTarget: 0.30, // 30%
    debtToEquityTarget: 0.8,
    baselineScore: 62.0,
  },
  "Real Estate": {
    peTarget: 18.0,
    profitMarginTarget: 0.18, // 18%
    revenueGrowthTarget: 0.05, // 5%
    grossMarginTarget: 0.55, // 55%
    debtToEquityTarget: 1.4,
    baselineScore: 61.0,
  },
  "Communication Services": {
    peTarget: 20.0,
    profitMarginTarget: 0.14, // 14%
    revenueGrowthTarget: 0.08, // 8%
    grossMarginTarget: 0.48, // 48%
    debtToEquityTarget: 1.1,
    baselineScore: 63.0,
  },
  "Basic Materials": {
    peTarget: 13.0,
    profitMarginTarget: 0.08, // 8%
    revenueGrowthTarget: 0.05, // 5%
    grossMarginTarget: 0.22, // 22%
    debtToEquityTarget: 0.7,
    baselineScore: 61.0,
  },
};

export const DEFAULT_BENCHMARK: SectorBenchmark = {
  peTarget: 18.0,
  profitMarginTarget: 0.12, // 12%
  revenueGrowthTarget: 0.08, // 8%
  grossMarginTarget: 0.35, // 35%
  debtToEquityTarget: 1.0,
  baselineScore: 63.0,
};

export function getBenchmarkForSector(sector?: string): SectorBenchmark {
  if (!sector) return DEFAULT_BENCHMARK;
  return INDUSTRY_BENCHMARKS[sector] || DEFAULT_BENCHMARK;
}
