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

const sharedTestPhoneNumber = process.env.DIAL_TEST_PROVIDER_NUMBER || "+972558838259";

export const providers: ProviderConfig[] = [
  {
    key: "cellcom",
    name: "סלקום",
    phoneNumber: process.env.CELLCOM_PHONE_NUMBER || sharedTestPhoneNumber,
    goal: "בררי מדוע המחיר עלה מ-100 ש״ח ל-150 ש״ח בחודש, ובקשי הצעת שימור של 100 ש״ח או פחות.",
  },
  {
    key: "partner",
    name: "פרטנר",
    phoneNumber: process.env.PARTNER_PHONE_NUMBER || sharedTestPhoneNumber,
    goal: "בקשי הצעה מתחרה לחבילת סלולר, כולל מחיר, נפח גלישה, התחייבות וכל עמלה נוספת.",
  },
  {
    key: "pelephone",
    name: "פלאפון",
    phoneNumber: process.env.PELEPHONE_PHONE_NUMBER || sharedTestPhoneNumber,
    goal: "בקשי הצעה מתחרה לחבילת סלולר, כולל מחיר, נפח גלישה, התחייבות וכל עמלה נוספת.",
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
  const fromNumberId = process.env.DIAL_FROM_NUMBER_ID || (await dial.listNumbers())[0]?.id;
  if (!fromNumberId) throw new Error("DIAL_CONFIG_MISSING: לא נמצא מספר Dial יוצא.");
  return fromNumberId;
}

export function createProviderPrompt(provider: ProviderConfig) {
  const providerSpecificContext = provider.key === "cellcom"
    ? "זו שיחת בירור ושימור מול הספק הנוכחי. התמקדי בסיבת עליית המחיר ובקבלת הנחת שימור."
    : `זו שיחת בדיקת הצעה חדשה מול ${provider.name}, מתחרה של הספק הנוכחי סלקום. אל תדברי כאילו הלקוח כבר מנוי אצל ${provider.name}.`;

  return `
את סוכנת המשא ומתן של Swaper, עוזרת פיננסית יוזמת מבוססת AI.
בתחילת השיחה הציגי את עצמך בבירור כסוכנת AI של Swaper שמתקשרת בשם לקוח לצורך בירור והשגת הצעת מחיר.

את מתקשרת אל ${provider.name}.
${providerSpecificContext}
מטרת השיחה: ${provider.goal}

בכל הצעה שאלי:
- מה המחיר החודשי הסופי?
- כמה נפח גלישה כלול?
- האם קיימת התחייבות?
- האם יש דמי SIM, דמי מעבר או עמלות נסתרות?
- לכמה זמן המחיר מובטח?

כללי מניעת לולאה וסיום שיחה — חובה:
- השיחה מוגבלת לעד 8 תגובות שלך. לאחר מכן סכמי וסיימי, גם אם לא התקבלה הצעה מלאה.
- שאלי כל שאלה פעם אחת בלבד. אסור לחזור על אותה שאלה בניסוח אחר.
- אם תשובה לא ברורה, מותר לבקש הבהרה פעם אחת בלבד. לאחר מכן רשמי שהפרט לא נמסר והמשיכי.
- מותר להציע הצעת נגד פעם אחת בלבד. אם היא נדחית, קבלי את ההצעה האחרונה וסיימי.
- אם הנציג מסר מחיר, נפח גלישה, התחייבות ועמלות — יש מספיק מידע. סכמי וסיימי מיד.
- אם הנציג מסרב, מבקש להפסיק, אומר שזה מספר שגוי, או שאין התקדמות במשך שתי תגובות — התנצלי וסיימי מיד.
- אם יש שקט, מערכת אוטומטית או המתנה ללא מענה, אל תחזרי שוב ושוב על הפתיח. נסי פעם נוספת אחת בלבד ואז סיימי.
- לעולם אל תתחילי מחדש את השיחה, אל תחזרי על ההצגה העצמית ואל תחזרי על מטרת השיחה.
- משפט הסיום שלך צריך להיות: "תודה רבה, אעביר את ההצעה ללקוח לבדיקה. יום טוב." לאחר משפט זה אל תשאלי שאלה נוספת וסיימי את השיחה.

כללי בטיחות:
- אל תבצעי מעבר ספק, ביטול או רכישה.
- אל תאשרי עסקה ואל תתחייבי בשם הלקוח.
- הסבירי שכל הצעה תוצג ללקוח ותדרוש את אישורו.
- בסיום חזרי בקצרה על ההצעה שקיבלת.
- שמרי על שיחה מקצועית, קצרה וידידותית בעברית.
`.trim();
}

export function summarizeCalls(calls: Call[]) {
  return calls.map((call) => ({
    callId: call.id,
    provider: providers.find((provider) => provider.phoneNumber === call.to)?.name || call.to,
    state: call.status.state,
    transcript: call.transcript,
  }));
}

export function buildCustomerSummary(calls: ReturnType<typeof summarizeCalls>) {
  const offers = calls.map((call) => {
    const result = call.transcript?.trim()
      ? call.transcript.trim()
      : `השיחה הסתיימה בסטטוס ${call.state}, אך עדיין אין תמלול זמין.`;
    return `*${call.provider}:*\n${result}`;
  });

  return [
    "סיכום משא ומתן של Swaper:",
    "",
    ...offers,
    "",
    "Swaper לא ביצעה מעבר ספק או רכישה. יש לבדוק את ההצעות ולאשר כל פעולה באופן מפורש.",
  ].join("\n");
}
