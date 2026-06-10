import { BankTransactions } from "@/components/BankDashboard";
import { BankShell } from "@/components/BankShell";

export default function ActivityPage() {
  return (
    <BankShell title="פעילות בחשבון" subtitle="כל הפעולות המוצגות הן נתוני הדגמה מקומיים">
      <section className="activity-summary">
        <div><span>הכנסות החודש</span><strong>₪18,542.80</strong><small>כולל תשואה</small></div>
        <div><span>הוצאות החודש</span><strong>₪6,840</strong><small>37% מההכנסה</small></div>
        <div><span>הוצאות קבועות</span><strong>₪610</strong><small>זוהתה חריגה אחת</small></div>
      </section>
      <section className="bank-panel bank-transactions activity-full">
        <div className="bank-panel-heading"><div><h2>כל הפעולות</h2><p>יוני 2026</p></div><span className="mock-filter">סינון · מוקאפ</span></div>
        <BankTransactions />
      </section>
    </BankShell>
  );
}
