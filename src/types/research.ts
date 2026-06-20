import { z } from "zod";

// Financial Data Zod Schema
export const FinancialDataSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  sector: z.string(),
  revenueGrowth: z.number().nullable(),
  netProfitMargin: z.number().nullable(),
  grossMargin: z.number().nullable(),
  currentRatio: z.number().nullable(),
  debtToEquity: z.number().nullable(),
  beta: z.number().nullable(),
  peRatio: z.number().nullable(),
  currentPrice: z.number().nullable(),
  fiftyTwoWeekHigh: z.number().nullable(),
  fiftyTwoWeekLow: z.number().nullable(),
});

export type FinancialData = z.infer<typeof FinancialDataSchema>;

// News Item Schema
export const NewsItemSchema = z.object({
  title: z.string(),
  url: z.string().url().or(z.string()),
  source: z.string(),
  publishedAt: z.string(),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;

// AI Explanation Schema (Gemini generated response)
export const AIAnalysisSchema = z.object({
  executiveSummary: z.string(),
  thesis: z.array(z.string()),
  counterThesis: z.array(z.string()),
  bullCase: z.string(),
  bearCase: z.string(),
  narrativeExplanation: z.string(),
});

export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;

// Score Breakdown Schema
export const ScoreBreakdownSchema = z.object({
  revenueGrowthScore: z.number(),
  profitabilityScore: z.number(),
  financialHealthScore: z.number(),
  valuationScore: z.number(),
  marketPositionScore: z.number(),
  newsSentimentScore: z.number(),
  businessRiskScore: z.number(),
  recentEventsScore: z.number(),
  totalFinancialScore: z.number(),
  totalRiskHealthScore: z.number(),
  overallScore: z.number(),
  riskScore: z.number(),
});

export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

// Provider Status Schema
export const ProviderStatusSchema = z.object({
  name: z.string(),
  status: z.enum(["Success", "Failed", "Unavailable"]),
  latencyMs: z.number().optional(),
  reliability: z.number(),
  coverage: z.number(),
  fallbackUsed: z.boolean(),
});

export type ProviderStatus = z.infer<typeof ProviderStatusSchema>;

// Data Quality Schema
export const DataQualitySchema = z.object({
  financialCoverage: z.number(),
  newsCoverage: z.number(),
  providerReliability: z.number(),
  dataFreshness: z.number(),
  industryCoverage: z.number(),
  overallDataQuality: z.number(),
});

export type DataQuality = z.infer<typeof DataQualitySchema>;

// Missing Data Impact Schema
export const MissingDataImpactSchema = z.object({
  newsMissing: z.boolean(),
  financialsMissing: z.boolean(),
  confidenceImpact: z.number(),
  affectedSections: z.array(z.string()),
  reliabilityImpact: z.string(),
});

export type MissingDataImpact = z.infer<typeof MissingDataImpactSchema>;

// Combined Research Response Schema (API response)
export const ResearchResponseSchema = z.object({
  reportId: z.string(),
  timestamp: z.string(),
  ticker: z.string(),
  companyName: z.string(),
  sector: z.string(),
  recommendation: z.string(),
  recommendationStrength: z.string(),
  overallScore: z.number(),
  confidenceScore: z.number(),
  confidenceCategory: z.string(),
  reliabilityScore: z.number(),
  reliabilityCategory: z.string(),
  riskScore: z.number(),
  riskCategory: z.string(),
  topPositiveDriver: z.string(),
  topConcern: z.string(),
  industryBaselineScore: z.number(),
  industryComparisonDelta: z.number(),
  dataFreshnessScore: z.number(),
  dataFreshnessCategory: z.string(),
  financialData: FinancialDataSchema,
  newsData: z.array(NewsItemSchema),
  scoreBreakdown: ScoreBreakdownSchema,
  aiAnalysis: AIAnalysisSchema,
  providerHealth: z.record(z.string(), ProviderStatusSchema),
  dataQuality: DataQualitySchema,
  missingDataImpact: MissingDataImpactSchema,
});

export type ResearchResponse = z.infer<typeof ResearchResponseSchema>;

// API Request Schema
export const ResearchRequestSchema = z.object({
  query: z.string().min(1, "Ticker or Company Name is required"),
});

export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;
