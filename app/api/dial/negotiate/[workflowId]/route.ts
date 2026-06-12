import { NextResponse } from "next/server";
import { refreshWorkflow } from "@/lib/workflow-store";
export async function GET(_request: Request, { params }: { params: Promise<{ workflowId: string }> }) {
  try {
    const { workflowId } = await params; const workflow = await refreshWorkflow(workflowId);
    if (!workflow) return NextResponse.json({ success: false, message: "תהליך ההשוואה לא נמצא." }, { status: 404 });
    return NextResponse.json({ success: true, workflow });
  } catch (error) { console.error("Dial workflow refresh failed", error); return NextResponse.json({ success: false, message: "לא הצלחנו לעדכן את מצב השיחות." }, { status: 502 }); }
}
