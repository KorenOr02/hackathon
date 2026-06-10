import { NextResponse } from "next/server";
import { createProviderPrompt, getDialClient, getFromNumberId, providers } from "@/lib/dial-workflow";

const callCooldownMs = 60_000;
let lastWorkflowCreatedAt = 0;

export async function POST() {
  if (Date.now() - lastWorkflowCreatedAt < callCooldownMs) {
    return NextResponse.json(
      { success: false, message: "כבר הופעל תהליך בדקה האחרונה. אפשר לנסות שוב בעוד רגע." },
      { status: 429 },
    );
  }

  const configuredProviders = providers.filter((provider) => provider.phoneNumber);
  const missingProviders = providers.filter((provider) => !provider.phoneNumber).map((provider) => provider.name);

  try {
    const dial = getDialClient();
    const fromNumberId = await getFromNumberId(dial);
    const calls = [];

    for (const provider of configuredProviders) {
      const call = await dial.makeCall({
        to: provider.phoneNumber!,
        fromNumberId,
        outboundInstruction: createProviderPrompt(provider),
        language: "he-IL",
        idempotencyKey: crypto.randomUUID(),
      });
      calls.push({ provider: provider.name, callId: call.id, state: call.status.state });
    }

    lastWorkflowCreatedAt = Date.now();
    return NextResponse.json({
      success: true,
      calls,
      missingProviders,
      testDestination: process.env.DIAL_TEST_PROVIDER_NUMBER || "+972558838259",
      message: missingProviders.length
        ? `הופעלה שיחה לספקים המוגדרים. חסרים מספרים עבור: ${missingProviders.join(", ")}.`
        : "הופעלו שלוש שיחות בדיקה נפרדות, עם פרומפט מותאם לכל ספק.",
    });
  } catch (error) {
    console.error("Dial provider workflow failed", error);
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("401") ? 401 : message.startsWith("DIAL_CONFIG_MISSING") ? 503 : 502;
    return NextResponse.json(
      { success: false, message: status === 401 ? "מפתח Dial אינו מורשה או שפג תוקפו." : "הפעלת שיחות הספקים נכשלה. לא בוצעה פעולה נוספת." },
      { status },
    );
  }
}
