import YahooFinance from "yahoo-finance2";
import { FinancialData } from "../types/research";

const yahooFinance = new YahooFinance();

export interface YahooFinanceResult {
  financialData: FinancialData;
  latencyMs: number;
}

interface SearchQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
}

interface SearchResponse {
  quotes: SearchQuote[];
}

interface QuoteSummaryResult {
  summaryProfile?: { sector?: string };
  financialData?: {
    revenueGrowth?: number;
    profitMargins?: number;
    grossMargins?: number;
    currentRatio?: number;
    debtToEquity?: number;
    currentPrice?: number;
    trailingPE?: number;
  };
  defaultKeyStatistics?: { beta?: number };
}

interface QuoteResult {
  longName?: string;
  shortName?: string;
  beta?: number;
  trailingPE?: number;
  forwardPE?: number;
  regularMarketPrice?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export async function searchTicker(query: string): Promise<{ ticker: string; name: string } | null> {
  try {
    // If query looks like a ticker (1-5 capital letters), check it
    const trimmed = query.trim().toUpperCase();
    if (/^[A-Z]{1,5}$/.test(trimmed)) {
      // Let's verify it by searching
      const searchRes = (await yahooFinance.search(trimmed)) as unknown as SearchResponse;
      if (searchRes.quotes && searchRes.quotes.length > 0) {
        const validQuotes = searchRes.quotes.filter((q) => q.symbol);
        if (validQuotes.length > 0) {
          const bestMatch = validQuotes[0];
          return {
            ticker: bestMatch.symbol!,
            name: bestMatch.shortname || bestMatch.longname || bestMatch.symbol!,
          };
        }
      }
    }

    // Otherwise, search for name
    const searchRes = (await yahooFinance.search(query)) as unknown as SearchResponse;
    if (searchRes.quotes && searchRes.quotes.length > 0) {
      const validQuotes = searchRes.quotes.filter((q) => q.symbol);
      if (validQuotes.length > 0) {
        const bestMatch = validQuotes.find((q: SearchQuote) => q.quoteType === "EQUITY") || validQuotes[0];
        return {
          ticker: bestMatch.symbol!,
          name: bestMatch.shortname || bestMatch.longname || bestMatch.symbol!,
        };
      }
    }
    return null;
  } catch (err) {
    console.error("Error searching ticker:", err);
    return null;
  }
}

export async function fetchRawYahooFinance(ticker: string): Promise<YahooFinanceResult> {
  const startTime = Date.now();
  try {
    // Fetch quote summary modules: financialData, summaryProfile, defaultKeyStatistics
    const summary = (await yahooFinance.quoteSummary(ticker, {
      modules: ["financialData", "summaryProfile", "defaultKeyStatistics"]
    })) as unknown as QuoteSummaryResult;

    const quote = (await yahooFinance.quote(ticker)) as unknown as QuoteResult;

    const latencyMs = Date.now() - startTime;

    const profile = summary.summaryProfile || {};
    const fin = summary.financialData || {};
    const stats = summary.defaultKeyStatistics || {};

    const financialData: FinancialData = {
      ticker: ticker,
      companyName: quote.longName || quote.shortName || ticker,
      sector: profile.sector || "Unknown",
      revenueGrowth: fin.revenueGrowth || null,
      netProfitMargin: fin.profitMargins || null,
      grossMargin: fin.grossMargins || null,
      currentRatio: fin.currentRatio || null,
      debtToEquity: fin.debtToEquity != null ? fin.debtToEquity / 100 : null, // Convert from percentage standard if needed or keep as ratio
      beta: stats.beta != null ? stats.beta : (quote.beta != null ? quote.beta : null),
      peRatio: quote.trailingPE || quote.forwardPE || fin.trailingPE || null,
      currentPrice: quote.regularMarketPrice || fin.currentPrice || null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || null,
    };

    return {
      financialData,
      latencyMs,
    };
  } catch (err) {
    console.error("Yahoo Finance fetch failed for:", ticker, err);
    throw err;
  }
}
