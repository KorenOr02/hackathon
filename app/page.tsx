"use client";

import { useEffect, useState } from "react";
import { BankShell } from "@/components/BankShell";
import { StatCard } from "@/components/StatCard";
import { ExpensesTable } from "@/components/ExpensesTable";
import { DetectionAlert } from "@/components/DetectionAlert";
import { NegotiationTimeline } from "@/components/NegotiationTimeline";
import { BestOfferCard } from "@/components/BestOfferCard";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [callMessage, setCallMessage] = useState("");
  const [calls, setCalls] = useState<Array<{ callId: string; provider: string }>>([]);
  const [summarySent, setSummarySent] = useState(false);
  const [callSummary, setCallSummary] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!started || complete) return;
    const timer = setTimeout(() => {
      if (activeStep < 4) setActiveStep((step) => step + 1);
    }, 1400);
    return () => clearTimeout(timer);
  }, [started, activeStep, complete]);

  useEffect(() => {
    if (!started || activeStep < 4 || complete || !calls.length) return;

    const completeWorkflow = async () => {
      try {
        const response = await fetch("/api/dial/negotiate/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calls }),
        });
        const result = await response.json();
        if (response.status === 409 && result.pending) return;
        if (!response.ok || !result.success) throw new Error(result.message);

        setSummarySent(Boolean(result.summarySent));
        setCallSummary(result.summary || "");
        setCallMessage(result.message);
        setComplete(true);
      } catch (error) {
        setCallMessage(error instanceof Error ? error.message : "לא הצלחנו לשלוח את סיכום ההצעות.");
      }
    };

    completeWorkflow();
    const poller = setInterval(completeWorkflow, 8_000);
    return () => clearInterval(poller);
  }, [started, activeStep, complete, calls]);

  async function startNegotiation() {
    setStarting(true);
    setCallMessage("");
    try {
      const response = await fetch("/api/dial/negotiate", { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);

      setStarted(true);
      setCalls(result.calls);
      setCallMessage(`${result.message}${result.testMode ? " כל השיחות נשלחות כרגע ליעד בדיקות משותף." : ""}`);
      setTimeout(() => document.getElementById("negotiation")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (error) {
      setCallMessage(error instanceof Error ? error.message : "לא הצלחנו להפעיל את סוכן המשא ומתן.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <BankShell title="חיסכון חכם" subtitle="Swaper מזהה חריגות, משווה הצעות ומכינה פעולות לאישור" workspace="negotiator">
      <div className="negotiator-workspace">
        <section className="negotiator-intro">
          <div><span className="bank-kicker">הזדמנות חיסכון חדשה</span><h2>חשבון הסלולר עלה.<br /><em>Swaper כבר מטפלת בזה.</em></h2><p>זוהתה עלייה חריגה בחיוב הקבוע של סלקום. ניתן להפעיל סוכן קצר שיבקש להחזיר את המחיר ל־₪100 או פחות, ללא ביצוע פעולה אמיתית.</p></div>
          <div className="stats-grid"><StatCard label="חיוב נוכחי" value="₪150" note="לחודש" tone="danger" /><StatCard label="חיוב קודם" value="₪100" note="בחודש שעבר" /><StatCard label="עליית מחיר" value="+50%" note="זוהתה אוטומטית" tone="danger" /><StatCard label="השפעה שנתית" value="₪600" note="אם לא נטפל" /></div>
        </section>
        <ExpensesTable />
        <DetectionAlert onStart={startNegotiation} started={started} starting={starting} callMessage={callMessage} />
        {started && <div id="negotiation" className="negotiation-grid"><NegotiationTimeline activeStep={activeStep} complete={complete} summarySent={summarySent} />{complete && <BestOfferCard summarySent={summarySent} summary={callSummary} />}</div>}
      </div>
    </BankShell>
  );
}
