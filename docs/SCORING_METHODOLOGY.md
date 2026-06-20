# Scoring Methodology - InvestiMind AI

This document provides a mathematical and logical audit trail of how InvestiMind AI calculates scores, ratings, confidence values, and investment recommendations.

---

## 1. Weighting Framework

The final decision is 100% deterministic, governed by the following formula:

$$\text{Overall Score (0-100)} = (\text{Financial Score} \times 0.65) + (\text{Risk Health Score} \times 0.35)$$

The breakdown of sub-scores is:

| Category | Component | Max Points | Metric Source |
| :--- | :--- | :--- | :--- |
| **Financial (65)** | Revenue Growth | 15 | Income Statement |
| | Profitability (Net Margin) | 15 | Income Statement |
| | Financial Health | 15 | Balance Sheet (Current Ratio & D/E) |
| | Valuation (P/E Ratio) | 10 | Market Price vs EPS |
| | Market Position (Gross Margin) | 10 | Income Statement |
| **Risk/News (35)** | News Sentiment | 15 | GNews / NewsAPI Fallback Chain |
| | Business Risk (Beta) | 10 | Key Statistics |
| | Recent Events (Momentum) | 10 | Price relative to 52-Week Range |

---

## 2. Mathematical Scoring Formulas

All metrics are scored continuously. Binary thresholds (e.g. `if Growth > 10% then 15 else 0`) are prohibited.

### Revenue Growth (Max 15)
Evaluated relative to the dynamic sector benchmark target ($T_{rev}$):
$$\text{Score} = \max\left(0, \min\left(15, \left(\frac{\text{YoY Growth}}{T_{rev}}\right) \times 15\right)\right)$$

### Profitability (Max 15)
Evaluated relative to the sector net profit margin target ($T_{profit}$):
$$\text{Score} = \max\left(0, \min\left(15, \left(\frac{\text{Net Margin}}{T_{profit}}\right) \times 15\right)\right)$$

### Financial Health (Max 15)
Split into **Current Ratio** (7.5 pts) and **Debt-to-Equity** (7.5 pts):
- **Current Ratio**: Target is 2.0.
  $$\text{Score}_{CR} = \min\left(7.5, \left(\frac{\text{Current Ratio}}{2.0}\right) \times 7.5\right)$$
- **Debt-to-Equity**: Target is sector benchmark ($T_{DE}$):
  - If $\text{D/E} \le T_{DE}$, $\text{Score}_{DE} = 7.5$.
  - If $\text{D/E} > T_{DE}$, $\text{Score}_{DE} = \max\left(0, 7.5 - \left(\frac{\text{D/E} - T_{DE}}{T_{DE}}\right) \times 7.5\right)$.

### Valuation / P/E Ratio (Max 10)
Evaluated relative to the sector benchmark target ($T_{PE}$):
- If $\text{P/E} \le 0$, $\text{Score}_{PE} = 2.0$ (reflects high risk of negative earnings).
- If $0 < \text{P/E} \le T_{PE}$, $\text{Score}_{PE} = 10.0$.
- If $\text{P/E} > T_{PE}$, $\text{Score}_{PE} = \max\left(1.0, 10.0 - \left(\frac{\text{P/E} - T_{PE}}{2 \times T_{PE}}\right) \times 9.0\right)$ (discounting expensive valuations down to a floor of 1.0).

### Market Position / Gross Margin (Max 10)
Evaluated relative to the sector benchmark gross margin target ($T_{gross}$):
$$\text{Score} = \min\left(10, \left(\frac{\text{Gross Margin}}{T_{gross}}\right) \times 10\right)$$

---

## 3. Risk & Sentiment Calculations

### News Sentiment (Max 15)
Mentions of positive vs. negative keywords are parsed in headline text to compute a Sentiment Index between $-1.0$ and $+1.0$:
$$\text{Index} = \frac{\sum(\text{Positive Words} - \text{Negative Words})}{\sum(\text{Positive Words} + \text{Negative Words})}$$
$$\text{Sentiment Score} = 7.5 + (\text{Index} \times 7.5)$$

### Business Risk / Beta (Max 10)
Systematic market volatility:
- If $\text{Beta} \le 0.8$, $\text{Score} = 10.0$ (Very Low Risk).
- If $0.8 < \text{Beta} \le 1.5$, $\text{Score} = \max\left(3.0, 10.0 - \left(\frac{\text{Beta} - 0.8}{0.7}\right) \times 7.0\right)$.
- If $\text{Beta} > 1.5$, $\text{Score} = \max\left(1.0, 3.0 - \left(\frac{\text{Beta} - 1.5}{1.0}\right) \times 2.0\right)$.

### Recent Events / Momentum (Max 10)
Compares current stock price to 52-week boundaries:
$$\text{Ratio} = \frac{\text{Current Price} - \text{52-Week Low}}{\text{52-Week High} - \text{52-Week Low}}$$
$$\text{Score} = \text{Ratio} \times 10.0$$

---

## 4. Double-Score System: Confidence vs. Reliability

### Data Confidence Score (0-100)
Confidence measures information **quality, freshness, and completeness**.
$$\text{Confidence Score} = \text{Overall Data Quality (0-100)} - \text{Missing Data Penalties}$$
Where:
- **Overall Data Quality** = Financial Coverage (30%) + News Coverage (20%) + Provider Reliability average (30%) + Freshness (20%).
- **Missing Data Penalties**:
  - News missing: $-12$ points.
  - Financials missing: $-25$ points.

### Recommendation Reliability (0-100)
Reliability measures **mathematical completeness**.
$$\text{Reliability} = 100 - \text{Deductions}$$
- Financial database missing: $-35$ points.
- News coverage missing: $-15$ points.
- Missing specific ratio parameters (P/E, beta, growth, margins): $-5$ points per missing metric.
