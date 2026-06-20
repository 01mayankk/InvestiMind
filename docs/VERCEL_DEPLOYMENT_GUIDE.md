# Vercel Deployment Guide - InvestiMind AI

## Overview
This document guides you through pushing your local InvestiMind AI project to GitHub and deploying it on Vercel's serverless hosting platform.

---

## Prerequisites
* **GitHub Account**: Active account to host the git repository.
* **Vercel Account**: Signup at [Vercel](https://vercel.com) using your GitHub credentials.
* **Repository Access**: A newly created repository for `investimind-ai`.
* **Required API Keys**:
  * `GEMINI_API_KEY`
  * `GNEWS_API_KEY`
  * `NEWS_API_KEY`
  * `APIFY_API_TOKEN`

---

## Push Code To GitHub

If you have not initialized git or pushed yet, run the following commands:
```bash
# Initialize git repository
git init

# Add files to stage (Ensure .env / .env.local is in .gitignore)
git add .

# Create the initial commit
git commit -m "chore: complete release preparation and build fixes"

# Link remote branch and push
git branch -M main
git remote add origin https://github.com/your-username/investimind-ai.git
git push -u origin main
```

---

## Deploy To Vercel

1. Log into your **Vercel Dashboard**.
2. Click **Add New...** and select **Project**.
3. Import the `investimind-ai` repository under the **Import Git Repository** section.
4. Set the project name (e.g. `investimind-ai`).
5. Ensure the **Framework Preset** is set to **Next.js**.

---

## Configure Environment Variables

Expand the **Environment Variables** accordion and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` | Google Generative AI credentials. |
| `GNEWS_API_KEY` | `gnews_tok...` | GNews developer search key. |
| `NEWS_API_KEY` | `news_tok...` | NewsAPI fallback key. |
| `APIFY_API_TOKEN` | `apify_api...` | Apify client token for Twitter feeds. |
| `NEXT_PUBLIC_APP_NAME` | `InvestiMind AI` | The client-side dashboard title. |

---

## Build Settings

The default Next.js configurations are compatible. Ensure they match these values:
* **Framework Preset**: `Next.js`
* **Build Command**: `npm run build`
* **Install Command**: `npm install`
* **Output Directory**: `Default (.next)`

Click **Deploy** and wait for Vercel's build runner to complete compiling static routes.

---

## Production Testing Checklist

Once deployed, visit your active URL and verify:
* **Search**: Perform a ticker lookup (e.g. `NVDA`) and verify loading indicators transition dynamically.
* **News**: Check the transparency panel to verify GNews/NewsAPI/Apify successfully returned status `Success`.
* **Gemini**: Ensure qualitative summaries, theses, and bull/bear narratives render without showing fallback error text.
* **Charts**: Ensure Gauges, Pie Chart, Bar Chart, and Radar Chart render correctly on modern viewports.
* **PDF Export**: Click **Export A4 PDF** and verify the download of a 5-page PDF report.
* **Theme Toggle**: Switch between Dark and Light mode to ensure proper component styling.

---

## Troubleshooting

### Build Failures
* **Symptom**: *Build failed: type errors, unused vars, or syntax issues.*
* **Solution**: Ensure your local codebase is fully linted. Vercel automatically runs type-checking and lint checks. If any warnings exist, the deployment runner exits with code 1.

### Missing Environment Variables
* **Symptom**: System runs but shows API provider status `Failed` or qualitative AI cards display warning texts.
* **Solution**: Double check the Environment Variables tab on Vercel's project settings and trigger a redeployment.

### API Rate Limits & Timeouts
* **Symptom**: Search or news fetches load for too long or return 500 status.
* **Solution**: Free-tier GNews or NewsAPI keys have daily limitations. Leverage the cache logic implemented in the backend memoryCache to limit outgoing queries.

---

## Updating Production

To push updates to production, simply commit your changes and push to your main branch:
```bash
git add .
git commit -m "refactor: optimize styling layout"
git push origin main
```
Vercel monitors pushes and will trigger a rolling zero-downtime deployment automatically.

---

## Rollback Strategy
If a deployment contains breaking bugs:
1. Navigate to the **Deployments** tab on Vercel.
2. Select the previous successful deployment.
3. Click the three dots and select **Promote to Production** to immediately restore the previous stable serverless instances.
