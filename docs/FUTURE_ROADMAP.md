# Future Product Roadmap - InvestiMind AI

InvestiMind AI is designed to scale from a single-page research utility into an enterprise-grade investment analytics platform. Below is the multi-phase plan:

---

## Phase 1: Core Research Agent (Current Release)
- Dynamic company and ticker lookup.
- Deterministic scoring comparing financials against sector benchmarks.
- News aggregation fallback chains.
- Gemini-powered explainability narratives.
- Detailed visual dashboards and multi-page PDF generation.

---

## Phase 2: Industry Comparison Expansion
- **Live Peer Analysis**: Automatically query the top 3 direct competitors of a searched company and chart their scores side-by-side.
- **Dynamic Peer Averages**: Replace static baseline sector values with live, real-time averages of active peer metrics.
- **Sector Volatility Indexing**: Track sector Beta changes to adjust business risk ratings automatically.

---

## Phase 3: Portfolio & Historical Tracker
- **Portfolio Health Report**: Upload a CSV of current holdings to calculate aggregated portfolio scoring, risk ratings, and data quality metrics.
- **Historical Analysis Tracker**: Save queries into a lightweight local SQLite database to display 30-day score history and alert cards on metric drift.
- **Drift Warnings**: Notify user if a company's financial score drops by more than 5 points between updates.

---

## Phase 4: Institutional Research Integration
- **Alternative News Parsing**: Parse regulatory filings (SEC 10-K and 10-Q) using PDF text extraction tools to feed risks directly into the business risk scorer.
- **Institutional Sentiment Index**: Scraping alternative channels (such as earnings call transcripts) to generate high-fidelity corporate sentiment scores.
- **Enterprise PDF Branding Customizer**: Let institutional analysts upload company logos and custom color schemes to style the 5-page PDF export dynamically.
