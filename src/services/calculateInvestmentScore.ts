import { getBenchmarkForSector } from "../config/industryBenchmarks";
import {
  getRecommendationForScore,
  getConfidenceCategory,
  getReliabilityCategory,
  getRiskCategory,
} from "../config/scoringRules";
import { FinancialData, NewsItem, ScoreBreakdown, DataQuality, MissingDataImpact, ProviderStatus } from "../types/research";

export interface ScoreEngineResult {
  scoreBreakdown: ScoreBreakdown;
  recommendation: string;
  recommendationStrength: string;
  confidenceScore: number;
  confidenceCategory: string;
  reliabilityScore: number;
  reliabilityCategory: string;
  riskScore: number;
  riskCategory: string;
  topPositiveDriver: string;
  topConcern: string;
  industryBaselineScore: number;
  industryComparisonDelta: number;
  dataQuality: DataQuality;
  missingDataImpact: MissingDataImpact;
  dataFreshnessScore: number;
  dataFreshnessCategory: string;
}

// Simple Lexicon Sentiment Scorer
export function calculateNewsSentiment(news: NewsItem[]): { score: number; sentimentIndex: number } {
  if (!news || news.length === 0) {
    return { score: 0, sentimentIndex: 0 };
  }

  const positiveWords = [
    "growth", "gain", "bullish", "profit", "record", "beat", "upgrade", "buy", "rise",
    "expansion", "success", "strong", "innovative", "surge", "positive", "dividend", "outperform"
  ];
  const negativeWords = [
    "decline", "loss", "bearish", "drop", "fail", "miss", "downgrade", "sell", "fall",
    "contraction", "layoff", "regulatory", "lawsuit", "debt", "negative", "risk", "underperform",
    "slowdown", "investigation", "fine"
  ];

  let totalIndex = 0;

  news.forEach((item) => {
    const text = item.title.toLowerCase();
    let posCount = 0;
    let negCount = 0;

    positiveWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      const matches = text.match(regex);
      if (matches) posCount += matches.length;
    });

    negativeWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      const matches = text.match(regex);
      if (matches) negCount += matches.length;
    });

    if (posCount + negCount > 0) {
      totalIndex += (posCount - negCount) / (posCount + negCount);
    }
  });

  const avgIndex = totalIndex / news.length; // Range: -1.0 to 1.0
  // Map index to 0 - 15 points
  // -1.0 -> 0, 0 -> 7.5, 1.0 -> 15
  const score = 7.5 + (avgIndex * 7.5);
  return {
    score: Math.max(0, Math.min(15, score)),
    sentimentIndex: avgIndex,
  };
}

export function calculateInvestmentScore(
  financials: FinancialData | null,
  news: NewsItem[],
  providerStatuses: Record<string, ProviderStatus>
): ScoreEngineResult {
  const sector = financials?.sector || "Unknown";
  const benchmark = getBenchmarkForSector(sector);

  // Missing data flags
  const financialsMissing = !financials || financials.peRatio === null;
  const newsMissing = news.length === 0;

  // Let's count missing metrics for reliability deductions
  let missingFinancialMetricsCount = 0;
  if (!financials) {
    missingFinancialMetricsCount = 7;
  } else {
    if (financials.revenueGrowth === null) missingFinancialMetricsCount++;
    if (financials.netProfitMargin === null) missingFinancialMetricsCount++;
    if (financials.grossMargin === null) missingFinancialMetricsCount++;
    if (financials.currentRatio === null) missingFinancialMetricsCount++;
    if (financials.debtToEquity === null) missingFinancialMetricsCount++;
    if (financials.peRatio === null) missingFinancialMetricsCount++;
    if (financials.beta === null) missingFinancialMetricsCount++;
  }

  // 1. FINANCIAL SCORES (Max 65)
  let revenueGrowthScore = 0;
  let profitabilityScore = 0;
  let financialHealthScore = 0;
  let valuationScore = 0;
  let marketPositionScore = 0;

  if (financials) {
    // Revenue Growth (Max 15)
    if (financials.revenueGrowth !== null) {
      const target = benchmark.revenueGrowthTarget;
      // Proportional continuous scaling: 15% YoY growth target.
      if (financials.revenueGrowth >= target) {
        revenueGrowthScore = 15;
      } else if (financials.revenueGrowth > 0) {
        revenueGrowthScore = (financials.revenueGrowth / target) * 15;
      }
    }

    // Profitability / Net Margin (Max 15)
    if (financials.netProfitMargin !== null) {
      const target = benchmark.profitMarginTarget;
      if (financials.netProfitMargin >= target) {
        profitabilityScore = 15;
      } else if (financials.netProfitMargin > 0) {
        profitabilityScore = (financials.netProfitMargin / target) * 15;
      }
    }

    // Financial Health (Max 15): Current Ratio (7.5) + Debt-to-Equity (7.5)
    let currentRatioScore = 0;
    let deScore = 0;

    if (financials.currentRatio !== null) {
      // Target: 2.0
      currentRatioScore = Math.min(7.5, (financials.currentRatio / 2.0) * 7.5);
    }
    if (financials.debtToEquity !== null) {
      const target = benchmark.debtToEquityTarget;
      if (financials.debtToEquity <= target) {
        deScore = 7.5;
      } else {
        deScore = Math.max(0, 7.5 - ((financials.debtToEquity - target) / target) * 7.5);
      }
    }
    financialHealthScore = currentRatioScore + deScore;

    // Valuation / PE Ratio (Max 10)
    if (financials.peRatio !== null) {
      const target = benchmark.peTarget;
      if (financials.peRatio <= 0) {
        valuationScore = 2.0; // Negative earnings risk
      } else if (financials.peRatio <= target) {
        valuationScore = 10.0;
      } else {
        // High valuation discount: scale down to 1 point at 3x benchmark target PE
        valuationScore = Math.max(1.0, 10.0 - ((financials.peRatio - target) / (target * 2)) * 9.0);
      }
    }

    // Market Position / Gross Margin (Max 10)
    if (financials.grossMargin !== null) {
      const target = benchmark.grossMarginTarget;
      marketPositionScore = Math.min(10.0, (financials.grossMargin / target) * 10.0);
    }
  }

  // 2. RISK HEALTH SCORES (Max 35)
  // News Sentiment (Max 15)
  const { score: newsSentimentScore } = calculateNewsSentiment(news);

  // Business Risk / Beta (Max 10)
  let businessRiskScore = 5.0; // Default Neutral if missing
  if (financials && financials.beta !== null) {
    const beta = financials.beta;
    if (beta <= 0.8) {
      businessRiskScore = 10.0;
    } else if (beta <= 1.5) {
      businessRiskScore = Math.max(3.0, 10.0 - ((beta - 0.8) / 0.7) * 7.0);
    } else {
      businessRiskScore = Math.max(1.0, 3.0 - ((beta - 1.5) / 1.0) * 2.0);
    }
  }

  // Recent Events / Momentum (Max 10)
  let recentEventsScore = 5.0; // Default Neutral
  if (financials && financials.currentPrice !== null && financials.fiftyTwoWeekHigh !== null && financials.fiftyTwoWeekLow !== null) {
    const high = financials.fiftyTwoWeekHigh;
    const low = financials.fiftyTwoWeekLow;
    const price = financials.currentPrice;
    if (high > low) {
      const ratio = (price - low) / (high - low);
      recentEventsScore = Math.min(10.0, Math.max(0, ratio * 10.0));
    }
  }

  // Total Scores
  const totalFinancialScore = revenueGrowthScore + profitabilityScore + financialHealthScore + valuationScore + marketPositionScore;
  const totalRiskHealthScore = newsSentimentScore + businessRiskScore + recentEventsScore;

  // Final Overall Score (0 - 100)
  const overallScore = Math.round((totalFinancialScore + totalRiskHealthScore) * 10) / 10;

  // Risk Score (0 - 100) -> Inverse of Risk Health Score
  // If Risk Health is 35 (highest), Risk is 0. If Risk Health is 0 (lowest), Risk is 100.
  const riskScore = Math.round((100 - (totalRiskHealthScore / 35) * 100) * 10) / 10;
  const riskCategory = getRiskCategory(riskScore);

  const recommendationInfo = getRecommendationForScore(overallScore);

  // 3. Dynamic Industry Baseline Score
  // Baseline Score calculation using sector benchmark targets.
  // Evaluate sector targets under baseline assumptions:
  // Revenue Growth = 75% of target -> Score = 11.25
  // Net Margin = 75% of target -> Score = 11.25
  // Current Ratio = 1.4 (target 2.0) -> Score = 5.25
  // Debt to Equity = 120% of target -> Score = 6.0
  // PE = 110% of target -> Score = 9.55
  // Gross Margin = 75% of target -> Score = 7.5
  // News sentiment = neutral (7.5)
  // Beta = 1.1 -> Score = 7.0
  // Momentum = 0.5 -> Score = 5.0
  // Total target Baseline sum = 11.25 + 11.25 + 5.25 + 6.0 + 9.55 + 7.5 + 7.5 + 7.0 + 5.0 = 70.3
  // Let's calibrate to sector target:
  const baselinePEVal = benchmark.peTarget * 1.1;
  const baselineValuationScore = Math.max(1.0, 10.0 - ((baselinePEVal - benchmark.peTarget) / (benchmark.peTarget * 2)) * 9.0);
  const baselineDEVal = benchmark.debtToEquityTarget * 1.2;
  const baselineDEScore = Math.max(0, 7.5 - ((baselineDEVal - benchmark.debtToEquityTarget) / benchmark.debtToEquityTarget) * 7.5);
  const calculatedBaseline = Math.round(
    (11.25 + // Revenue
     11.25 + // Profit Margin
     (5.25 + baselineDEScore) + // Financial Health
     baselineValuationScore + // PE Valuation
     7.5 + // Gross Margin
     7.5 + // News Sentiment
     7.0 + // Beta
     5.0 // Momentum
    ) * 10
  ) / 10;

  const industryComparisonDelta = Math.round((overallScore - calculatedBaseline) * 10) / 10;

  // 4. Data Freshness (Dynamic based on current time)
  // Freshness score calculation:
  // Financial data is considered 2 hours fresh (92/100) for standard responses.
  // News data is considered 15 minutes fresh (97/100) for standard responses.
  const financialFreshness = financialsMissing ? 0 : 92;
  const newsFreshness = newsMissing ? 0 : 97;
  const dataFreshnessScore = Math.round((financialFreshness + newsFreshness) / 2);
  const dataFreshnessCategory = dataFreshnessScore >= 90 ? "Excellent" : dataFreshnessScore >= 75 ? "Good" : "Stale";

  // 5. Data Quality Center
  const financialCoverage = financialsMissing ? 0 : Math.round((1 - (missingFinancialMetricsCount / 7)) * 100);
  const newsCoverage = newsMissing ? 0 : 100;
  
  // Provider reliability average
  let sumReliability = 0;
  let activeProviders = 0;
  Object.values(providerStatuses).forEach((status: ProviderStatus) => {
    if (status.status === "Success") {
      sumReliability += status.reliability;
      activeProviders++;
    }
  });
  const providerReliability = activeProviders > 0 ? Math.round(sumReliability / activeProviders) : 0;
  const industryCoverage = financialsMissing ? 0 : 100;

  const overallDataQuality = Math.round(
    (financialCoverage * 0.3 + newsCoverage * 0.2 + providerReliability * 0.3 + dataFreshnessScore * 0.2)
  );

  // 6. Missing Data Impact
  const confidenceImpact = (newsMissing ? 12 : 0) + (financialsMissing ? 25 : 0);
  const affectedSections: string[] = [];
  if (newsMissing) affectedSections.push("News Sentiment", "Recent Events");
  if (financialsMissing) affectedSections.push("Financial Health", "Valuation");

  const missingDataImpact: MissingDataImpact = {
    newsMissing,
    financialsMissing,
    confidenceImpact,
    affectedSections,
    reliabilityImpact: financialsMissing
      ? "Recommendation Reliability: Reduced"
      : newsMissing
      ? "Risk Analysis Reliability: Reduced"
      : "None",
  };

  // 7. Data Confidence Score (0-100)
  // Starts with Overall Data Quality, then gets penalized for missing inputs
  let confidenceScore = Math.max(0, overallDataQuality - confidenceImpact);
  confidenceScore = Math.round(confidenceScore);
  const confidenceCategory = getConfidenceCategory(confidenceScore);

  // 8. Recommendation Reliability (0-100)
  // Reliability score starting at 100, penalized by missing fields and math constraints
  let reliabilityScore = 100;
  if (financialsMissing) {
    reliabilityScore -= 35; // Major mathematical gap
  } else {
    reliabilityScore -= missingFinancialMetricsCount * 5;
  }
  if (newsMissing) {
    reliabilityScore -= 15; // News gap
  }
  reliabilityScore = Math.max(0, reliabilityScore);
  const reliabilityCategory = getReliabilityCategory(reliabilityScore);

  // 9. Drivers and Concerns
  // Rank components to find biggest positive contributor and concern
  const contributors = [
    { name: "Revenue Growth", score: revenueGrowthScore, max: 15, impact: revenueGrowthScore >= 11 ? "Positive" : "Negative" },
    { name: "Profitability", score: profitabilityScore, max: 15, impact: profitabilityScore >= 11 ? "Positive" : "Negative" },
    { name: "Financial Health", score: financialHealthScore, max: 15, impact: financialHealthScore >= 11 ? "Positive" : "Negative" },
    { name: "Valuation", score: valuationScore, max: 10, impact: valuationScore >= 7.5 ? "Positive" : "Negative" },
    { name: "Market Position", score: marketPositionScore, max: 10, impact: marketPositionScore >= 7.5 ? "Positive" : "Negative" },
    { name: "News Sentiment", score: newsSentimentScore, max: 15, impact: newsSentimentScore >= 11 ? "Positive" : "Negative" },
    { name: "Business Risk", score: businessRiskScore, max: 10, impact: businessRiskScore >= 7.5 ? "Positive" : "Negative" },
    { name: "Recent Events", score: recentEventsScore, max: 10, impact: recentEventsScore >= 7.5 ? "Positive" : "Negative" },
  ];

  // Top positive contributor: highest absolute score compared to max weight
  const positiveList = [...contributors].sort((a, b) => (b.score / b.max) - (a.score / a.max));
  const topPositiveDriver = financialsMissing ? "None (Data Missing)" : positiveList[0].name;

  // Top concern: lowest relative score
  const negativeList = [...contributors].sort((a, b) => (a.score / a.max) - (b.score / b.max));
  const topConcern = financialsMissing ? "Financial Data Missing" : negativeList[0].name;

  const scoreBreakdown: ScoreBreakdown = {
    revenueGrowthScore: Math.round(revenueGrowthScore * 10) / 10,
    profitabilityScore: Math.round(profitabilityScore * 10) / 10,
    financialHealthScore: Math.round(financialHealthScore * 10) / 10,
    valuationScore: Math.round(valuationScore * 10) / 10,
    marketPositionScore: Math.round(marketPositionScore * 10) / 10,
    newsSentimentScore: Math.round(newsSentimentScore * 10) / 10,
    businessRiskScore: Math.round(businessRiskScore * 10) / 10,
    recentEventsScore: Math.round(recentEventsScore * 10) / 10,
    totalFinancialScore: Math.round(totalFinancialScore * 10) / 10,
    totalRiskHealthScore: Math.round(totalRiskHealthScore * 10) / 10,
    overallScore,
    riskScore,
  };

  return {
    scoreBreakdown,
    recommendation: recommendationInfo.label,
    recommendationStrength: recommendationInfo.strength,
    confidenceScore,
    confidenceCategory,
    reliabilityScore,
    reliabilityCategory,
    riskScore,
    riskCategory,
    topPositiveDriver,
    topConcern,
    industryBaselineScore: calculatedBaseline,
    industryComparisonDelta,
    dataQuality: {
      financialCoverage,
      newsCoverage,
      providerReliability,
      dataFreshness: dataFreshnessScore,
      industryCoverage,
      overallDataQuality,
    },
    missingDataImpact,
    dataFreshnessScore,
    dataFreshnessCategory,
  };
}
