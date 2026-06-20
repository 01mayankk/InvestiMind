import { fetchRawYahooFinance, searchTicker } from "../tools/yahooFinanceTool";
import { FinancialData, ProviderStatus } from "../types/research";
import { globalCache } from "./cache/memoryCacheProvider";

export interface FetchFinancialsResult {
  financialData: FinancialData | null;
  providerStatus: ProviderStatus;
  warningMessage?: string;
}

const FINANCIALS_CACHE_TTL = 7200; // 2 hours

export async function fetchCompanyFinancials(query: string): Promise<FetchFinancialsResult> {
  const cacheKey = `financials:${query.trim().toUpperCase()}`;
  
  // Try cache first
  const cached = await globalCache.get<FetchFinancialsResult>(cacheKey);
  if (cached) {
    console.log(`Financials Cache hit for: ${query}`);
    return cached;
  }

  // Resolve query to ticker
  const tickerInfo = await searchTicker(query);
  if (!tickerInfo) {
    const status: ProviderStatus = {
      name: "Yahoo Finance",
      status: "Unavailable",
      reliability: 0,
      coverage: 0,
      fallbackUsed: false,
    };
    return {
      financialData: null,
      providerStatus: status,
      warningMessage: `Could not resolve company name or ticker for "${query}".`,
    };
  }

  const { ticker, name } = tickerInfo;

  try {
    const { financialData, latencyMs } = await fetchRawYahooFinance(ticker);

    // Calculate actual coverage: count how many non-null values we got out of the 13 required fields
    const fields = Object.values(financialData);
    const nonNullCount = fields.filter((v) => v !== null).length;
    const coveragePercent = Math.round((nonNullCount / fields.length) * 100);

    const status: ProviderStatus = {
      name: "Yahoo Finance",
      status: "Success",
      latencyMs,
      reliability: 98,
      coverage: coveragePercent,
      fallbackUsed: false,
    };

    const result: FetchFinancialsResult = {
      financialData,
      providerStatus: status,
    };

    // Cache the successful result
    await globalCache.set(cacheKey, result, FINANCIALS_CACHE_TTL);
    return result;

  } catch (err: unknown) {
    console.error(`Yahoo Finance fetch failed for query ${query}:`, err);
    // If it fails, degrade gracefully. Do NOT mock data.
    const status: ProviderStatus = {
      name: "Yahoo Finance",
      status: "Failed",
      reliability: 0,
      coverage: 0,
      fallbackUsed: false,
    };

    // Create a skeleton financial data object with nulls so the engine doesn't crash but knows metrics are empty.
    const emptyFinancials: FinancialData = {
      ticker: ticker,
      companyName: name,
      sector: "Unknown",
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
    };

    return {
      financialData: emptyFinancials,
      providerStatus: status,
      warningMessage: `Financial data could not be fully retrieved for ${ticker}. Recommendation confidence has been reduced.`,
    };
  }
}
