import type { ProviderKey, ProviderLifecycle, WorkflowStatus } from "@/lib/dial-workflow";
import { CheckIcon, PhoneIcon } from "./icons";

const providerMeta: Record<ProviderKey, { type: string; letter: string }> = {
  cellcom: { type: "שימור", letter: "ס" },
  partner: { type: "הצעה חדשה", letter: "פ" },
  pelephone: { type: "הצעה חדשה", letter: "פ" },
};
const labels: Record<ProviderLifecycle, string> = {
  waiting: "ממתינה לתורה", queued: "מתכוננים לשיחה", ringing: "מחייגים לספק",
  "in-progress": "השיחה מתבצעת", analyzing: "מנתחים את התוצאה", completed: "התקבלה תוצאה",
  "no-answer": "לא התקבלה תשובה", busy: "הקו היה תפוס", failed: "השיחה נכשלה",
};

export function NegotiationTimeline({ workflow, onRetry, retrying }: {
  workflow: WorkflowStatus; onRetry: (providerKey: ProviderKey) => void; retrying: ProviderKey | null;
}) {
  const finished = workflow.providers.filter((provider) => ["completed", "no-answer", "busy", "failed"].includes(provider.lifecycle)).length;
  return (
    <section className="calls-section">
      <div className="calls-heading">
        <div><span className="bank-kicker">{workflow.allFinished ? "ההשוואה הסתיימה" : "Swaper עובדת בשבילך"}</span><h2>{workflow.allFinished ? "התוצאות מוכנות" : workflow.testMode ? "מבצעת שיחת בדיקה אחת" : "בודקת שלושה ספקים"}</h2></div>
        <span className={`calls-status ${workflow.allFinished ? "done" : ""}`}>{finished} מתוך {workflow.providers.length} הסתיימו</span>
      </div>
      <div className="provider-call-grid">
        {workflow.providers.map((provider) => {
          const meta = providerMeta[provider.providerKey];
          const done = ["completed", "no-answer", "busy", "failed"].includes(provider.lifecycle);
          return <article className={`provider-call-card ${done ? "is-done" : "is-active"} lifecycle-${provider.lifecycle}`} key={provider.providerKey}>
            <div className="provider-call-top"><span className="provider-avatar">{meta.letter}</span><span className="provider-call-icon">{done ? <CheckIcon /> : <PhoneIcon />}</span></div>
            <div><small>{meta.type}</small><h3>{provider.provider}</h3></div>
            <div className="provider-call-state"><i />{labels[provider.lifecycle]}</div>
            {provider.retryable && <button className="retry-btn" onClick={() => onRetry(provider.providerKey)} disabled={retrying === provider.providerKey}>{retrying === provider.providerKey ? "מנסה שוב..." : "נסה שוב"}</button>}
          </article>;
        })}
      </div>
    </section>
  );
}
