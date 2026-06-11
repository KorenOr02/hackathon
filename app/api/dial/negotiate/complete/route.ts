import { NextResponse } from "next/server";
import { assertE164PhoneNumber, buildCustomerSummary, getDialClient, getFromNumberId, summarizeCalls, type ProviderCallReference } from "@/lib/dial-workflow";

const sentWorkflowKeys = new Set<string>();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const callsRequested: ProviderCallReference[] = Array.isArray(body?.calls)
    ? body.calls.filter((call: unknown): call is ProviderCallReference => {
      if (!call || typeof call !== "object") return false;
      const candidate = call as Record<string, unknown>;
      return typeof candidate.callId === "string" && typeof candidate.provider === "string";
    })
    : [];
  const customerPhoneNumber = process.env.CUSTOMER_SUMMARY_NUMBER || process.env.CUSTOMER_WHATSAPP_NUMBER;

  if (!callsRequested.length) {
    return NextResponse.json({ success: false, message: "לא התקבלו מזהי שיחות לסיכום." }, { status: 400 });
  }

  try {
    const callIds = callsRequested.map(({ callId }) => callId);
    const workflowKey = [...callIds].sort().join(":");
    if (sentWorkflowKeys.has(workflowKey)) {
      return NextResponse.json({ success: true, duplicate: true, summarySent: true, message: "סיכום ההצעות כבר נשלח ללקוח ב-SMS." });
    }

    const dial = getDialClient();
    const fromNumberId = await getFromNumberId(dial);
    const calls = await Promise.all(callsRequested.map(async ({ callId, provider }) => ({
      call: await dial.getCall(callId),
      provider,
    })));
    const unfinished = calls.filter(({ call }) => call.status.state !== "Terminated");

    if (unfinished.length) {
      return NextResponse.json(
        { success: false, pending: true, message: "חלק משיחות הספקים עדיין לא הסתיימו. הסיכום טרם נשלח." },
        { status: 409 },
      );
    }
    const awaitingTranscripts = calls.filter(({ call }) =>
      call.status.terminationType === "completed" && call.duration > 0 && !call.transcript?.trim()
    );

    if (awaitingTranscripts.length) {
      return NextResponse.json(
        { success: false, pending: true, message: "השיחות הסתיימו, אך התמלולים עדיין בהכנה. הסיכום טרם נשלח." },
        { status: 409 },
      );
    }

    const summary = buildCustomerSummary(summarizeCalls(calls));

    if (!customerPhoneNumber) {
      return NextResponse.json({
        success: true,
        summarySent: false,
        summary,
        message: "השיחות הסתיימו. חסר CUSTOMER_SUMMARY_NUMBER, לכן הסיכום לא נשלח ב-SMS.",
      });
    }
    assertE164PhoneNumber(customerPhoneNumber, "מקבל הסיכום");

    const message = await dial.sendMessage({
      to: customerPhoneNumber,
      fromNumberId,
      body: summary,
    });
    sentWorkflowKeys.add(workflowKey);

    return NextResponse.json({ success: true, summarySent: true, summary, messageId: message.id, message: "סיכום ההצעות נשלח ללקוח ב-SMS." });
  } catch (error) {
    console.error("Dial SMS summary failed", error);
    return NextResponse.json(
      { success: false, message: "שליחת סיכום ה-SMS נכשלה. לא בוצעה פעולה נוספת." },
      { status: 502 },
    );
  }
}
