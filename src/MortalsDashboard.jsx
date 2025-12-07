import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AlertCircle, Calendar, CalendarDays, Clock, Hourglass, Heart, RefreshCcw,
  TimerReset, Zap, CheckCircle2, ListTodo, Plus, Trash2, BarChart2,
  Play, Pause, RotateCcw, Timer, Sparkles, NotebookText, Feather, Crown, Users,
  Upload, Download, X
} from "lucide-react";
import MoodTracker from './components/MoodTracker';
import EmotionHeatmap from './components/EmotionHeatmap';
import WeeklyMoodSummary from './components/WeeklyMoodSummary';
import MortalsChime from './components/MortalsChime';
import MortalityCurves from './components/MortalityCurves';
import MemoryCapsule from './components/MemoryCapsule';
import StorylineArc from './components/StorylineArc';
import AboutPhilosophy from './components/AboutPhilosophy';
import LifeReviewTimeline from './components/LifeReviewTimeline';
import ValuesCompass from './components/ValuesCompass';
import ExistenceCurves from './components/ExistenceCurves';
import DepartureJournal from './components/DepartureJournal';
import CircleInfluence from './components/CircleInfluence';
import EpitaphGenerator from './components/EpitaphGenerator';
import GratitudeLedger from './components/GratitudeLedger';
import AskMortals from './components/AskMortals';
import WeeklySynthesis from './components/WeeklySynthesis';
import PhilosophyCard from './components/PhilosophyCard';
import DegreesOfSelfSpiral from './components/DegreesOfSelfSpiral';

// Utility functions
function addYears(date, years) {
  const d = new Date(date);
  const targetYear = d.getFullYear() + years;
  if (d.getMonth() === 1 && d.getDate() === 29) { 
    const tmp = new Date(d); 
    tmp.setFullYear(targetYear, 1, 28); 
    return tmp; 
  }
  const out = new Date(d); 
  out.setFullYear(targetYear); 
  return out;
}

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const humanPct = (p) => `${Math.round(p * 100)}%`;
const todayKey = () => new Date().toISOString().slice(0,10);
const dateKey = (d) => new Date(d).toISOString().slice(0,10);
const weekKeyFromDate = (d) => dateKey(startOfWeek(d));

function startOfDay(d) { 
  const x = new Date(d); 
  x.setHours(0,0,0,0); 
  return x; 
}

function endOfDay(d) { 
  const x = new Date(d); 
  x.setHours(23,59,59,999); 
  return x; 
}

function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  x.setDate(x.getDate() + diff);
  return x;
}

function endOfWeek(d) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 7);
  e.setMilliseconds(-1);
  return e;
}

function formatDuration(ms) {
  if (ms <= 0) return "0s";
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || parts.length) parts.push(`${hours}h`);
  if (minutes || parts.length) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

function readLegacyTouches(dk) {
  try { 
    return Number(localStorage.getItem(`mortals.legacy.touch.${dk}`) || "0"); 
  } catch { 
    return 0; 
  }
}

function logLegacyTouch(dk = todayKey()) {
  try {
    const k = `mortals.legacy.touch.${dk}`;
    const n = Number(localStorage.getItem(k) || "0");
    localStorage.setItem(k, String(n + 1));
    window.dispatchEvent(new Event("mortals-legacy-touch-updated"));
  } catch {}
}

// Hook for handling localStorage state
function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try { 
      const raw = localStorage.getItem(key); 
      return raw ? JSON.parse(raw) : initial; 
    }
    catch { 
      return initial; 
    }
  });
  
  useEffect(() => { 
    try { 
      localStorage.setItem(key, JSON.stringify(state)); 
    } catch {} 
  }, [key, state]);
  
  return [state, setState];
}

// UI Components
function Button({ variant = "default", className = "", ...props }) {
  const base = "rounded-2xl px-3 py-1.5 text-sm font-medium flex items-center justify-center transition-colors";
  const styles = variant === "secondary"
    ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
    : variant === "danger"
    ? "bg-red-600 text-white hover:bg-red-700" 
    : variant === "gold"
    ? "bg-amber-600 text-white hover:bg-amber-700"
    : "bg-black text-white hover:bg-gray-800";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 ${className}`}
      {...props}
    />
  );
}

function Label({ className = "", ...props }) {
  return <label className={`text-sm font-medium ${className}`} {...props} />;
}

function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-3xl bg-white border border-gray-200 ${className}`}
      {...props}
    />
  );
}

function CardContent({ className = "", ...props }) {
  return <div className={`p-6 ${className}`} {...props} />;
}

function Slider({ min = 0, max = 100, step = 1, value = [0], onValueChange, className = "" }) {
  const v = value?.[0] ?? 0;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={`w-full ${className}`}
    />
  );
}

function useInterval(callback, delay) {
  const savedRef = useRef();
  useEffect(() => { savedRef.current = callback; }, [callback]);
  useEffect(() => {
    if (delay == null) return;
    const id = setInterval(() => savedRef.current && savedRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3 border border-gray-200">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold tabular-nums text-lg">{value ?? "—"}</div>
    </div>
  );
}

// Component for final decade band in the time visualization
function FinalDecadeBand({ dob, endDate, now }) {
  const total = endDate - dob;
  const finalStart = addYears(endDate, -10);
  const finalPctStart = clamp01((finalStart - dob) / total);
  const nowPct = clamp01((now - dob) / total);
  
  return (
    <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden" title="Final Decade">
      <div 
        className="absolute inset-y-0 bg-amber-300/70" 
        style={{ 
          left: `${finalPctStart * 100}%`, 
          width: `${(1 - finalPctStart) * 100}%` 
        }} 
      />
      <div 
        className="absolute -top-1 h-4 w-0.5 bg-gray-900" 
        style={{ left: `${nowPct * 100}%` }} 
        title="Now" 
      />
    </div>
  );
}

// Main MortalsDashboard component
export default function MortalsDashboard({ onEnterMirror }) {
  const [now, setNow] = useState(new Date());

  // Core settings
  const [dob, setDob] = useLocalState("mortals.dob", "");
  const [lifespan, setLifespan] = useLocalState("mortals.lifespan", 80);
  const [lensOverride, setLensOverride] = useLocalState("mortals.lensOverride", "auto");

  // Update current time
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Calculate life-related dates and percentages
  const dobDate = useMemo(() => (dob ? new Date(dob + "T00:00:00") : null), [dob]);
  const endDate = useMemo(() => (dobDate ? addYears(dobDate, lifespan) : null), [dobDate, lifespan]);

  const life = useMemo(() => {
    if (!dobDate || !endDate) return null;
    const total = endDate - dobDate;
    const elapsed = now - dobDate;
    const remain = Math.max(0, endDate - now);
    const pct = clamp01(elapsed / total);
    return { total, elapsed, remain, pct };
  }, [dobDate, endDate, now]);

  const inFinalDecade = useMemo(() => {
    if (!endDate) return false;
    const finalStart = addYears(endDate, -10);
    return now >= finalStart;
  }, [endDate, now]);

  // Determine lens mode
  const lens = useMemo(() => {
    if (lensOverride === "standard") return "standard";
    if (lensOverride === "final") return "final";
    return inFinalDecade ? "final" : "standard";
  }, [lensOverride, inFinalDecade]);

  const isFinal = lens === "final";
  const rootBg = isFinal ? "bg-amber-50" : "bg-gray-50";

  // Time-related labels
  const secondsLeft = life ? Math.max(0, Math.floor(life.remain / 1000)) : null;
  const exactCountdown = life ? formatDuration(life.remain) : "";
  const yearsLeftLabel = useMemo(() => {
    if (!life) return "—";
    const y = life.remain / (365.25 * 24 * 3600 * 1000);
    return y < 0 ? "0" : y.toFixed(2);
  }, [life]);

  // Prompts for reflection
  const standardPrompts = [
    "Did you honour your highest priorities today?",
    "What tiny action moves a long-term dream by 1%?",
    "Are you spending time or investing it?",
    "Who needs your kindness before midnight?",
    "What will make Future-You quietly proud tonight?",
  ];

  const finalDecadePrompts = [
    "Which relationship needs warmth or repair this week?",
    "What wisdom do I want to record so it outlives me?",
    "What small act of generosity would echo beyond today?",
    "Who can I mentor or encourage right now?",
    "What story should I tell while I can?",
    "Which Credit do I need to settle before I go?",
  ];

  // Calculate additional stats for hero section
  const heroStats = useMemo(() => {
    if (!life || !dobDate || !endDate) return null;
    
    const MS_PER_DAY = 24 * 3600 * 1000;
    const MS_PER_WEEK = 7 * MS_PER_DAY;
    
    const daysLived = Math.floor(life.elapsed / MS_PER_DAY);
    const daysTotal = Math.floor((endDate - dobDate) / MS_PER_DAY);
    const daysRemaining = Math.max(0, daysTotal - daysLived);
    
    const weeksLived = Math.floor(life.elapsed / MS_PER_WEEK);
    const weeksTotal = Math.floor((endDate - dobDate) / MS_PER_WEEK);
    const weeksRemaining = Math.max(0, weeksTotal - weeksLived);
    const currentWeek = weeksLived + 1;
    
    return {
      lifePct: life.pct,
      daysLived,
      daysRemaining,
      weeksLived,
      weeksRemaining,
      weeksTotal,
      currentWeek
    };
  }, [life, dobDate, endDate]);

  // JSX for dashboard
  return (
    <div className={`${rootBg} min-h-screen`}>
      <div className="mx-auto max-w-6xl p-6 md:p-10 space-y-8">
        {/* Enhanced Hero Header */}
        <header className="space-y-6">
          {/* Title Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-2xl ${isFinal ? "bg-amber-100" : "bg-slate-100"}`}>
                <Zap className={`w-7 h-7 ${isFinal ? "text-amber-700" : "text-slate-700"}`} />
              </div>
              <div>
                <h1 className={`text-3xl md:text-4xl font-bold tracking-tight ${isFinal ? "text-amber-900" : "text-slate-900"}`}>
                  MORTALS
                </h1>
                <p className={`text-sm ${isFinal ? "text-amber-700" : "text-slate-600"} italic`}>
                  A Dashboard for Mortality Awareness
                </p>
              </div>
            </div>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-medium border-2 transition-all ${
                isFinal 
                  ? "border-amber-300 hover:bg-amber-100 text-amber-900" 
                  : "border-slate-300 hover:bg-slate-100 text-slate-900"
              }`}
              onClick={onEnterMirror}
              title="Enter Mirror Mode"
            >
              Mirror Mode
            </button>
          </div>

          {/* Tagline */}
          <div className="text-center">
            <p className={`text-lg md:text-xl font-medium ${isFinal ? "text-amber-800" : "text-slate-700"}`}>
              "We are all mortal. The question is: are we awake?"
            </p>
          </div>

          {/* Live Stats Grid */}
          {heroStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Life Lived */}
              <div className={`rounded-2xl p-5 border-2 ${
                isFinal 
                  ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" 
                  : "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Hourglass className={`w-5 h-5 ${isFinal ? "text-amber-600" : "text-slate-600"}`} />
                  <span className={`text-xs font-semibold ${isFinal ? "text-amber-700" : "text-slate-600"}`}>
                    LIFE
                  </span>
                </div>
                <div className={`text-3xl font-bold tabular-nums ${isFinal ? "text-amber-900" : "text-slate-900"}`}>
                  {(heroStats.lifePct * 100).toFixed(1)}%
                </div>
                <div className={`text-xs mt-1 ${isFinal ? "text-amber-700" : "text-slate-600"}`}>
                  Lived
                </div>
                {/* Mini progress bar */}
                <div className="mt-3 h-1.5 bg-white/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isFinal ? "bg-amber-600" : "bg-slate-600"}`}
                    style={{ width: `${heroStats.lifePct * 100}%` }}
                  />
                </div>
              </div>

              {/* Days Lived */}
              <div className={`rounded-2xl p-5 border-2 ${
                isFinal 
                  ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" 
                  : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <CalendarDays className={`w-5 h-5 ${isFinal ? "text-amber-600" : "text-blue-600"}`} />
                  <span className={`text-xs font-semibold ${isFinal ? "text-amber-700" : "text-blue-700"}`}>
                    DAYS
                  </span>
                </div>
                <div className={`text-3xl font-bold tabular-nums ${isFinal ? "text-amber-900" : "text-blue-900"}`}>
                  {heroStats.daysLived.toLocaleString()}
                </div>
                <div className={`text-xs mt-1 ${isFinal ? "text-amber-700" : "text-blue-700"}`}>
                  Lived
                </div>
              </div>

              {/* Current Week */}
              <div className={`rounded-2xl p-5 border-2 ${
                isFinal 
                  ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" 
                  : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Calendar className={`w-5 h-5 ${isFinal ? "text-amber-600" : "text-purple-600"}`} />
                  <span className={`text-xs font-semibold ${isFinal ? "text-amber-700" : "text-purple-700"}`}>
                    WEEK
                  </span>
                </div>
                <div className={`text-3xl font-bold tabular-nums ${isFinal ? "text-amber-900" : "text-purple-900"}`}>
                  {heroStats.currentWeek.toLocaleString()}
                </div>
                <div className={`text-xs mt-1 ${isFinal ? "text-amber-700" : "text-purple-700"}`}>
                  of {heroStats.weeksTotal.toLocaleString()}
                </div>
              </div>

              {/* Weeks Remaining */}
              <div className={`rounded-2xl p-5 border-2 ${
                isFinal 
                  ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" 
                  : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Clock className={`w-5 h-5 ${isFinal ? "text-amber-600" : "text-emerald-600"}`} />
                  <span className={`text-xs font-semibold ${isFinal ? "text-amber-700" : "text-emerald-700"}`}>
                    WEEKS
                  </span>
                </div>
                <div className={`text-3xl font-bold tabular-nums ${isFinal ? "text-amber-900" : "text-emerald-900"}`}>
                  {heroStats.weeksRemaining.toLocaleString()}
                </div>
                <div className={`text-xs mt-1 ${isFinal ? "text-amber-700" : "text-emerald-700"}`}>
                  Remaining
                </div>
              </div>
            </div>
          ) : (
            /* Placeholder when no DOB set */
            <div className="text-center py-12 px-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 font-medium mb-1">Set your birth date below to begin</p>
              <p className="text-sm text-slate-500">Your life stats will appear here</p>
            </div>
          )}

          {/* Tool Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className={`text-xs font-semibold ${isFinal ? "text-amber-700" : "text-slate-600"}`}>
              13 TOOLS:
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              🧭 Values
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              ⏱️ Time
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              💭 Memory
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              📜 Legacy
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
              🔮 Reflection
            </span>
          </div>
        </header>

        {/* Core Content */}
        <Card className="shadow-md">
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date of Birth Input */}
            <div className="space-y-2">
              <Label htmlFor="dob" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date of Birth
              </Label>
              <Input 
                id="dob" 
                type="date" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            {/* Lifespan Input */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Hourglass className="w-4 h-4" /> Desired Lifespan (years)
              </Label>
              <div className="flex items-center gap-3">
                <Slider
                  min={40}
                  max={120}
                  step={1}
                  value={[lifespan]}
                  onValueChange={(v) => setLifespan(v[0])}
                  className="w-full"
                />
                <Input
                  type="number"
                  className="w-24"
                  value={lifespan}
                  onChange={(e) => setLifespan(parseInt(e.target.value || "0", 10))}
                />
              </div>
              <p className="text-xs text-gray-500">
                Tip: 80–90 years is common in planning exercises; choose your own horizon.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Life Stats */}
        {life && (
          <Card className="shadow-md">
            <CardContent className="space-y-4">
              <h2 className="font-semibold">Life Progress</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Years left" value={yearsLeftLabel} />
                <Stat label="Seconds left" value={secondsLeft?.toLocaleString()} />
                <Stat label="Target date" value={endDate?.toLocaleDateString()} />
                <Stat label="Exact countdown" value={exactCountdown} />
              </div>
              {dobDate && endDate && (
                <FinalDecadeBand dob={dobDate} endDate={endDate} now={now} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Philosophy and Components */}
        <PhilosophyCard />
        <DegreesOfSelfSpiral />
        <MortalsChime />
        <MoodTracker />
        <EmotionHeatmap days={30} />
        <WeeklyMoodSummary />
        <MemoryCapsule />
        <MortalityCurves />
        <ExistenceCurves isFinal={isFinal} />
        <StorylineArc />
        <LifeReviewTimeline />
        <DepartureJournal />
        <CircleInfluence isFinal={isFinal} />
        <EpitaphGenerator />
        <ValuesCompass accent={isFinal ? "gold" : "gray"} />
        <GratitudeLedger />
        <AskMortals />
        <WeeklySynthesis />

        {/* Reflections */}
        <Card className="shadow-sm">
          <CardContent>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4" /> Reflections
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
              {(isFinal ? finalDecadePrompts : standardPrompts).map((t, i) => (
                <li key={i} className={`rounded-xl px-3 py-2 border ${isFinal ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
                  • {t}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="text-xs text-gray-600 text-center">
          Built for gentle urgency. Your inputs and notes are saved locally in your browser.
        </div>
      </div>
    </div>
  );
}