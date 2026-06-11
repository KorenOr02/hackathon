import { CheckIcon, PhoneIcon } from "./icons";

export function BestOfferCard({ summarySent, summary }: { summarySent: boolean; summary: string }) {
  return (
    <section className="offer-section">
      <div className="offer-hero">
        <div className="offer-intro"><span className="eyebrow light">תוצאות אמיתיות מ-Dial</span><h2>השיחות הסתיימו</h2><p>להלן התמלולים שהתקבלו מהשיחות. Swaper לא ביצעה מעבר ספק או רכישה.</p><span className="approval-badge">ממתין לבדיקת המשתמש</span></div>
        <div className="offer-price"><span>סטטוס סיכום</span><strong><CheckIcon /></strong><em>{summarySent ? "נשלח ב-SMS" : "לא נשלח ב-SMS"}</em></div>
        <div className="savings"><div><span>מקור הנתונים</span><strong>Dial</strong></div><div><span>פעולה שבוצעה</span><strong>שיחות בלבד</strong></div></div>
      </div>
      <div className="offer-action">
        <div><span className="eyebrow">סיכום שיחות</span><h3>תמלולי המשא ומתן</h3><p style={{ whiteSpace: "pre-wrap" }}>{summary || "לא התקבל תמלול מהשיחות."}</p></div>
        <div className="action-buttons"><button className="secondary-btn" disabled><PhoneIcon />{summarySent ? "הסיכום נשלח ב-SMS" : "לא הוגדר יעד SMS"}</button></div>
      </div>
    </section>
  );
}
