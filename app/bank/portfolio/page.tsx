import { BankShell } from "@/components/BankShell";
import { holdings } from "@/lib/bank-mock-data";

export default function PortfolioPage() {
  return (
    <BankShell title="התיק שלי" subtitle="תמונת מצב של נכסים ויתרות · נתוני מוקאפ">
      <section className="portfolio-hero bank-panel">
        <div><span>שווי התיק הכולל</span><strong>₪187,430</strong><small>+₪4,860 מתחילת השנה · 2.66%</small></div>
        <div className="portfolio-curve"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
      </section>
      <section className="bank-panel holdings-panel">
        <div className="bank-panel-heading"><div><h2>החזקות</h2><p>החלוקה הנוכחית של תיק המוקאפ</p></div><span>עודכן עכשיו</span></div>
        <div className="holdings-list">
          {holdings.map((holding) => <div className="holding-row" key={holding.name}><div><span className="holding-mark"/><div><strong>{holding.name}</strong><small>{holding.type}</small></div></div><div><span>שווי</span><strong>{holding.value}</strong></div><div><span>משקל בתיק</span><strong>{holding.allocation}%</strong><i><b style={{ width: `${holding.allocation}%` }}/></i></div><div><span>תשואה שנתית</span><strong className="holding-yield">{holding.yield}</strong></div></div>)}
        </div>
      </section>
      <section className="bank-footnote"><strong>אין כאן מוצר השקעה אמיתי.</strong><span>המסך מדגים כיצד Swaper יכולה להציג תמונה פיננסית מאוחדת בעתיד, בכפוף להסכמת המשתמש וחיבור מאובטח.</span></section>
    </BankShell>
  );
}
