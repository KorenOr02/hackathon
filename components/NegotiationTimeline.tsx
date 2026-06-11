"use client";

import { CheckIcon, PhoneIcon, SparkIcon } from "./icons";

const steps = [
  { label: "מבקש מסלקום להחזיר את המחיר ל-₪100 או פחות", result: "שיחת הספק הסתיימה", icon: PhoneIcon },
  { label: "מבקש מפרטנר מחיר של ₪100 או פחות", result: "שיחת הספק הסתיימה", icon: PhoneIcon },
  { label: "מבקש מפלאפון מחיר של ₪100 או פחות", result: "שיחת הספק הסתיימה", icon: PhoneIcon },
  { label: "אוסף את המחירים הסופיים", result: "המחירים הסופיים התקבלו מ-Dial", icon: SparkIcon },
  { label: "שולח סיכום הצעות ללקוח ב-SMS", result: "שלב הסיכום הסתיים. לא בוצע מעבר ספק.", icon: PhoneIcon },
];

export function NegotiationTimeline({ activeStep, complete, summarySent }: { activeStep: number; complete: boolean; summarySent: boolean }) {
  const progress = complete ? 100 : Math.max(8, ((activeStep + 0.45) / steps.length) * 100);
  return (
    <section className="surface timeline-section">
      <div className="section-heading">
        <div><span className="eyebrow">סוכן משא ומתן מבוסס AI</span><h2>{complete ? summarySent ? "ההשוואה והסיכום הושלמו" : "השיחות הסתיימו, הסיכום טרם נשלח" : activeStep === 4 ? "ממתין לתוצאות ושולח סיכום" : "מנהל משא ומתן מול הספקים"}</h2></div>
        <span className={`agent-state ${complete && summarySent ? "done" : ""}`}>{summarySent ? "נשלח ללקוח" : complete ? "נדרשת הגדרה" : "הסוכן עובד"}</span>
      </div>
      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
      <div className="timeline">
        {steps.map((step, index) => {
          const done = complete || index < activeStep;
          const active = !complete && index === activeStep;
          const Icon = step.icon;
          return (
            <div className={`timeline-item ${done ? "is-done" : ""} ${active ? "is-active" : ""}`} key={step.label}>
              <span className="timeline-icon">{done ? <CheckIcon /> : <Icon />}</span>
              <div><strong>{step.label}{active ? "..." : ""}</strong>{done && <p>{step.result}</p>}{active && <p className="working">יוצר קשר עם הספק ובוחן את תנאי ההצעה</p>}</div>
              <span className="step-number">0{index + 1}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
