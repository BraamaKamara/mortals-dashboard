// src/components/DepartureJournal.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { 
  BookOpen, Lock, Unlock, Download, Printer, FileText, 
  Heart, Sparkles, Clock, Users, Scroll, Gift, X
} from "lucide-react";

/**
 * DepartureJournal
 * - Unlocks when life progress >= threshold (default 0.95)
 * - Sequenced prompts saved to localStorage
 * - Export/Print options
 *
 * localStorage keys:
 *   mortals.departure.threshold          -> number (0..1), default 0.95
 *   mortals.departure.unlockedAt         -> ISO datetime when first unlocked
 *   mortals.departure.answers            -> object { qid: {text, updatedAt} }
 *   mortals.dob, mortals.lifespan        -> used to compute life progress
 */

const YEAR_MS = 365.25 * 24 * 3600 * 1000;

// Small self-contained UI primitives (to avoid external deps)
function Card({ className = "", children }) {
  return <div className={`rounded-2xl border-2 border-gray-200 bg-white shadow-xl ${className}`}>{children}</div>;
}
function CardContent({ className = "", children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
function Button({ variant = "default", className = "", ...props }) {
  const base =
    "inline-flex items-center gap-2 justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg";
  const styles =
    variant === "secondary"
      ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300"
      : variant === "danger"
      ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
      : variant === "gold"
      ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800"
      : "bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-900 hover:to-black";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
function Label({ className = "", ...props }) {
  return <label className={`text-sm font-semibold ${className}`} {...props} />;
}
function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${className}`}
      {...props}
    />
  );
}
function TextArea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${className}`}
      {...props}
    />
  );
}
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/* ----------------------- helpers ----------------------- */
function parseDOBFlexible(raw) {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(raw + "T00:00:00");
    return isFinite(d) ? d : null;
  }
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    return isFinite(d) ? d : null;
  }
  const d = new Date(raw);
  return isFinite(d) ? d : null;
}

function lifeProgress() {
  let dob = "", ls = 80;
  try { dob = localStorage.getItem("mortals.dob") || ""; } catch {}
  try { ls = Number(localStorage.getItem("mortals.lifespan") || 80); } catch {}
  const dobDate = parseDOBFlexible(dob);
  if (!dobDate || !isFinite(ls) || ls <= 0) return { pct: 0, ok: false };
  const end = new Date(dobDate);
  end.setFullYear(end.getFullYear() + ls);
  const now = new Date();
  const total = end - dobDate;
  const elapsed = now - dobDate;
  if (total <= 0) return { pct: 0, ok: false };
  return { pct: clamp01(elapsed / total), ok: true, end };
}

// --- helpers to compute life progress safely ---
const _addYears = (d, y) => {
  const x = new Date(d);
  const target = x.getFullYear() + Number(y || 0);
  // handle Feb 29 gracefully
  if (x.getMonth() === 1 && x.getDate() === 29) {
    const tmp = new Date(x);
    tmp.setFullYear(target, 1, 28);
    return tmp;
  }
  const out = new Date(x);
  out.setFullYear(target);
  return out;
};

const lifeProgress01 = () => {
  try {
    const dob = localStorage.getItem("mortals.dob") || "";
    const span = JSON.parse(localStorage.getItem("mortals.lifespan") || "0");
    if (!dob || !span) return 0;
    const dobDate = new Date(dob + "T00:00:00");
    const end = _addYears(dobDate, span);
    const total = end - dobDate;
    const elapsed = new Date() - dobDate;
    if (!isFinite(total) || total <= 0) return 0;
    const p = elapsed / total;
    return Math.max(0, Math.min(1, p));
  } catch {
    return 0;
  }
};

function readThreshold() {
  try {
    const raw = localStorage.getItem("mortals.departure.threshold");
    const n = raw ? Number(raw) : 0.95;
    return isFinite(n) ? n : 0.95;
  } catch {
    return 0.95;
  }
}

function readAnswers() {
  try { return JSON.parse(localStorage.getItem("mortals.departure.answers") || "{}"); } catch { return {}; }
}
function writeAnswers(obj) {
  try { localStorage.setItem("mortals.departure.answers", JSON.stringify(obj)); } catch {}
}

/* --------------------- prompts (sequence) --------------------- */
const PROMPTS = [
  { 
    id: "forgive-self",  
    title: "Forgiveness — of myself",          
    guide: "What regret do I release? What am I willing to forgive in myself?",
    icon: Heart,
    color: "from-rose-100 to-pink-100"
  },
  { 
    id: "forgive-others",
    title: "Forgiveness — of others",          
    guide: "Who needs my forgiveness? What would mercy sound like in my own words?",
    icon: Users,
    color: "from-blue-100 to-indigo-100"
  },
  { 
    id: "unfinished",    
    title: "Unfinished dreams",                 
    guide: "What did I long to build, learn, or repair? What small version can still be done?",
    icon: Sparkles,
    color: "from-purple-100 to-violet-100"
  },
  { 
    id: "gratitude",     
    title: "Gratitude inventory",               
    guide: "Name the people, places, and moments that made life luminous.",
    icon: Heart,
    color: "from-amber-100 to-yellow-100"
  },
  { 
    id: "transfer",      
    title: "Transmission of wisdom",            
    guide: "What 3 truths or principles do I want to pass on — to family, students, strangers?",
    icon: Scroll,
    color: "from-teal-100 to-cyan-100"
  },
  { 
    id: "requests",      
    title: "Requests & blessings",              
    guide: "What do I ask of those who remain? What blessing do I give them?",
    icon: Gift,
    color: "from-green-100 to-emerald-100"
  },
];

/* ------------------------ component ------------------------ */
export default function DepartureJournal({ className = "" }) {
  const [threshold, setThreshold] = useState(readThreshold());
  const [answers, setAnswers] = useState(readAnswers());
  const [open, setOpen] = useState(false);

  const prog = useMemo(() => lifeProgress(), []);
  const pct = prog.ok ? prog.pct : 0;
  const lp = useMemo(() => lifeProgress01(), []);

  const unlocked = pct >= threshold;

  useEffect(() => {
    try { localStorage.setItem("mortals.departure.threshold", String(threshold)); } catch {}
  }, [threshold]);

  useEffect(() => {
    writeAnswers(answers);
  }, [answers]);

  useEffect(() => {
    if (unlocked) {
      try {
        if (!localStorage.getItem("mortals.departure.unlockedAt")) {
          localStorage.setItem("mortals.departure.unlockedAt", new Date().toISOString());
        }
      } catch {}
    }
  }, [unlocked]);

  function handleChange(id, text) {
    setAnswers((prev) => ({ ...prev, [id]: { text, updatedAt: new Date().toISOString() } }));
  }

  function exportTxt() {
    const lines = [];
    lines.push(`# Departure Journal (unlocked at ${(threshold * 100).toFixed(0)}%)`);
    try {
      const u = localStorage.getItem("mortals.departure.unlockedAt");
      if (u) lines.push(`Unlocked: ${new Date(u).toLocaleString()}`);
    } catch {}
    lines.push("");
    for (const p of PROMPTS) {
      lines.push(`## ${p.title}`);
      const t = answers[p.id]?.text || "";
      lines.push(t.trim() ? t.trim() : "(no entry yet)");
      lines.push("");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.download = `departure-journal-${ts}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    const payload = {
      __schema: "mortals-departure",
      version: 1,
      threshold,
      unlockedAt: (() => {
        try { return localStorage.getItem("mortals.departure.unlockedAt") || null; } catch { return null; }
      })(),
      answers,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.download = `departure-journal-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className={`shadow-xl ${className}`}>
      <CardContent className="space-y-6">
        {/* Enhanced Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${unlocked ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-gray-400 to-gray-600'} shadow-lg`}>
                {unlocked ? (
                  <Unlock className="w-6 h-6 text-white" />
                ) : (
                  <Lock className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-2xl text-gray-800">Departure Journal</h2>
                <p className="text-sm text-gray-600">
                  A sacred space for final reflections
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Unlocks at</div>
              <div className="text-lg font-bold text-amber-700">
                {(threshold * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed italic border-l-4 border-amber-400 pl-4 py-2 bg-amber-50 rounded-r-lg">
            "When the time comes to depart, what words remain unspoken? What forgiveness ungranted? 
            This journal opens not from fear, but from a desire to meet the end with grace, clarity, and peace."
          </p>
        </div>

        {/* Enhanced Progress */}
        <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4" />
              Life progress
            </div>
            <div className="font-bold tabular-nums text-xl text-gray-800">
              {(lp * 100).toFixed(1)}%
            </div>
          </div>
          <div className="relative h-4 w-full rounded-full bg-gray-200 overflow-hidden shadow-inner">
            <div
              className={`h-4 transition-all duration-500 ${
                unlocked 
                  ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-lg" 
                  : "bg-gradient-to-r from-gray-600 to-gray-800"
              }`}
              style={{ width: `${clamp01(pct) * 100}%` }}
            />
            {unlocked && (
              <div 
                className="absolute top-0 h-4 w-8 bg-white opacity-40 animate-pulse"
                style={{ left: `${clamp01(pct) * 100 - 8}%` }}
              />
            )}
          </div>
        </div>

        {/* Status Message */}
        {!unlocked ? (
          <div className="rounded-xl border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-gray-100 p-5 shadow-md">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-slate-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-800 mb-2">This sequence remains sealed</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  When the time is right, it will open — not as fear, but as <span className="font-semibold text-slate-700">closure</span>. 
                  A gentle invitation to reflect on forgiveness, gratitude, unfinished dreams, and the wisdom you wish to leave behind.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <Unlock className="w-6 h-6 text-amber-700 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 
                  Unlocked — Enter with gentleness
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  This sacred space is now open. Write with honesty and compassion. Your words are saved privately in this browser. 
                  You can export, print, or seal them in your Memory Capsule when ready.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setOpen(true)} disabled={!unlocked}>
            <BookOpen className="w-4 h-4" />
            {unlocked ? 'Begin / Continue Writing' : 'Locked'}
          </Button>
          <Button variant="secondary" onClick={exportTxt} disabled={!unlocked}>
            <FileText className="w-4 h-4" />
            Export Text
          </Button>
          <Button variant="secondary" onClick={exportJson} disabled={!unlocked}>
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
          <Button variant="secondary" onClick={() => window.print()} disabled={!unlocked}>
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>

        {/* Test Mode */}
        <div className="pt-4 border-t-2 border-gray-200">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer font-medium hover:text-gray-700">⚙️ Test mode: Adjust unlock threshold</summary>
            <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Input
                type="number"
                min={1}
                max={99}
                value={Math.round(threshold * 100)}
                onChange={(e) => {
                  const n = Math.max(1, Math.min(99, Number(e.target.value || 95)));
                  setThreshold(n / 100);
                }}
                className="w-24"
              />
              <span className="font-medium">Current threshold: {(threshold * 100).toFixed(0)}%</span>
            </div>
          </details>
        </div>
      </CardContent>

      {/* Modal */}
      {open && (
        <JournalModal
          onClose={() => setOpen(false)}
          answers={answers}
          onChange={handleChange}
        />
      )}
    </Card>
  );
}

/* ------------------------ modal ------------------------ */
function JournalModal({ onClose, answers, onChange }) {
  const topRef = useRef(null);
  const modalRef = useRef(null);
  
  useEffect(() => { 
    // Scroll to top when modal opens
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, []);

  const handleSave = () => {
    // Trigger a visual confirmation
    const saved = document.createElement('div');
    saved.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg z-[60] font-medium';
    saved.style.animation = 'slideInRight 0.3s ease-out';
    saved.textContent = '✓ All entries saved successfully';
    document.body.appendChild(saved);
    setTimeout(() => {
      saved.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => saved.remove(), 300);
    }, 2000);
  };

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="min-h-screen p-4 flex items-start justify-center py-8">
        <Card className="max-w-4xl w-full shadow-2xl">
          <CardContent className="space-y-6">
          {/* Enhanced Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Departure Journal</h2>
                <p className="text-sm text-gray-600">A gentle sequence for closure and wisdom</p>
              </div>
            </div>
            <Button variant="secondary" onClick={onClose}>
              <X className="w-4 h-4" />
              Close
            </Button>
          </div>

          <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
            <p className="text-sm text-gray-800 leading-relaxed">
              <span className="font-bold text-amber-900">✨ Sacred space:</span> These prompts guide you through 
              <span className="font-semibold"> forgiveness</span>, 
              <span className="font-semibold"> unfinished work</span>, 
              <span className="font-semibold"> gratitude</span>, and 
              <span className="font-semibold"> the passing of wisdom</span>. 
              Your entries are saved privately in this browser. Write with honesty and compassion.
            </p>
          </div>

          {/* Inspirational Message */}
          <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-3">Before you begin...</h3>
                <p className="text-sm text-gray-700 leading-relaxed italic mb-3">
                  "To write your departure is not to summon it, but to soften its arrival. These words are lanterns 
                  you leave behind — for yourself, for those you love, and for the quiet peace that comes from saying 
                  what must be said before silence."
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Take your time. There is no rush. Each prompt is an invitation, not an obligation. 
                  Write what feels true. Skip what doesn't serve you. Return when ready.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Prompts */}
          <div className="grid gap-5">
            {PROMPTS.map((p, idx) => {
              const Icon = p.icon;
              const hasContent = answers[p.id]?.text;
              
              return (
                <div 
                  key={p.id} 
                  className={`rounded-xl border-2 p-5 shadow-md hover:shadow-lg transition-all bg-gradient-to-br ${p.color}`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border-2 border-gray-300">
                        <span className="font-bold text-gray-800">{idx + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label className="flex items-center gap-2 text-base text-gray-800 mb-2">
                        <Icon className="w-5 h-5" />
                        {p.title}
                      </Label>
                      <p className="text-xs text-gray-700 italic leading-relaxed">
                        {p.guide}
                      </p>
                    </div>
                  </div>
                  
                  <TextArea
                    ref={idx === 0 ? topRef : undefined}
                    rows={5}
                    placeholder="Take your time... write what feels true..."
                    value={answers[p.id]?.text || ""}
                    onChange={(e) => onChange(p.id, e.target.value)}
                    className="mt-3 bg-white/90 backdrop-blur"
                  />
                  
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-gray-600">
                      {hasContent ? (
                        <span className="flex items-center gap-1 text-green-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          Saved
                        </span>
                      ) : (
                        <span className="text-gray-500">Not saved yet</span>
                      )}
                    </span>
                    {answers[p.id]?.updatedAt && (
                      <span className="text-gray-500">
                        Last updated: {new Date(answers[p.id].updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Message */}
          <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-gray-100 p-5">
            <p className="text-xs text-gray-700 leading-relaxed">
              <span className="font-bold text-gray-800">💡 Suggestion:</span> Consider sharing selected passages with a trusted person, 
              sealing them in your <span className="font-semibold">Memory Capsule</span> for a future date, 
              or keeping them as a private legacy to be discovered when the time comes.
            </p>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t-2 border-gray-200">
            <Button variant="gold" onClick={handleSave}>
              <Heart className="w-4 h-4" />
              Save All Entries
            </Button>
            <Button variant="secondary" onClick={onClose}>
              <X className="w-4 h-4" />
              Close Journal
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
