// src/components/PhilosophyCard.jsx
import React, { useMemo, useState } from "react";
import { quoteOfToday, weeklyPromptFor } from "../data/quotes";
import StillnessModal from "./StillnessModal";
import { Sparkles, Quote, NotebookText, Flower2, CalendarDays, Heart, CheckCircle2 } from "lucide-react";

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function PhilosophyCard() {
  const q = useMemo(() => quoteOfToday(new Date()), []);
  const weekly = useMemo(() => weeklyPromptFor(new Date()), []);
  const [openReflect, setOpenReflect] = useState(false);
  const [openStill, setOpenStill] = useState(false);
  const [entry, setEntry] = useState(readEntry(todayKey()));
  const [note, setNote] = useState(entry?.note || "");
  const [resonance, setResonance] = useState(typeof entry?.resonance === "number" ? entry.resonance : 60);
  const [commitType, setCommitType] = useState(entry?.commit?.type || "");
  const [commitTarget, setCommitTarget] = useState(entry?.commit?.target || "");

  function saveNote() {
    const payload = {
      note: note?.trim() || "",
      resonance: clamp01(resonance / 100),
      commit: commitType ? { type: commitType, target: commitTarget?.trim() || "" } : null,
      savedAt: new Date().toISOString(),
      quote: q
    };
    try {
      localStorage.setItem(`mortals.reflect.${todayKey()}`, JSON.stringify(payload));
      setEntry(payload);
    } catch {}
    setOpenReflect(false);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-md p-6">
      {/* subtle glows */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl opacity-20 bg-purple-300" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-64 h-64 rounded-full blur-3xl opacity-10 bg-blue-300" />

      <div className="flex items-center justify-between relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/70 bg-white/70 backdrop-blur text-xs font-semibold uppercase tracking-wider text-slate-700">
          <Quote className="w-3.5 h-3.5" /> Daily Reflection
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Soul layer
        </div>
      </div>

      {/* Quote */}
      <div className="mt-4 relative">
        <div className="text-6xl font-serif leading-none text-slate-300/70 select-none">“</div>
        <p className="-mt-4 text-xl md:text-2xl leading-snug text-slate-900">{q.text}</p>
        <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
          <span>— {q.author}</span>
          {q.tag ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">{q.tag}</span> : null}
        </div>
      </div>

      {/* Today intention (if saved) */}
      {entry && (entry.note || entry.commit) ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {entry.commit ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Today: {prettyCommit(entry.commit)}
            </span>
          ) : null}
          {entry.note ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200" title={entry.note}>
              <Heart className="w-3.5 h-3.5 text-rose-600" /> “{truncate(entry.note, 48)}”
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2 relative">
        <button
          onClick={() => setOpenReflect(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm shadow hover:brightness-110"
          title="Make it land today"
        >
          <NotebookText className="w-4 h-4" /> Reflect
        </button>
        <button
          onClick={() => setOpenStill(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-100 text-gray-900 text-sm hover:bg-gray-200"
          title="One-minute stillness"
        >
          <Flower2 className="w-4 h-4" /> Be Still (1:00)
        </button>
        <StillnessStatsChips />
      </div>

      {/* Weekly prompt */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <div className="flex items-center gap-2 text-slate-800 font-medium">
          <CalendarDays className="w-4 h-4" /> Weekly Philosophical Prompt
        </div>
        <div className="mt-1 text-slate-700">{weekly}</div>
      </div>

      {/* Reflect modal */}
      {openReflect && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white w-full max-w-xl border shadow-xl p-5">
            <div className="font-semibold mb-3 flex items-center gap-2">
              <NotebookText className="w-4 h-4" /> Make it land today
            </div>

            {/* Resonance */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>How much does this land today?</span>
                <span className="tabular-nums font-semibold">{resonance}%</span>
              </div>
              <input type="range" min={0} max={100} step={1} value={resonance} onChange={(e)=> setResonance(Number(e.target.value))} className="w-full" />
            </div>

            {/* Note */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">One line</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="One sentence is enough…"
              />
            </div>

            {/* Commit */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Make a tiny commitment</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { k: "act", label: "Act (2‑min)", hint: "What will you do?" },
                  { k: "appreciate", label: "Appreciate", hint: "Who will you message?" },
                  { k: "remember", label: "Remember", hint: "What will you capture?" },
                  { k: "align", label: "Align to a Value", hint: "Which value today?" },
                ].map((c) => (
                  <button
                    key={c.k}
                    type="button"
                    onClick={() => { setCommitType(c.k); if (!commitTarget) setCommitTarget(""); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      commitType === c.k ? "bg-indigo-600 text-white border-indigo-700" : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }`}
                    title={c.hint}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {commitType ? (
                <input
                  type="text"
                  value={commitTarget}
                  onChange={(e)=> setCommitTarget(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder={
                    commitType === "act" ? "What 2‑minute action?" :
                    commitType === "appreciate" ? "Who will you message?" :
                    commitType === "remember" ? "What will you capture?" :
                    "Which value today?"
                  }
                />
              ) : null}
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="px-3 py-2 rounded-2xl text-sm bg-gray-100 hover:bg-gray-200"
                onClick={() => setOpenReflect(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded-2xl text-sm bg-black text-white hover:bg-gray-800"
                onClick={saveNote}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stillness modal */}
      <StillnessModal open={openStill} onClose={() => setOpenStill(false)} seconds={60} />
    </div>
  );
}

// --- helpers ---
function readEntry(key) {
  try {
    const raw = localStorage.getItem(`mortals.reflect.${key}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      // migrate from plain note string
      return { note: raw };
    }
  } catch {
    return null;
  }
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function prettyCommit(c) {
  if (!c) return "";
  const t = c.type;
  const target = c.target ? ` — ${c.target}` : "";
  if (t === "act") return `Act${target}`;
  if (t === "appreciate") return `Appreciate${target}`;
  if (t === "remember") return `Remember${target}`;
  if (t === "align") return `Align${target}`;
  return `${t}${target}`;
}

function clamp01(x){ return Math.max(0, Math.min(1, x)); }

function StillnessStatsChips() {
  const [stats, setStats] = React.useState(getStillnessStats());
  React.useEffect(() => {
    const id = setInterval(() => setStats(getStillnessStats()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!stats) return null;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
        Streak: <b className="tabular-nums">{stats.streak}</b>d
      </span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
        Minutes: <b className="tabular-nums">{Math.round(stats.totalSeconds/60)}</b>
      </span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200" title="Best one-minute presence (calm)">
        Best Presence: <b className="tabular-nums">{stats.bestCalm}%</b>
      </span>
    </div>
  );
}

function getStillnessStats() {
  try {
    const raw = localStorage.getItem("mortals.stillness.log");
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr) || arr.length === 0) return { streak: 0, totalSeconds: 0, bestCalm: 0 };
    const totalSeconds = arr.reduce((a, b) => a + (Number(b.seconds) || 0), 0);
    const bestCalm = arr.reduce((m, r) => typeof r.calmPct === 'number' ? Math.max(m, Math.round(r.calmPct)) : m, 0);
    // compute streak ending today
    const byDate = new Set(arr.map((r) => r.date));
    let streak = 0;
    let d = new Date();
    for (;;) {
      const key = d.toISOString().slice(0,10);
      if (byDate.has(key)) {
        streak += 1;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return { streak, totalSeconds, bestCalm };
  } catch {
    return { streak: 0, totalSeconds: 0, bestCalm: 0 };
  }
}
