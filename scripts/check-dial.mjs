import { DialClient } from "@getdial/sdk";

const apiKey = process.env.DIAL_API_KEY;
const e164PhoneNumberPattern = /^\+[1-9]\d{7,14}$/;

if (!apiKey) {
  console.error("Dial is not configured: DIAL_API_KEY is missing from .env.local.");
  process.exit(1);
}

try {
  const dial = new DialClient({
    apiKey,
    ...(process.env.DIAL_BASE_URL ? { baseUrl: process.env.DIAL_BASE_URL } : {}),
  });
  const numbers = await dial.listNumbers();

  if (!numbers.length) {
    console.error("Dial API connection succeeded, but the account has no outbound phone number.");
    process.exit(1);
  }

  const configuredNumberId = process.env.DIAL_FROM_NUMBER_ID;
  if (configuredNumberId && !numbers.some((number) => number.id === configuredNumberId)) {
    console.error("DIAL_FROM_NUMBER_ID does not match a phone number in the Dial account.");
    process.exit(1);
  }

  const providerVariables = [
    ["CELLCOM_PHONE_NUMBER", process.env.CELLCOM_PHONE_NUMBER],
    ["PARTNER_PHONE_NUMBER", process.env.PARTNER_PHONE_NUMBER],
    ["PELEPHONE_PHONE_NUMBER", process.env.PELEPHONE_PHONE_NUMBER],
  ];
  const configuredProviders = providerVariables.filter(([, value]) => value);
  const invalidDestinations = [
    ...configuredProviders,
    ...(process.env.DIAL_TEST_PROVIDER_NUMBER ? [["DIAL_TEST_PROVIDER_NUMBER", process.env.DIAL_TEST_PROVIDER_NUMBER]] : []),
    ...(process.env.CUSTOMER_SUMMARY_NUMBER ? [["CUSTOMER_SUMMARY_NUMBER", process.env.CUSTOMER_SUMMARY_NUMBER]] : []),
  ].filter(([, value]) => !e164PhoneNumberPattern.test(value));

  if (invalidDestinations.length) {
    console.error(`These phone numbers are not valid E.164 values: ${invalidDestinations.map(([name]) => name).join(", ")}`);
    process.exit(1);
  }

  if (!process.env.DIAL_TEST_PROVIDER_NUMBER && !configuredProviders.length) {
    console.error("Dial API connection succeeded, but no provider destination numbers are configured.");
    process.exit(1);
  }

  console.log(`Dial connection succeeded. ${numbers.length} outbound number(s) available.`);
  console.log(process.env.DIAL_TEST_PROVIDER_NUMBER
    ? "Test mode is enabled: provider calls will use DIAL_TEST_PROVIDER_NUMBER."
    : `${configuredProviders.length} real provider destination number(s) configured.`);
  console.log(process.env.CUSTOMER_SUMMARY_NUMBER
    ? "SMS summary destination is configured."
    : "SMS summary destination is not configured; calls can still run.");
  console.log("Note: this check validates credentials, numbers, and destinations. Dial only reports outbound quota when a call is created.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Dial connection check failed.");
  process.exit(1);
}
