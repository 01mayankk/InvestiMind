# AI Development Log - InvestiMind AI

This file documents the prompts, responses, errors, corrections, and structural decisions made by the AI coding assistant during the generation of the InvestiMind AI platform.

---

## 1. Initial Prompt Planning

- **Goal**: Build an AI Investment Research Agent using Next.js, LangGraph, and Gemini 2.5 Flash.
- **Decision Boundary**: The recommendation must be deterministic. The AI must never calculate scores, select metrics, or decide on the PASS/INVEST recommendation. The AI acts only as a qualitative explainability synthesizer.
- **LangGraph Nodes**:
  - `FinancialResearchNode`
  - `NewsAggregationNode`
  - `InvestmentScoringNode`
  - `AIExplanationNode`
  - `ReportGenerationNode`

---

## 2. API Schema Validation Decisions

- **Decision**: Define a single nested response schema in `src/types/research.ts` using Zod.
- **Reasoning**: We wanted to prevent unchecked payloads from reaching the frontend components. If the data is parsed at the API boundary, React components can confidently print metrics (e.g. `revenueGrowth`) without crash risks or verbose null check loops.
- **Validation Schema**: Enforced `ResearchResponseSchema` containing data coverage lists, provider health indicators, and AI analysis blocks.

---

## 3. Library Corrections & Runtime Debugging

### Issue A: Yahoo Finance Upgrade v3 Error
- **Error**: `Call const yahooFinance = new YahooFinance() first. Upgrading from v2?`
- **Correction**: The bootstrapped library `yahoo-finance2` was updated from version 2 to 3. In the new version, static methods are deprecated, and it requires creating a client instance.
- **Code Fix**:
  ```typescript
  import YahooFinance from 'yahoo-finance2';
  const yahooFinance = new YahooFinance();
  ```

### Issue B: LangChain Google GenAI Model Setup
- **Error**: `Object literal may only specify known properties, and 'modelName' does not exist in type 'GoogleGenerativeAIChatInput'`
- **Correction**: The class `ChatGoogleGenerativeAI` expects the key `model` instead of `modelName`.
- **Code Fix**:
  ```typescript
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: apiKey,
    temperature: 0.15,
  });
  ```

### Issue C: TypeScript implicit any and type casting in ts-node
- **Error**: Compiling `testWorkflow.ts` returned error `reportId does not exist on type {}` due to state inference.
- **Correction**: Cast the LangGraph output directly through `unknown` to `GraphState`:
  ```typescript
  const result = (await investmentResearchGraph.invoke(initialState)) as unknown as GraphState;
  ```
