# Decision Engine & Scoring Philosophy - InvestiMind AI

InvestiMind AI is engineered to address the core problem of trust and explainability in financial AI products. Many AI-driven investment tools suffer from "black box" decisions where predictions or ratings are generated in the hidden weights of an LLM.

In InvestiMind AI, we enforce a strict architectural boundary: **The Investment Decision is 100% Deterministic Code.**

---

## 1. Separation of Responsibilities

The system is split into two mutually isolated components:

```
┌──────────────────────────────────────────────┐
│            DETERMINISTIC ENGINE              │
│       - Metric extraction from APIs          │
│       - Benchmark comparisons                │
│       - Weighted score calculation           │
│       - Recommendation categorization        │
│       - Confidence index calculation         │
└──────────────────────┬───────────────────────┘
                       │
                       │ Outputs numbers, ratios, and final recommendation
                       ▼
┌──────────────────────────────────────────────┐
│              EXPLAINABLE AI                  │
│       - Accepts numbers and news titles      │
│       - Synthesizes investment thesis        │
│       - Drafts bull/bear narratives          │
│       - Summarizes in human-readable terms   │
│       - STRICTLY FORBIDDEN from altering math│
└──────────────────────────────────────────────┘
```

---

## 2. Dynamic Benchmark Rationale

Instead of checking absolute standards (e.g. comparing a high-leverage bank's Debt-to-Equity to a debt-free software provider using the same standard), the engine dynamically loads sector targets:

- **Technology**: Targets high growth (15%), high margins (gross 50%, net 20%), low leverage (D/E 0.8), and accepts premium P/E multiples (25.0).
- **Financial Services**: Targets lower growth (6%), very high leverage (D/E 2.5), and low P/E multiples (14.0).
- **Utilities**: Targets low growth (3%), high asset-backed debt (D/E 1.5), stable net margins (12%), and low P/E multiples (16.0).

This guarantees that a company is rated **fairly relative to its peers**, preventing incorrect PASS recommendations for asset-heavy or cyclical entities.

---

## 3. Audit Trails & Reproducibility
- **Fixed Algorithms**: The code inside `src/services/calculateInvestmentScore.ts` contains no random numbers, temperature variables, or stochastic models. Given the same inputs, it yields the exact same scores, drivers, and recommendations every time.
- **Trace Auditing**: We output the full calculations under the `scoreBreakdown` field, which displays raw sub-scores before overall scaling. This allows an external analyst to manually recalculate and verify the platform's decision.
- **V2.1 Visual Telemetry Trace**: The Audit tab in the terminal decomposes this telemetry into 5 collapsible panels. Analysts can toggle detailed logs for calculation trace weights, data sources coverage, and provider health timelines without dashboard clutter.

