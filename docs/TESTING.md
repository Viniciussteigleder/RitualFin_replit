# RitualFin Testing Guide

This guide explains how to run tests locally for the RitualFin application.

## 1. Prerequisites

- Node.js (v18+)
- PostgreSQL (e.g., Neon DB or local)
- Environment variables configured in `.env.local`

## 2. Smoke Tests (Logic & DB)

Smoke tests verify core business logic and database connectivity without a browser.

```bash
# Run the smoke test suite
npx tsx script/smoke-test.ts
```

## 3. Playwright E2E Tests (UI & Flows)

E2E tests verify the full user experience, including authentication and ingestion.

### Setup
```bash
# Install browsers
npx playwright install chromium
```

### Run Tests
```bash
# Recommended: Build and test
npm run build && npx playwright test tests/*.spec.ts

# Run a specific test
npx playwright test tests/auth.spec.ts
```

### Mocking OCR in Tests
Screenshot ingestion tests use a client-side mock to bypass expensive Tesseract processing. This is handled automatically in the `tests/screenshot.spec.ts` using `window.__MOCK_OCR_TEXT__`.

## 4. Local Development

```bash
# Start the dev server
npm run dev
```

The application will be available at `http://localhost:3000`.
Tests run on `PORT=3001` as configured in `playwright.config.ts`.
