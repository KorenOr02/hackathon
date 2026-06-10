# Swaper Hackathon

Swaper is a Hebrew RTL hackathon MVP that combines a mock financial dashboard
with an AI-powered savings workflow.

The system detects a recurring bill increase, creates provider-specific
negotiation calls through Dial, compares the results, and can send a WhatsApp
summary to the customer. Banking data and banking actions are mock-only.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Dial configuration

Copy `.env.example` to `.env.local` and configure the required values.
Never commit `.env.local` or API keys.

During testing, `DIAL_TEST_PROVIDER_NUMBER` sends all provider calls to one
shared test destination while preserving a different prompt for each provider.

## Safety

- No real banking integration.
- No automatic provider switch.
- Provider calls do not approve transactions.
- Every provider action requires explicit user approval.
