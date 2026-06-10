import Link from "next/link";
import { bankSummary, monthlyYield, transactions } from "@/lib/bank-mock-data";

export function BankDashboard() {
  return (
    <>
      <section className="bank-summary-grid">
        {bankSummary.map((item, index) => <article key={item.label} className="bank-summary-card"><span>{item.label}</span><strong>{item.value}</strong><small className={item.tone}>{item.note}</small>{index === 0 && <div className="mini-line"><i/><i/><i/><i/><i/><i/><i/></div>}</article>)}
      </section>
      <section className="bank-insights-grid">
        <article className="bank-panel yield-panel">
          <div className="bank-panel-heading"><h2>תשואה חודשית</h2><span>2026</span></div>
          <div className="bar-chart">
            {monthlyYield.map((item, index) => <div className="bar-column" key={item.month}><span>₪{(item.value / 1000).toFixed(1)}k</span><i className={index === monthlyYield.length - 1 ? "current" : ""} style={{ height: `${item.height}%` }} /><small>{item.month}</small></div>)}
          </div>
        </article>
        <article className="bank-panel allocation-panel">
          <h2>חלוקת נכסים</h2>
          <div className="donut" aria-label="חלוקת נכסים: 50 אחוז קרן כספית, 34 אחוז עובר ושב, 16 אחוז אגח"><span /></div>
          <ul><li><i className="blue"/>קרן כספית <strong>50%</strong></li><li><i className="light-blue"/>יתרת עו״ש <strong>34%</strong></li><li><i className="purple"/>אג״ח קצרות <strong>16%</strong></li></ul>
        </article>
      </section>
      <section className="bank-panel bank-transactions">
        <div className="bank-panel-heading"><h2>פעולות אחרונות</h2><Link href="/bank/activity">הצגת הכול</Link></div>
        <BankTransactions rows={transactions.slice(0, 4)} />
      </section>
    </>
  );
}

export function BankTransactions({ rows = transactions }: { rows?: typeof transactions }) {
  return <div className="bank-table-wrap"><table className="bank-table"><thead><tr><th>תיאור</th><th>תאריך</th><th>סכום</th><th>סוג</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.description}-${row.date}`} className={row.flagged ? "flagged" : ""}><td><strong>{row.description}</strong>{row.flagged && <small>זוהתה עליית מחיר</small>}</td><td>{row.date}</td><td className={row.positive ? "positive-amount" : ""}>{row.amount}</td><td><span>{row.category}</span></td></tr>)}</tbody></table></div>;
}
