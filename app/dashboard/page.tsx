"use client";

import React, { useState, useEffect, useId } from "react";

// ── Design tokens ──
const BLUE    = "#6B8FB5";
const BLUE_L  = "#9BB4CE";
const DARK_BG = "#2E3439";
const TEAL    = "#3A5560";
const PLUM    = "#4A3D4E";
const PLUM_C  = "#9A86A6";
const FG1     = "#FFFFFF";
const FG2     = "#C8C8C8";
const BORDER  = "rgba(255,255,255,0.10)";
const CARD    = "rgba(255,255,255,0.06)";

const TOTAL   = 187430;
const MMF_APR = 0.04;
const ils = (n: number) => "₪" + Math.round(n).toLocaleString();

// ── SVG Icons (inline, no dep) ──
function Icon({ d, size = 18, color = FG2, viewBox = "0 0 24 24" }: { d: string | string[]; size?: number; color?: string; viewBox?: string }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const ICONS: Record<string, string[]> = {
  dashboard:  ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  portfolio:  ["M21.21 15.89A10 10 0 1 1 8 2.83", "M22 12A10 10 0 0 0 12 2v10z"],
  activity:   ["M22 12h-4l-3 9L9 3l-3 9H2"],
  transfer:   ["M17 1l4 4-4 4", "M3 11V9a4 4 0 0 1 4-4h14", "M7 23l-4-4 4-4", "M21 13v2a4 4 0 0 1-4 4H3"],
  settings:   ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  shield:     ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  repeat:     ["M17 1l4 4-4 4","M3 11V9a4 4 0 0 1 4-4h14","M7 23l-4-4 4-4","M21 13v2a4 4 0 0 1-4 4H3"],
  chevronRight: ["M9 18l6-6-6-6"],
};

// ── Sparkline ──
function Sparkline({ data, color = BLUE_L, w = 120, h = 36 }: { data?: number[]; color?: string; w?: number; h?: number }) {
  const pts = data || [28, 24, 26, 20, 22, 16, 18, 12, 14, 8];
  const step = w / (pts.length - 1);
  const d = pts.map((y, i) => `${i === 0 ? "M" : "L"}${i * step},${y}`).join(" ");
  const area = d + ` L${(pts.length - 1) * step},${h} L0,${h} Z`;
  const uid = useId().replace(/:/g, "");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${uid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Sidebar ──
const NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "portfolio", label: "Portfolio" },
  { id: "activity",  label: "Activity" },
  { id: "transfer",  label: "Transfer" },
  { id: "settings",  label: "Settings" },
] as const;
type PageId = (typeof NAV)[number]["id"];

function Sidebar({ page, setPage }: { page: PageId; setPage: (p: PageId) => void }) {
  return (
    <div style={{ width: 220, flexShrink: 0, background: "rgba(22,26,29,0.95)", borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", height: "100%", padding: "0 12px" }}>
      {/* Logo */}
      <div style={{ padding: "28px 12px 32px", display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="32" height="24" viewBox="0 0 64 48" fill="none">
          <ellipse cx="18" cy="24" rx="13" ry="8.5" stroke={BLUE} strokeWidth="2.2" fill="none" transform="rotate(-18 18 24)" />
          <ellipse cx="46" cy="24" rx="13" ry="8.5" stroke={BLUE} strokeWidth="2.2" fill="none" transform="rotate(18 46 24)" />
          <path d="M24.5 18.5 C32 14, 34 14, 40 18" stroke={BLUE} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M24.5 29.5 C32 34, 34 34, 40 29.5" stroke={BLUE} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 18, fontWeight: 700, color: FG1, letterSpacing: "-0.02em" }}>Swaper</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((n) => {
          const active = page === n.id;
          return (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: active ? "rgba(107,143,181,0.18)" : "transparent", textAlign: "left", width: "100%" }}>
              <Icon d={ICONS[n.id]} size={18} color={active ? BLUE_L : "rgba(255,255,255,0.4)"} />
              <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 14, fontWeight: active ? 600 : 400, color: active ? FG1 : "rgba(255,255,255,0.5)" }}>{n.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User pill */}
      <div style={{ padding: "16px 8px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 12px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>Y</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 13, fontWeight: 600, color: FG1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Yael Cohen</div>
            <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, color: FG2 }}>Active plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ──
function StatCard({ label, value, sub, trend, spark }: { label: string; value: string; sub?: string; trend?: boolean; spark?: boolean }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, fontWeight: 600, color: FG2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 30, fontWeight: 900, color: FG1, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 12, color: trend ? "#8BA8A0" : FG2 }}>{sub}</div>}
      {spark && <div style={{ marginTop: 8 }}><Sparkline w={120} h={28} /></div>}
    </div>
  );
}

// ── Confirmation popup ──
function ConfirmPopup({ from, to, onConfirm, onCancel }: { from: number; to: number; onConfirm: () => void; onCancel: () => void }) {
  const fromMMF   = TOTAL - from;
  const toMMF     = TOTAL - to;
  const fromYield = fromMMF * MMF_APR / 12;
  const toYield   = toMMF   * MMF_APR / 12;
  const yieldDiff = toYield - fromYield;
  const moving    = to - from; // positive = more liquid, negative = more invested

  return (
    <>
      {/* Backdrop */}
      <div onClick={onCancel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 100, backdropFilter: "blur(2px)" }} />
      {/* Card */}
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 101,
        background: "#1E2428", border: `1px solid rgba(255,255,255,0.14)`, borderRadius: 20, padding: "28px 28px 22px",
        width: 400, boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Icon d={ICONS.shield} size={18} color={BLUE_L} />
          <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 16, fontWeight: 700, color: FG1 }}>Confirm Safety Cushion Change</span>
        </div>
        <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 12.5, color: FG2, marginBottom: 22, lineHeight: 1.5 }}>
          {moving > 0
            ? `Moving ${ils(moving)} from money-market funds to your liquid account.`
            : `Moving ${ils(-moving)} from your liquid account into money-market funds.`}
        </div>

        {/* Before → After */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", marginBottom: 22, direction: "ltr" }}>
          {/* Before */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 10, fontWeight: 600, color: FG2, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Before</div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 10, color: FG2, marginBottom: 2 }}>Liquid cushion</div>
              <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 15, fontWeight: 800, color: PLUM_C }}>{ils(from)}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 10, color: FG2, marginBottom: 2 }}>Monthly yield</div>
              <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 15, fontWeight: 800, color: "#8BA8A0" }}>{ils(fromYield)}</div>
            </div>
          </div>

          {/* Arrow — points from Before (left) to After (right) */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={FG2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>

          {/* After */}
          <div style={{ background: "rgba(107,143,181,0.10)", border: `1px solid rgba(107,143,181,0.25)`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 10, fontWeight: 600, color: BLUE_L, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>After</div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 10, color: FG2, marginBottom: 2 }}>Liquid cushion</div>
              <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 15, fontWeight: 800, color: PLUM_C }}>{ils(to)}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 10, color: FG2, marginBottom: 2 }}>Monthly yield</div>
              <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 15, fontWeight: 800, color: "#8BA8A0" }}>
                {ils(toYield)}
                <span style={{ fontSize: 11, fontWeight: 600, color: yieldDiff >= 0 ? "#8BA8A0" : "#C08A8A", marginLeft: 4 }}>
                  ({yieldDiff >= 0 ? "+" : ""}{ils(yieldDiff)}/mo)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "transparent", cursor: "pointer", fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 14, fontWeight: 600, color: FG2 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: BLUE, cursor: "pointer", fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 14, fontWeight: 700, color: "#fff" }}>Confirm</button>
        </div>
      </div>
    </>
  );
}

// ── Dashboard page ──
function DashboardPage() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  const [cushion, setCushion] = useState(28000);
  const [draft, setDraft]     = useState<number | null>(null); // pending value not yet confirmed
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const v = +(localStorage.getItem("swaper-cushion") || "");
    if (v >= 0 && v <= TOTAL) setCushion(v);
  }, []);
  useEffect(() => { localStorage.setItem("swaper-cushion", String(cushion)); }, [cushion]);

  // The value shown live (slider preview uses draft; confirmed state uses cushion)
  const displayed = draft ?? cushion;

  function handleSliderChange(val: number) { setDraft(val); }
  function handleSliderCommit()            { if (draft !== null && draft !== cushion) setShowConfirm(true); }
  function handlePreset(val: number)       { setDraft(val); setShowConfirm(true); }
  function handleConfirm()                 { if (draft !== null) setCushion(draft); setDraft(null); setShowConfirm(false); }
  function handleCancel()                  { setDraft(null); setShowConfirm(false); }

  const mmf         = TOTAL - displayed;
  const cushionPct  = (displayed / TOTAL) * 100;
  const mmfPct      = (mmf / TOTAL) * 100;
  const monthlyYield = mmf * MMF_APR / 12;
  const dailyYield   = mmf * MMF_APR / 365;

  const vals = [0.43, 0.58, 0.55, 0.78, 0.70, 0.92, 1].map((f) => monthlyYield * f);
  const mx   = Math.max(...vals, 1);

  const C   = 2 * Math.PI * 36;
  const seg = [
    { label: "Gov't MMF",        amt: mmf * 0.71, color: BLUE },
    { label: "Short-term bonds", amt: mmf * 0.29, color: BLUE_L },
    { label: "Cash reserve",     amt: cushion,    color: PLUM_C },
  ];
  let acc = 0;
  const arcs = seg.map((s) => {
    const frac = s.amt / TOTAL;
    const a = { ...s, dash: frac * C, gap: C - frac * C, offset: -acc * C, pct: frac * 100 };
    acc += frac;
    return a;
  });

  const txns = [
    { label: "Yield credited",       date: "Today 02:00",      amount: "+₪42.80", type: "yield" },
    { label: "Auto-transfer to MMF", date: "Yesterday 23:55",  amount: "₪12,000", type: "mmf" },
    { label: "Bill payment — HOA",   date: "Mon 14:32",         amount: "-₪1,840", type: "bill" },
    { label: "Yield credited",       date: "Sun 02:00",         amount: "+₪41.50", type: "yield" },
    { label: "MMF transfer",         date: "Sat 22:10",         amount: "₪8,000",  type: "mmf" },
  ];

  const presets = [{ label: "1 month", amt: 14000 }, { label: "3 months", amt: 42000 }, { label: "6 months", amt: 84000 }];

  return (
    <div style={{ padding: "36px 36px 60px", overflowY: "auto", height: "100%" }}>
      {showConfirm && draft !== null && (
        <ConfirmPopup from={cushion} to={draft} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 26, fontWeight: 800, color: FG1, letterSpacing: "-0.03em" }}>Dashboard</div>
          <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 13, color: FG2, marginTop: 2 }}>Monday, 21 April 2026</div>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: BLUE, border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 14, fontWeight: 600, color: "#fff" }}>
          <Icon d={ICONS.repeat} size={15} color="#fff" />
          New Transfer
        </button>
      </div>

      {/* Safety Cushion control */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "24px 26px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon d={ICONS.shield} size={18} color={BLUE_L} />
              <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 15, fontWeight: 700, color: FG1 }}>Safety Cushion</span>
            </div>
            <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 12.5, color: FG2, marginTop: 4 }}>Choose how much stays instantly liquid vs. earning yield in money-market funds.</div>
          </div>
        </div>

        {/* Split readout */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: PLUM_C }} />
              <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 12, fontWeight: 600, color: FG2 }}>Liquid cushion</span>
            </div>
            <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 28, fontWeight: 900, color: FG1, letterSpacing: "-0.03em", lineHeight: 1 }}>{ils(displayed)}</div>
            <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11.5, color: FG2, marginTop: 3 }}>{cushionPct.toFixed(0)}% · available instantly</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "flex-end", marginBottom: 3 }}>
              <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 12, fontWeight: 600, color: FG2 }}>In money-market funds</span>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: BLUE }} />
            </div>
            <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 28, fontWeight: 900, color: FG1, letterSpacing: "-0.03em", lineHeight: 1 }}>{ils(mmf)}</div>
            <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11.5, color: "#8BA8A0", marginTop: 3 }}>{mmfPct.toFixed(0)}% · +{ils(monthlyYield)}/mo</div>
          </div>
        </div>

        {/* Split bar */}
        <div style={{ display: "flex", height: 12, borderRadius: 99, overflow: "hidden", background: "rgba(255,255,255,0.06)", marginBottom: 14 }}>
          <div style={{ width: `${cushionPct}%`, background: PLUM_C, transition: "width 0.12s ease" }} />
          <div style={{ width: `${mmfPct}%`, background: BLUE, transition: "width 0.12s ease" }} />
        </div>

        <input type="range" min="0" max={TOTAL} step="500" value={displayed}
          onChange={(e) => handleSliderChange(+e.target.value)}
          onMouseUp={handleSliderCommit} onTouchEnd={handleSliderCommit}
          style={{ width: "100%", accentColor: PLUM_C, cursor: "pointer" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, color: FG2 }}>All invested</span>
          <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, color: FG2 }}>All liquid</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Portfolio" value={ils(TOTAL)} sub="+₪312 today" trend spark />
        <StatCard label="In MMF" value={ils(mmf)} sub={`Earning ${(MMF_APR * 100).toFixed(1)}% p.a.`} trend />
        <StatCard label="In Account" value={ils(displayed)} sub="Fully liquid" />
        <StatCard label="Yield This Month" value={ils(monthlyYield)} sub={`≈ +${ils(dailyYield)}/day`} trend />
      </div>

      {/* Chart + allocation */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 24 }}>
        {/* Bar chart */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 15, fontWeight: 700, color: FG1 }}>Projected Monthly Yield</div>
            <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 12, color: FG2 }}>at current split</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 140 }}>
            {vals.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 10, color: FG2 }}>₪{(v / 1000).toFixed(1)}k</div>
                <div style={{ width: "100%", borderRadius: "6px 6px 0 0", height: `${(v / mx) * 100}px`, background: i === vals.length - 1 ? BLUE : "rgba(107,143,181,0.25)", transition: "height 0.3s ease" }} />
                <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 10, color: FG2 }}>{months[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "24px" }}>
          <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 15, fontWeight: 700, color: FG1, marginBottom: 20 }}>Allocation</div>
          <svg width="130" height="130" viewBox="0 0 100 100" style={{ display: "block", margin: "0 auto" }}>
            {arcs.map((a, i) => (
              <circle key={i} cx="50" cy="50" r="36" fill="none" stroke={a.color} strokeWidth="18" strokeDasharray={`${a.dash} ${a.gap}`} strokeDashoffset={a.offset} transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 0.15s ease" }} />
            ))}
            <circle cx="50" cy="50" r="26" fill={DARK_BG} />
          </svg>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {arcs.map((a) => (
              <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 12, color: FG2, flex: 1 }}>{a.label}</span>
                <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 12, fontWeight: 700, color: FG1 }}>{a.pct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 15, fontWeight: 700, color: FG1 }}>Recent Transactions</div>
          <button style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 12, color: FG2 }}>View all</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              {["Description", "Date", "Amount", "Type"].map((h) => (
                <th key={h} style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, fontWeight: 600, color: FG2, textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 24px", textAlign: "left", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {txns.map((tx, i) => (
              <tr key={i} style={{ borderBottom: i < txns.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <td style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 14, color: FG1, padding: "13px 24px" }}>{tx.label}</td>
                <td style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 13, color: FG2, padding: "13px 24px" }}>{tx.date}</td>
                <td style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 14, fontWeight: 700, padding: "13px 24px", color: tx.amount.startsWith("+") ? "#8BA8A0" : FG1 }}>{tx.amount}</td>
                <td style={{ padding: "13px 24px" }}>
                  <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: tx.type === "yield" ? "rgba(139,168,160,0.18)" : tx.type === "mmf" ? "rgba(107,143,181,0.18)" : "rgba(255,255,255,0.08)", color: tx.type === "yield" ? "#8BA8A0" : tx.type === "mmf" ? BLUE_L : FG2 }}>
                    {tx.type === "yield" ? "Yield" : tx.type === "mmf" ? "MMF" : "Payment"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Portfolio page ──
function PortfolioPage() {
  const funds = [
    { name: "Government Money-Market Fund", ticker: "IL-GOV-MMF", balance: "₪56,520", yield: "4.85%", pct: 60 },
    { name: "Short-Term Bond Fund",         ticker: "IL-STB-01",  balance: "₪22,608", yield: "4.20%", pct: 24 },
    { name: "Cash Reserve",                 ticker: "LIQUIDITY",  balance: "₪15,072", yield: "—",     pct: 16 },
  ];
  return (
    <div style={{ padding: "36px", overflowY: "auto", height: "100%" }}>
      <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 26, fontWeight: 800, color: FG1, letterSpacing: "-0.03em", marginBottom: 8 }}>Portfolio</div>
      <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 13, color: FG2, marginBottom: 32 }}>Your money-market fund breakdown</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {funds.map((f, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 14, fontWeight: 700, color: FG1, marginBottom: 3 }}>{f.name}</div>
                <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, color: FG2 }}>{f.ticker}</div>
              </div>
              <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, height: "fit-content", background: "rgba(107,143,181,0.15)", color: BLUE_L }}>{f.pct}%</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 10, color: FG2, marginBottom: 4 }}>Balance</div>
                <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 20, fontWeight: 800, color: FG1, letterSpacing: "-0.03em" }}>{f.balance}</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 10, color: FG2, marginBottom: 4 }}>Annual yield</div>
                <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 20, fontWeight: 800, color: f.yield === "—" ? FG2 : "#8BA8A0", letterSpacing: "-0.03em" }}>{f.yield}</div>
              </div>
            </div>
            <div style={{ marginTop: 14, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${f.pct}%`, background: BLUE, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Transfer page ──
function TransferPage() {
  const [amount, setAmount] = useState(12500);
  const [dir, setDir] = useState<"to-mmf" | "to-account">("to-mmf");
  const opts = [
    { id: "to-mmf" as const,     label: "To MMF",     sub: "Start earning yield" },
    { id: "to-account" as const, label: "To Account", sub: "Available immediately" },
  ];
  const preview = [
    ["Est. daily yield", dir === "to-mmf" ? `+₪${(amount * 0.047 / 365).toFixed(2)}/day` : "—"],
    ["Settlement", "Instant"],
    ["Fee", "None"],
  ];
  return (
    <div style={{ padding: "36px", overflowY: "auto", height: "100%" }}>
      <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 26, fontWeight: 800, color: FG1, letterSpacing: "-0.03em", marginBottom: 8 }}>Transfer</div>
      <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 13, color: FG2, marginBottom: 32 }}>Move funds between checking account and MMF</div>
      <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {opts.map((opt) => (
            <div key={opt.id} onClick={() => setDir(opt.id)} style={{ background: dir === opt.id ? "rgba(107,143,181,0.18)" : CARD, border: `1.5px solid ${dir === opt.id ? BLUE : BORDER}`, borderRadius: 16, padding: "18px", cursor: "pointer" }}>
              <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 15, fontWeight: 700, color: dir === opt.id ? BLUE_L : FG1 }}>{opt.label}</div>
              <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 12, color: FG2, marginTop: 4 }}>{opt.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ background: CARD, border: "1.5px solid rgba(107,143,181,0.35)", borderRadius: 20, padding: "24px" }}>
          <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, color: BLUE_L, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Amount</div>
          <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 44, fontWeight: 900, color: FG1, letterSpacing: "-0.03em", marginBottom: 16 }}>₪{amount.toLocaleString()}</div>
          <input type="range" min="1000" max="100000" step="500" value={amount} onChange={(e) => setAmount(+e.target.value)} style={{ width: "100%", accentColor: BLUE }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, color: FG2 }}>₪1,000</span>
            <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, color: FG2 }}>₪100,000</span>
          </div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "18px", display: "flex", flexDirection: "column", gap: 10 }}>
          {preview.map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 13, color: FG2 }}>{l}</span>
              <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 13, fontWeight: 700, color: l === "Est. daily yield" && dir === "to-mmf" ? "#8BA8A0" : FG1 }}>{v}</span>
            </div>
          ))}
        </div>
        <button style={{ padding: "15px", borderRadius: 14, border: "none", cursor: "pointer", background: BLUE, fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>Confirm Transfer</button>
      </div>
    </div>
  );
}

// ── Settings page ──
function SettingsPage() {
  const groups = [
    { section: "Profile",       rows: ["Full name", "Email address", "Phone number", "Language"] },
    { section: "Automation",    rows: ["Auto-transfer threshold", "Yield reinvestment", "Transfer schedule"] },
    { section: "Security",      rows: ["Two-factor authentication", "Login sessions", "Change password"] },
    { section: "Notifications", rows: ["Yield credited", "Transfer completed", "Low balance alert"] },
  ];
  return (
    <div style={{ padding: "36px", overflowY: "auto", height: "100%" }}>
      <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 26, fontWeight: 800, color: FG1, letterSpacing: "-0.03em", marginBottom: 32 }}>Settings</div>
      <div style={{ maxWidth: 560 }}>
        {groups.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 11, fontWeight: 700, color: FG2, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{g.section}</div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
              {g.rows.map((row, ri) => (
                <div key={ri} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: ri < g.rows.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <span style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 14, color: FG1 }}>{row}</span>
                  <Icon d={ICONS.chevronRight} size={16} color="rgba(255,255,255,0.25)" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Activity page (stub) ──
function ActivityPage() {
  return (
    <div style={{ padding: "36px", overflowY: "auto", height: "100%" }}>
      <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 26, fontWeight: 800, color: FG1, letterSpacing: "-0.03em", marginBottom: 8 }}>Activity</div>
      <div style={{ fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 13, color: FG2, marginBottom: 32 }}>Full transaction history</div>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 32, textAlign: "center", color: FG2, fontFamily: "'Satoshi',system-ui,sans-serif", fontSize: 14 }}>Coming soon</div>
    </div>
  );
}

// ── Root app ──
const PAGES: Record<PageId, React.FC> = {
  dashboard: DashboardPage,
  portfolio: PortfolioPage,
  activity:  ActivityPage,
  transfer:  TransferPage,
  settings:  SettingsPage,
};

export default function DashboardApp() {
  const [page, setPage] = useState<PageId>("dashboard");
  useEffect(() => {
    const saved = localStorage.getItem("swaper-dash-page") as PageId | null;
    if (saved && saved in PAGES) setPage(saved);
  }, []);
  useEffect(() => { localStorage.setItem("swaper-dash-page", page); }, [page]);

  const Page = PAGES[page] || DashboardPage;

  return (
    <>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
      <div style={{ width: "100%", height: "100vh", background: DARK_BG, display: "flex", position: "relative", overflow: "hidden", fontFamily: "'Satoshi',system-ui,sans-serif" }}>
        {/* Aurora bg */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse at 5% 90%, ${TEAL}55 0%, transparent 45%), radial-gradient(ellipse at 95% 5%, ${PLUM}44 0%, transparent 40%)` }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%", height: "100%" }}>
          <Sidebar page={page} setPage={setPage} />
          <main style={{ flex: 1, overflow: "hidden" }}>
            <Page />
          </main>
        </div>
      </div>
    </>
  );
}
