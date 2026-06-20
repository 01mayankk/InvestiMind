# Local Setup Guide - InvestiMind AI

Follow these steps to run InvestiMind AI locally on your system.

---

## 1. Prerequisites
- **Node.js**: Version 20.0 or higher is required.
- **NPM**: Built-in with Node.js.

---

## 2. Environment Configurations

1. Copy the template or locate the `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
2. Populate the required keys:
   - `GEMINI_API_KEY`: Get a free key from Google AI Studio. Required for AI narrative summaries.
   - `GNEWS_API_KEY`: News API Key (Priority 1).
   - `NEWS_API_KEY`: NewsAPI Key (Priority 2).
   - `APIFY_API_TOKEN`: Apify API Token (Priority 3).

*Note: If no news keys are provided, or if the Gemini key is missing, the system degrades gracefully and displays fallback warning blocks rather than crashing.*

---

## 3. Dependency Installation

Execute NPM installs to download packages:
```bash
npm install
```

---

## 4. Running the Application

### Development Server
Start the local Next.js server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 5. Running the CLI Sandbox Test Runner

You can execute the LangGraph workflow directly from your terminal using our ts-node script:

```bash
# On Windows Powershell:
$env:TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","target":"es2020"}'; npx ts-node src/scripts/testWorkflow.ts MSFT

# On Linux / macOS:
TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","target":"es2020"}' npx ts-node src/scripts/testWorkflow.ts MSFT
```
Replace `MSFT` with any company name or stock ticker of your choice.
