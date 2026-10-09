# SchemeSense Frontend — React + TypeScript + Vite + Tailwind

Production-quality web frontend for the Cloud-Native Semantic Eligibility Reasoning Framework (BITE412L).

## Features
- **Modern Dark AI Directory Design**: Glassmorphic floating pill navbar, hover glow cards, vibrant cyan-to-magenta gradients.
- **Multilingual Support**: English, Hindi (हिन्दी), Tamil (தமிழ்), and Telugu (తెలుగు) via `react-i18next`.
- **Explainable Eligibility Evaluator**: Verdict cards, 0-100 readiness score radial gauge, clause-by-clause proximity table (PASSED/FAILED/UNKNOWN), IMMUTABLE vs MUTABLE tags, and missing evidence guidance.
- **Interactive Rule Graph & Amendment Simulator**: Point-in-time `as_of` Cypher query inspector & rule evolution simulator.
- **Full Offline Mock Fallback**: Controlled via `VITE_USE_MOCKS=true`.

## Local Development
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000`.

## Production Build
```bash
npm run build
```

## Firebase Deployment
Deploys directly to `cloudreasoningengine.web.app`:
```bash
npx firebase-tools deploy --only hosting --project cloudreasoningengine
```
