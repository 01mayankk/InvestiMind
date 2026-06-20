# API Contract - InvestiMind AI

InvestiMind AI exposes a single unified research route on its backend.

---

## 1. Research Initiation Endpoint

- **Route**: `/api/research`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

### Request Body (JSON)
```json
{
  "query": "AAPL"
}
```
*Note: The query field can be a company stock ticker (e.g., "AAPL", "MSFT") or a search name (e.g., "Tesla", "Microsoft"). The system automatically searches and resolves names to tickers.*

---

## 2. Success Response Payload (200 OK)

A fully successful run returns a nested research report structure validated against the Zod schema:

```json
{
  "reportId": "INV-2026-AAPL-E4D2",
  "timestamp": "2026-06-20T15:46:12.345Z",
  "ticker": "AAPL",
  "companyName": "Apple Inc.",
  "sector": "Technology",
  "recommendation": "INVEST",
  "recommendationStrength": "Strong",
  "overallScore": 78.4,
  "confidenceScore": 87,
  "confidenceCategory": "High",
  "reliabilityScore": 95,
  "reliabilityCategory": "Very Reliable",
  "riskScore": 45.2,
  "riskCategory": "Moderate",
  "topPositiveDriver": "Revenue Growth",
  "topConcern": "Valuation",
  "industryBaselineScore": 68.4,
  "industryComparisonDelta": 10.0,
  "dataFreshnessScore": 94,
  "dataFreshnessCategory": "Excellent",
  "financialData": {
    "ticker": "AAPL",
    "companyName": "Apple Inc.",
    "sector": "Technology",
    "revenueGrowth": 0.148,
    "netProfitMargin": 0.214,
    "grossMargin": 0.443,
    "currentRatio": 1.95,
    "debtToEquity": 0.85,
    "beta": 1.2,
    "peRatio": 28.5,
    "currentPrice": 185.3,
    "fiftyTwoWeekHigh": 198.2,
    "fiftyTwoWeekLow": 165.4
  },
  "newsData": [
    {
      "title": "Apple announces revenue growth exceeds expectations...",
      "url": "https://example.com/news/1",
      "source": "GNews",
      "publishedAt": "2026-06-20T12:00:00Z"
    }
  ],
  "scoreBreakdown": {
    "revenueGrowthScore": 13.7,
    "profitabilityScore": 12.8,
    "financialHealthScore": 11.9,
    "valuationScore": 6.5,
    "marketPositionScore": 9.0,
    "newsSentimentScore": 10.3,
    "businessRiskScore": 6.4,
    "recentEventsScore": 7.8,
    "totalFinancialScore": 53.9,
    "totalRiskHealthScore": 24.5,
    "overallScore": 78.4,
    "riskScore": 30.0
  },
  "aiAnalysis": {
    "executiveSummary": "Apple exhibits strong revenue growth and industry-leading margins, outperforming baseline benchmarks...",
    "thesis": [
      "Revenue growth exceeding technology industry expectations.",
      "Net profit margin of 21.4% highlights extreme capital efficiency."
    ],
    "counterThesis": [
      "P/E ratio of 28.5 trades at a premium valuation compared to benchmarks."
    ],
    "bullCase": "Operating margins continue expanding as services revenue scaling accelerates.",
    "bearCase": "Hardware replacement cycles slow down amidst regulatory pressure.",
    "narrativeExplanation": "Calculated score is supported by positive drivers in gross margins, counterbalanced by P/E multiples."
  },
  "providerHealth": {
    "Yahoo Finance": {
      "name": "Yahoo Finance",
      "status": "Success",
      "latencyMs": 420,
      "reliability": 98,
      "coverage": 100,
      "fallbackUsed": false
    },
    "GNews": {
      "name": "GNews",
      "status": "Success",
      "latencyMs": 580,
      "reliability": 95,
      "coverage": 100,
      "fallbackUsed": false
    }
  },
  "dataQuality": {
    "financialCoverage": 100,
    "newsCoverage": 100,
    "providerReliability": 96,
    "dataFreshness": 94,
    "industryCoverage": 100,
    "overallDataQuality": 89
  },
  "missingDataImpact": {
    "newsMissing": false,
    "financialsMissing": false,
    "confidenceImpact": 0,
    "affectedSections": [],
    "reliabilityImpact": "None"
  }
}
```

---

## 3. Error / Failure Responses

### Invalid Input Payload (400 Bad Request)
Returned when Zod request validation fails.
```json
{
  "error": "Invalid request payload",
  "details": {
    "query": {
      "_errors": ["Ticker or Company Name is required"]
    }
  }
}
```

### Server Error / Timeout Failures (500 Internal Server Error)
Returned when internal LangGraph threads fail or time out.
```json
{
  "error": "An unexpected error occurred during research aggregation.",
  "details": "Timeout of 5000ms exceeded"
}
```
