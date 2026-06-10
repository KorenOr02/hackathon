"use client";

import { useState } from "react";
import { bestOffer } from "@/lib/mock-data";
import { CheckIcon, PhoneIcon } from "./icons";

export function BestOfferCard({ summarySent }: { summarySent: boolean }) {
  const [actionMessage, setActionMessage] = useState("");
  return (
    <section className="offer-section">
      <div className="offer-hero">
        <div className="offer-intro"><span className="eyebrow light">נמצאה ההצעה הטובה ביותר</span><h2>{bestOffer.provider}</h2><p>{bestOffer.notes}. ללא התחייבות ולא נמצאו עמלות נסתרות.</p><span className="approval-badge">ממתין לאישור המשתמש</span></div>
        <div className="offer-price"><span>מחיר חודשי חדש</span><strong><small>₪</small>{bestOffer.monthlyPrice}</strong><em>לחודש · {bestOffer.data}</em></div>
        <div className="savings"><div><span>חיסכון חודשי</span><strong>₪55</strong></div><div><span>חיסכון שנתי</span><strong>₪660</strong></div></div>
      </div>
      <div className="offer-action">
        <div><span className="eyebrow">פעולה מומלצת</span><h3>הכנת בקשת מעבר לפלאפון</h3><p>Swaper מכינה את הצעד הבא. האישור הסופי נשאר בידיים שלך.</p></div>
        <div className="action-buttons"><button className="approve-btn" onClick={() => setActionMessage("הפעולה הוכנה. מעבר הספק הסופי דורש אישור נוסף וביצוע ידני של המשתמש.")}><CheckIcon />אישור הכנת הפעולה</button><button className="secondary-btn" onClick={() => setActionMessage("ההמלצה נדחתה. לא בוצעה שום פעולה.")}>דחייה</button><button className="secondary-btn" disabled><PhoneIcon />{summarySent ? "הסיכום נשלח ב-WhatsApp" : "סיכום WhatsApp טרם נשלח"}</button></div>
      </div>
      {actionMessage && <div className="action-message"><CheckIcon />{actionMessage}</div>}
    </section>
  );
}
