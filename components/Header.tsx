import { SparkIcon } from "./icons";
import Link from "next/link";

export function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark"><SparkIcon /></span>
        <div><strong>Swaper Negotiator</strong><span>מרכז בקרה פיננסי חכם</span></div>
      </div>
      <div className="header-right">
        <Link href="/bank" className="bank-preview-link">למסכי החשבון <span>←</span></Link>
        <span className="live-dot">סביבת הדגמה</span>
        <span className="badge">MVP להאקתון</span>
      </div>
    </header>
  );
}
