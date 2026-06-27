import type { Call } from "@getdial/sdk";
import {
  analyzeCall, assertE164PhoneNumber, buildCustomerSummary, createProviderPrompt, getConfiguredProviders,
  getDialClient, getFromNumberId, normalizeDialCallError, type ProviderConfig, type ProviderKey, type ProviderWorkflowResult,
  type WorkflowStatus, waitingProviderResult,
} from "@/lib/dial-workflow";

interface ProviderRun { provider: ProviderConfig; callId: string | null; call: Call | null; creationError: boolean; initial: boolean }
interface WorkflowRecord {
  id: string; testMode: boolean; runs: ProviderRun[]; summarySent: boolean; summarySending: boolean;
  initialSummaryFinalized: boolean; summaryMessage: string; createdAt: number;
}
const globalStore = globalThis as typeof globalThis & { swaperWorkflows?: Map<string, WorkflowRecord> };
const workflows = globalStore.swaperWorkflows ?? new Map<string, WorkflowRecord>();
globalStore.swaperWorkflows = workflows;

async function placeCall(run: ProviderRun) {
  assertE164PhoneNumber(run.provider.phoneNumber!, run.provider.name);
  const dial = getDialClient();
  const fromNumberId = await getFromNumberId(dial);
  const call = await dial.makeCall({ to: run.provider.phoneNumber!, fromNumberId, outboundInstruction: createProviderPrompt(run.provider), language: "he-IL", idempotencyKey: crypto.randomUUID() });
  run.callId = call.id; run.call = call; run.creationError = false;
}
async function tryPlaceCall(run: ProviderRun) {
  try { await placeCall(run); } catch (error) {
    console.error(`Dial call to ${run.provider.name} failed`, error);
    run.creationError = true;
    throw normalizeDialCallError(error);
  }
}

export async function createWorkflow() {
  const configuredProviders = getConfiguredProviders();
  if (!configuredProviders.length) throw new Error("DIAL_CONFIG_MISSING: לא הוגדר אף מספר ספק לחיוג.");
  const testMode = Boolean(process.env.DIAL_TEST_PROVIDER_NUMBER);
  const providersToCall = configuredProviders;
  const workflow: WorkflowRecord = {
    id: crypto.randomUUID(), testMode,
    runs: providersToCall.map((provider) => ({ provider, callId: null, call: null, creationError: false, initial: true })),
    summarySent: false, summarySending: false, initialSummaryFinalized: false, summaryMessage: "", createdAt: Date.now(),
  };
  workflows.set(workflow.id, workflow);
  try {
    await Promise.all(workflow.runs.map(tryPlaceCall));
  } catch (error) {
    workflows.delete(workflow.id);
    throw error;
  }
  return getPublicStatus(workflow);
}

function resultForRun(run: ProviderRun): ProviderWorkflowResult {
  if (run.creationError) return { ...waitingProviderResult(run.provider), lifecycle: "failed", reason: "לא הצלחנו ליצור את השיחה", retryable: true };
  return run.call ? analyzeCall(run.provider, run.call) : waitingProviderResult(run.provider);
}
function isFinished(result: ProviderWorkflowResult) { return ["completed", "no-answer", "busy", "failed"].includes(result.lifecycle); }
function getPublicStatus(workflow: WorkflowRecord): WorkflowStatus {
  const results = workflow.runs.map(resultForRun).map((result) => workflow.testMode ? { ...result, retryable: false } : result);
  return { workflowId: workflow.id, testMode: workflow.testMode, providers: results, allFinished: results.every(isFinished), summarySent: workflow.summarySent, summaryMessage: workflow.summaryMessage };
}
async function refreshCalls(workflow: WorkflowRecord) {
  const dial = getDialClient();
  await Promise.all(workflow.runs.map(async (run) => {
    if (run.callId && (run.call?.status.state !== "Terminated" || (run.call.status.terminationType === "completed" && !run.call.transcript?.trim()))) run.call = await dial.getCall(run.callId);
  }));
}
async function sendSummaryOnce(workflow: WorkflowRecord, results: ProviderWorkflowResult[]) {
  if (workflow.initialSummaryFinalized || workflow.summarySending || !results.every(isFinished)) return;
  workflow.summarySending = true; workflow.initialSummaryFinalized = true;
  try {
    const customerPhoneNumber = process.env.CUSTOMER_SUMMARY_NUMBER || process.env.CUSTOMER_WHATSAPP_NUMBER;
    if (!customerPhoneNumber) { workflow.summaryMessage = "הבדיקה הסתיימה, אך לא הוגדר מספר לשליחת SMS."; return; }
    assertE164PhoneNumber(customerPhoneNumber, "מקבל הסיכום");
    const dial = getDialClient(); const fromNumberId = await getFromNumberId(dial);
    await dial.sendMessage({ to: customerPhoneNumber, fromNumberId, body: buildCustomerSummary(results) });
    workflow.summarySent = true; workflow.summaryMessage = "סיכום כל השיחות נשלח ב-SMS.";
  } catch (error) { console.error("Dial SMS summary failed", error); workflow.summaryMessage = "שליחת סיכום ה-SMS נכשלה."; }
  finally { workflow.summarySending = false; }
}
export async function refreshWorkflow(workflowId: string) {
  const workflow = workflows.get(workflowId); if (!workflow) return null;
  await refreshCalls(workflow);
  const status = getPublicStatus(workflow);
  await sendSummaryOnce(workflow, status.providers.filter((result) => workflow.runs.find((run) => run.provider.key === result.providerKey)?.initial));
  return getPublicStatus(workflow);
}
export async function retryProvider(workflowId: string, providerKey: ProviderKey) {
  const workflow = workflows.get(workflowId); if (!workflow) return null;
  if (workflow.testMode) return getPublicStatus(workflow);
  const run = workflow.runs.find((candidate) => candidate.provider.key === providerKey);
  if (!run || !resultForRun(run).retryable) return getPublicStatus(workflow);
  run.callId = null; run.call = null; run.creationError = false; run.initial = false;
  try { await tryPlaceCall(run); } catch { /* Keep the provider in a retryable failed state. */ }
  return getPublicStatus(workflow);
}
