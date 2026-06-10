import { AlertIcon, ArrowIcon } from "./icons";

export function DetectionAlert({ onStart, started, starting, callMessage }: { onStart: () => void; started: boolean; starting: boolean; callMessage: string }) {
  return (
    <section className="detection">
      <div className="detection-main">
        <span className="alert-icon"><AlertIcon /></span>
        <div>
          <span className="eyebrow light">זוהתה חריגה</span>
          <h2>זוהתה עליית מחיר</h2>
          <p>Swaper זיהתה שחבילת הסלולר שלך בסלקום עלתה מ־₪100 ל־₪150 בחודש. הסוכן יברר את הסיבה מול סלקום, ינהל משא ומתן, יבדוק מתחרים וישלח לך את כל ההצעות ב-WhatsApp.</p>
          <button className="primary-btn" onClick={onStart} disabled={started || starting}>{starting ? "יוצר שיחות לספקים..." : started ? "המשא ומתן מול הספקים בתהליך" : "הפעלת סוכן המשא ומתן"}<ArrowIcon /></button>
          {callMessage && <p className={`call-status-message ${started ? "success" : "error"}`}>{callMessage}</p>}
        </div>
      </div>
      <div className="detection-stats">
        <div><span>ספק</span><strong>סלקום</strong></div><div><span>קטגוריה</span><strong>סלולר</strong></div>
        <div><span>מחיר קודם</span><strong>₪100</strong></div><div><span>מחיר נוכחי</span><strong>₪150</strong></div>
        <div><span>עלייה</span><strong>50%</strong></div><div><span>השפעה שנתית</span><strong>₪600</strong></div>
      </div>
    </section>
  );
}
