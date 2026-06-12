# Swaper Hackathon

Swaper is a Hebrew RTL hackathon MVP that combines a mock financial dashboard
with an AI-powered savings workflow.

The system detects a recurring bill increase, creates provider-specific
negotiation calls through Dial, compares the results, and can send an SMS
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
When set, it overrides every provider-specific destination number.
Leave it empty for real calls and configure each provider number separately.

Required for calls:

- `DIAL_API_KEY`
- At least one provider phone number, or `DIAL_TEST_PROVIDER_NUMBER`
- A phone number in the Dial account; optionally select it with `DIAL_FROM_NUMBER_ID`

All destination numbers must use E.164 format, for example `+972501234567`.

`CUSTOMER_SUMMARY_NUMBER` is optional. Without it, calls still run and finish,
but the final SMS summary is skipped.

After all calls terminate, Swaper extracts each provider's final-offer line and
sends the concise final offers to `CUSTOMER_SUMMARY_NUMBER`.

The outbound instruction tells Dial's voice agent to navigate IVR menus using
DTMF keypad presses, preferring retention, customer service, or billing, before
starting the short price negotiation with a human representative.

## Safety

- No real banking integration.
- No automatic provider switch.
- Provider calls do not approve transactions.
- Every provider action requires explicit user approval.
