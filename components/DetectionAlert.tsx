import { AlertIcon, ArrowIcon } from "./icons";

export function DetectionAlert({ onStart, started, starting, callMessage, isError }: { onStart: () => void; started: boolean; starting: boolean; callMessage: string; isError: boolean }) {
  return (
    <section className="savings-hero">
      <div className="savings-hero-copy">
        <span className="savings-alert"><AlertIcon />התייקרות חדשה</span>
        <h2>חשבון הסלולר עלה ב־<em>₪50</em></h2>
        <p>Swaper תתקשר לסלקום, פרטנר ופלאפון ותבקש מחיר של ₪100 או פחות.</p>
        <button className="primary-btn savings-cta" onClick={onStart} disabled={started || starting}>
          {starting ? "פותחת שלוש שיחות..." : started ? "Swaper מטפלת בזה" : "מצאו לי מחיר טוב יותר"}
          <ArrowIcon />
        </button>
        <span className="savings-helper">במצב הבדיקה תתבצע שיחה אחת בלבד · ניווט אוטומטי במענה הקולי</span>
        {callMessage && <p className={`call-status-message ${isError ? "error" : "success"}`}>{callMessage}</p>}
      </div>
      <div className="price-change-card">
        <div className="provider-chip"><span>ס</span><div><small>המנוי הנוכחי</small><strong>סלקום</strong></div></div>
        <div className="price-change">
          <div><small>היה</small><strong>₪100</strong></div>
          <span className="price-arrow">←</span>
          <div className="current-price"><small>עכשיו</small><strong>₪150</strong></div>
        </div>
        <div className="annual-impact"><span>תוספת שנתית</span><strong>₪600</strong></div>
      </div>
    </section>
  );
}
