import { fetchNewsFromProvider } from "../tools/newsFetcherTool";
import { NewsItem, ProviderStatus } from "../types/research";
import { globalCache } from "./cache/memoryCacheProvider";

export interface FetchNewsResult {
  news: NewsItem[];
  providerStatuses: Record<string, ProviderStatus>;
  warningMessage?: string;
}

const NEWS_CACHE_TTL = 1800; // 30 minutes

export async function fetchCompanyNews(query: string, ticker: string): Promise<FetchNewsResult> {
  const cacheKey = `news:${ticker.toUpperCase()}`;

  // Try cache first
  const cached = await globalCache.get<FetchNewsResult>(cacheKey);
  if (cached) {
    console.log(`News Cache hit for: ${ticker}`);
    return cached;
  }

  const providers: { key: "gnews" | "newsapi" | "apify"; name: string; envVar: string }[] = [
    { key: "gnews", name: "GNews", envVar: "GNEWS_API_KEY" },
    { key: "newsapi", name: "NewsAPI", envVar: "NEWS_API_KEY" },
    { key: "apify", name: "Apify Twitter Scraper", envVar: "APIFY_API_TOKEN" },
  ];

  const providerStatuses: Record<string, ProviderStatus> = {};
  let successfulNews: NewsItem[] = [];
  let fallbackUsed = false;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const apiKey = process.env[provider.envVar];

    if (!apiKey) {
      providerStatuses[provider.name] = {
        name: provider.name,
        status: "Unavailable",
        reliability: 0,
        coverage: 0,
        fallbackUsed: false,
      };
      continue;
    }

    const startTime = Date.now();
    try {
      const news = await fetchNewsFromProvider(provider.key, query, ticker, apiKey);
      const latencyMs = Date.now() - startTime;

      providerStatuses[provider.name] = {
        name: provider.name,
        status: "Success",
        latencyMs,
        reliability: provider.name === "GNews" ? 95 : provider.name === "NewsAPI" ? 85 : 90,
        coverage: news.length > 0 ? 100 : 0,
        fallbackUsed,
      };

      if (news.length > 0) {
        successfulNews = news;
        // Fill remaining providers in status list as "Unavailable" since they weren't reached
        for (let j = i + 1; j < providers.length; j++) {
          const nextProvider = providers[j];
          providerStatuses[nextProvider.name] = {
            name: nextProvider.name,
            status: "Unavailable",
            reliability: 0,
            coverage: 0,
            fallbackUsed: false,
          };
        }
        break;
      }
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`News fetch failed for provider ${provider.name}:`, errorMsg);

      providerStatuses[provider.name] = {
        name: provider.name,
        status: "Failed",
        latencyMs,
        reliability: 0,
        coverage: 0,
        fallbackUsed,
      };
      // Next iteration will use fallback
      fallbackUsed = true;
    }
  }

  // If all failed, return empty array and warning banner, but do not crash
  const allFailed = successfulNews.length === 0;
  let warningMessage: string | undefined;

  if (allFailed) {
    warningMessage = "Recent news coverage was unavailable. Risk analysis may be less reliable.";
    // Ensure all providers are recorded in the map if they weren't initialized
    providers.forEach((prov) => {
      if (!providerStatuses[prov.name]) {
        providerStatuses[prov.name] = {
          name: prov.name,
          status: "Failed",
          reliability: 0,
          coverage: 0,
          fallbackUsed: true,
        };
      }
    });
  }

  const result: FetchNewsResult = {
    news: successfulNews,
    providerStatuses,
    warningMessage,
  };

  // Cache successful or degraded news states alike to prevent hammering keys
  await globalCache.set(cacheKey, result, NEWS_CACHE_TTL);
  return result;
}
