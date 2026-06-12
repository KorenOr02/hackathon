import { NextResponse } from "next/server";
import { retryProvider } from "@/lib/workflow-store";
import type { ProviderKey } from "@/lib/dial-workflow";
const providerKeys: ProviderKey[] = ["cellcom", "partner", "pelephone"];
export async function POST(request: Request, { params }: { params: Promise<{ workflowId: string }> }) {
  const body = await request.json().catch(() => null);
  if (!providerKeys.includes(body?.providerKey)) return NextResponse.json({ success: false, message: "הספק שנבחר אינו תקין." }, { status: 400 });
  try {
    const { workflowId } = await params; const workflow = await retryProvider(workflowId, body.providerKey);
    if (!workflow) return NextResponse.json({ success: false, message: "תהליך ההשוואה לא נמצא." }, { status: 404 });
    return NextResponse.json({ success: true, workflow, message: "הניסיון החוזר התחיל." });
  } catch (error) { console.error("Dial provider retry failed", error); return NextResponse.json({ success: false, message: "לא הצלחנו להתחיל ניסיון חוזר." }, { status: 502 }); }
}
