import { StateGraph, START, END } from "@langchain/langgraph";
import crypto from "crypto";
import { fetchCompanyFinancials } from "../services/fetchCompanyFinancials";
import { fetchCompanyNews } from "../services/fetchCompanyNews";
import { calculateInvestmentScore, ScoreEngineResult } from "../services/calculateInvestmentScore";
import { generateInvestmentAnalysis } from "../services/generateInvestmentAnalysis";
import { FinancialData, NewsItem, AIAnalysis, ProviderStatus, ResearchResponse, ResearchResponseSchema } from "../types/research";

// Define the state channel interface for LangGraph
export interface GraphState {
  query: string;
  ticker: string;
  companyName: string;
  sector: string;
  financialData: FinancialData | null;
  newsData: NewsItem[];
  providerStatuses: Record<string, ProviderStatus>;
  warningMessages: string[];
  scoreResult: ScoreEngineResult | null;
  aiAnalysis: AIAnalysis | null;
  finalReport: ResearchResponse | null;
}

// 1. FinancialResearchNode
async function runFinancialResearchNode(state: GraphState): Promise<Partial<GraphState>> {
  console.log(`[FinancialResearchNode] Fetching financials for: ${state.query}`);
  const result = await fetchCompanyFinancials(state.query);
  
  const warnings = [...state.warningMessages];
  if (result.warningMessage) {
    warnings.push(result.warningMessage);
  }

  const ticker = result.financialData?.ticker || state.query.toUpperCase();
  const companyName = result.financialData?.companyName || ticker;
  const sector = result.financialData?.sector || "Unknown";

  const providerStatuses = { ...state.providerStatuses };
  providerStatuses["Yahoo Finance"] = result.providerStatus;

  return {
    ticker,
    companyName,
    sector,
    financialData: result.financialData,
    providerStatuses,
    warningMessages: warnings,
  };
}

// 2. NewsAggregationNode
async function runNewsAggregationNode(state: GraphState): Promise<Partial<GraphState>> {
  console.log(`[NewsAggregationNode] Fetching news for ticker: ${state.ticker}`);
  const result = await fetchCompanyNews(state.companyName, state.ticker);

  const warnings = [...state.warningMessages];
  if (result.warningMessage) {
    warnings.push(result.warningMessage);
  }

  const providerStatuses = { ...state.providerStatuses, ...result.providerStatuses };

  return {
    newsData: result.news,
    providerStatuses,
    warningMessages: warnings,
  };
}

// 3. InvestmentScoringNode
async function runInvestmentScoringNode(state: GraphState): Promise<Partial<GraphState>> {
  console.log(`[InvestmentScoringNode] Calculating deterministic scores for: ${state.ticker}`);
  const scoreResult = calculateInvestmentScore(
    state.financialData,
    state.newsData,
    state.providerStatuses
  );

  return {
    scoreResult,
  };
}

// 4. AIExplanationNode
async function runAIExplanationNode(state: GraphState): Promise<Partial<GraphState>> {
  console.log(`[AIExplanationNode] Generating explainable thesis for: ${state.ticker}`);
  if (!state.scoreResult) {
    throw new Error("Cannot run AI explanation node without scoring results.");
  }

  const aiAnalysis = await generateInvestmentAnalysis(
    state.financialData,
    state.newsData,
    state.scoreResult.scoreBreakdown,
    state.scoreResult.recommendation,
    state.scoreResult.confidenceScore,
    state.scoreResult.reliabilityScore,
    state.scoreResult.riskScore
  );

  return {
    aiAnalysis,
  };
}

// 5. ReportGenerationNode
async function runReportGenerationNode(state: GraphState): Promise<Partial<GraphState>> {
  console.log(`[ReportGenerationNode] Assembling and validating final payload for: ${state.ticker}`);
  if (!state.scoreResult || !state.aiAnalysis) {
    throw new Error("Missing score or AI explanation states.");
  }

  const timestamp = new Date().toISOString();
  const year = new Date().getFullYear();

  // Generate Report ID: INV-[YYYY]-[TICKER]-[4-CHAR-HASH]
  const rawHash = crypto
    .createHash("sha256")
    .update(timestamp + state.ticker)
    .digest("hex");
  const shortHash = rawHash.substring(0, 4).toUpperCase();
  const reportId = `INV-${year}-${state.ticker}-${shortHash}`;

  const payload: ResearchResponse = {
    reportId,
    timestamp,
    ticker: state.ticker,
    companyName: state.companyName,
    sector: state.sector,
    recommendation: state.scoreResult.recommendation,
    recommendationStrength: state.scoreResult.recommendationStrength,
    overallScore: state.scoreResult.scoreBreakdown.overallScore,
    confidenceScore: state.scoreResult.confidenceScore,
    confidenceCategory: state.scoreResult.confidenceCategory,
    reliabilityScore: state.scoreResult.reliabilityScore,
    reliabilityCategory: state.scoreResult.reliabilityCategory,
    riskScore: state.scoreResult.riskScore,
    riskCategory: state.scoreResult.riskCategory,
    topPositiveDriver: state.scoreResult.topPositiveDriver,
    topConcern: state.scoreResult.topConcern,
    industryBaselineScore: state.scoreResult.industryBaselineScore,
    industryComparisonDelta: state.scoreResult.industryComparisonDelta,
    dataFreshnessScore: state.scoreResult.dataFreshnessScore,
    dataFreshnessCategory: state.scoreResult.dataFreshnessCategory,
    financialData: state.financialData || {
      ticker: state.ticker,
      companyName: state.companyName,
      sector: state.sector,
      revenueGrowth: null,
      netProfitMargin: null,
      grossMargin: null,
      currentRatio: null,
      debtToEquity: null,
      beta: null,
      peRatio: null,
      currentPrice: null,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null,
    },
    newsData: state.newsData,
    scoreBreakdown: state.scoreResult.scoreBreakdown,
    aiAnalysis: state.aiAnalysis,
    providerHealth: state.providerStatuses,
    dataQuality: state.scoreResult.dataQuality,
    missingDataImpact: state.scoreResult.missingDataImpact,
  };

  // Enforce strict Zod schema validation before completion
  const validatedPayload = ResearchResponseSchema.parse(payload);

  return {
    finalReport: validatedPayload,
  };
}

// Define the LangGraph State Machine
const workflow = new StateGraph<GraphState>({
  channels: {
    query: null,
    ticker: null,
    companyName: null,
    sector: null,
    financialData: null,
    newsData: null,
    providerStatuses: null,
    warningMessages: null,
    scoreResult: null,
    aiAnalysis: null,
    finalReport: null,
  },
})
  // Register Nodes
  .addNode("FinancialResearchNode", runFinancialResearchNode)
  .addNode("NewsAggregationNode", runNewsAggregationNode)
  .addNode("InvestmentScoringNode", runInvestmentScoringNode)
  .addNode("AIExplanationNode", runAIExplanationNode)
  .addNode("ReportGenerationNode", runReportGenerationNode)
  
  // Set Edges
  .addEdge(START, "FinancialResearchNode")
  .addEdge("FinancialResearchNode", "NewsAggregationNode")
  .addEdge("NewsAggregationNode", "InvestmentScoringNode")
  .addEdge("InvestmentScoringNode", "AIExplanationNode")
  .addEdge("AIExplanationNode", "ReportGenerationNode")
  .addEdge("ReportGenerationNode", END);

// Compile the runnable graph
export const investmentResearchGraph = workflow.compile();
