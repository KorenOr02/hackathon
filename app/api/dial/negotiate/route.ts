import { NextResponse } from "next/server";
import { createWorkflow } from "@/lib/workflow-store";
import { DialWorkflowError } from "@/lib/dial-workflow";

const callCooldownMs = 60_000;
let lastWorkflowCreatedAt = 0;
export async function POST() {
  if (Date.now() - lastWorkflowCreatedAt < callCooldownMs) return NextResponse.json({ success: false, message: "כבר הופעל תהליך בדקה האחרונה. אפשר לנסות שוב בעוד רגע." }, { status: 429 });
  try {
    const workflow = await createWorkflow(); lastWorkflowCreatedAt = Date.now();
    return NextResponse.json({ success: true, workflow, message: workflow.testMode ? "שיחת בדיקה אחת התחילה. לא ייצאו שיחות נוספות בתהליך הזה." : "ההשוואה התחילה מול שלושת הספקים." });
  } catch (error) {
    console.error("Dial provider workflow failed", error);
    if (error instanceof DialWorkflowError) {
      return NextResponse.json({ success: false, code: error.code, message: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("401") ? 401 : message.startsWith("DIAL_CONFIG_MISSING") ? 503 : 502;
    const publicMessage = message.startsWith("DIAL_CONFIG_MISSING:") ? message.replace("DIAL_CONFIG_MISSING:", "").trim() : status === 401 ? "מפתח Dial אינו מורשה או שפג תוקפו." : "הפעלת שיחות הספקים נכשלה. לא בוצעה פעולה נוספת.";
    return NextResponse.json({ success: false, message: publicMessage }, { status });
  }
}
