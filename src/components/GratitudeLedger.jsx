// src/components/GratitudeLedger.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Users, Sparkles, TrendingUp, Calendar, MessageCircle,
  Phone, Mail, User, ChevronDown, ChevronUp, Download, Trash2,
  Gift, Hand, Ear, MessageSquare, LifeBuoy
} from "lucide-react";

/**
 * GratitudeLedger - The Web of Reciprocity
 * 
 * VISION: Life is sustained by an invisible web of kindness and connection.
 * This ledger helps you see the threads—who you've thanked, helped, or encouraged.
 * It's not just a log; it's a mirror reflecting your place in the human tapestry.
 * 
 * Weekly practice of gratitude creates awareness of interdependence and counters
 * the illusion of isolated self-sufficiency. Track your streak as a measure of
 * consistent presence in the lives of others.
 * 
 * Data lives in localStorage:
 *   - mortals.gratitude.{YYYY-WW}  -> array of entries
 *   - mortals.gratitude.streak     -> integer (consecutive weeks w/ >=1 entry)
 *   - mortals.gratitude.lastWeek   -> "YYYY-WW" of last week with entries
 *
 * Entry shape:
 *   { id, date, person, action, channel, notes }
 */

/* ---------- action metadata ---------- */
const ACTIONS = [
  { key: "thanked", icon: Heart, color: "bg-rose-500", label: "Thanked", desc: "Expressed gratitude" },
  { key: "helped", icon: Hand, color: "bg-blue-500", label: "Helped", desc: "Offered assistance" },
  { key: "listened to", icon: Ear, color: "bg-purple-500", label: "Listened", desc: "Held space" },
  { key: "encouraged", icon: MessageSquare, color: "bg-green-500", label: "Encouraged", desc: "Lifted up" },
  { key: "supported", icon: LifeBuoy, color: "bg-amber-500", label: "Supported", desc: "Stood beside" },
];

const CHANNELS = [
  { key: "in person", icon: User },
  { key: "call", icon: Phone },
  { key: "text", icon: MessageCircle },
  { key: "email", icon: Mail },
  { key: "message", icon: MessageCircle },
];

function Card({ className = "", children }) {
  return <div className={`rounded-3xl border border-slate-200/50 bg-gradient-to-br from-slate-50 via-white to-rose-50/30 shadow-2xl overflow-hidden ${className}`}>{children}</div>;
}
function CardContent({ className = "", children }) {
  return <div className={`p-8 ${className}`}>{children}</div>;
}
function Button({ variant = "default", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "secondary"
      ? "bg-slate-100 text-slate-900 hover:bg-slate-200 border-2 border-slate-200"
      : variant === "danger"
      ? "bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100 hover:border-red-300"
      : variant === "gold"
      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-110 shadow-lg"
      : "bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:brightness-110 shadow-lg";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all ${className}`}
      {...props}
    />
  );
}
function TextArea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all resize-none ${className}`}
      {...props}
    />
  );
}

/* ---------- date helpers ---------- */
const todayKey = () => new Date().toISOString().slice(0, 10);
const startOfWeek = (d) => {
  const x = new Date(d); x.setHours(0,0,0,0);
  const day = x.getDay(); const diff = day === 0 ? -6 : 1 - day; // Monday as week start
  x.setDate(x.getDate() + diff); return x;
};
const weekKey = (d) => {
  const s = startOfWeek(d);
  const oneJan = new Date(s.getFullYear(), 0, 1);
  const dayNo = Math.floor((s - oneJan) / 86400000) + 1;
  const week = Math.ceil((dayNo + ((oneJan.getDay() + 6) % 7)) / 7); // ISO-ish
  return `${s.getFullYear()}-${String(week).padStart(2, "0")}`;
};
const rangeLabel = (d) => {
  const s = startOfWeek(d);
  const e = new Date(s); e.setDate(s.getDate() + 6);
  return `${s.toLocaleDateString()} — ${e.toLocaleDateString()}`;
};

/* ---------- storage ---------- */
function readWeek(key) {
  try { return JSON.parse(localStorage.getItem(`mortals.gratitude.${key}`) || "[]"); } catch { return []; }
}
function writeWeek(key, list) {
  try { localStorage.setItem(`mortals.gratitude.${key}`, JSON.stringify(list)); } catch {}
}
function readStreak() {
  try { return Number(localStorage.getItem("mortals.gratitude.streak") || "0"); } catch { return 0; }
}
function writeStreak(n) {
  try { localStorage.setItem("mortals.gratitude.streak", String(n)); } catch {}
}
function readLastWeek() {
  try { return localStorage.getItem("mortals.gratitude.lastWeek") || ""; } catch { return ""; }
}
function writeLastWeek(k) {
  try { localStorage.setItem("mortals.gratitude.lastWeek", k); } catch {}
}

/* ---------- id ---------- */
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function GratitudeLedger() {
  const [now] = useState(new Date());
  const wKey = weekKey(now);
  const [list, setList] = useState(readWeek(wKey));
  const [formExpanded, setFormExpanded] = useState(false);
  const [threadsExpanded, setThreadsExpanded] = useState(false);

  // form
  const [person, setPerson] = useState("");
  const [action, setAction] = useState("thanked"); // thanked/helped/listened/encouraged
  const [channel, setChannel] = useState("in person"); // in person/call/text/email/support
  const [date, setDate] = useState(todayKey());
  const [notes, setNotes] = useState("");

  // weekly stats
  const stats = useMemo(() => {
    const counts = list.length;
    const byAction = list.reduce((a, x) => { a[x.action] = (a[x.action] || 0) + 1; return a; }, {});
    const uniqPeople = new Set(list.map(x => x.person.trim().toLowerCase()).filter(Boolean)).size;
    return { counts, byAction, uniqPeople };
  }, [list]);

  // streak logic: if current week has >=1 entry and last tracked week is previous week, streak +1; if gap, reset.
  useEffect(() => {
    const last = readLastWeek();
    const curHas = list.length > 0;
    if (!curHas) return; // only consider when current week gets its first entry
    if (last === wKey) return;

    const curWeekStart = startOfWeek(now);
    const prevWeekKey = weekKey(new Date(curWeekStart.getFullYear(), curWeekStart.getMonth(), curWeekStart.getDate() - 7));
    const prevHad = readWeek(prevWeekKey).length > 0;

    if (!last) {
      writeStreak(1);
      writeLastWeek(wKey);
    } else if (last === prevWeekKey && prevHad) {
      writeStreak(readStreak() + 1);
      writeLastWeek(wKey);
    } else {
      writeStreak(1);
      writeLastWeek(wKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length]);

  // gentle Sunday 18:00 prompt if empty
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      const isSunday = d.getDay() === 0;
      if (isSunday && d.getHours() === 18 && list.length === 0) {
        // subtle nudge; no blocking confirm
        console.log("GratitudeLedger: Consider logging someone you thanked/helped this week.");
      }
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [list.length]);

  function addEntry() {
    if (!person.trim()) return;
    const entry = { id: uid(), date, person: person.trim(), action, channel, notes: notes.trim() };
    const next = [entry, ...list];
    setList(next); writeWeek(wKey, next);
    setPerson(""); setNotes("");
  }
  function removeEntry(id) {
    const next = list.filter(x => x.id !== id);
    setList(next); writeWeek(wKey, next);
  }
  function exportWeek() {
    const lines = [];
    lines.push(`# Gratitude Ledger — ${rangeLabel(now)} (${wKey})`);
    lines.push("");
    for (const x of list) {
      lines.push(`- ${x.date}: ${x.person} — ${x.action} via ${x.channel}${x.notes ? ` | ${x.notes}` : ""}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `gratitude-${wKey}.txt`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  const weekLabel = rangeLabel(now);

  return (
    <Card className="relative">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-200/10 rounded-full blur-3xl pointer-events-none" />
      
      <CardContent className="relative space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-red-600 shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="font-bold text-3xl bg-gradient-to-r from-slate-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
            The Web of Reciprocity
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Life is sustained by an invisible web of kindness. Track the threads—
            <span className="text-rose-600 font-medium"> who you've thanked</span>, 
            <span className="text-blue-600 font-medium"> helped</span>, or 
            <span className="text-green-600 font-medium"> encouraged</span>. 
            Each gesture weaves you deeper into the human tapestry.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border-2 border-slate-200 text-sm text-slate-700">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold">{weekLabel}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-4 gap-4">
          <Stat label="Connections" value={stats.counts} icon={Users} color="rose" />
          <Stat label="Unique People" value={stats.uniqPeople} icon={Heart} color="pink" />
          <Stat label="Week Streak" value={readStreak()} icon={TrendingUp} color="emerald" />
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 border-2 border-amber-200 shadow-md">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>This Week's Mix</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byAction).map(([k, v]) => {
                const action = ACTIONS.find(a => a.key === k);
                if (!v || !action) return null;
                const Icon = action.icon;
                return (
                  <span key={k} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-white border-2 border-amber-200 text-amber-900">
                    <Icon className="w-3 h-3" />
                    {v}
                  </span>
                );
              })}
              {Object.keys(stats.byAction).length === 0 && (
                <span className="text-xs text-slate-500 italic">No actions yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Form */}
        <div className="rounded-2xl border-2 border-rose-300/50 bg-white/90 backdrop-blur shadow-lg overflow-hidden">
          <button
            onClick={() => setFormExpanded(v => !v)}
            className="w-full flex items-center justify-between p-5 hover:bg-rose-50/50 transition-colors"
            type="button"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100">
                {formExpanded ? (
                  <ChevronUp className="w-5 h-5 text-rose-700" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-rose-700" />
                )}
              </div>
              <div className="text-left">
                <span className="font-bold text-lg text-slate-800 block">
                  Record a Connection
                </span>
                {!formExpanded && (
                  <span className="text-xs text-slate-600">
                    Click to add an entry
                  </span>
                )}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {formExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-5 pb-5 space-y-4 bg-gradient-to-br from-white/80 to-rose-50/30">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Who?</label>
                      <Input placeholder="Name of person" value={person} onChange={(e)=> setPerson(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">When?</label>
                      <Input type="date" value={date} onChange={(e)=> setDate(e.target.value)} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-2 block">What did you do?</label>
                    <div className="grid sm:grid-cols-5 gap-2">
                      {ACTIONS.map(a => {
                        const Icon = a.icon;
                        const active = action === a.key;
                        return (
                          <button
                            key={a.key}
                            onClick={() => setAction(a.key)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                              active
                                ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-400 shadow-md scale-105'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            type="button"
                          >
                            <div className={`p-2 rounded-lg ${active ? a.color : 'bg-slate-100'}`}>
                              <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-600'}`} />
                            </div>
                            <span className="text-xs font-medium text-slate-800">{a.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-2 block">How did you connect?</label>
                    <div className="flex flex-wrap gap-2">
                      {CHANNELS.map(c => {
                        const Icon = c.icon;
                        const active = channel === c.key;
                        return (
                          <button
                            key={c.key}
                            onClick={() => setChannel(c.key)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                              active
                                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-transparent shadow-md'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                            type="button"
                          >
                            <Icon className="w-4 h-4" />
                            {c.key}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Reflection (optional)</label>
                    <TextArea
                      rows={3}
                      placeholder="What did this mean to you? How did it feel?"
                      value={notes}
                      onChange={(e)=> setNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setFormExpanded(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addEntry} disabled={!person.trim()}>
                      <Gift className="w-4 h-4" />
                      Add Connection
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Entries List */}
        {list.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center bg-gradient-to-br from-slate-50 via-white to-rose-50/20"
          >
            <div className="max-w-md mx-auto space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 inline-block">
                <Heart className="w-10 h-10 text-rose-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No connections yet this week</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Start weaving your web. Aim for at least three genuine moments—
                a thank you, a helping hand, an encouraging word.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border-2 border-rose-300/50 bg-white/90 backdrop-blur shadow-lg overflow-hidden">
            {/* Collapsible Header */}
            <button
              onClick={() => setThreadsExpanded(v => !v)}
              className="w-full flex items-center justify-between p-5 hover:bg-rose-50/50 transition-colors"
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100">
                  {threadsExpanded ? (
                    <ChevronUp className="w-5 h-5 text-rose-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-rose-700" />
                  )}
                </div>
                <div className="text-left">
                  <span className="font-bold text-lg text-slate-800 block">
                    This Week's Threads
                  </span>
                  <span className="text-xs text-slate-600">
                    {list.length} {list.length === 1 ? 'connection' : 'connections'}
                  </span>
                </div>
              </div>
              <Button variant="secondary" onClick={(e) => { e.stopPropagation(); exportWeek(); }} className="text-xs px-3 py-1.5">
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
            </button>

            <AnimatePresence>
              {threadsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Scrollable container with max height */}
                  <div className="max-h-[600px] overflow-y-auto px-5 pb-5 scrollbar-thin scrollbar-thumb-rose-300 scrollbar-track-slate-100 hover:scrollbar-thumb-rose-400 bg-gradient-to-br from-white/80 to-rose-50/30">
                    <ul className="space-y-2">
                      {list.map((x, idx) => {
                        const actionMeta = ACTIONS.find(a => a.key === x.action);
                        const ActionIcon = actionMeta?.icon || Heart;
                        const channelMeta = CHANNELS.find(c => c.key === x.channel);
                        const ChannelIcon = channelMeta?.icon || User;
                        
                        return (
                          <motion.li
                            key={x.id ?? `${x.date}-${idx}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group p-4 rounded-2xl border-2 border-slate-200 bg-white hover:bg-gradient-to-r hover:from-rose-50/30 hover:to-pink-50/30 hover:border-rose-300 transition-all shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-start gap-4">
                              <div className={`p-2.5 rounded-xl ${actionMeta?.color || 'bg-slate-500'} flex-shrink-0`}>
                                <ActionIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-base text-slate-900">{x.person}</h4>
                                  <span className="text-sm text-slate-600">• {actionMeta?.label || x.action}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                  <span className="inline-flex items-center gap-1">
                                    <ChannelIcon className="w-3 h-3" />
                                    {x.channel}
                                  </span>
                                  <span>•</span>
                                  <span>{new Date(x.date).toLocaleDateString()}</span>
                                </div>
                                {x.notes && (
                                  <p className="text-sm text-slate-700 mt-2 italic leading-relaxed pl-3 border-l-2 border-rose-300">
                                    {x.notes}
                                  </p>
                                )}
                              </div>
                              <button
                                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl border-2 border-slate-200 hover:bg-red-50 hover:border-red-400 transition-all"
                                onClick={() => removeEntry(x.id)}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}        {/* Practice Reminder */}
        <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-slate-800 mb-1">Weekly Practice</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Try one <b>thank you</b>, one <b>helping hand</b>, and one <b>word of encouragement</b> every week. 
                The web grows stronger with each thread you weave.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, icon: Icon, color }) {
  const colorClasses = {
    rose: "from-rose-50 to-pink-50 border-rose-300 text-rose-700",
    pink: "from-pink-50 to-fuchsia-50 border-pink-300 text-pink-700",
    emerald: "from-emerald-50 to-teal-50 border-emerald-300 text-emerald-700",
    amber: "from-amber-50 to-orange-50 border-amber-300 text-amber-700",
  };
  
  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${colorClasses[color]} p-5 border-2 shadow-md hover:shadow-lg transition-all group overflow-hidden`}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/20 blur-2xl group-hover:scale-125 transition-transform" />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </div>
        <div className="font-bold tabular-nums text-2xl text-slate-900">{value ?? "—"}</div>
      </div>
    </div>
  );
}
