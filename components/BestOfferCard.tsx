import type { WorkflowStatus } from "@/lib/dial-workflow";
import { CheckIcon, PhoneIcon, SparkIcon } from "./icons";

const confidenceLabel = { verified: "המחיר אומת", detected: "המחיר זוהה אך לא אומת", none: "לא התקבלה הצעה" };

export function BestOfferCard({ workflow }: { workflow: WorkflowStatus }) {
  const verified = workflow.providers.filter((offer) => offer.price !== null && offer.confidence === "verified");
  const detected = workflow.providers.filter((offer) => offer.price !== null);
  const best = [...(verified.length ? verified : detected)].sort((a, b) => a.price! - b.price!)[0];
  const isVerifiedBest = best?.confidence === "verified";
  return (
    <section className="results-section">
      <div className="results-highlight">
        <div><span className="result-kicker"><SparkIcon />{isVerifiedBest ? "ההצעה הטובה ביותר שאומתה" : best ? "המחיר הנמוך ביותר שזוהה" : "הבדיקה הושלמה"}</span><h2>{best?.provider || "לא התקבלה הצעה ברורה"}</h2><p>{best ? isVerifiedBest ? `חיסכון אפשרי של ₪${Math.max(0, 150 - best.price!)} בכל חודש` : "המחיר טרם אושר במפורש בשיחה" : "אפשר לנסות שוב מול ספקים שלא ענו"}</p></div>
        <div className="winning-price"><small>מחיר חודשי</small><strong>{best ? `₪${best.price}` : "—"}</strong><span>{best ? confidenceLabel[best.confidence] : "אין מחיר להצגה"}</span></div>
      </div>
      <div className="offer-comparison">{workflow.providers.map((offer) => <article className={offer.providerKey === best?.providerKey ? "is-best" : ""} key={offer.providerKey}><span>{offer.provider}</span><strong>{offer.price !== null ? `₪${offer.price}` : "לא התקבל"}</strong><small className={`confidence confidence-${offer.confidence}`}>{confidenceLabel[offer.confidence]}</small><p>{offer.reason}</p></article>)}</div>
      <div className="results-footer"><span><CheckIcon />לא בוצע מעבר ספק או רכישה</span><button className="secondary-btn" disabled><PhoneIcon />{workflow.summarySent ? "סיכום כל השיחות נשלח ב-SMS" : workflow.summaryMessage || "סיכום ה-SMS בהכנה"}</button></div>
    </section>
  );
}
