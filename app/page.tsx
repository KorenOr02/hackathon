"use client";

import { useEffect, useState } from "react";
import { BankShell } from "@/components/BankShell";
import { BestOfferCard } from "@/components/BestOfferCard";
import { DetectionAlert } from "@/components/DetectionAlert";
import { NegotiationTimeline } from "@/components/NegotiationTimeline";
import type { ProviderKey, WorkflowStatus } from "@/lib/dial-workflow";

export default function Home() {
  const [workflow, setWorkflow] = useState<WorkflowStatus | null>(null);
  const [starting, setStarting] = useState(false);
  const [retrying, setRetrying] = useState<ProviderKey | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!workflow || workflow.allFinished) return;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/dial/negotiate/${workflow.workflowId}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);
        setWorkflow(result.workflow);
        if (result.workflow.summaryMessage) setMessage(result.workflow.summaryMessage);
      } catch (refreshError) {
        setError(true);
        setMessage(refreshError instanceof Error ? refreshError.message : "לא הצלחנו לעדכן את מצב השיחות.");
      }
    };
    refresh();
    const poller = setInterval(refresh, 5_000);
    return () => clearInterval(poller);
  }, [workflow?.workflowId, workflow?.allFinished]);

  async function startNegotiation() {
    setStarting(true);
    setError(false);
    setMessage("");
    try {
      const response = await fetch("/api/dial/negotiate", { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      setWorkflow(result.workflow);
      setMessage(result.message);
      setTimeout(() => document.getElementById("negotiation")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (startError) {
      setError(true);
      setMessage(startError instanceof Error ? startError.message : "לא הצלחנו להפעיל את סוכן המשא ומתן.");
    } finally {
      setStarting(false);
    }
  }

  async function retryProvider(providerKey: ProviderKey) {
    if (!workflow) return;
    setRetrying(providerKey);
    setError(false);
    try {
      const response = await fetch(`/api/dial/negotiate/${workflow.workflowId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerKey }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      setWorkflow(result.workflow);
      setMessage(result.message);
    } catch (retryError) {
      setError(true);
      setMessage(retryError instanceof Error ? retryError.message : "לא הצלחנו להתחיל ניסיון חוזר.");
    } finally {
      setRetrying(null);
    }
  }

  return (
    <BankShell title="חיסכון חכם" subtitle="מחיר טוב יותר, בלי להתקשר בעצמך" workspace="negotiator">
      <div className="negotiator-workspace">
        <DetectionAlert onStart={startNegotiation} started={Boolean(workflow)} starting={starting} callMessage={message} isError={error} />
        {workflow && (
          <div id="negotiation" className="negotiation-grid" aria-live="polite">
            <NegotiationTimeline workflow={workflow} onRetry={retryProvider} retrying={retrying} />
            {workflow.allFinished && <BestOfferCard workflow={workflow} />}
          </div>
        )}
      </div>
    </BankShell>
  );
}
