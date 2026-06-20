# Local Development Guide - InvestiMind AI

## Overview
This document provides instructions for cloning, setting up, running, testing, linting, and building the InvestiMind AI platform on your local machine.

---

## Prerequisites

### Required Software
Ensure you have the following installed on your machine:
* **Node.js**: Version `18.x` or newer (Recommended: `20.x` LTS)
* **npm**: Version `9.x` or newer (Usually packaged with Node.js)

---

## Clone Repository

Clone the project from GitHub and navigate to the project directory:
```bash
git clone https://github.com/your-username/investimind-ai.git
cd investimind-ai
```

---

## Install Dependencies

Install the project dependencies using npm:
```bash
npm install
```

---

## Environment Variables

The application queries real-time financials, scrapes Twitter feeds, and requests AI-generated investment explanations. To run the app, create a `.env.local` file in the root of the project:

### Required Variables
Create a file named `.env.local` and add the following keys:
* `GEMINI_API_KEY`: API key for Google Generative AI (Gemini 2.5 Flash / Gemini 1.5 Pro).
* `GNEWS_API_KEY`: API key for GNews search fallback (obtainable from https://gnews.io).
* `NEWS_API_KEY`: API key for NewsAPI fallback (obtainable from https://newsapi.org).
* `APIFY_API_TOKEN`: API key for Twitter Scraper Lite (obtainable from https://apify.com).
* `NEXT_PUBLIC_APP_NAME`: Title of the application dashboard (default: `InvestiMind AI`).

### Example `.env.local`
```env
GEMINI_API_KEY=your_gemini_api_key_here
GNEWS_API_KEY=your_gnews_api_key_here
NEWS_API_KEY=your_news_api_key_here
APIFY_API_TOKEN=your_apify_api_token_here
NEXT_PUBLIC_APP_NAME="InvestiMind AI"
```

---

## Running Development Server

Start the local development server:
```bash
npm run dev
```

Open your browser and navigate to the expected URL:
**[http://localhost:3000](http://localhost:3000)**

---

## Running Tests

Verify the LangGraph state graph workflow by executing the console test runner:
```bash
npx ts-node -O "{\"module\": \"commonjs\"}" src/scripts/testWorkflow.ts
```
Or optionally test a specific symbol:
```bash
npx ts-node -O "{\"module\": \"commonjs\"}" src/scripts/testWorkflow.ts TSLA
```

---

## Type Checking

Verify typescript compilation type-safety without emitting files:
```bash
npm run tsc -- --noEmit
```
*(or run `npx tsc --noEmit` directly)*

---

## Linting

Check code formatting and ESLint rule compliance:
```bash
npm run lint
```

---

## Building Production Version

To build a optimized web bundle and test production servers locally:

1. Build the production application:
   ```bash
   npm run build
   ```
2. Launch the production application server:
   ```bash
   npm run start
   ```

---

## Troubleshooting

### Common Errors

#### 1. API Key Issues
* **Symptom**: *Gemini AI explanation failed* warning shows on the dashboard UI.
* **Solution**: Ensure `GEMINI_API_KEY` is defined in `.env.local`. If missing, the scoring engine runs successfully, but the AI summaries degrade gracefully to default static text.
* **Symptom**: *Recent news coverage was unavailable* warning.
* **Solution**: Ensure at least one of `GNEWS_API_KEY`, `NEWS_API_KEY`, or `APIFY_API_TOKEN` is set. The news node sequentially cascades through them.

#### 2. Build Issues
* **Symptom**: NextJS build fails during compilation or lint checks.
* **Solution**: Run `npm run lint` locally. NextJS prohibits explicit `any` casting, unused variables, and raw double quotes in JSX templates. Ensure all lints are resolved before building.

#### 3. Network Issues
* **Symptom**: Yahoo Finance query fails or times out.
* **Solution**: Verify your internet connection. Yahoo Finance fetches do not require API tokens, but rate limits may apply on public cloud IP addresses. Use the memory cache TTL to prevent rate limit blocks.
