import { NextResponse } from "next/server";
import { assertE164PhoneNumber, createProviderPrompt, getConfiguredProviders, getDialClient, getFromNumberId, getMissingProviders } from "@/lib/dial-workflow";

const callCooldownMs = 60_000;
let lastWorkflowCreatedAt = 0;

export async function POST() {
  if (Date.now() - lastWorkflowCreatedAt < callCooldownMs) {
    return NextResponse.json(
      { success: false, message: "כבר הופעל תהליך בדקה האחרונה. אפשר לנסות שוב בעוד רגע." },
      { status: 429 },
    );
  }

  const configuredProviders = getConfiguredProviders();
  const missingProviders = getMissingProviders();

  try {
    if (!configuredProviders.length) {
      throw new Error("DIAL_CONFIG_MISSING: לא הוגדר אף מספר ספק לחיוג.");
    }
    configuredProviders.forEach((provider) => assertE164PhoneNumber(provider.phoneNumber!, provider.name));

    const dial = getDialClient();
    const fromNumberId = await getFromNumberId(dial);
    const calls = [];
    const failedProviders = [];

    for (const provider of configuredProviders) {
      try {
        const call = await dial.makeCall({
          to: provider.phoneNumber!,
          fromNumberId,
          outboundInstruction: createProviderPrompt(provider),
          language: "he-IL",
          idempotencyKey: crypto.randomUUID(),
        });
        calls.push({ provider: provider.name, callId: call.id, state: call.status.state });
      } catch (error) {
        console.error(`Dial call to ${provider.name} failed`, error);
        failedProviders.push(provider.name);
      }
    }

    if (!calls.length) {
      throw new Error("DIAL_CALLS_FAILED: לא נוצרה אף שיחה.");
    }

    lastWorkflowCreatedAt = Date.now();
    return NextResponse.json({
      success: true,
      calls,
      missingProviders,
      failedProviders,
      testMode: Boolean(process.env.DIAL_TEST_PROVIDER_NUMBER),
      message: [...missingProviders, ...failedProviders].length
        ? `הופעלו ${calls.length} שיחות. לא הופעלו שיחות עבור: ${[...missingProviders, ...failedProviders].join(", ")}.`
        : `הופעלו ${calls.length} שיחות נפרדות, עם פרומפט מותאם לכל ספק.`,
    });
  } catch (error) {
    console.error("Dial provider workflow failed", error);
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("401") ? 401 : message.startsWith("DIAL_CONFIG_MISSING") ? 503 : 502;
    const publicMessage = message.startsWith("DIAL_CONFIG_MISSING:")
      ? message.replace("DIAL_CONFIG_MISSING:", "").trim()
      : status === 401
        ? "מפתח Dial אינו מורשה או שפג תוקפו."
        : "הפעלת שיחות הספקים נכשלה. לא בוצעה פעולה נוספת.";
    return NextResponse.json(
      { success: false, message: publicMessage },
      { status },
    );
  }
}
