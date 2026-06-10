import { recurringExpenses } from "@/lib/mock-data";

export function ExpensesTable() {
  return (
    <section className="surface expenses-section">
      <div className="section-heading">
        <div><span className="eyebrow">ניטור חודשי</span><h2>הוצאות קבועות</h2></div>
        <span className="muted-label">סריקה אחרונה: עכשיו</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>ספק</th><th>קטגוריה</th><th>מחיר קודם</th><th>מחיר נוכחי</th><th>שינוי</th><th>סטטוס</th></tr></thead>
          <tbody>
            {recurringExpenses.map((expense) => (
              <tr key={expense.provider} className={expense.status === "המחיר עלה" ? "issue-row" : ""}>
                <td><strong>{expense.provider}</strong></td><td>{expense.category}</td><td>₪{expense.previousPrice}</td><td><strong>₪{expense.currentPrice}</strong></td>
                <td className={expense.change ? "increase" : ""}>{expense.change ? "+" : ""}{expense.change}%</td>
                <td><span className={`status status-${expense.status === "יציב" ? "stable" : "issue"}`}>{expense.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
