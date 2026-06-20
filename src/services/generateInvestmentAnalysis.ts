import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { FinancialData, NewsItem, AIAnalysis, ScoreBreakdown } from "../types/research";

const AIAnalysisZodSchema = z.object({
  executiveSummary: z.string().describe("Summarize the recommendation, overall score, confidence, positive drivers, and risks in 150 words or less."),
  thesis: z.array(z.string()).describe("List 3-4 bullet points outlining key reasons to invest."),
  counterThesis: z.array(z.string()).describe("List 3-4 bullet points outlining primary concerns or risks."),
  bullCase: z.string().describe("Best-case operating and stock performance outlook."),
  bearCase: z.string().describe("Worst-case operating and stock performance outlook."),
  narrativeExplanation: z.string().describe("Narrative explanation of the final decision and score contributors."),
});

export async function generateInvestmentAnalysis(
  financials: FinancialData | null,
  news: NewsItem[],
  scoreBreakdown: ScoreBreakdown,
  recommendation: string,
  confidenceScore: number,
  reliabilityScore: number,
  riskScore: number
): Promise<AIAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Returning placeholder text explanations.");
    return getFallbackExplanations(financials?.companyName || "Unknown Ticker");
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.15,
    });

    const structuredLlm = model.withStructuredOutput(AIAnalysisZodSchema);

    // Format metrics and headlines as a highly compressed prompt
    const ticker = financials?.ticker || "Unknown";
    const name = financials?.companyName || "Unknown";
    const sector = financials?.sector || "Unknown";

    const metricsText = financials
      ? `Ticker: ${ticker}
Company: ${name}
Sector: ${sector}
Revenue Growth: ${financials.revenueGrowth != null ? (financials.revenueGrowth * 100).toFixed(1) + "%" : "N/A"}
Net Margin: ${financials.netProfitMargin != null ? (financials.netProfitMargin * 100).toFixed(1) + "%" : "N/A"}
Gross Margin: ${financials.grossMargin != null ? (financials.grossMargin * 100).toFixed(1) + "%" : "N/A"}
Current Ratio: ${financials.currentRatio || "N/A"}
Debt-to-Equity: ${financials.debtToEquity || "N/A"}
P/E Ratio: ${financials.peRatio || "N/A"}
Beta: ${financials.beta || "N/A"}
Current Price: $${financials.currentPrice || "N/A"}`
      : `Ticker: ${ticker}
Company: ${name}
Sector: ${sector}
(Financial metrics unavailable)`;

    const newsText = news.length > 0
      ? news.map((item, idx) => `[Headline ${idx + 1}]: "${item.title}" (Source: ${item.source})`).join("\n")
      : "(Recent news headlines unavailable)";

    const scoringText = `Deterministic Scoring Engine Output:
Recommendation: ${recommendation}
Overall Score: ${scoreBreakdown.overallScore} / 100
Confidence Score: ${confidenceScore} / 100
Reliability Score: ${reliabilityScore} / 100
Risk Score: ${riskScore} / 100
Financial Sub-score: ${scoreBreakdown.totalFinancialScore} / 65
Risk/News Sub-score: ${scoreBreakdown.totalRiskHealthScore} / 35`;

    const prompt = `You are a Senior Investment Research Analyst.
Your task is to analyze the financial and news data for ${name} and provide structured explanations for our dashboard.

IMPORTANT CONSTRAINTS:
1. DO NOT alter the calculated score (${scoreBreakdown.overallScore}), recommendation (${recommendation}), or any risk metric.
2. The Scoring Engine is 100% deterministic and final. Your job is ONLY to explain the results factually.
3. Every narrative statement MUST align with the numerical metrics and news headlines provided below. Do not invent metrics or facts.
4. Keep the 'executiveSummary' under 150 words.

DATA INPUTS:
=== Financial Metrics ===
${metricsText}

=== Scoring Output ===
${scoringText}

=== Recent News Headlines (Top 5) ===
${newsText}

Provide your analysis in the required JSON schema.`;

    const result = await structuredLlm.invoke(prompt);
    return result;

  } catch (err) {
    console.error("Gemini AI explanation failed:", err);
    return getFallbackExplanations(financials?.companyName || "Unknown Ticker");
  }
}

function getFallbackExplanations(companyName: string): AIAnalysis {
  return {
    executiveSummary: `Explanation analysis for ${companyName} was unable to generate because the Gemini API key was not configured or the request timed out. Please verify your environment configurations.`,
    thesis: [
      `No AI-generated thesis available. Please review the numerical metrics in the charts below.`,
      `Verify that GEMINI_API_KEY is correctly set in your environment file.`
    ],
    counterThesis: [
      `No AI-generated counter-thesis available.`,
      `Please review valuation parameters and P/E compared to sector expectations.`
    ],
    bullCase: "Not available.",
    bearCase: "Not available.",
    narrativeExplanation: "Not available.",
  };
}
