// src/components/StorylineArc.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Flag, Edit3, Save, RefreshCw, ArrowRight, BookOpen, MapPin, Plus, Trash2, Info, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Archive as ArchiveIcon, Undo2, Clock
} from "lucide-react";

/**
 * Storyline Arc — chapters + prompts + milestone pins
 * - Pin tooltips with exact date (if DOB known)
 * - Auto-scale to Desired Lifespan (proportional rescale)
 * - NEW: Category legend (reads milestone.category + color)
 */

const LS_CHAPTERS   = "mortals.storyline";
const LS_MILESTONES = "mortals.milestones";
const LS_AUTOSCALE  = "mortals.storyline.autoscale";
const LS_MISS_WIN   = "mortals.milestones.missWindowYears";

function readHorizonYears() {
  try {
    const keys = ["mortals.desiredLifespan","mortals.targetYears","mortals.horizonYears"];
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v != null && v !== "") return Number(JSON.parse(v));
    }
  } catch {}
  return 80;
}

const DEFAULT_CHAPTERS = [
  { label: "Childhood",     start: 0,  end: 12, color: "bg-emerald-500" },
  { label: "Formation",     start: 12, end: 25, color: "bg-sky-500" },
  { label: "Striving",      start: 25, end: 40, color: "bg-indigo-500" },
  { label: "Mastery",       start: 40, end: 55, color: "bg-purple-500" },
  { label: "Stewardship",   start: 55, end: 70, color: "bg-amber-500" },
  { label: "Legacy",        start: 70, end: 85, color: "bg-rose-500" },
  { label: "Elder / Ancestry", start: 85, end: 100, color: "bg-gray-500" },
];

const readJSON = (k, f=null) => { try { const v = localStorage.getItem(k); return v? JSON.parse(v): f; } catch { return f; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function getDOB(){ try { return localStorage.getItem("mortals.dob") || ""; } catch { return ""; } }
function normalizeISODate(s){
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) { const [,d,mo,y]=m; return `${y}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
  const d = new Date(s); if (!isNaN(d)) return d.toISOString().slice(0,10);
  return "";
}
function yearsBetween(d1, d2=new Date()){
  const iso = normalizeISODate(d1);
  if(!iso) return null; const a=new Date(iso), b=new Date(d2);
  let y=b.getFullYear()-a.getFullYear();
  const had=(b.getMonth()>a.getMonth())||(b.getMonth()===a.getMonth()&&b.getDate()>=a.getDate());
  return had? y: y-1;
}
function dateFromAge(age, dobISO) {
  const baseISO = normalizeISODate(dobISO);
  if (!baseISO) return "";
  const base = new Date(baseISO); if (isNaN(base)) return "";
  const d = new Date(base); d.setFullYear(d.getFullYear() + Number(age||0));
  if (d.getMonth() !== base.getMonth()) d.setDate(28);
  return d.toISOString().slice(0,10);
}
function ageAtDate(dateISO, dob){
  const dobISO = normalizeISODate(dob), tgtISO=normalizeISODate(dateISO);
  if(!dobISO || !tgtISO) return null; return yearsBetween(dobISO, new Date(tgtISO));
}
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

const COLOR_CLASSES = [
  "bg-emerald-500","bg-sky-500","bg-indigo-500","bg-purple-500","bg-amber-500","bg-rose-500","bg-gray-500",
  "bg-teal-500","bg-fuchsia-500","bg-blue-500","bg-lime-500","bg-orange-500",
];

function totalSpan(chapters){ return chapters.reduce((acc,c)=>Math.max(acc,c.end),0); }
function sorted(ch){ return [...ch].sort((a,b)=>a.start-b.start); }

function scaleChapters(base, horizon){
  const src = sorted(base);
  const span = totalSpan(src);
  if (!span || span === horizon) return src;
  const f = horizon / span;
  const out = src.map(c => ({
    ...c,
    start: Math.round(c.start * f),
    end:   Math.max(Math.round(c.end * f), Math.round(c.start * f) + 1),
  }));
  for (let i=1;i<out.length;i++){
    if (out[i].start < out[i-1].end) out[i].start = out[i-1].end;
    if (out[i].end <= out[i].start)  out[i].end   = out[i].start + 1;
  }
  return out;
}

function pinTooltip(m, dob){
  const base = `${m.title} · age ${m.age}`;
  const d = m.date || (dob ? dateFromAge(m.age, dob) : "");
  return d ? `${base} · ${d}` : base;
}

export default function StorylineArc(){
  const [chaptersSaved, setChaptersSaved] = useState(readJSON(LS_CHAPTERS, DEFAULT_CHAPTERS));
  const [editing, setEditing] = useState(false);
  const [manualAge, setManualAge] = useState(30);

  const [milestones, setMilestones] = useState(() => {
    const raw = readJSON(LS_MILESTONES, []);
    // Lightweight migration: ensure status fields exist
    return (raw || []).map(m => ({
      completed: false,
      archived: false,
      ...m,
    }));
  });
  const [msTitle, setMsTitle] = useState("");
  const [msColor, setMsColor] = useState("#111827");
  const [msMode, setMsMode]   = useState("age");
  const [msAge, setMsAge]     = useState(30);
  const [msDate, setMsDate]   = useState("");
  const [milestonesExpanded, setMilestonesExpanded] = useState(false); // Collapsible state default collapsed

  const [autoscale, setAutoscale] = useState(() => {
    try { const raw = localStorage.getItem(LS_AUTOSCALE); return raw ? JSON.parse(raw) : true; } catch { return true; }
  });
  const horizon = readHorizonYears();

  const dob = getDOB();
  const ageFromDOB = yearsBetween(dob);
  const age = ageFromDOB ?? manualAge;

  // Miss window setting (years)
  const [missWindow, setMissWindow] = useState(() => {
    try { const raw = localStorage.getItem(LS_MISS_WIN); return raw ? Number(JSON.parse(raw)) : 1; } catch { return 1; }
  });
  function persistMissWindow(v){
    const val = Math.max(0, Math.min(10, Number(v) || 0));
    setMissWindow(val);
    try { localStorage.setItem(LS_MISS_WIN, JSON.stringify(val)); } catch {}
  }

  // helpers for milestone persistence and status
  function persistMilestones(next){ setMilestones(next); writeJSON(LS_MILESTONES, next); }
  function statusOf(m){
    if (m.archived) return "archived";
    if (m.completed) return "achieved";
    if (ageFromDOB != null && ageFromDOB >= ((m.age ?? 0) + (missWindow || 0))) return "missed";
    return "upcoming";
  }
  function markDone(id){
    const next = milestones.map(m => m.id===id ? {
      ...m, completed: true, completedAt: (dob ? (m.date || dateFromAge(m.age, dob)) : new Date().toISOString().slice(0,10))
    } : m);
    persistMilestones(next);
  }
  function undoDone(id){
    const next = milestones.map(m => m.id===id ? { ...m, completed: false, completedAt: undefined } : m);
    persistMilestones(next);
  }
  function toggleArchive(id){
    const next = milestones.map(m => m.id===id ? { ...m, archived: !m.archived, archivedAt: !m.archived ? new Date().toISOString() : undefined } : m);
    persistMilestones(next);
  }

  useEffect(()=>{
    setChaptersSaved(prev => sorted(prev).map((c,i,arr)=>{
      const start = i===0 ? 0 : Math.max(arr[i-1].end, Number(c.start));
      const end   = Math.max(Number(c.end), start+1);
      return { ...c, label: (c.label||"").trim() || `Chapter ${i+1}`, start, end };
    }));
  },[]);

  const chaptersUsed = useMemo(
    () => autoscale ? scaleChapters(chaptersSaved, horizon) : chaptersSaved,
    [autoscale, chaptersSaved, horizon]
  );

  const span  = useMemo(()=> totalSpan(chaptersUsed), [chaptersUsed]);
  const nowPos= useMemo(()=> clamp(age??0, 0, span), [age, span]);

  const currentChapter = useMemo(
    ()=> chaptersUsed.find(c => nowPos >= c.start && nowPos < c.end) || chaptersUsed[chaptersUsed.length-1],
    [chaptersUsed, nowPos]
  );
  const nextChapter = useMemo(()=>{
    const i = chaptersUsed.indexOf(currentChapter);
    return chaptersUsed[i+1] || null;
  },[chaptersUsed, currentChapter]);

  const withinPct = useMemo(()=>{
    const denom = (currentChapter.end - currentChapter.start) || 1;
    return (nowPos - currentChapter.start) / denom;
  },[currentChapter, nowPos]);

  const barSegments = useMemo(()=>{
    return chaptersUsed.map(c=>{
      const widthPct = ((c.end - c.start) / span) * 100;
      const isNow = nowPos >= c.start && nowPos < c.end;
      return { ...c, widthPct, isNow };
    });
  },[chaptersUsed, span, nowPos]);

  const [promptIndex, setPromptIndex] = useState(0);
  const PROMPTS = {
    childhood: [
      "What early joy still lives in you?",
      "Which game taught you something lasting?",
      "Who protected your wonder? How can you thank them?"
    ],
    formation: [
      "Which virtues are you building this season?",
      "What teacher or text is shaping your mind?",
      "What habits now will become your character later?"
    ],
    striving: [
      "What are you willing to endure for a worthy aim?",
      "Where does ambition serve others, not only you?",
      "What will you stop doing to serve the essential?"
    ],
    mastery: [
      "Which skills deserve depth, not breadth?",
      "Who are your apprentices? How do you lift them?",
      "What standard of excellence do you uphold secretly?"
    ],
    stewardship: [
      "Whose growth are you responsible for now?",
      "What should you preserve, repair, or pass on?",
      "How can power be used gently and justly?"
    ],
    legacy: [
      "What memory of you should survive in others?",
      "What wisdom must be written so it outlives you?",
      "If you had one last project, what would it be?"
    ],
    elder: [
      "What reconciliations still call for your courage?",
      "What blessings should you speak while you can?",
      "How will you modernize your traditions with kindness?"
    ]
  };
  function promptsForLabel(label=""){
    const key = label.toLowerCase();
    if (key.includes("child")) return PROMPTS.childhood;
    if (key.includes("form")) return PROMPTS.formation;
    if (key.includes("striv")) return PROMPTS.striving;
    if (key.includes("master")) return PROMPTS.mastery;
    if (key.includes("steward")) return PROMPTS.stewardship;
    if (key.includes("legacy")) return PROMPTS.legacy;
    if (key.includes("elder") || key.includes("ances")) return PROMPTS.elder;
    return [
      "What is worth your next thousand hours?",
      "Who needs your patience more than your speed?",
      "What would you still do if you had five years left?"
    ];
  }
  const chapterPrompts = promptsForLabel(currentChapter?.label || "");
  const prompt = chapterPrompts[promptIndex % chapterPrompts.length];
  function shufflePrompt(){ setPromptIndex(i => (i+1)%chapterPrompts.length); }

  function addMilestone(){
    let ageVal = null, dateISO = "";
    const mode = msMode;
    if (mode === "age") {
      ageVal = Number(msAge);
      if (dob) dateISO = dateFromAge(ageVal, dob);
    } else {
      dateISO = msDate;
      const a = ageAtDate(msDate, dob);
      if (a==null) { window.mortalsToast?.("Set your DOB above, or switch to 'By age' mode.", { type: 'error' }); return; }
      ageVal = a;
    }
    if (!msTitle.trim()) return;
    const item = { id: uid(), title: msTitle.trim(), age: Math.round(ageVal), color: msColor, date: dateISO || undefined, completed: false, archived: false, createdAt: new Date().toISOString() };
    const next = [...milestones, item].sort((a,b)=>a.age-b.age);
    persistMilestones(next);
    setMsTitle("");
  }
  function removeMilestone(id){
    const next = milestones.filter(m=>m.id!==id);
    persistMilestones(next);
  }

  function resetDefaults(){
    setChaptersSaved(DEFAULT_CHAPTERS);
    writeJSON(LS_CHAPTERS, DEFAULT_CHAPTERS);
  }
  function saveEdits(){
    const norm = sorted(chaptersSaved).map((c,i,arr)=>{
      const start = i===0 ? 0 : Math.max(arr[i-1].end, Number(c.start));
      const end   = Math.max(Number(c.end), start+1);
      return { ...c, label: (c.label||"").trim() || `Chapter ${i+1}`, start, end };
    });
    setChaptersSaved(norm); writeJSON(LS_CHAPTERS, norm); setEditing(false);
  }
  function toggleAutoscale(v){
    setAutoscale(v);
    try { localStorage.setItem(LS_AUTOSCALE, JSON.stringify(v)); } catch {}
  }

  // Legend entries derived from milestones (category + color)
  const legend = useMemo(()=>{
    const map = new Map();
    milestones.forEach(m=>{
      const key = (m.category || "pin") + "|" + (m.color || "#111827");
      if (!map.has(key)) map.set(key, {
        label: m.category ? (m.category[0].toUpperCase() + m.category.slice(1)) : "Pin",
        color: m.color || "#111827"
      });
    });
    return Array.from(map.values());
  }, [milestones]);

  // Derived groups and counts
  const groups = useMemo(() => {
    const g = { upcoming: [], missed: [], achieved: [], archived: [] };
    for (const m of milestones) g[statusOf(m)].push(m);
    // sort each group by age ascending
    Object.keys(g).forEach(k => g[k].sort((a,b)=> (a.age||0)-(b.age||0)));
    return g;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestones, ageFromDOB]);
  const counts = {
    upcoming: groups.upcoming.length,
    missed: groups.missed.length,
    achieved: groups.achieved.length,
    archived: groups.archived.length,
    total: milestones.length,
  };

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
            <Flag className="w-5 h-5 text-indigo-600"/> Storyline Arc
          </div>
          <div className="text-sm text-gray-600 mt-1">Chapters of a life · prompts & milestones</div>
        </div>
      </div>

      {/* Controls row */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-600 mb-1">Current age</div>
          {ageFromDOB != null ? (
            <div className="text-sm"><span className="font-medium">{ageFromDOB}</span><span className="text-gray-600"> (auto from DOB)</span></div>
          ) : (
            <input type="number" min={0} max={120}
              value={manualAge}
              onChange={(e)=> setManualAge(parseInt(e.target.value||"0",10))}
              className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
            />
          )}
        </div>

        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-600 mb-1">Edit chapters</div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-2xl text-sm bg-gray-100 hover:bg-gray-200 inline-flex items-center gap-2"
              onClick={()=> setEditing(v=>!v)}>
              <Edit3 className="w-4 h-4"/>{editing ? "Close editor" : "Open editor"}
            </button>
            <button className="px-3 py-1.5 rounded-2xl text-sm bg-gray-100 hover:bg-gray-200 inline-flex items-center gap-2"
              onClick={resetDefaults} title="Restore default arc">
              <RefreshCw className="w-4 h-4"/> Reset
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-600 mb-1">Scaling</div>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" className="accent-black"
                   checked={autoscale} onChange={e=>toggleAutoscale(e.target.checked)} />
            Auto-scale to desired lifespan
          </label>
          <div className="text-[11px] text-gray-500 mt-1">
            Horizon: <b>{horizon}</b> years · chapters are proportionally rescaled (non-destructive).
          </div>
        </div>
      </div>

      {/* Now / Next */}
      <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
            <span className="font-bold text-lg text-gray-800">{currentChapter?.label}</span>
            <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-semibold text-gray-700 border border-gray-300">
              {Math.round(withinPct*100)}% complete
            </span>
          </div>
          {nextChapter && (
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 px-3 py-1.5 rounded-full border border-gray-300">
              <ArrowRight className="w-4 h-4 text-indigo-600"/>
              <span>Next: <b className="text-indigo-700">{nextChapter.label}</b> at age <b>{nextChapter.start}</b></span>
            </div>
          )}
        </div>
      </div>

  {/* Enhanced Segmented bar */}
      <div className="mt-6">
        <div className="relative w-full h-12 rounded-2xl overflow-hidden border-2 border-gray-300 shadow-lg bg-gradient-to-b from-gray-50 to-gray-100">
          {/* Chapter segments with gradients */}
          <div className="absolute inset-0 flex">
            {barSegments.map((seg, idx)=>(
              <div 
                key={seg.label+seg.start}
                className={`h-full ${seg.color} relative transition-all duration-300 hover:brightness-110 cursor-pointer group`}
                style={{ width: `${seg.widthPct}%` }}
                title={`${seg.label}: ${seg.start}–${seg.end}`}
              >
                {/* Gradient overlay for depth */}
                <div className={`absolute inset-0 ${seg.isNow ? 'bg-gradient-to-t from-black/20 via-transparent to-white/20' : 'bg-gradient-to-t from-black/10 via-transparent to-white/10'}`}></div>
                
                {/* Shimmer effect on current chapter */}
                {seg.isNow && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                )}
                
                {/* Chapter name label inside bar */}
                {seg.widthPct > 8 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold text-white drop-shadow-lg ${seg.isNow ? 'text-shadow-glow' : ''}`}>
                      {seg.label}
                    </span>
                  </div>
                )}
                
                {/* Divider line between segments */}
                {idx < barSegments.length - 1 && (
                  <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/50"></div>
                )}
              </div>
            ))}
          </div>

          {/* Milestone pins with status styling */}
          {milestones.map(m=>{
            const leftPct = clamp((m.age/span)*100, 0, 100);
            const st = statusOf(m);
            const color = m.color || "#111827";
            return (
              <div key={m.id} className="absolute -top-2 z-10 transition-transform hover:scale-125" style={{ left: `calc(${leftPct}% - 8px)` }}>
                <div className="relative">
                  {/* Outer glow */}
                  <div className="absolute inset-0 w-4 h-4 rounded-full blur-sm" style={{ background: color, opacity: st==='archived'?0.15:0.5 }}></div>
                  {/* Pin marker */}
                  <div className="relative w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer"
                       style={{ background: st==='missed'? '#ef4444' : (st==='achieved' ? '#10b981' : color) }}
                       title={pinTooltip(m, dob)}>
                    <div className="absolute inset-0 rounded-full bg-white/20"></div>
                    {st==='achieved' && <CheckCircle className="absolute -top-3 -right-3 w-4 h-4 text-emerald-500" />}
                    {st==='missed' && <XCircle className="absolute -top-3 -right-3 w-4 h-4 text-red-500" />}
                    {st==='archived' && <ArchiveIcon className="absolute -top-3 -right-3 w-4 h-4 text-gray-400" />}
                  </div>
                  {/* Pin stem */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-3" style={{ background: st==='missed'? '#ef4444' : st==='achieved' ? '#10b981' : '#9ca3af', opacity: st==='archived'?0.4:1 }}></div>
                </div>
              </div>
            );
          })}

          {/* Enhanced Now marker */}
          <div className="absolute top-0 bottom-0 z-20" style={{ left: `${(nowPos/span)*100}%` }}>
            <div className="relative -translate-x-1/2">
              {/* Marker line with gradient */}
              <div className="w-1 h-full bg-gradient-to-b from-red-500 via-orange-500 to-red-500 shadow-lg"></div>
              {/* Animated pulse at top */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75"></div>
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500"></div>
              </div>
              {/* Label */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                  YOU
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Labels row */}
        <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: barSegments.map(s=>`${s.widthPct}fr`).join(" ") }}>
          {barSegments.map(seg=>(
            <div key={seg.label+"-label"} className="flex flex-col items-center">
              <div className={`text-xs font-semibold truncate ${seg.isNow ? 'text-indigo-700' : 'text-gray-700'}`}>
                {seg.label}
              </div>
              <div className={`text-[10px] ${seg.isNow ? 'text-indigo-600 font-semibold' : 'text-gray-500'}`}>
                {seg.start}–{seg.end}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add shimmer animation style */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Chapter Prompts */}
      <div className="mt-5 rounded-2xl border p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BookOpen className="w-4 h-4"/> Prompts for <span className="font-semibold">{currentChapter?.label}</span>
          <button onClick={shufflePrompt}
            className="ml-auto px-3 py-1.5 rounded-2xl text-sm bg-gray-100 hover:bg-gray-200">Shuffle</button>
        </div>
        <div className="mt-2 text-sm text-gray-800">• {prompt}</div>
        <div className="mt-1 text-[11px] text-gray-500 flex items-center gap-1">
          <Info className="w-3 h-3"/> Use this to author your next small action or journal line.
        </div>
      </div>

      {/* Milestones Editor */}
      <div className="mt-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden shadow-md">
        {/* Collapsible Header */}
        <button
          onClick={() => setMilestonesExpanded(!milestonesExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-indigo-100/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-indigo-600"/>
            <div className="text-left">
              <div className="font-semibold text-gray-800">Milestone Pins</div>
              <div className="text-xs text-gray-600 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3"/>Upcoming: <b>{counts.upcoming}</b></span>
                <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle className="w-3 h-3"/>Achieved: <b>{counts.achieved}</b></span>
                <span className="inline-flex items-center gap-1 text-red-700" title={`Milestones past age ${ageFromDOB != null ? ageFromDOB - missWindow : '?'} that are not completed or archived`}>
                  <XCircle className="w-3 h-3"/>Missed: <b>{counts.missed}</b>
                </span>
                <span className="inline-flex items-center gap-1 text-gray-600"><ArchiveIcon className="w-3 h-3"/>Archived: <b>{counts.archived}</b></span>
                <span className="inline-flex items-center gap-1 text-indigo-700" title="Grace period before a past-due milestone is marked as Missed">
                  · Miss window: <b>{missWindow}</b>y
                </span>
              </div>
            </div>
          </div>
          {milestonesExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Collapsible Content */}
        {milestonesExpanded && (
          <div className="px-5 pb-5 bg-white">
            {/* Miss window setting */}
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 flex items-center gap-3">
              <div className="text-xs font-medium text-indigo-900">Miss window</div>
              <input
                type="number"
                min={0}
                max={10}
                step={0.25}
                className="w-20 rounded-lg border-2 border-indigo-200 px-2 py-1 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-300"
                value={missWindow}
                onChange={(e)=>persistMissWindow(e.target.value)}
              />
              <div className="text-xs text-indigo-900/70">years grace before a past milestone is considered "Missed"</div>
              <button
                onClick={()=>persistMissWindow(1)}
                className="ml-auto px-3 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-medium transition"
                title="Reset to 1 year"
              >
                Reset
              </button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-12 items-end">
              <div className="sm:col-span-4">
                <div className="text-xs text-gray-600 mb-1 font-medium">Title</div>
                <input className="w-full rounded-xl border-2 border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                       placeholder="Graduation, First book, Wedding, …"
                       value={msTitle} onChange={e=>setMsTitle(e.target.value)} />
              </div>

              <div className="sm:col-span-2">
                <div className="text-xs text-gray-600 mb-1 font-medium">Color</div>
                <input type="color" className="w-full h-10 rounded-xl border-2 border-gray-300 cursor-pointer"
                       value={msColor} onChange={e=>setMsColor(e.target.value)} />
              </div>

              <div className="sm:col-span-2">
                <div className="text-xs text-gray-600 mb-1 font-medium">Mode</div>
                <select className="w-full rounded-xl border-2 border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                        value={msMode} onChange={e=>setMsMode(e.target.value)}>
                  <option value="age">By age</option>
                  <option value="date">By date</option>
                </select>
              </div>

              {msMode==="age" ? (
                <div className="sm:col-span-2">
                  <div className="text-xs text-gray-600 mb-1 font-medium">Age</div>
                  <input type="number" min={0} max={120}
                         className="w-full rounded-xl border-2 border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                         value={msAge} onChange={e=>setMsAge(parseInt(e.target.value||"0",10))} />
                </div>
              ) : (
                <div className="sm:col-span-2">
                  <div className="text-xs text-gray-600 mb-1 font-medium">Date</div>
                  <input type="date" className="w-full rounded-xl border-2 border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                         value={msDate} onChange={e=>setMsDate(e.target.value)} />
                  {!dob && <div className="text-[11px] text-gray-500 mt-1">Set your DOB to convert date → age.</div>}
                </div>
              )}

              <div className="sm:col-span-2">
                <button onClick={addMilestone}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* List of milestones, grouped by status */}
            <div className="mt-4">
              {milestones.length === 0 ? (
                <div className="text-sm text-gray-600 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50">
                  No pins yet — add a few to mark your story.
                </div>
              ) : (
                <>
                  <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Your Milestones</div>
                  <div className="grid gap-4 max-h-72 overflow-y-auto pr-2">
                    {[
                      { key: 'upcoming', label: 'Upcoming', color: 'text-slate-700', icon: Clock },
                      { key: 'achieved', label: 'Achieved', color: 'text-emerald-700', icon: CheckCircle },
                      { key: 'missed', label: 'Missed', color: 'text-red-700', icon: XCircle },
                      { key: 'archived', label: 'Archived', color: 'text-gray-600', icon: ArchiveIcon },
                    ].map(section => (
                      groups[section.key].length > 0 && (
                        <div key={section.key}>
                          <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${section.color}`}>
                            {React.createElement(section.icon, { className: 'w-4 h-4' })}
                            {section.label} · {groups[section.key].length}
                          </div>
                          <div className="mt-2 grid gap-2">
                            {groups[section.key].map(m => (
                              <div key={m.id} className="rounded-xl border-2 border-gray-200 bg-white p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
                                <div className="w-4 h-4 rounded-full border-2 border-white shadow-md" style={{ background: m.color || '#111827' }} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-800 truncate" title={pinTooltip(m, dob)}>{m.title}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                                    <span>Age {m.age}</span>
                                    {(m.date || (dob ? dateFromAge(m.age, dob) : "")) && (
                                      <span>· {m.date || dateFromAge(m.age, dob)}</span>
                                    )}
                                    {m.completed && m.completedAt && (
                                      <span className="text-emerald-700">· Done {new Date(m.completedAt).toLocaleDateString()}</span>
                                    )}
                                    {m.archived && m.archivedAt && (
                                      <span className="text-gray-600">· Archived {new Date(m.archivedAt).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {m.completed ? (
                                    <button className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700" title="Mark as not done" onClick={()=>undoDone(m.id)}>
                                      <Undo2 className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700" title="Mark done" onClick={()=>markDone(m.id)}>
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700" title={m.archived? 'Unarchive':'Archive'} onClick={()=>toggleArchive(m.id)}>
                                    <ArchiveIcon className="w-4 h-4" />
                                  </button>
                                  <button className="px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600" title="Remove" onClick={()=>removeMilestone(m.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Legend (from existing milestones) */}
      {legend.length > 0 && (
        <div className="mt-4 rounded-2xl border p-3">
          <div className="text-xs font-medium mb-2">Legend</div>
          <div className="flex flex-wrap gap-2">
            {legend.map((l, i)=>(
              <div key={i} className="text-xs inline-flex items-center gap-2 px-2 py-1 rounded-xl border">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }}></span>
                {l.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor panel */}
      {editing && (
        <div className="mt-5 rounded-2xl border p-4">
          <div className="text-sm font-medium mb-2">Edit chapters (start inclusive, end exclusive)</div>
          <div className="grid gap-2">
            {chaptersSaved.map((c, idx)=>(
              <div key={idx} className="grid gap-2 sm:grid-cols-12 items-center">
                <input className="sm:col-span-4 rounded-2xl border px-3 py-1.5 text-sm"
                       value={c.label}
                       onChange={e=>setChaptersSaved(chs=>chs.map((x,i)=>i===idx?{...x,label:e.target.value}:x))} />
                <input type="number" min={0} max={120}
                       className="sm:col-span-2 rounded-2xl border px-3 py-1.5 text-sm"
                       value={c.start}
                       onChange={e=>setChaptersSaved(chs=>chs.map((x,i)=>i===idx?{...x,start:parseInt(e.target.value||"0",10)}:x))}
                       title="Start age" />
                <input type="number" min={1} max={120}
                       className="sm:col-span-2 rounded-2xl border px-3 py-1.5 text-sm"
                       value={c.end}
                       onChange={e=>setChaptersSaved(chs=>chs.map((x,i)=>i===idx?{...x,end:parseInt(e.target.value||"0",10)}:x))}
                       title="End age" />
                <select className="sm:col-span-3 rounded-2xl border px-3 py-1.5 text-sm"
                        value={c.color}
                        onChange={e=>setChaptersSaved(chs=>chs.map((x,i)=>i===idx?{...x,color:e.target.value}:x))}>
                  {COLOR_CLASSES.map(cl=> <option key={cl} value={cl}>{cl.replace("bg-","")}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button className="px-3 py-1.5 rounded-2xl text-sm bg-gray-100 hover:bg-gray-200" onClick={()=>setEditing(false)}>Cancel</button>
            <button className="px-3 py-1.5 rounded-2xl text-sm bg-black text-white hover:bg-gray-800 inline-flex items-center gap-2" onClick={saveEdits}>
              <Save className="w-4 h-4"/> Save
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 text-[11px] text-gray-500">
        The arc is symbolic, not prescriptive. Auto-scaling is non-destructive—your saved chapters remain intact.
      </div>
    </div>
  );
}
