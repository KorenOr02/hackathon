import { DialClient, type Call } from "@getdial/sdk";

export type ProviderKey = "cellcom" | "partner" | "pelephone";

export interface ProviderConfig {
  key: ProviderKey;
  name: string;
  phoneNumber?: string;
  goal: string;
}

export interface ProviderCallResult {
  provider: string;
  callId: string;
  state: string;
}

export interface ProviderCallReference {
  provider: string;
  callId: string;
}

const sharedTestPhoneNumber = process.env.DIAL_TEST_PROVIDER_NUMBER;
const e164PhoneNumberPattern = /^\+[1-9]\d{7,14}$/;

export const providers: ProviderConfig[] = [
  {
    key: "cellcom",
    name: "סלקום",
    phoneNumber: sharedTestPhoneNumber || process.env.CELLCOM_PHONE_NUMBER,
    goal: "בקשי להחזיר את המחיר החודשי מ-150 ש״ח ל-100 ש״ח או פחות.",
  },
  {
    key: "partner",
    name: "פרטנר",
    phoneNumber: sharedTestPhoneNumber || process.env.PARTNER_PHONE_NUMBER,
    goal: "בקשי מחיר חודשי של 100 ש״ח או פחות.",
  },
  {
    key: "pelephone",
    name: "פלאפון",
    phoneNumber: sharedTestPhoneNumber || process.env.PELEPHONE_PHONE_NUMBER,
    goal: "בקשי מחיר חודשי של 100 ש״ח או פחות.",
  },
];

export function getDialClient() {
  const apiKey = process.env.DIAL_API_KEY;
  if (!apiKey) throw new Error("DIAL_CONFIG_MISSING: חסר DIAL_API_KEY.");

  return new DialClient({
    apiKey,
    ...(process.env.DIAL_BASE_URL ? { baseUrl: process.env.DIAL_BASE_URL } : {}),
  });
}

export async function getFromNumberId(dial: DialClient) {
  const numbers = await dial.listNumbers();
  const configuredNumberId = process.env.DIAL_FROM_NUMBER_ID;
  const fromNumberId = configuredNumberId || numbers[0]?.id;
  if (!fromNumberId) throw new Error("DIAL_CONFIG_MISSING: לא נמצא מספר Dial יוצא.");
  if (configuredNumberId && !numbers.some((number) => number.id === configuredNumberId)) {
    throw new Error("DIAL_CONFIG_MISSING: המספר שהוגדר ב-DIAL_FROM_NUMBER_ID אינו קיים בחשבון Dial.");
  }
  return fromNumberId;
}

export function getConfiguredProviders() {
  return providers.filter((provider) => provider.phoneNumber);
}

export function getMissingProviders() {
  return providers.filter((provider) => !provider.phoneNumber).map((provider) => provider.name);
}

export function assertE164PhoneNumber(phoneNumber: string, label: string) {
  if (!e164PhoneNumberPattern.test(phoneNumber)) {
    throw new Error(`DIAL_CONFIG_MISSING: המספר עבור ${label} חייב להיות בפורמט E.164, לדוגמה +972501234567.`);
  }
}

export function createProviderPrompt(provider: ProviderConfig) {
  const providerSpecificContext = provider.key === "cellcom"
    ? "זו שיחת שימור קצרה מול הספק הנוכחי."
    : `זו שיחת בקשת מחיר קצרה מול ${provider.name}. אל תדברי כאילו הלקוח כבר מנוי אצלם.`;

  return `
את סוכנת המשא ומתן של Swaper, עוזרת פיננסית יוזמת מבוססת AI.
בתחילת השיחה הציגי את עצמך במשפט אחד כסוכנת AI של Swaper שמתקשרת בשם לקוח כדי להוריד את המחיר החודשי.

את מתקשרת אל ${provider.name}.
${providerSpecificContext}
מטרת השיחה: ${provider.goal}

כללי שיחה — חובה:
- השיחה צריכה להיות קצרה מאוד, ישירה וממוקדת רק במחיר החודשי.
- אל תשאלי על פרטי החבילה, גלישה, התחייבות, עמלות, הטבות או שום נושא אחר.
- בקשי פעם אחת מחיר של 100 ש״ח או פחות.
- אם המחיר לא מאושר מיד, מותר לבקש פעם אחת נוספת בלבד להוריד ל-100 ש״ח או פחות.
- אם הוצע מחיר של 100 ש״ח או פחות, ודאי אותו פעם אחת בלבד בשאלה: "רק לוודא, המחיר החודשי החדש הוא [המחיר], נכון?"
- לאחר שהמחיר אומת, אל תשאלי שום שאלה נוספת וסיימי מיד.
- אם ההורדה נדחית או שהמחיר נשאר מעל 100 ש״ח לאחר הבקשה הנוספת, קבלי את התשובה וסיימי מיד.
- השיחה מוגבלת לעד 4 תגובות שלך.
- אל תחזרי על ההצגה העצמית או על אותה בקשה יותר מפעמיים.
- לפני משפט הסיום, אמרי שורת סיכום אחת בדיוק בפורמט:
  "הצעה סופית: מחיר חודשי [המחיר שאומת, או לא הושגה הנחה]."
- משפט הסיום שלך צריך להיות: "תודה רבה, אעביר את ההצעה ללקוח לבדיקה. יום טוב." לאחר משפט זה אל תשאלי שאלה נוספת וסיימי את השיחה.

כללי בטיחות:
- אל תבצעי מעבר ספק, ביטול או רכישה.
- אל תאשרי עסקה ואל תתחייבי בשם הלקוח.
- שמרי על שיחה מקצועית, קצרה וידידותית בעברית.
`.trim();
}

export function summarizeCalls(calls: Array<{ call: Call; provider: string }>) {
  return calls.map(({ call, provider }) => ({
    callId: call.id,
    provider,
    state: call.status.state,
    terminationType: call.status.terminationType,
    transcript: call.transcript,
  }));
}

export function buildCustomerSummary(calls: ReturnType<typeof summarizeCalls>) {
  const offers = calls.map((call) => {
    const transcript = call.transcript?.trim();
    const finalOffers = transcript
      ? [...transcript.matchAll(/הצעה סופית:\s*([\s\S]*?)(?=\r?\n|תודה רבה|$)/g)]
      : [];
    const finalOffer = finalOffers.at(-1)?.[0]?.trim();
    const result = finalOffer
      ? finalOffer
      : transcript
        ? "לא זוהתה שורת הצעה סופית בתמלול."
        : `לא התקבלה הצעה. השיחה הסתיימה בסטטוס ${call.state}.`;
    return `${call.provider}: ${result}`;
  });

  return [
    "המחירים הסופיים של Swaper:",
    ...offers,
    "לא בוצע מעבר ספק או רכישה.",
  ].join("\n");
}
