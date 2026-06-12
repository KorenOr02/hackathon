import { DialClient, type Call, type CallState, type TerminationType } from "@getdial/sdk";

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

export type OfferConfidence = "verified" | "detected" | "none";
export type ProviderLifecycle = "waiting" | "queued" | "ringing" | "in-progress" | "analyzing" | "completed" | "no-answer" | "busy" | "failed";
export interface ProviderWorkflowResult {
  providerKey: ProviderKey; provider: string; callId: string | null; lifecycle: ProviderLifecycle;
  state: CallState | "Waiting"; terminationType: TerminationType | null; price: number | null;
  confidence: OfferConfidence; reason: string; retryable: boolean;
}
export interface WorkflowStatus {
  workflowId: string; testMode: boolean; providers: ProviderWorkflowResult[]; allFinished: boolean;
  summarySent: boolean; summaryMessage: string;
}

export class DialWorkflowError extends Error {
  constructor(public code: "quota_exceeded" | "call_failed", message: string, public status: number) {
    super(message);
  }
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

export function normalizeDialCallError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes('"code":"quota_exceeded"') || message.includes("Outbound call quota reached")) {
    return new DialWorkflowError(
      "quota_exceeded",
      "מכסת השיחות היוצאות בחשבון Dial נוצלה במלואה (50/50). יש להגדיל או לאפס את המכסה ב-Dial לפני שניתן להוציא שיחה.",
      402,
    );
  }
  return new DialWorkflowError("call_failed", "Dial לא הצליחה ליצור את השיחה היוצאת.", 502);
}

export function createProviderPrompt(provider: ProviderConfig) {
  const providerSpecificContext = provider.key === "cellcom"
    ? "סלקום היא חברת הסלולר הנוכחית של הלקוח. המחיר שלו עלה מ-100 ש״ח ל-150 ש״ח בחודש."
    : `את מתקשרת אל ${provider.name} בשם לקוח שמחיר הסלולר שלו התייקר מ-100 ש״ח ל-150 ש״ח בחודש, כדי לקבל הצעה חלופית זולה יותר.`;

  return `
את נציגת Swaper ומתקשרת אל ${provider.name} בשם לקוח כדי להוריד עבורו את מחיר הסלולר החודשי.
${providerSpecificContext}

המטרה היחידה שלך היא להשיג מחיר חודשי של 100 ש״ח או פחות. אל תנהלי שיחה על פרטי החבילה ואל תבצעי רכישה, מעבר ספק או התחייבות.

מיד כשהשיחה מתחברת, אל תישארי בשקט. אמרי פעם אחת בלבד:
"שלום, אני נציגת Swaper ומתקשרת בשם לקוח שהמחיר החודשי שלו התייקר. הלקוח שילם 100 ש״ח והמחיר עלה ל-150 ש״ח. אפשר להחזיר את המחיר ל-100 ש״ח או פחות?"

אם במקום אדם את שומעת הוראת תפריט ברורה כמו "לשירות לקוחות הקש 1", הפסיקי לדבר, האזיני לאפשרויות והקישי באמצעות DTMF את האפשרות שמובילה לשימור לקוחות או לשירות לקוחות. לאחר החיבור לנציג, אל תחזרי על ההצגה המלאה; אמרי רק: "אני מתקשרת בשם לקוח שהמחיר שלו התייקר. אפשר להחזיר אותו ל-100 ש״ח או פחות?"

המשך השיחה:
1. לאחר משפט הפתיחה, המתיני לתשובה והקשיבי.
2. אם המחיר גבוה מ-100 ש״ח, בקשי פעם אחת בלבד מחיר נמוך יותר.
3. כשנאמר מחיר ברור, ודאי אותו פעם אחת: "רק לוודא, המחיר החודשי הוא [המחיר], נכון?"
4. לאחר האישור אמרי: "הצעה סופית: מחיר חודשי [המחיר]." הודי וסיימי.

דברי באופן טבעי, קצר וענייני. אל תחזרי על ההצגה העצמית או על משפט שכבר אמרת. אם קטעו אותך או שהיה רעש, הקשיבי והמשיכי בלי להתחיל מחדש. אם הנציג מבקש להמתין, המתיני. אם לא ניתן לקבל מחיר, אמרי: "הצעה סופית: לא הושגה הנחה." וסיימי.

אל תמסרי מספר זהות, פרטי אשראי, סיסמה או מידע אישי.
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

function extractPrice(text: string) {
  const matches = [...text.matchAll(/(?:₪\s*)?(\d{2,4})(?:\s*(?:ש["״']?ח|שקל(?:ים)?))?/g)]
    .map((match) => Number(match[1])).filter((price) => price >= 10 && price <= 2_000);
  return matches.at(-1) ?? null;
}

export function analyzeCall(provider: ProviderConfig, call: Call): ProviderWorkflowResult {
  const transcript = call.transcript?.trim() || "";
  const terminationType = call.status.terminationType;
  const base = { providerKey: provider.key, provider: provider.name, callId: call.id, state: call.status.state, terminationType };
  if (call.status.state !== "Terminated") {
    const lifecycle = call.status.state === "Queued" ? "queued" : call.status.state === "Ringing" ? "ringing" : "in-progress";
    const reason = lifecycle === "queued" ? "השיחה ממתינה לחיוג" : lifecycle === "ringing" ? "מחייגים לספק" : "השיחה מתבצעת";
    return { ...base, lifecycle, price: null, confidence: "none", reason, retryable: false };
  }
  if (terminationType === "completed" && call.duration > 0 && !transcript) return { ...base, lifecycle: "analyzing", price: null, confidence: "none", reason: "מנתחים את תוצאת השיחה", retryable: false };
  if (terminationType && terminationType !== "completed") {
    const lifecycle = terminationType === "no-answer" ? "no-answer" : terminationType === "busy" ? "busy" : "failed";
    const reason = terminationType === "no-answer" ? "הספק לא ענה" : terminationType === "busy" ? "הקו היה תפוס" : "השיחה לא הושלמה";
    return { ...base, lifecycle, price: null, confidence: "none", reason, retryable: true };
  }
  const finalOfferLines = transcript.match(/הצעה סופית:[^\r\n]*/g) || [];
  const verifiedPrice = extractPrice(finalOfferLines.at(-1) || "");
  if (verifiedPrice !== null) return { ...base, lifecycle: "completed", price: verifiedPrice, confidence: "verified", reason: "המחיר אושר בשיחה", retryable: false };
  const refusal = /לא הושגה הנחה|אין הנחה|לא ניתן|אי אפשר|מסרב/.test(transcript);
  const offerStatements = transcript.split(/\r?\n/).filter((line) => /מציע|להציע|אפשר לתת|יכול(?:ים)? לתת|המחיר (?:הוא|יהיה)|יעלה/.test(line)).join("\n");
  const detectedPrice = refusal ? null : extractPrice(offerStatements);
  if (detectedPrice !== null) return { ...base, lifecycle: "completed", price: detectedPrice, confidence: "detected", reason: "המחיר הוזכר אך לא אושר במפורש", retryable: false };
  return { ...base, lifecycle: "completed", price: null, confidence: "none", reason: refusal ? "הספק לא הציע מחיר נמוך יותר" : "לא זוהתה הצעת מחיר ברורה", retryable: false };
}

export function waitingProviderResult(provider: ProviderConfig): ProviderWorkflowResult {
  return { providerKey: provider.key, provider: provider.name, callId: null, lifecycle: "waiting", state: "Waiting", terminationType: null, price: null, confidence: "none", reason: "ממתינה לתורה", retryable: false };
}

export function buildCustomerSummary(results: ProviderWorkflowResult[]) {
  const offers = results.map((result) => result.price === null
    ? `${result.provider}: ${result.reason}`
    : `${result.provider}: ${result.price} ש"ח, ${result.confidence === "verified" ? "המחיר אומת" : "המחיר זוהה אך לא אומת"}`);
  const bestVerified = results.filter((result) => result.price !== null && result.confidence === "verified").sort((a, b) => a.price! - b.price!)[0];
  return ["Swaper סיים להשוות עבורך:", ...offers, "", bestVerified ? `ההצעה הטובה ביותר שאומתה: ${bestVerified.provider}, ${bestVerified.price} ש"ח` : "לא התקבלה הצעה מאומתת.", "לא בוצע מעבר ספק או רכישה."].join("\n");
}
