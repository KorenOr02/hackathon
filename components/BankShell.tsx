"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ActivityIcon, GridIcon, PortfolioIcon, ShieldIcon, TransferIcon } from "./BankIcons";
import { SparkIcon } from "./icons";

const items = [
  { href: "/bank", label: "דשבורד", icon: GridIcon },
  { href: "/", label: "חיסכון חכם", icon: SparkIcon },
  { href: "/bank/portfolio", label: "תיק", icon: PortfolioIcon },
  { href: "/bank/activity", label: "פעילות", icon: ActivityIcon },
  { href: "/bank/transfer", label: "העברה", icon: TransferIcon },
];

export function BankShell({ title, subtitle, children, workspace = "bank" }: { title: string; subtitle: string; children: ReactNode; workspace?: "bank" | "negotiator" }) {
  const pathname = usePathname();
  return (
    <main className="bank-app">
      <aside className="bank-sidebar">
        <Link href="/bank" className="bank-logo"><span><SparkIcon /></span><strong>Swaper</strong></Link>
        <nav>
          {items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={pathname === href ? "active" : ""}><Icon />{label}</Link>
          ))}
        </nav>
        <div className="bank-sidebar-bottom">
          <div className="bank-user"><span>י</span><div><strong>יעל כהן</strong><small>תוכנית פעילה · מוקאפ</small></div></div>
        </div>
      </aside>
      <section className="bank-content">
        <div className="mock-banner"><ShieldIcon /><strong>סביבת מוקאפ בלבד</strong><span>{workspace === "bank" ? "אין חיבור לחשבון בנק, וכל הנתונים והפעולות במסך הם להדגמה בלבד." : "המערכת משתמשת בנתונים מדומים בלבד. שום שיחה, מעבר ספק או פעולה פיננסית לא מתבצעים ללא אישור."}</span></div>
        <header className="bank-page-header">
          <div><h1>{title}</h1><p>{subtitle}</p></div>
          {workspace === "bank" ? <button disabled><TransferIcon />העברה חדשה · מוקאפ</button> : <span className="workspace-status"><SparkIcon />סוכן פיננסי פעיל</span>}
        </header>
        {children}
      </section>
    </main>
  );
}
