import { NewsItem, ProviderStatus } from "../types/research";

export interface NewsFetchResult {
  news: NewsItem[];
  status: ProviderStatus;
}

// Helper to enforce timeout on fetch
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// 1. GNews Fetcher
async function fetchGNews(query: string, apiKey: string): Promise<NewsItem[]> {
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=5&apikey=${apiKey}`;
  const response = await fetchWithTimeout(url, { method: "GET" });
  if (!response.ok) throw new Error(`GNews response status ${response.status}`);
  const data = await response.json();
  if (!data.articles) return [];
  return data.articles.map((art: { title?: string; url?: string; source?: { name?: string }; publishedAt?: string }) => ({
    title: art.title || "",
    url: art.url || "",
    source: art.source?.name || "GNews",
    publishedAt: art.publishedAt || new Date().toISOString(),
  }));
}

// 2. NewsAPI Fetcher
async function fetchNewsAPI(query: string, apiKey: string): Promise<NewsItem[]> {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=5&sortBy=relevance&apiKey=${apiKey}`;
  const response = await fetchWithTimeout(url, { method: "GET" });
  if (!response.ok) throw new Error(`NewsAPI response status ${response.status}`);
  const data = await response.json();
  if (!data.articles) return [];
  return data.articles.map((art: { title?: string; url?: string; source?: { name?: string }; publishedAt?: string }) => ({
    title: art.title || "",
    url: art.url || "",
    source: art.source?.name || "NewsAPI",
    publishedAt: art.publishedAt || new Date().toISOString(),
  }));
}

// 3. Apify Twitter Scraper
async function fetchApifyTwitterScraper(ticker: string, token: string): Promise<NewsItem[]> {
  const url = `https://api.apify.com/v2/actors/apidojo~twitter-scraper-lite/run-sync-get-dataset-items?token=${token}`;
  
  const body = {
    searchTerms: [`$${ticker}`],
    maxItems: 5,
    sort: "Latest"
  };

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }, 9000);

  if (!response.ok) throw new Error(`Apify response status ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data.map((tweet: { full_text?: string; text?: string; url?: string; twitter_url?: string; id_str?: string; created_at?: string; user?: { screen_name?: string } }) => {
    const text = tweet.full_text || tweet.text || "";
    const tweetUrl = tweet.url || tweet.twitter_url || (tweet.id_str ? `https://twitter.com/i/web/status/${tweet.id_str}` : "");
    const source = `Twitter (@${tweet.user?.screen_name || "anonymous"})`;
    let publishedAt = new Date().toISOString();
    if (tweet.created_at) {
      try {
        publishedAt = new Date(tweet.created_at).toISOString();
      } catch {}
    }

    return {
      title: text,
      url: tweetUrl,
      source: source,
      publishedAt: publishedAt,
    };
  });
}

export async function fetchNewsFromProvider(
  provider: "gnews" | "newsapi" | "apify",
  query: string,
  ticker: string,
  apiKey: string
): Promise<NewsItem[]> {
  switch (provider) {
    case "gnews":
      return await fetchGNews(query, apiKey);
    case "newsapi":
      return await fetchNewsAPI(query, apiKey);
    case "apify":
      return await fetchApifyTwitterScraper(ticker, apiKey);
  }
}
