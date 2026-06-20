# Contributing Guidelines - InvestiMind AI

We welcome contributions to help improve InvestiMind AI. To maintain high code quality and architecture alignment, please adhere to these guidelines.

---

## 1. File Naming Rules
Every file name must clearly describe its responsibility. Avoid generic titles like `utils.ts`, `helpers.ts`, `common.ts`, or `service.ts`.
- **Good**: `fetchCompanyFinancials.ts`, `calculateInvestmentScore.ts`
- **Bad**: `financials.ts`, `helpers.ts`

---

## 2. Coding Standards
- **Strict TypeScript**: Avoid `any` or `unknown` type casting unless dealing with third-party libraries (e.g. Yahoo Finance) where typings are incomplete. Use strict type checks (`noImplicitAny`, `strictNullChecks`).
- **Validation**: All external data inputs (HTTP bodies, external API feeds) must pass through a Zod schema before reaching components or scoring logic.
- **Single Responsibility Principle (SRP)**: Keep functions and components focused on a single task. Avoid compounding logic in page templates.

---

## 3. Pull Request Checklist

Before submitting a Pull Request, confirm that:
1. The project builds cleanly with no compile errors:
   ```bash
   npm run tsc --noEmit
   ```
2. Lint check passes successfully:
   ```bash
   npm run lint
   ```
3. A local test execution runs cleanly for standard tickers:
   ```bash
   $env:TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","target":"es2020"}'; npx ts-node src/scripts/testWorkflow.ts AAPL
   ```
4. All significant milestones are appended to `PROJECT_STATUS.md` matching the established log format.
