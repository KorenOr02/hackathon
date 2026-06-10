import { BankShell } from "@/components/BankShell";
import { ShieldIcon } from "@/components/BankIcons";

export default function TransferPage() {
  return (
    <BankShell title="העברה חדשה" subtitle="מסך המחשה בלבד · לא ניתן לבצע העברות">
      <section className="transfer-layout">
        <div className="bank-panel transfer-form">
          <div className="transfer-lock"><ShieldIcon /><div><strong>העברות מושבתות במוקאפ</strong><span>הטופס מדגים את חוויית המשתמש בלבד ואינו שולח או שומר מידע.</span></div></div>
          <label>חשבון מקור<input disabled value="עו״ש · יתרה ₪93,230" readOnly /></label>
          <label>שם המוטב<input disabled placeholder="שם המוטב" /></label>
          <label>מספר חשבון<input disabled placeholder="מספר חשבון" /></label>
          <div className="transfer-split"><label>סכום<input disabled placeholder="₪0.00" /></label><label>מועד<input disabled value="היום" readOnly /></label></div>
          <label>הערה<input disabled placeholder="סיבת ההעברה" /></label>
          <button disabled>המשך לאישור · מוקאפ בלבד</button>
        </div>
        <aside className="transfer-note"><span>איך זה יעבוד בעתיד</span><h2>המשתמש תמיד מאשר</h2><p>גם עם חיבור בנקאי מאובטח, Swaper תוכל להכין פעולה ולהציג אותה לבדיקה. ביצוע סופי ידרוש אישור מפורש של המשתמש.</p><ul><li>הצגת הסכום והיעד לפני ביצוע</li><li>אימות זהות ואישור נוסף</li><li>תיעוד מלא של הפעולה</li></ul></aside>
      </section>
    </BankShell>
  );
}
