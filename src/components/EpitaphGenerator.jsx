// src/components/EpitaphGenerator.jsx
import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Download, Printer, Sparkles, Calendar, Heart, Target, Users, Lightbulb, ChevronDown, ChevronUp, Edit3, Save, Trash2 } from "lucide-react";

/**
 * EpitaphGenerator - Redesigned as Legacy Statement Builder
 * - Deeper reflection: What you stood for, created, who you touched, what you learned
 * - Visual timeline of yearly snapshots
 * - Guided prompts for meaningful writing
 * - Beautiful typography and memorial aesthetic
 * - Integration with Values Compass
 * - Export and print capabilities
 */

const YEAR_MS = 365.25 * 24 * 3600 * 1000;

function parseDOBFlexible(raw) {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return new Date(raw + "T00:00:00");
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  if (m) { const [, dd, mm, yyyy] = m; return new Date(`${yyyy}-${mm}-${dd}T00:00:00`); }
  const d = new Date(raw); return isFinite(d) ? d : null;
}

function getAgeYears() {
  let dob = ""; try { dob = localStorage.getItem("mortals.dob") || ""; } catch {}
  const d = parseDOBFlexible(dob);
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / YEAR_MS);
}

function readName() {
  try { return localStorage.getItem("mortals.profile.name") || ""; } catch { return ""; }
}

function saveName(n) {
  try { localStorage.setItem("mortals.profile.name", n); } catch {}
}

function readValuesFromCompass() {
  try {
    const raw = localStorage.getItem("mortals.values.names");
    if (raw) return JSON.parse(raw).filter(Boolean);
  } catch {}
  return ["Truth", "Generosity", "Courage"];
}

function readHistory() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && /^mortals\.epitaph\.\d{4}$/.test(k)) {
        const yearStr = k.slice(-4);
        const data = localStorage.getItem(k);
        try {
          const parsed = JSON.parse(data);
          out.push({ year: yearStr, ...parsed });
        } catch {
          out.push({ year: yearStr, text: data || "" });
        }
      }
    }
  } catch {}
  return out.sort((a, b) => Number(b.year) - Number(a.year));
}

function exportTxt(currentYear, data) {
  const lines = [];
  lines.push(`═══════════════════════════════════════`);
  lines.push(`       LEGACY STATEMENT — ${currentYear}`);
  lines.push(`═══════════════════════════════════════`);
  lines.push("");
  if (data.name) lines.push(`Name: ${data.name}`);
  if (data.age) lines.push(`Age: ${data.age}`);
  lines.push("");
  lines.push("─────────────────────────────────────");
  lines.push("  YOUR EPITAPH");
  lines.push("─────────────────────────────────────");
  lines.push(data.text || "(not written yet)");
  lines.push("");
  if (data.stoodFor) {
    lines.push("─────────────────────────────────────");
    lines.push("  WHAT YOU STOOD FOR");
    lines.push("─────────────────────────────────────");
    lines.push(data.stoodFor);
    lines.push("");
  }
  if (data.created) {
    lines.push("─────────────────────────────────────");
    lines.push("  WHAT YOU CREATED");
    lines.push("─────────────────────────────────────");
    lines.push(data.created);
    lines.push("");
  }
  if (data.touched) {
    lines.push("─────────────────────────────────────");
    lines.push("  WHO YOU TOUCHED");
    lines.push("─────────────────────────────────────");
    lines.push(data.touched);
    lines.push("");
  }
  if (data.learned) {
    lines.push("─────────────────────────────────────");
    lines.push("  WHAT YOU LEARNED");
    lines.push("─────────────────────────────────────");
    lines.push(data.learned);
    lines.push("");
  }
  lines.push("═══════════════════════════════════════");
  lines.push(`Generated: ${new Date().toLocaleDateString()}`);
  
  const blob = new Blob([lines.join("\n")], { type: "text/plain; charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `legacy-statement-${currentYear}.txt`;
  document.body.appendChild(a);
  a.click(); 
  a.remove(); 
  URL.revokeObjectURL(url);
}

export default function EpitaphGenerator() {
  const year = new Date().getFullYear();
  const [name, setName] = useState(readName());
  const [showPrompts, setShowPrompts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const age = getAgeYears();
  const values = readValuesFromCompass();

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(`mortals.epitaph.${year}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { text: "", stoodFor: "", created: "", touched: "", learned: "", ...parsed };
      }
    } catch {}
    return { text: "", stoodFor: "", created: "", touched: "", learned: "" };
  });

  const history = useMemo(() => readHistory(), [data]);

  useEffect(() => { saveName(name); }, [name]);

  function saveSnapshot() {
    try {
      const snapshot = { ...data, name, age, values, savedAt: new Date().toISOString() };
      localStorage.setItem(`mortals.epitaph.${year}`, JSON.stringify(snapshot));
      window.mortalsToast?.(`Legacy statement saved for ${year}`, { type: 'success' });
    } catch (e) {
      window.mortalsToast?.("Failed to save: " + e.message, { type: 'error' });
    }
  }

  function generateDraft() {
    const vText = values.length ? values.join(", ") : "learning, service, and courage";
    const who = name ? `${name}, aged ${age ?? "—"}` : `A mortal traveler, aged ${age ?? "—"}`;
    const draft = `${who}.\nKnown for living toward ${vText}.\nSpent days building what outlasts them.\nLeft things better than found.`;
    
    setData(prev => ({
      ...prev,
      text: prev.text || draft,
      stoodFor: prev.stoodFor || `Living by these values: ${vText}`,
      created: prev.created || "",
      touched: prev.touched || "",
      learned: prev.learned || ""
    }));
  }

  function loadYear(y) {
    try {
      const saved = localStorage.getItem(`mortals.epitaph.${y}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData({ text: "", stoodFor: "", created: "", touched: "", learned: "", ...parsed });
        if (parsed.name) setName(parsed.name);
      }
    } catch {}
  }

  function deleteYear(y) {
    if (!window.confirm(`Delete legacy statement for ${y}?`)) return;
    try {
      localStorage.removeItem(`mortals.epitaph.${y}`);
      if (String(y) === String(year)) {
        setData({ text: "", stoodFor: "", created: "", touched: "", learned: "" });
      }
    } catch {}
  }

  const hasContent = data.text || data.stoodFor || data.created || data.touched || data.learned;

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <div>
              <div className="font-bold text-lg">Legacy Statement</div>
              <div className="text-xs text-slate-300">If life ended today, what would you be remembered for?</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold text-lg">{year}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border-2 border-indigo-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-indigo-900 mb-1 block">Your Name</label>
              <input
                className="w-full rounded-xl border-2 border-indigo-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-indigo-900 mb-1 block">Age</label>
              <input
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                disabled
                value={age ?? "Not set"}
                title="Set your date of birth in settings"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-indigo-900 mb-1 block">Core Values</label>
              <input
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm truncate"
                disabled
                value={values.join(", ")}
                title={values.join(", ")}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={generateDraft}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            Generate Draft
          </button>
          <button
            onClick={saveSnapshot}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            Save {year}
          </button>
          <button
            onClick={() => exportTxt(year, { ...data, name, age })}
            disabled={!hasContent}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => window.print()}
            disabled={!hasContent}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            disabled={!hasContent}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-medium text-sm hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BookOpen className="w-4 h-4" />
            {previewMode ? "Edit Mode" : "Preview"}
          </button>
        </div>

        <button
          onClick={() => setShowPrompts(!showPrompts)}
          className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100 rounded-xl border-2 border-amber-200 transition-colors text-sm font-semibold text-amber-900"
        >
          <span className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Reflection Prompts & Guidance
          </span>
          {showPrompts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showPrompts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-amber-900">
                <Target className="w-4 h-4" />
                What You Stood For
              </div>
              <p className="text-xs text-gray-700">Your principles, values, causes you championed</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-amber-900">
                <Sparkles className="w-4 h-4" />
                What You Created
              </div>
              <p className="text-xs text-gray-700">Work, art, ideas, projects that will outlast you</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-amber-900">
                <Users className="w-4 h-4" />
                Who You Touched
              </div>
              <p className="text-xs text-gray-700">People you influenced, helped, loved, inspired</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-amber-900">
                <Heart className="w-4 h-4" />
                What You Learned
              </div>
              <p className="text-xs text-gray-700">Wisdom gained, mistakes made, growth achieved</p>
            </div>
          </div>
        )}

        {!previewMode ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <BookOpen className="w-4 h-4" />
                Your Epitaph (Main Statement)
              </label>
              <textarea
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 font-serif leading-relaxed"
                rows={4}
                placeholder="If life ended today, what would your epitaph read? Write in your own voice..."
                value={data.text}
                onChange={(e) => setData({ ...data, text: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  What You Stood For
                </label>
                <textarea
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  rows={3}
                  placeholder="Your principles, values, causes..."
                  value={data.stoodFor}
                  onChange={(e) => setData({ ...data, stoodFor: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  What You Created
                </label>
                <textarea
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  rows={3}
                  placeholder="Work, art, ideas, projects..."
                  value={data.created}
                  onChange={(e) => setData({ ...data, created: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Who You Touched
                </label>
                <textarea
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  rows={3}
                  placeholder="People you influenced, helped, loved..."
                  value={data.touched}
                  onChange={(e) => setData({ ...data, touched: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  What You Learned
                </label>
                <textarea
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                  rows={3}
                  placeholder="Wisdom gained, growth achieved..."
                  value={data.learned}
                  onChange={(e) => setData({ ...data, learned: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border-2 border-slate-300">
            <div className="text-center space-y-3 pb-6 border-b-2 border-slate-300">
              <div className="text-2xl font-bold text-slate-900">{name || "A Mortal Traveler"}</div>
              {age && <div className="text-sm text-slate-600">Aged {age} • {year}</div>}
              {values.length > 0 && (
                <div className="text-xs text-slate-500 italic">Guided by: {values.join(" • ")}</div>
              )}
            </div>

            {data.text && (
              <div className="space-y-2">
                <div className="text-center font-serif text-lg leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {data.text}
                </div>
              </div>
            )}

            {data.stoodFor && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                  <Target className="w-4 h-4" />
                  What They Stood For
                </div>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pl-6">
                  {data.stoodFor}
                </div>
              </div>
            )}

            {data.created && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-purple-900">
                  <Sparkles className="w-4 h-4" />
                  What They Created
                </div>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pl-6">
                  {data.created}
                </div>
              </div>
            )}

            {data.touched && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                  <Users className="w-4 h-4" />
                  Who They Touched
                </div>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pl-6">
                  {data.touched}
                </div>
              </div>
            )}

            {data.learned && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-rose-900">
                  <Heart className="w-4 h-4" />
                  What They Learned
                </div>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pl-6">
                  {data.learned}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-slate-200 transition-colors text-sm font-semibold text-slate-700"
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Past Snapshots ({history.length})
          </span>
          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHistory && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No past legacy statements yet. Your first snapshot will be saved for {year}.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.year}
                    className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-lg font-bold text-slate-900">{item.year}</div>
                          {item.name && <div className="text-sm text-gray-600">• {item.name}</div>}
                          {item.age && <div className="text-sm text-gray-600">• Age {item.age}</div>}
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                          {item.text || "(No epitaph written)"}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => loadYear(item.year)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          title="Load this year"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteYear(item.year)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="Delete this year"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="font-semibold text-gray-700 mb-1">About Legacy Statements</div>
          <p>
            This exercise helps you reflect on what matters most. Write as if today were your last day.
            Each year's snapshot captures your evolving understanding of your life's meaning.
            All data is private and stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
