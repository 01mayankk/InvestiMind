export interface RecommendationScale {
  min: number;
  max: number;
  label: "STRONG INVEST" | "INVEST" | "HOLD" | "PASS" | "STRONG PASS";
  strength: "Exceptional" | "Strong" | "Moderate" | "Weak" | "Very Weak";
}

export const RECOMMENDATION_SCALES: RecommendationScale[] = [
  { min: 90, max: 100, label: "STRONG INVEST", strength: "Exceptional" },
  { min: 75, max: 89, label: "INVEST", strength: "Strong" },
  { min: 55, max: 74, label: "HOLD", strength: "Moderate" },
  { min: 35, max: 54, label: "PASS", strength: "Weak" },
  { min: 0, max: 34, label: "STRONG PASS", strength: "Very Weak" },
];

export function getRecommendationForScore(score: number): {
  label: string;
  strength: string;
} {
  const scale = RECOMMENDATION_SCALES.find((s) => score >= s.min && score <= s.max);
  if (scale) return { label: scale.label, strength: scale.strength };
  if (score > 100) return { label: "STRONG INVEST", strength: "Exceptional" };
  return { label: "STRONG PASS", strength: "Very Weak" };
}

export function getConfidenceCategory(confidence: number): string {
  if (confidence >= 90) return "Very High";
  if (confidence >= 75) return "High";
  if (confidence >= 55) return "Medium";
  if (confidence >= 35) return "Low";
  return "Very Low";
}

export function getReliabilityCategory(reliability: number): string {
  if (reliability >= 90) return "Very Reliable";
  if (reliability >= 75) return "Reliable";
  if (reliability >= 55) return "Moderately Reliable";
  if (reliability >= 35) return "Low Reliability";
  return "Very Low Reliability";
}

export function getRiskCategory(riskScore: number): string {
  if (riskScore >= 81) return "Very High";
  if (riskScore >= 61) return "High";
  if (riskScore >= 41) return "Moderate";
  if (riskScore >= 21) return "Low";
  return "Very Low";
}

// Weights out of 100
export const SCORING_WEIGHTS = {
  financial: 0.65,
  riskHealth: 0.35,
};

// Max sub-scores
export const FINANCIAL_SUB_WEIGHTS = {
  revenueGrowth: 15,
  profitability: 15,
  financialHealth: 15,
  valuation: 10,
  marketPosition: 10,
};

export const RISK_HEALTH_SUB_WEIGHTS = {
  newsSentiment: 15,
  businessRisk: 10,
  recentEvents: 10,
};
