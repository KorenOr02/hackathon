import { NextResponse } from "next/server";
import { buildCustomerSummary, getDialClient, getFromNumberId, summarizeCalls } from "@/lib/dial-workflow";

const sentWorkflowKeys = new Set<string>();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const callIds = Array.isArray(body?.callIds) ? body.callIds.filter((id: unknown) => typeof id === "string") : [];
  const customerPhoneNumber = process.env.CUSTOMER_WHATSAPP_NUMBER;

  if (!callIds.length) {
    return NextResponse.json({ success: false, message: "לא התקבלו מזהי שיחות לסיכום." }, { status: 400 });
  }
  if (!customerPhoneNumber) {
    return NextResponse.json({ success: false, message: "חסר CUSTOMER_WHATSAPP_NUMBER. לא נשלח סיכום." }, { status: 503 });
  }

  try {
    const workflowKey = [...callIds].sort().join(":");
    if (sentWorkflowKeys.has(workflowKey)) {
      return NextResponse.json({ success: true, duplicate: true, message: "סיכום ההצעות כבר נשלח ללקוח ב-WhatsApp." });
    }

    const dial = getDialClient();
    const fromNumberId = await getFromNumberId(dial);
    const calls = await Promise.all(callIds.map((callId: string) => dial.getCall(callId)));
    const unfinished = calls.filter((call) => call.status.state !== "Terminated");

    if (unfinished.length) {
      return NextResponse.json(
        { success: false, pending: true, message: "חלק משיחות הספקים עדיין לא הסתיימו. הסיכום טרם נשלח." },
        { status: 409 },
      );
    }

    const summary = buildCustomerSummary(summarizeCalls(calls));

    // The current SDK runtime supports the WhatsApp channel although its public
    // TypeScript union still lists SMS only.
    const message = await dial.sendMessage({
      to: customerPhoneNumber,
      fromNumberId,
      body: summary,
      channel: "whatsapp",
    } as unknown as Parameters<typeof dial.sendMessage>[0]);
    sentWorkflowKeys.add(workflowKey);

    return NextResponse.json({ success: true, messageId: message.id, message: "סיכום ההצעות נשלח ללקוח ב-WhatsApp." });
  } catch (error) {
    console.error("Dial WhatsApp summary failed", error);
    return NextResponse.json(
      { success: false, message: "שליחת סיכום ה-WhatsApp נכשלה. לא בוצעה פעולה נוספת." },
      { status: 502 },
    );
  }
}
