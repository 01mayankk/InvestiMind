# InvestiMind AI - Master Project Generation Prompt

This document contains a refined, single-execution prompt designed to guide an AI coding agent to recreate the InvestiMind AI platform from scratch.

---

## The Master Prompt

```markdown
# Master Project Instruction: InvestiMind AI

You are a Senior Staff Software Engineer and Product Architect. Your task is to design and implement a complete production-quality project named:

# InvestiMind AI
"InvestiMind AI – Intelligent Investment Research Powered by Explainable AI"

---

## 1. Absolute Architecture Freeze (No Databases, Auth, or Swarms)
DO NOT ADD:
- PostgreSQL, MongoDB, Redis, Supabase, Firebase
- Authentication or user account sessions
- Vector databases, Pinecone, ChromaDB, Weaviate, RAG systems
- Background workers, queues, websockets, or multi-agent swarms

The platform must operate on zero persistent server storage, running server-side requests via Next.js Serverless API routes and caching data in local memory.

---

## 2. Directory Layout Requirement
Organize the project files exactly as follows:
```
src/
  app/
    api/
      research/
        route.ts
    layout.tsx
    page.tsx
  components/
    DashboardView.tsx
    InvestmentSummaryCard.tsx
    ExecutiveSummary.tsx
    ExplainabilityCenter.tsx
    InvestmentHealthReport.tsx
    ScoreContributionView.tsx
    MissingDataImpactCenter.tsx
    ConfidenceBreakdownView.tsx
    DataFreshnessCenter.tsx
    TransparencyPanel.tsx
    ProviderHealthCenter.tsx
    Charts/
      GaugeChart.tsx
      ScoreBarChart.tsx
      SentimentPieChart.tsx
      RadarComparisonChart.tsx
  agents/
    investmentResearchGraph.ts
  tools/
    yahooFinanceTool.ts
    newsFetcherTool.ts
  services/
    cache/
      cacheProvider.ts
      memoryCacheProvider.ts
    fetchCompanyFinancials.ts
    fetchCompanyNews.ts
    calculateInvestmentScore.ts
    generateInvestmentAnalysis.ts
  config/
    scoringRules.ts
    industryBenchmarks.ts
  types/
    research.ts
  lib/
    pdfExporter.ts
    tailwindMergeUtility.ts
  hooks/
    useTheme.ts
  docs/
    ARCHITECTURE.md
    API.md
    DECISION_ENGINE.md
    SCORING_METHODOLOGY.md
    SETUP.md
    DEPLOYMENT.md
    CONTRIBUTING.md
    FUTURE_ROADMAP.md
    AI_DEVELOPMENT_LOG.md
    PROJECT_GENERATION_PROMPT.md
```

---

## 3. Strict Coding Standards
- **Strict TypeScript**: Avoid `any` except when dealing with third-party libraries (e.g. yahoo-finance2 v3) where typings are incomplete.
- **Zod Validation**: All external API endpoints, Yahoo Finance fetches, and Gemini responses must pass through strict Zod schema validation before logic execution.
- **Vague Files Prohibited**: Do not write files named `utils.ts`, `helpers.ts`, `common.ts`, or `service.ts`. Every filename must clearly state its singular responsibility.
- **Theme**: Premium fintech dark mode default with light mode toggle support.

---

## 4. LangGraph Agent Workflows
Implement the agent state machine in `src/agents/investmentResearchGraph.ts` with five nodes:
1. `START` -> **FinancialResearchNode** (fetches Yahoo Finance metrics)
2. **NewsAggregationNode** (fetches news sequentially: GNews -> NewsAPI -> Apify Twitter Scraper)
3. **InvestmentScoringNode** (runs deterministic calculations)
4. **AIExplanationNode** (synthesizes thesis blocks via a single Gemini 2.5 Flash call)
5. **ReportGenerationNode** (validates Zod payload and logs audit Report ID) -> `END`

---

## 5. Double-Score & Risk Systems
- **Scoring Weighting**: Overall Score = (Financial Score × 0.65) + (Risk Health Score × 0.35).
- **Financial Score (65 max)**: Revenue growth (15), Profitability Net margin (15), Health CR/DE (15), Valuation PE (10), Position gross margin (10). Continuous scaling only.
- **Risk Score (0-100)**: Derived from Beta, News sentiment lexicon, Recent momentum, and solvency. Mapped to risk categories.
- **Confidence (0-100)**: Focuses on data completeness, reliability, and freshness. Deducts 12 points if news is missing, 25 points if financials are missing.
- **Reliability (0-100)**: Focuses on mathematical completeness. Deducts 35 points if financials are missing, 15 points if news is missing.

---

## 6. Audit & PDF Export
- **Report Audit ID**: Format `INV-[YEAR]-[TICKER]-[HASH]` generated for tracking.
- **PDF Schema**: Generate a 5-page PDF report by page-by-page capturing DOM components.
  - Page 1: Executive Summary & Recommendation Card
  - Page 2: AI Thesis, Counter Thesis, Bull/Bear Cases
  - Page 3: Score Breakdown Matrix & Why Not Higher/Lower lists
  - Page 4: Recharts Visualizations & Industry comparison
  - Page 5: Provider Health stats, AI Transparency Panel (showing 0% scoring influence), and Metadata logs.
```
