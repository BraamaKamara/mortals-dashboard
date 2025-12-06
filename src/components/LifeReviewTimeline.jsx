// src/components/LifeReviewTimeline.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Plus, Trash2, Pencil, Check, X, Filter, Search, Star,
  ChevronDown, ChevronUp, BookOpen, Heart, Sparkles, Briefcase, PenLine,
  MapPinned, Trophy, Activity, PlusCircle, ArrowUp, ArrowDown, Clock
} from "lucide-react";

/**
 * Life-Review Timeline
 * Local-only store: "mortals.timeline.v1"
 * Event: { id, date(YYYY-MM-DD), title, category, significance(1-5), note }
 */

const LS_KEY = "mortals.timeline.v1";
const CATEGORIES = [
  { key: "Birth",        icon: Heart,     color: "bg-rose-500" },
  { key: "Loss",         icon: Activity,  color: "bg-gray-700" },
  { key: "Decision",     icon: MapPinned, color: "bg-amber-600" },
  { key: "Creation",     icon: PenLine,   color: "bg-indigo-600" },
  { key: "Relationship", icon: BookOpen,  color: "bg-pink-500" },
  { key: "Career",       icon: Briefcase, color: "bg-emerald-600" },
  { key: "Achievement",  icon: Trophy,    color: "bg-violet-600" },
  { key: "Health",       icon: Activity,  color: "bg-orange-600" },
];
const catMeta = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));

function readAll() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function writeAll(list) { try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {} }
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const ymd = (d) => new Date(d).toISOString().slice(0, 10);

function SigStars({ n = 1 }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < n ? "fill-yellow-400 stroke-yellow-500" : "stroke-gray-300"}`} />
      ))}
    </div>
  );
}

export default function LifeReviewTimeline() {
  const [list, setList] = useState(readAll());
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [formExpanded, setFormExpanded] = useState(true); // For collapsible form content
  const [filters, setFilters] = useState(CATEGORIES.map(c => c.key));
  const [expandYear, setExpandYear] = useState({}); // Start with all collapsed
  const [draft, setDraft] = useState({ date: "", title: "", category: "Decision", significance: 3, note: "" });
  const [editId, setEditId] = useState(null);

  useEffect(() => writeAll(list), [list]);

  const normalized = useMemo(() => {
    const rows = list
      .filter(e => !query || `${e.title} ${e.note} ${e.category}`.toLowerCase().includes(query.toLowerCase()))
      .filter(e => filters.includes(e.category))
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
    const byYear = rows.reduce((acc, e) => {
      const y = (e.date || "").slice(0, 4) || "—";
      (acc[y] ||= []).push(e);
      return acc;
    }, {});
    const years = Object.keys(byYear).sort();
    return { byYear, years };
  }, [list, query, filters]);

  const stats = useMemo(() => {
    if (list.length === 0) return { first: null, last: null, spanYears: 0, topCat: null };
    const dates = list.map(e => e.date).filter(Boolean).sort();
    const first = dates[0], last = dates[dates.length - 1];
    const spanYears = first && last ? new Date(last).getFullYear() - new Date(first).getFullYear() + 1 : 0;
    const counts = list.reduce((m, e) => ((m[e.category] = (m[e.category] || 0) + 1), m), {});
    const topCat = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { first, last, spanYears, topCat };
  }, [list]);

  function addOrUpdate() {
    if (!draft.date || !draft.title) return;
    if (editId) {
      setList(prev => prev.map(e => e.id === editId ? { ...e, ...draft } : e));
      setEditId(null);
    } else {
      setList(prev => [{ id: uid(), ...draft }, ...prev]);
    }
    setDraft({ date: "", title: "", category: "Decision", significance: 3, note: "" });
    setOpenForm(false);
  }
  function startEdit(e) {
    setEditId(e.id);
    setDraft({ date: e.date || "", title: e.title || "", category: e.category || "Decision", significance: e.significance || 3, note: e.note || "" });
    setOpenForm(true);
  }
  function remove(id) {
    if (!window.confirm("Delete this moment from your life review?")) return;
    setList(prev => prev.filter(e => e.id !== id));
  }
  function toggleFilter(k) {
    setFilters(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  }
  function clearAll() {
    if (!window.confirm("⚠️ This will permanently erase all moments from your life review timeline.\n\nThis action cannot be undone.\n\nAre you sure you want to continue?")) return;
    setList([]);
  }

  function addPreset(kind) {
    const today = ymd(new Date());
    const map = {
      turning_point: { title: "Turning point", category: "Decision", significance: 4, note: "A decision that changed my path.", date: today },
      mentor:        { title: "Met a mentor", category: "Relationship", significance: 4, note: "A person who reoriented my horizon.", date: today },
      creation:      { title: "Created something I’m proud of", category: "Creation", significance: 5, note: "", date: today },
      loss:          { title: "A loss that shaped me", category: "Loss", significance: 5, note: "", date: today },
    };
    const d = map[kind];
    if (!d) return;
    setDraft(d);
    setOpenForm(true);
  }

  return (
    <div className="relative rounded-3xl border border-slate-200/50 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 shadow-2xl overflow-hidden">
      {/* Atmospheric background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative p-8 space-y-8">
        {/* Atmospheric Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 shadow-lg">
              <CalendarDays className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="font-bold text-3xl bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 bg-clip-text text-transparent">
            Life-Review Timeline
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The moments that shaped your journey. Each memory a thread in the tapestry of your life—
            <span className="text-blue-600 font-medium"> births</span>, 
            <span className="text-gray-700 font-medium"> losses</span>, 
            <span className="text-amber-600 font-medium"> decisions</span>, 
            <span className="text-indigo-600 font-medium"> creations</span>.
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              className="pl-10 pr-4 py-3 text-sm rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all shadow-sm hover:shadow-md w-64"
              placeholder="Search your story…"
              value={query}
              onChange={(e)=> setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={()=> setOpenForm(v=>!v)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white text-sm font-semibold hover:brightness-110 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" /> {openForm ? 'Close' : 'Add Moment'}
          </button>
        </div>

        {/* Refined Filters */}
        <div className="backdrop-blur-sm bg-white/60 rounded-2xl border-2 border-slate-200/50 p-5 shadow-inner">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
              <Filter className="w-4 h-4 text-slate-700" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Filter by life chapter</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => {
              const active = filters.includes(c.key);
              const Icon = c.icon;
              return (
                <button
                  key={c.key}
                  onClick={()=> toggleFilter(c.key)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    active 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md hover:shadow-lg scale-105" 
                      : "bg-white/80 text-slate-700 border-slate-300 hover:bg-white hover:border-slate-400"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${catMeta[c.key].color}`} />
                  <Icon className="w-4 h-4" />
                  {c.key}
                </button>
              );
            })}
          </div>
        </div>

        {/* Atmospheric Presets */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Start with a template</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              className="group relative inline-flex items-center gap-2 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 px-4 py-3 rounded-2xl text-sm font-medium transition-all hover:shadow-lg" 
              onClick={()=> addPreset("turning_point")}
            >
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                <MapPinned className="w-4 h-4 text-white"/>
              </div>
              <span className="text-blue-700">Turning point</span>
            </button>
            <button 
              className="group relative inline-flex items-center gap-2 bg-gradient-to-br from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 border-2 border-green-200 px-4 py-3 rounded-2xl text-sm font-medium transition-all hover:shadow-lg" 
              onClick={()=> addPreset("mentor")}
            >
              <div className="p-1.5 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg">
                <BookOpen className="w-4 h-4 text-white"/>
              </div>
              <span className="text-green-700">Met a mentor</span>
            </button>
            <button 
              className="group relative inline-flex items-center gap-2 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-200 px-4 py-3 rounded-2xl text-sm font-medium transition-all hover:shadow-lg" 
              onClick={()=> addPreset("creation")}
            >
              <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                <PenLine className="w-4 h-4 text-white"/>
              </div>
              <span className="text-amber-700">Creation</span>
            </button>
            <button 
              className="group relative inline-flex items-center gap-2 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-2 border-red-200 px-4 py-3 rounded-2xl text-sm font-medium transition-all hover:shadow-lg" 
              onClick={()=> addPreset("loss")}
            >
              <div className="p-1.5 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
                <Activity className="w-4 h-4 text-white"/>
              </div>
              <span className="text-red-700">Loss</span>
            </button>
          </div>
        </div>

        {/* Collapsible Form */}
        <AnimatePresence initial={false}>
          {openForm && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-2xl border-2 border-purple-300/50 bg-white/90 backdrop-blur shadow-xl overflow-hidden"
            >
              {/* Collapsible Header */}
              <button
                onClick={() => setFormExpanded(v => !v)}
                className="w-full flex items-center justify-between p-5 hover:bg-purple-50/50 transition-colors"
                type="button"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100">
                    {formExpanded ? (
                      <ChevronUp className="w-5 h-5 text-purple-700" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-purple-700" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-lg text-slate-800 block">
                      {editId ? 'Edit This Moment' : 'Capture a Moment'}
                    </span>
                    {!formExpanded && (
                      <span className="text-xs text-slate-600">
                        Click to expand
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
                    <div className="px-5 pb-5 grid sm:grid-cols-6 gap-4 bg-gradient-to-br from-white/80 to-purple-50/30">
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">Date</div>
                  <input
                    type="date"
                    className="w-full rounded-xl border-2 border-slate-300 px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                    value={draft.date}
                    onChange={(e)=> setDraft(d => ({ ...d, date: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">Chapter</div>
                  <select
                    className="w-full rounded-xl border-2 border-slate-300 px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                    value={draft.category}
                    onChange={(e)=> setDraft(d => ({ ...d, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">Significance</div>
                  <input
                    type="range" min={1} max={5} step={1}
                    className="w-full accent-purple-600"
                    value={draft.significance}
                    onChange={(e)=> setDraft(d => ({ ...d, significance: Number(e.target.value) }))}
                  />
                  <div className="mt-1.5"><SigStars n={draft.significance} /></div>
                </div>
                <div className="sm:col-span-6">
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">Title</div>
                  <input
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                    placeholder="e.g., Left home for university"
                    value={draft.title}
                    onChange={(e)=> setDraft(d => ({ ...d, title: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-6">
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">Reflection</div>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none"
                    placeholder="Context, feelings, what followed…"
                    value={draft.note}
                    onChange={(e)=> setDraft(d => ({ ...d, note: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-6 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 text-sm font-medium transition-all"
                    onClick={()=> { setOpenForm(false); setEditId(null); }}
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:brightness-110 shadow-md hover:shadow-lg transition-all"
                    onClick={addOrUpdate}
                  >
                    {editId ? <><Check className="w-4 h-4" /> Save</> : <><PlusCircle className="w-4 h-4" /> Add Moment</>}
                  </button>
                </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Atmospheric Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          <Stat label="Moments captured" value={list.length} icon={CalendarDays} color="purple" />
          <Stat label="First dated" value={stats.first ? new Date(stats.first).toLocaleDateString() : "—"} icon={ArrowUp} color="emerald" />
          <Stat label="Most recent" value={stats.last ? new Date(stats.last).toLocaleDateString() : "—"} icon={ArrowDown} color="blue" />
          <Stat label="Years spanned" value={stats.spanYears || "—"} icon={Clock} color="amber" />
        </div>

        {/* Timeline with Clear All Button */}
        {normalized.years.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border-2 border-dashed border-slate-300 p-16 text-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 inline-block">
                <CalendarDays className="w-12 h-12 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Your story awaits</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Life unfolds through pivotal moments. Start capturing yours.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Clear All button - Better placement above timeline */}
            {list.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100 hover:border-red-300 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                  title="Remove all timeline events"
                >
                  <Trash2 className="w-4 h-4" /> Clear All Events
                </button>
              </div>
            )}
            
            <div className="relative space-y-3">
              {/* Atmospheric timeline thread */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-blue-300 to-transparent opacity-50" />
              
              {normalized.years.map((y) => (
                <YearBlock
                  key={y}
                  year={y}
                  events={normalized.byYear[y]}
                  expanded={expandYear[y] ?? false}
                  onToggle={() => setExpandYear(s => ({ ...s, [y]: !(s[y] ?? false) }))}
                  onEdit={startEdit}
                  onDelete={remove}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }) {
  const colorClasses = {
    purple: "from-purple-50 to-purple-100 border-purple-300 text-purple-700",
    emerald: "from-emerald-50 to-emerald-100 border-emerald-300 text-emerald-700",
    blue: "from-blue-50 to-blue-100 border-blue-300 text-blue-700",
    amber: "from-amber-50 to-amber-100 border-amber-300 text-amber-700",
  };
  
  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${colorClasses[color]} p-5 border-2 shadow-md hover:shadow-lg transition-all group overflow-hidden`}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/20 blur-2xl group-hover:scale-125 transition-transform" />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </div>
        <div className="font-bold tabular-nums text-2xl text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function YearBlock({ year, events, expanded, onToggle, onEdit, onDelete }) {
  const total = events.length;
  const sigAvg = Math.round((events.reduce((a, e) => a + (e.significance || 1), 0) / total) || 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-all bg-white/90 backdrop-blur ml-16"
    >
      {/* Year marker on timeline thread */}
      <div className="absolute -left-20 top-6 flex items-center gap-3">
        <div className="px-4 py-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold text-sm shadow-lg">
          {year}
        </div>
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-4 border-white shadow-lg" />
      </div>
      
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gradient-to-r from-slate-50/80 via-purple-50/50 to-blue-50/50 hover:from-slate-100/80 hover:via-purple-100/50 hover:to-blue-100/50 flex items-center justify-between transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-white border-2 border-purple-200 group-hover:border-purple-400 transition-all">
            {expanded ? <ChevronUp className="w-5 h-5 text-purple-600" /> : <ChevronDown className="w-5 h-5 text-purple-600" />}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-slate-900">
              {total} {total === 1 ? 'moment' : 'moments'}
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <SigStars n={sigAvg} />
            </div>
            <span className="text-lg font-bold text-slate-700">
              {year}
            </span>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="divide-y divide-slate-200"
          >
            {events.map((e, idx) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-blue-50/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="relative mt-1">
                    <div className="absolute inset-0 rounded-full blur-md opacity-50" style={{ background: catMeta[e.category]?.color || "#94a3b8" }} />
                    <span className={`relative block w-4 h-4 rounded-full shadow-lg ${catMeta[e.category]?.color || "bg-slate-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-bold text-base text-slate-900">{e.title}</h4>
                      <BadgeCat category={e.category} />
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">
                        <Clock className="w-3 h-3" />
                        {new Date(e.date).toLocaleDateString()}
                      </span>
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                        <SigStars n={e.significance || 1} />
                      </div>
                    </div>
                    {e.note && (
                      <p className="text-sm text-slate-700 mt-3 leading-relaxed whitespace-pre-wrap italic pl-4 border-l-2 border-purple-200 bg-slate-50/50 py-2 px-4 rounded-r-lg">
                        {e.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2.5 rounded-xl border-2 border-slate-200 hover:bg-blue-50 hover:border-blue-400 transition-all"
                      onClick={() => onEdit(e)}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      className="p-2.5 rounded-xl border-2 border-slate-200 hover:bg-red-50 hover:border-red-400 transition-all"
                      onClick={() => onDelete(e.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BadgeCat({ category }) {
  const meta = catMeta[category];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-2 bg-white/90 backdrop-blur shadow-sm hover:shadow-md transition-all">
      <span className={`w-2.5 h-2.5 rounded-full ${meta.color}`} />
      <Icon className="w-3.5 h-3.5" />
      {category}
    </span>
  );
}
