import fs from "fs";
import path from "path";
import { investmentResearchGraph, GraphState } from "../agents/investmentResearchGraph";

// Simple manual .env parser to avoid extra packages
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        // Remove surrounding quotes if any
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    });
    console.log("Loaded environment variables from .env");
  } else {
    console.warn(".env file not found. Running with default process environment.");
  }
}

async function main() {
  loadEnv();

  const testQuery = process.argv[2] || "AAPL";
  console.log(`\n=== Running Test Analysis for Ticker: "${testQuery}" ===\n`);

  const initialState = {
    query: testQuery,
    ticker: "",
    companyName: "",
    sector: "",
    financialData: null,
    newsData: [],
    providerStatuses: {},
    warningMessages: [],
    scoreResult: null,
    aiAnalysis: null,
    finalReport: null,
  };

  try {
    const result = (await investmentResearchGraph.invoke(initialState)) as unknown as GraphState;
    const report = result.finalReport;

    if (!report) {
      console.error("Workflow completed but finalReport is null.");
      return;
    }

    console.log("=== ANALYSIS REPORT METADATA ===");
    console.log(`Report ID:       ${report.reportId}`);
    console.log(`Timestamp:       ${report.timestamp}`);
    console.log(`Company Name:    ${report.companyName} (${report.ticker})`);
    console.log(`Sector:          ${report.sector}`);
    
    console.log("\n=== DETERMINISTIC SCORE BREAKDOWN ===");
    console.log(`Recommendation:  ${report.recommendation} (Strength: ${report.recommendationStrength})`);
    console.log(`Overall Score:   ${report.overallScore} / 100`);
    console.log(`Confidence:      ${report.confidenceScore} / 100 (${report.confidenceCategory})`);
    console.log(`Reliability:     ${report.reliabilityScore} / 100 (${report.reliabilityCategory})`);
    console.log(`Risk Score:      ${report.riskScore} / 100 (${report.riskCategory})`);
    console.log(`Industry Delta:  ${report.industryComparisonDelta >= 0 ? "+" : ""}${report.industryComparisonDelta} vs Baseline ${report.industryBaselineScore}`);
    console.log(`Top Driver:      ${report.topPositiveDriver}`);
    console.log(`Top Concern:     ${report.topConcern}`);
    
    console.log("\n=== SUB-SCORES ===");
    console.log(JSON.stringify(report.scoreBreakdown, null, 2));

    console.log("\n=== AI EXPLANATION OUTPUT ===");
    console.log("--- Executive Summary ---");
    console.log(report.aiAnalysis.executiveSummary);
    console.log("\n--- Thesis ---");
    report.aiAnalysis.thesis.forEach((point: string) => console.log(`* ${point}`));
    console.log("\n--- Counter-Thesis ---");
    report.aiAnalysis.counterThesis.forEach((point: string) => console.log(`* ${point}`));
    console.log(`\n--- Bull Case ---\n${report.aiAnalysis.bullCase}`);
    console.log(`\n--- Bear Case ---\n${report.aiAnalysis.bearCase}`);
    
    console.log("\n=== PROVIDER STATUS & QUALITY ===");
    console.log(JSON.stringify(report.providerHealth, null, 2));
    console.log(JSON.stringify(report.dataQuality, null, 2));

    if (result.warningMessages.length > 0) {
      console.log("\n=== WARNING MESSAGES ===");
      result.warningMessages.forEach((msg: string) => console.warn(`[WARNING] ${msg}`));
    }

  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

main();
