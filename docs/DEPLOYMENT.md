# Production Deployment Guide - Vercel

InvestiMind AI is designed to be easily deployed to Vercel with zero database requirements or complex background servers.

---

## 1. Vercel Deployment Flow

### Option A: Vercel CLI
1. Install Vercel globally:
   ```bash
   npm install -g vercel
   ```
2. Run deployment from the root directory:
   ```bash
   vercel
   ```
3. Follow the prompts to link the project.
4. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option B: GitHub Integration (Recommended)
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log into the Vercel Dashboard, click **Add New Project**, and import the repository.
3. Add the Environment Variables in the settings screen.
4. Click **Deploy**.

---

## 2. Environment Variables Checklist

Configure the following variables in the Vercel Dashboard settings screen under the **Environment Variables** tab:

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Recommended | Google Gemini key for generating thesis summaries. |
| `GNEWS_API_KEY` | Optional | Priority 1 news provider. |
| `NEWS_API_KEY` | Optional | Priority 2 news provider. |
| `APIFY_API_TOKEN` | Optional | Priority 3 news provider (Twitter scraper). |
| `NEXT_PUBLIC_APP_NAME` | Required | Set to `InvestiMind AI`. |

---

## 3. Production Considerations
- **Serverless API Limits**: Vercel serverless function execution is capped at 10 seconds on the Hobby tier (15 seconds on Pro). Because we run our entire LangGraph flow in a **single pass** and enforce a **5-second timeout** on news APIs, function timeouts are avoided.
- **Node.js Runtime**: Enforce Node.js 20.x in the Vercel project settings to match local dev parameters.
