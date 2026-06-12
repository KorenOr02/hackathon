import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ success: false, message: "הנתיב הוחלף בבדיקת סטטוס workflow." }, { status: 410 }); }
