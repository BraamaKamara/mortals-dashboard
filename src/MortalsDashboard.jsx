import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  AlertCircle, Calendar, CalendarDays, Clock, Hourglass, Heart, RefreshCcw,
  TimerReset, Zap, CheckCircle2, ListTodo, Plus, Trash2, BarChart2,
  Play, Pause, RotateCcw, Timer, Sparkles, NotebookText, Feather, Crown, Users,
  Upload, Download, X, BookText, Menu, Home, Target, Activity, Book, 
  MessageCircle, TrendingUp, Package, FileText, Star, ChevronDown, LogOut, User, BookOpen
} from "lucide-react";
import MortalsLogo from "./components/MortalsLogo";
import PhilosophyCard from "./components/PhilosophyCard";
import MoodTracker from "./components/MoodTracker";
import AboutPhilosophy from "./components/AboutPhilosophy";
import StillnessModal from "./components/StillnessModal";
import EmotionHeatmap from "./components/EmotionHeatmap";
import WeeklyMoodSummary from "./components/WeeklyMoodSummary";
import MortalsChime from "./components/MortalsChime";
import MortalityCurves from "./components/MortalityCurves";
import MemoryCapsule from "./components/MemoryCapsule";
import StorylineArc from "./components/StorylineArc";
import LifeReviewTimeline from "./components/LifeReviewTimeline";
import ValuesCompass from "./components/ValuesCompass";
import DepartureJournal from "./components/DepartureJournal";
import CircleInfluence from "./components/CircleInfluence";
import EpitaphGenerator from "./components/EpitaphGenerator";
import GratitudeLedger from "./components/GratitudeLedger";
import DailyWeeklyJars from "./components/DailyWeeklyJars_canonical";
import LifeReel from "./components/LifeReel";
import UserMenu from "./components/UserMenu";
import ProfileModal from "./components/ProfileModal";
import MirrorModeButton from "./components/MirrorModeButton";
import PresenceIndexModal from "./components/PresenceIndexModal";
import ContinuityTrackerModal from "./components/ContinuityTrackerModal";
import MoralPresenceModal from "./components/MoralPresenceModal";
import EthicalNudgeModal from "./components/EthicalNudgeModal";
import EthicalReflectionModal from "./components/EthicalReflectionModal";
import AIInsightsPanel from "./components/AIInsightsPanel";
import McMahanHub from "./components/McMahanHub";
import { aiService } from "./services/aiService";

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

function Stat({ label, value, icon, highlight = false }) {
  return (
    <div className={`rounded-2xl p-4 border transition-all duration-300 ${
      highlight 
        ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md" 
        : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm"
    }`}>
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
        {icon && <span className="text-sm flex items-center text-gray-600">{icon}</span>}
        <span className="font-medium">{label}</span>
      </div>
      <div className={`font-bold tabular-nums text-xl ${highlight ? "text-blue-700" : "text-gray-900"}`}>
        {value ?? "--"}
      </div>
    </div>
  );
}

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

function startOfYear(d) {
  const x = new Date(d);
  x.setMonth(0, 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfYear(d) {
  const x = new Date(d);
  x.setMonth(11, 31);
  x.setHours(23, 59, 59, 999);
  return x;
}

// Hook for handling localStorage state
function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
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
export default function MortalsDashboard({ onEnterMirror, currentUser, onLogout, onOpenEternalBoard }) {
  const [now, setNow] = useState(new Date());
  const [isStillnessOpen, setIsStillnessOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  
  // Reflection Suite Modals
  const [openModal, setOpenModal] = useState(null); // 'presence', 'continuity', 'moral-presence', 'nudges', 'ethical-reflection', null

  // AI Insights
  const [aiSummary, setAiSummary] = useState("");
  const [aiCached, setAiCached] = useState(false);
  const [aiUpdatedAt, setAiUpdatedAt] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // McMahan Hub
  const [isMcmahanHubOpen, setIsMcmahanHubOpen] = useState(false);

  // Core settings
  const [dob, setDob] = useLocalState("mortals.dob", "");
  const [lifespan, setLifespan] = useLocalState("mortals.lifespan", 80);
  const [lensOverride, setLensOverride] = useLocalState("mortals.lensOverride", "auto");
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  // Upcoming Events
  const [events, setEvents] = useLocalState("mortals.upcomingEvents", []);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [editingEventId, setEditingEventId] = useState(null);
  const [editingEventDate, setEditingEventDate] = useState("");

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
  // Full dashboard with all sections rendering below header

  // Time-related labels
  const secondsLeft = life ? Math.max(0, Math.floor(life.remain / 1000)) : null;
  const exactCountdown = life ? formatDuration(life.remain) : "";
  const yearsLeftLabel = useMemo(() => {
    if (!life) return "ΓÇö";
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

  // AI insights handler
  const handleGenerateInsights = async () => {
    setAiError("");
    setAiLoading(true);
    try {
      const response = await aiService.fetchInsights();
      setAiSummary(response.summary || "");
      setAiCached(!!response.cached);
      setAiUpdatedAt(response.created_at || new Date().toISOString());
    } catch (err) {
      setAiError(err.message || "Failed to generate insights");
    } finally {
      setAiLoading(false);
    }
  };

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

  // Micro-progress for current day/week/year
  const dayPct = useMemo(() => {
    const s = startOfDay(now); const e = endOfDay(now);
    return clamp01((now - s) / (e - s));
  }, [now]);
  const weekPct = useMemo(() => {
    const s = startOfWeek(now); const e = endOfWeek(now);
    return clamp01((now - s) / (e - s));
  }, [now]);
  const yearPct = useMemo(() => {
    const s = startOfYear(now); const e = endOfYear(now);
    return clamp01((now - s) / (e - s));
  }, [now]);

  // Upcoming events helpers
  const upcoming = useMemo(() => {
    const n = now.getTime();
    return (events || [])
      .map((e) => ({
        ...e,
        dateObj: new Date(e.date),
        createdAtObj: e.createdAt ? new Date(e.createdAt) : null,
      }))
      .filter((e) => e.dateObj.getTime() > n)
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 3);
  }, [events, now]);

  const addEvent = () => {
    if (!newEventName.trim() || !newEventDate) return;
    const ev = {
      id: Date.now(),
      name: newEventName.trim(),
      date: newEventDate,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [...(prev || []), ev]);
    setNewEventName("");
    setNewEventDate("");
  };

  const removeEvent = (id) => setEvents((prev) => (prev || []).filter((e) => e.id !== id));

  const eventPctRemaining = (e) => {
    // Use a 1-year ramp up to the event date so the donut meaningfully fills over time
    const end = e.dateObj.getTime();
    const WINDOW_MS = 365.25 * 24 * 3600 * 1000;
    const start = end - WINDOW_MS;
    const total = Math.max(1, end - start);
    const elapsed = now.getTime() - start;
    return clamp01(elapsed / total);
  };

  const eventTimeLeftLabel = (e) => {
    const ms = Math.max(0, e.dateObj.getTime() - now.getTime());
    // Show days if > 2 days else hh:mm:ss
    const days = Math.floor(ms / (24 * 3600 * 1000));
    if (days >= 2) return `${days} days left`;
    return `${formatDuration(ms)} left`;
  };

  const startEditEventDate = (ev) => {
    setEditingEventId(ev.id);
    setEditingEventDate((ev.date || "").slice(0, 10));
  };
  const saveEditEventDate = () => {
    if (!editingEventId || !editingEventDate) {
      setEditingEventId(null);
      setEditingEventDate("");
      return;
    }
    setEvents((prev) => (prev || []).map((e) => e.id === editingEventId ? { ...e, date: editingEventDate } : e));
    setEditingEventId(null);
    setEditingEventDate("");
  };
  const cancelEditEventDate = () => {
    setEditingEventId(null);
    setEditingEventDate("");
  };

  // Navigation sections
  const navSections = [
    { id: "dashboard", label: "Dashboard", icon: Home, ref: useRef(null) },
    { id: "tasks", label: "Daily Tasks", icon: Target, ref: useRef(null) },
    { id: "tracking", label: "Time Tracking", icon: Clock, ref: useRef(null) },
    { id: "reflection", label: "Reflection", icon: Feather, ref: useRef(null) },
    { id: "wisdom", label: "Wisdom & Insights", icon: Star, ref: useRef(null) },
    { id: "connections", label: "Connections", icon: Heart, ref: useRef(null) },
    { id: "memory", label: "Memory & Legacy", icon: Package, ref: useRef(null) },
    { id: "curves", label: "Mortality Curves", icon: Activity, ref: useRef(null) },
  ];

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const section = navSections.find(s => s.id === sectionId);
    if (section?.ref.current) {
      section.ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  // Profile modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState({ name: "", avatarEmoji: "", avatarImage: "" });

  const loadProfile = () => {
    try {
      const name = localStorage.getItem("mortals.profile.name") || currentUser?.username || "";
      const avatarEmoji = localStorage.getItem("mortals.profile.avatarEmoji") || "≡ƒò»∩╕Å";
      const avatarImage = localStorage.getItem("mortals.profile.avatarImage") || "";
      setProfile({ name, avatarEmoji, avatarImage });
    } catch {}
  };

  useEffect(() => {
    loadProfile();
    const handler = () => loadProfile();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  // Debug helper: log when profile modal toggles
  useEffect(() => {
    if (isProfileOpen) {
      console.log('[Profile] Modal opened');
    } else {
      console.log('[Profile] Modal closed');
    }
  }, [isProfileOpen]);

  // JSX for dashboard
  return (
    <div className={`${rootBg} min-h-screen`}>
      <div className="mx-auto max-w-6xl p-6 md:p-10 space-y-8">
        {/* Enhanced Hero Header */}
        <header className="space-y-6">
          {/* Title Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <MortalsLogo size={56} variant={isFinal ? "final" : "default"} className="drop-shadow-sm" />
              <div>
                <h1 className={`text-3xl md:text-4xl font-extrabold tracking-wider uppercase bg-clip-text text-transparent ${
                  isFinal
                    ? "bg-gradient-to-r from-amber-900 to-amber-600"
                    : "bg-gradient-to-r from-slate-900 to-slate-600"
                }`}>
                  MORTALS
                </h1>
                <p className={`text-xs md:text-sm ${isFinal ? "text-amber-700" : "text-slate-600"}`}>
                  A Dashboard for Mortality Awareness
                </p>
                {profile?.name && (
                  <p className={`mt-0.5 text-xs md:text-sm font-medium ${isFinal ? "text-amber-800" : "text-slate-700"}`}>
                    Hi, <span className="font-bold">{profile.name}</span>. Remember: this moment will never return.
                  </p>
                )}
              </div>
            </div>

            {/* Reflection Suite Buttons + User Menu */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
              <button
                onClick={() => setOpenModal('presence')}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-200 shadow hover:from-purple-200 hover:to-indigo-300 transition font-semibold text-sm"
                title="Open Reflection Suite - Presence"
              >
                <Heart size={18} className="text-purple-600" />
                <span className="hidden sm:inline">Presence</span>
              </button>

              <button
                onClick={() => setOpenModal('continuity')}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-green-200 shadow hover:from-emerald-200 hover:to-green-300 transition font-semibold text-sm"
                title="Open Reflection Suite - Continuity"
              >
                <TrendingUp size={18} className="text-emerald-600" />
                <span className="hidden sm:inline">Continuity</span>
              </button>

              <button
                onClick={() => setOpenModal('moral-presence')}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-rose-100 to-pink-200 shadow hover:from-rose-200 hover:to-pink-300 transition font-semibold text-sm"
                title="Open Reflection Suite - Moral Presence"
              >
                <Zap size={18} className="text-rose-600" />
                <span className="hidden sm:inline">Consciousness</span>
              </button>

              <button
                onClick={() => setOpenModal('nudges')}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-200 shadow hover:from-amber-200 hover:to-orange-300 transition font-semibold text-sm"
                title="Open Reflection Suite - Ethical Nudges"
              >
                <AlertCircle size={18} className="text-amber-600" />
                <span className="hidden sm:inline">Nudges</span>
              </button>

              <button
                onClick={() => setOpenModal('ethical-reflection')}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-violet-200 shadow hover:from-indigo-200 hover:to-violet-300 transition font-semibold text-sm"
                title="Open Reflection Suite - Ethical Reflection"
              >
                <Sparkles size={18} className="text-indigo-600" />
                <span className="hidden sm:inline">Reflect</span>
              </button>

              <MirrorModeButton active={false} onToggle={onEnterMirror} />

              <button
                onClick={() => setIsMcmahanHubOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-200 shadow hover:from-violet-200 hover:to-purple-300 transition font-semibold text-sm"
                title="Open McMahan Hub - Philosophy of Identity"
              >
                <BookOpen size={18} className="text-violet-600" />
                <span className="hidden sm:inline">McMahan</span>
              </button>

              <button
                onClick={onOpenEternalBoard}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 shadow hover:from-amber-200 hover:to-amber-300 transition font-semibold text-sm"
                title="Open Eternal Board - Share Your Wisdom"
              >
                <Sparkles size={18} className="text-amber-600" />
                <span className="hidden sm:inline">Eternal Board</span>
              </button>

              <UserMenu 
                onLogout={onLogout}
                onAbout={() => setIsAboutOpen(true)}
                onProfile={() => {
                  console.log('[Profile] Button clicked');
                  setIsProfileOpen(true);
                }}
                displayName={profile.name}
                avatarEmoji={profile.avatarEmoji}
                avatarImage={profile.avatarImage}
              />
            </div>
          </div>

          {/* Navigation Menu Dropdown */}
          {isMenuOpen && (
            <div className={`rounded-2xl border-2 p-4 shadow-xl ${
              isFinal 
                ? "bg-white border-amber-200" 
                : "bg-white border-indigo-200"
            }`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {navSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        activeSection === section.id
                          ? isFinal
                            ? "bg-gradient-to-r from-amber-100 to-amber-50 border-2 border-amber-400 text-amber-900 shadow-md"
                            : "bg-gradient-to-r from-indigo-100 to-indigo-50 border-2 border-indigo-400 text-indigo-900 shadow-md"
                          : isFinal
                            ? "bg-amber-50/50 border-2 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-300"
                            : "bg-indigo-50/50 border-2 border-indigo-200 text-indigo-800 hover:bg-indigo-100 hover:border-indigo-300"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-semibold">{section.label}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-600 italic">
                  Quick navigation to different sections of your mortality dashboard
                </p>
              </div>
            </div>
          )}

          {/* Philosophical Callout - Premium Compact */}
          <div className={`relative rounded-3xl overflow-hidden border-2 shadow-lg ${
            isFinal 
              ? "bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-amber-200/50" 
              : "bg-gradient-to-br from-purple-50 via-white to-indigo-50/30 border-purple-200/50"
          }`}>
            {/* Subtle decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1">
              <div className={`h-full ${
                isFinal 
                  ? "bg-gradient-to-r from-transparent via-amber-400 to-transparent" 
                  : "bg-gradient-to-r from-transparent via-purple-400 to-transparent"
              }`} />
            </div>

            {/* Content */}
            <div className="relative px-6 py-5 md:px-8 md:py-6">
              <div className="flex items-center justify-between gap-4">
                {/* Icon/Logo Side */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center ${
                    isFinal 
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30" 
                      : "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md shadow-purple-500/30"
                  }`}>
                    <Hourglass className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                </div>

                {/* Quote Text */}
                <div className="flex-1 text-left">
                  <p className={`text-sm md:text-base font-medium leading-snug mb-1 ${
                    isFinal ? "text-amber-900/80" : "text-purple-900/80"
                  }`}>
                    We are all mortal.
                  </p>
                  <p className={`text-base md:text-lg lg:text-xl font-bold leading-tight ${
                    isFinal 
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-orange-700 to-amber-800" 
                      : "text-transparent bg-clip-text bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-800"
                  }`}>
                    The question is: are we awake?
                  </p>
                </div>

                {/* Accent Element */}
                <div className="hidden md:flex flex-shrink-0 items-center gap-1.5">
                  <div className={`w-1.5 h-8 rounded-full ${
                    isFinal ? "bg-gradient-to-b from-amber-400 to-orange-500" : "bg-gradient-to-b from-purple-400 to-indigo-500"
                  }`} />
                  <div className={`w-1 h-6 rounded-full ${
                    isFinal ? "bg-gradient-to-b from-amber-300 to-orange-400" : "bg-gradient-to-b from-purple-300 to-indigo-400"
                  }`} />
                </div>
              </div>
            </div>

            {/* Bottom subtle glow */}
            <div className="absolute bottom-0 left-0 right-0 h-px">
              <div className={`h-full ${
                isFinal 
                  ? "bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" 
                  : "bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"
              }`} />
            </div>
          </div>

          {/* Life Reel Section - Visual Bridge from Philosophy to Reality */}
          <div className="space-y-4">
            {/* Contextual Introduction */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              <div className="flex items-center gap-3 px-4">
                <div className={`w-2 h-2 rounded-full ${
                  isFinal ? "bg-amber-500" : "bg-purple-500"
                }`} />
                <h2 className={`text-lg md:text-xl font-semibold ${
                  isFinal ? "text-amber-900" : "text-purple-900"
                }`}>
                  Your Life in Moments
                </h2>
                <div className={`w-2 h-2 rounded-full ${
                  isFinal ? "bg-amber-500" : "bg-purple-500"
                }`} />
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>
            
            {/* Life Reel Component */}
            <LifeReel isFinal={isFinal} />
            
            {/* Transition to Stats */}
            <div className="flex items-center gap-3 justify-center pt-2">
              <div className={`w-1 h-1 rounded-full ${
                isFinal ? "bg-amber-400" : "bg-purple-400"
              }`} />
              <div className={`w-1.5 h-1.5 rounded-full ${
                isFinal ? "bg-amber-500" : "bg-purple-500"
              }`} />
              <div className={`w-1 h-1 rounded-full ${
                isFinal ? "bg-amber-400" : "bg-purple-400"
              }`} />
            </div>
          </div>

          {/* Your Horizon - Life Setup Panel */}
          <Card
          className={`relative overflow-hidden rounded-3xl border-2 shadow-xl ${
            isFinal
              ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
              : "bg-gradient-to-br from-slate-50 to-violet-50 border-slate-200"
          }`}
        >
          {/* soft decorative glows */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl opacity-25 bg-purple-300" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 w-64 h-64 rounded-full blur-3xl opacity-20 bg-indigo-300" />
          <CardContent className="space-y-6">
            {/* Header copy */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] md:text-xs font-semibold uppercase tracking-wider 
                bg-white/60 backdrop-blur border-white/70 text-slate-700">
                <Hourglass className={`${isFinal ? "text-amber-600" : "text-indigo-600"} w-3.5 h-3.5`} />
                Your Horizon
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Set the frame of your life</h2>
              <p className="text-sm text-gray-600">Two choices shape everything you'll see here: when you began, and how long you intend to live.</p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date of Birth Input */}
              <div className="space-y-2">
                <Label htmlFor="dob" className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${isFinal ? "text-amber-700" : "text-purple-700"}`} />
                  <span className="font-semibold">Date of Birth</span>
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={`rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    isFinal
                      ? "border-amber-200 focus:ring-amber-400 focus:border-amber-300"
                      : "border-purple-200 focus:ring-purple-400 focus:border-purple-300"
                  }`}
                />
                <p className="text-xs text-gray-500">Stored only in your browser. Nothing leaves your device.</p>
              </div>

              {/* Lifespan Input */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Hourglass className={`w-4 h-4 ${isFinal ? "text-amber-700" : "text-purple-700"}`} />
                  <span className="font-semibold">Desired Lifespan (years)</span>
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
                    className="w-24 rounded-xl border-2 border-gray-200"
                    value={lifespan}
                    onChange={(e) => setLifespan(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                {/* quick picks */}
                <div className="flex flex-wrap gap-2">
                  {[70, 80, 90, 100].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setLifespan(y)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        lifespan === y
                          ? isFinal
                            ? "bg-amber-600 text-white border-amber-700"
                            : "bg-purple-600 text-white border-purple-700"
                          : isFinal
                            ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                            : "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
                      }`}
                    >
                      {y}y
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Tip: 80-90 years is common in planning exercises; choose your own horizon.</p>
              </div>
            </div>

            {/* Micro stats */}
            {(dobDate || endDate) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className={`rounded-xl px-3 py-2 border text-sm ${
                  isFinal ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <span className="opacity-70">Age: </span>
                  <span className="font-semibold">
                    {life ? (life.elapsed / (365.25 * 24 * 3600 * 1000)).toFixed(2) : "--"} yrs
                  </span>
                </div>
                <div className={`rounded-xl px-3 py-2 border text-sm ${
                  isFinal ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <span className="opacity-70">Target: </span>
                  <span className="font-semibold">{endDate ? endDate.toLocaleDateString() : "--"}</span>
                </div>
                <div className={`rounded-xl px-3 py-2 border text-sm ${
                  isFinal ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <span className="opacity-70">Weeks total: </span>
                  <span className="font-semibold">{heroStats ? heroStats.weeksTotal.toLocaleString() : "ΓÇö"}</span>
                </div>
              </div>
            )}

            {/* footer actions */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-500">You can change these anytime. The dashboard adapts instantly.</p>
              <button
                type="button"
                onClick={() => { setDob(""); setLifespan(80); }}
                className="text-xs font-semibold underline decoration-dotted text-gray-600 hover:text-gray-800"
                title="Reset to defaults"
              >
                Reset
              </button>
            </div>
          </CardContent>
        </Card>

          {/* Live Stats Grid */}
          {heroStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Life Lived */}
              <div className={`rounded-2xl p-5 border-2 ${
                isFinal 
                  ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" 
                  : "bg-gradient-to-br from-rose-50 to-red-50 border-rose-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Hourglass className={`w-5 h-5 ${isFinal ? "text-amber-600" : "text-rose-600"}`} />
                  <span className={`text-xs font-semibold ${isFinal ? "text-amber-700" : "text-rose-700"}`}>
                    LIFE
                  </span>
                </div>
                <div className={`text-3xl font-bold tabular-nums ${isFinal ? "text-amber-900" : "text-rose-900"}`}>
                  {(heroStats.lifePct * 100).toFixed(1)}%
                </div>
                <div className={`text-xs mt-1 ${isFinal ? "text-amber-700" : "text-rose-700"}`}>
                  Lived
                </div>
                {/* Mini progress bar */}
                <div className="mt-3 h-1.5 bg-white/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isFinal ? "bg-amber-600" : "bg-rose-600"}`}
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
              <p className="text-slate-700 font-medium mb-1">Set your birth date above to begin</p>
              <p className="text-sm text-slate-500">Your life stats will appear here</p>
            </div>
          )}
        </header>

        {/* AI Insights Panel */}
        <div className="mt-6">
          <AIInsightsPanel
            summary={aiSummary}
            cached={aiCached}
            lastUpdated={aiUpdatedAt}
            loading={aiLoading}
            error={aiError}
            onRefresh={handleGenerateInsights}
          />
        </div>

        

        {/* Life Stats - immersive now experience */}
        {life && (
          <Card className={`relative overflow-hidden rounded-3xl border-2 shadow-xl ${
            isFinal ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" : "bg-gradient-to-br from-white to-slate-50 border-slate-200"
          }`}>
            {/* ambient glows */}
            <div className="pointer-events-none absolute -top-10 right-0 w-72 h-72 rounded-full blur-3xl opacity-25 bg-blue-300" />
            <div className="pointer-events-none absolute bottom-0 -left-10 w-80 h-80 rounded-full blur-3xl opacity-20 bg-purple-300" />
            <CardContent className="space-y-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Heart className={`w-6 h-6 ${isFinal ? "text-amber-600" : "text-blue-600"}`} />
                    Life Progress
                  </h2>
                  <span className="text-xs text-gray-600">You are here, and time is moving.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                    isFinal ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-blue-50 text-blue-800 border-blue-200"
                  }`}>
                    {Math.round(life.pct * 100)}% Complete
                  </div>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      isFinal ? "border-amber-300 text-amber-800 hover:bg-amber-100" : "border-purple-300 text-purple-800 hover:bg-purple-100"
                    }`}
                    onClick={() => setIsStillnessOpen(true)}
                    title="Pause for 10s"
                  >
                    Pause 10s
                  </button>
                </div>
              </div>

              {/* Visual Progress Bar with 'now' marker */}
              <div className="space-y-2">
                <div className="relative h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                      isFinal ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" : "bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"
                    }`}
                    style={{ width: `${Math.min(life.pct * 100, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                  </div>
                  {/* now marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full ring-4 ring-white"
                    style={{ left: `${Math.min(life.pct * 100, 100)}%`, background: isFinal ? "#d97706" : "#4f46e5" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Birth: {dobDate?.toLocaleDateString()}</span>
                  <span className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      {now.toLocaleTimeString()}
                    </span>
                  </span>
                  <span>Target: {endDate?.toLocaleDateString()}</span>
                </div>
              </div>

              {/* Micro-moment dials */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{ label: "Today", pct: dayPct, hue: isFinal ? "#d97706" : "#6366f1" }, { label: "This Week", pct: weekPct, hue: isFinal ? "#b45309" : "#7c3aed" }, { label: "This Year", pct: yearPct, hue: isFinal ? "#92400e" : "#4f46e5" }].map((t) => (
                  <div key={t.label} className="flex items-center gap-4 rounded-2xl border bg-white/70 backdrop-blur px-4 py-3">
                    <div
                      className="shrink-0 w-14 h-14 rounded-full grid place-items-center"
                      style={{
                        background: `conic-gradient(${t.hue} ${Math.round(t.pct * 360)}deg, #e5e7eb 0deg)`
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-white grid place-items-center text-sm font-bold tabular-nums">
                        {Math.round(t.pct * 100)}%
                      </div>
                    </div>

                    {/* Removed embedded ProfileModal; single instance rendered globally */}
                    <div>
                      <div className="text-xs text-gray-500">{t.label}</div>
                      <div className="text-sm font-semibold text-gray-900">{Math.round(t.pct * 100)}% elapsed</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat
                  label="Years Remaining"
                  value={yearsLeftLabel}
                  icon={<Hourglass className="w-4 h-4 text-indigo-600" />}
                  highlight={true}
                />
                
                {/* Seconds Left */}
                <div className="rounded-2xl p-4 border transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300 hover:shadow-md">
                  <div className="flex items-center gap-2 text-xs text-purple-700 mb-1">
                    <Timer className="w-4 h-4" />
                    <span className="font-medium">Seconds Left</span>
                  </div>
                  <div className="font-bold tabular-nums text-xl text-purple-900">
                    {secondsLeft?.toLocaleString() ?? "--"}
                  </div>
                </div>

                {/* Target Date */}
                <div className="rounded-2xl p-4 border transition-all duration-300 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-300 hover:shadow-md">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 mb-1">
                    <CalendarDays className="w-4 h-4" />
                    <span className="font-medium">Target Date</span>
                  </div>
                  <div className="font-bold tabular-nums text-xl text-emerald-900">
                    {endDate?.toLocaleDateString() ?? "--"}
                  </div>
                </div>

                {/* Time Remaining */}
                <div className="rounded-2xl p-4 border transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300 hover:shadow-md">
                  <div className="flex items-center gap-2 text-xs text-amber-700 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Time Remaining</span>
                  </div>
                  <div className="font-bold tabular-nums text-xl text-amber-900">
                    {exactCountdown ?? "--"}
                  </div>
                </div>
              </div>

              {dobDate && endDate && (
                <FinalDecadeBand dob={dobDate} endDate={endDate} now={now} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events */}
        <Card className={`relative overflow-hidden rounded-3xl border-2 shadow-xl ${
          isFinal ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" : "bg-gradient-to-br from-white to-slate-50 border-slate-200"
        }`}>
          <CardContent className="space-y-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className={`${isFinal ? "text-amber-600" : "text-blue-600"} w-6 h-6`} />
                  Upcoming Events
                </h2>
                <span className="text-xs text-gray-600">Track time remaining to your next 3 milestones.</span>
              </div>
            </div>

            {/* Add event form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Event name (e.g., Anniversary)"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                className="md:col-span-1"
              />
              <Input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="md:col-span-1"
              />
              <button
                type="button"
                onClick={addEvent}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold border ${
                  isFinal ? "bg-amber-600 text-white border-amber-700 hover:bg-amber-700" : "bg-blue-600 text-white border-blue-700 hover:bg-blue-700"
                }`}
                title="Add event"
              >
                Add Event
              </button>
            </div>

            {/* Events grid */}
            {upcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcoming.map((e, idx) => {
                  const pct = eventPctRemaining(e);
                  const hue = isFinal ? ["#b45309", "#d97706", "#92400e"][idx % 3] : ["#6366f1", "#7c3aed", "#4f46e5"][idx % 3];
                  return (
                    <div key={e.id} className="flex items-center gap-4 rounded-2xl border bg-white/70 backdrop-blur px-4 py-3">
                      <div
                        className="shrink-0 w-16 h-16 rounded-full grid place-items-center"
                        style={{ background: `conic-gradient(${hue} ${Math.round(pct * 360)}deg, #e5e7eb 0deg)` }}
                        title={`${Math.round(pct * 100)}% to event`}
                      >
                        <div className="w-12 h-12 rounded-full bg-white grid place-items-center text-sm font-bold tabular-nums">
                          {Math.round(pct * 100)}%
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="truncate">
                            <div className="text-sm font-semibold text-gray-900 truncate">{e.name}</div>
                            {editingEventId === e.id ? (
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="date"
                                  value={editingEventDate}
                                  onChange={(ev) => setEditingEventDate(ev.target.value)}
                                  className="px-2 py-1 rounded-lg border border-gray-300 text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={saveEditEventDate}
                                  className="text-xs px-2 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditEventDate}
                                  className="text-xs px-2 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span>{new Date(e.date).toLocaleDateString()}</span>
                                <button
                                  type="button"
                                  onClick={() => startEditEventDate(e)}
                                  className="text-gray-400 hover:text-gray-700"
                                  title="Edit date"
                                >
                                  <Calendar className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEvent(e.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-700 mt-1">{eventTimeLeftLabel(e)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-600 italic">No upcoming events yet. Add one above.</div>
            )}
          </CardContent>
        </Card>

        {/* Philosophy and Components */}
        <div ref={navSections[0].ref}> {/* Dashboard */}
          <PhilosophyCard />
        </div>
        
        <div ref={navSections[1].ref}> {/* Daily Tasks */}
          <MortalsChime />
        </div>
        
        <div ref={navSections[2].ref}> {/* Time Tracking */}
          <MoodTracker />
          <EmotionHeatmap days={30} />
          <WeeklyMoodSummary />
        </div>
        
        <div ref={navSections[3].ref}> {/* Connections */}
          <GratitudeLedger />
          <CircleInfluence isFinal={isFinal} />
        </div>
        
        <div ref={navSections[6].ref}> {/* Memory & Legacy */}
          <MemoryCapsule />
          <LifeReviewTimeline />
          <DepartureJournal />
          <EpitaphGenerator />
          <StorylineArc />
        </div>
        
        <div ref={navSections[7].ref}> {/* Mortality Curves */}
          <MortalityCurves />
        </div>
        
        <ValuesCompass accent={isFinal ? "gold" : "gray"} />

        <div className="text-xs text-gray-600 text-center">
          Built for gentle urgency. Your inputs and notes are saved locally in your browser.
        </div>
      </div>

      {/* Profile Modal (single instance) */}
      <ProfileModal 
        open={isProfileOpen} 
        onClose={(res) => { 
          setIsProfileOpen(false); 
          if (res?.saved) loadProfile();
        }} 
        currentUser={currentUser} 
      />

      {/* About Philosophy Modal */}
      <AboutPhilosophy 
        open={isAboutOpen} 
        onClose={() => setIsAboutOpen(false)} 
      />
      
      {/* Reflection Suite Modals */}
      <PresenceIndexModal 
        isOpen={openModal === 'presence'} 
        onClose={() => setOpenModal(null)} 
      />
      <ContinuityTrackerModal 
        isOpen={openModal === 'continuity'} 
        onClose={() => setOpenModal(null)} 
      />
      <MoralPresenceModal 
        isOpen={openModal === 'moral-presence'} 
        onClose={() => setOpenModal(null)} 
      />
      <EthicalNudgeModal 
        isOpen={openModal === 'nudges'} 
        onClose={() => setOpenModal(null)} 
      />
      <EthicalReflectionModal 
        isOpen={openModal === 'ethical-reflection'} 
        onClose={() => setOpenModal(null)} 
      />
      
      <StillnessModal open={isStillnessOpen} onClose={() => setIsStillnessOpen(false)} seconds={10} />
      
      {/* McMahan Hub Modal */}
      <McMahanHub isOpen={isMcmahanHubOpen} onClose={() => setIsMcmahanHubOpen(false)} />
    </div>
  );
}
