import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Clock, Heart, Target, BookOpen, Users, Hourglass, Sparkles, X, CheckCircle, RotateCcw } from "lucide-react";

const YEAR_MS = 365.25 * 24 * 3600 * 1000;
const WEEK_MS = 7 * 24 * 3600 * 1000;
const MIN_SCREEN_TIME = 3000;

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

export default function PhilosophicalMirror({ onExit }) {
  const [screen, setScreen] = useState(0);
  const [canProgress, setCanProgress] = useState(false);
  const [commitment, setCommitment] = useState("");
  const [time, setTime] = useState(new Date());
  const [weeksView, setWeeksView] = useState("fit"); // 'fit' or 'year'
  const monthsAreaRef = useRef(null);
  const [monthCellSize, setMonthCellSize] = useState(12);
  const [milestoneVersion, setMilestoneVersion] = useState(0);

  const mirrorData = useMemo(() => {
    const data = {
      dob: null,
      age: null,
      lifePct: 0,
      lifespanYears: 0,
      weeksLived: 0,
      weeksRemaining: 0,
      weeksTotal: 0,
      values: [],
      valuesAlignment: [],
      timeSpent: [],
      totalTimeTracked: 0,
      epitaph: "",
      circleSize: 0,
      circleInner: [],
      circleMiddle: [],
      circleOuter: [],
      capsules: 0,
      milestones: {
        all: [],
        achieved: [],
        ahead: [],
        notYet: []
      }
    };

    try {
      // Parse DOB and lifespan from localStorage (stored as JSON by useLocalState hook)
      let dobStr = "";
      let lifespan = 80;
      
      try {
        const dobRaw = localStorage.getItem("mortals.dob");
        dobStr = dobRaw ? JSON.parse(dobRaw) : "";
      } catch {
        dobStr = localStorage.getItem("mortals.dob") || "";
      }
      
      try {
        const lifespanRaw = localStorage.getItem("mortals.lifespan");
        lifespan = lifespanRaw ? JSON.parse(lifespanRaw) : 80;
      } catch {
        lifespan = Number(localStorage.getItem("mortals.lifespan") || 80);
      }
      data.lifespanYears = Number.isFinite(lifespan) ? lifespan : 80;
      
      if (dobStr) {
        const dobDate = new Date(dobStr + "T00:00:00");
        const endDate = addYears(dobDate, lifespan);
        const now = new Date();
        
  const total = Math.max(0, endDate - dobDate);
  const elapsed = Math.max(0, now - dobDate);
        
        data.dob = dobDate;
  data.age = Math.floor(elapsed / YEAR_MS);
  data.lifePct = total > 0 ? Math.min(1, Math.max(0, elapsed / total)) : 0;
  data.weeksLived = Math.floor(elapsed / WEEK_MS);
  data.weeksTotal = Math.floor(total / WEEK_MS);
  data.weeksRemaining = Math.max(0, data.weeksTotal - data.weeksLived);
      }

      const valuesNames = JSON.parse(localStorage.getItem("mortals.values.names") || '["Truth","Generosity","Courage"]');
      data.values = valuesNames.filter(Boolean);

      const alignment = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const dayData = JSON.parse(localStorage.getItem(`mortals.values.check.${key}`) || '{}');
        
        data.values.forEach(v => {
          if (!alignment[v]) alignment[v] = { yes: 0, partial: 0, no: 0, total: 0 };
          const status = dayData[v] ?? 0;
          alignment[v].total++;
          if (status === 2) alignment[v].yes++;
          else if (status === 1) alignment[v].partial++;
          else alignment[v].no++;
        });
      }
      
      data.valuesAlignment = data.values.map(v => {
        const a = alignment[v];
        const totalChecks = a ? a.total : 0;
        const score = a && totalChecks > 0 ? ((a.yes + a.partial * 0.5) / totalChecks) : 0;
        return {
          name: v,
          score,
          checked: totalChecks
        };
      });

      const timeByTag = {};
      let totalMinutes = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const entries = JSON.parse(localStorage.getItem(`mortals.ledger.${key}`) || '[]');
        
        entries.forEach(e => {
          const tag = e.tag || "Unlabeled";
          const mins = Number(e.minutes) || 0;
          timeByTag[tag] = (timeByTag[tag] || 0) + mins;
          totalMinutes += mins;
        });
      }
      
      const totalHours = totalMinutes / 60;
      data.totalTimeTracked = totalHours;
      data.timeSpent = Object.entries(timeByTag)
        .map(([tag, mins]) => ({ 
          tag, 
          hours: (mins / 60).toFixed(1),
          minutes: mins,
          percentage: totalMinutes > 0 ? ((mins / totalMinutes) * 100).toFixed(0) : 0
        }))
        .sort((a, b) => b.minutes - a.minutes);

      const year = new Date().getFullYear();
      const epitaphData = localStorage.getItem(`mortals.epitaph.${year}`);
      if (epitaphData) {
        try {
          const parsed = JSON.parse(epitaphData);
          data.epitaph = parsed.text || "";
        } catch {
          data.epitaph = epitaphData || "";
        }
      }

      const circleData = JSON.parse(localStorage.getItem("mortals.influence.contacts") || '[]');
      data.circleSize = circleData.length;
      data.circleInner = circleData.filter(c => c.ring === 1);
      data.circleMiddle = circleData.filter(c => c.ring === 2);
      data.circleOuter = circleData.filter(c => c.ring === 3);

      // Milestones from Storyline Arc
      const milestonesData = JSON.parse(localStorage.getItem("mortals.milestones") || '[]');
      const currentAge = Number.isFinite(data.age) ? data.age : 0;
      const achieved = milestonesData.filter(m => m && m.achieved === true);
      const ahead = milestonesData
        .filter(m => m && m.achieved !== true && Number(m.age) > currentAge)
        .sort((a,b)=> Number(a.age) - Number(b.age));
      const notYet = milestonesData
        .filter(m => m && m.achieved !== true && Number(m.age) <= currentAge)
        .sort((a,b)=> Number(b.age) - Number(a.age));
      data.milestones = { all: milestonesData, achieved, ahead, notYet };

      const capsuleKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("mortals.capsule.")) capsuleKeys.push(key);
      }
      data.capsules = capsuleKeys.length;

    } catch (e) {
      console.error("Error loading mirror data:", e);
    }

    return data;
  }, [milestoneVersion]);

  // Milestone status helpers
  const writeMilestones = (next) => {
    try {
      localStorage.setItem("mortals.milestones", JSON.stringify(next));
      setMilestoneVersion(v => v + 1);
    } catch {}
  };

  const markMilestone = (milestone, achieved=true) => {
    try {
      const list = JSON.parse(localStorage.getItem("mortals.milestones") || '[]');
      const idx = list.findIndex(m => m && (m.id === milestone.id || (m.title === milestone.title && Number(m.age) === Number(milestone.age))));
      if (idx >= 0) {
        list[idx] = { ...list[idx], achieved, achievedAt: achieved ? new Date().toISOString() : undefined };
        writeMilestones(list);
      }
    } catch {}
  };

  const nextScreen = () => {
    if (!canProgress) return;
    if (screen < 6) {
      setScreen(screen + 1);
      setCanProgress(false);
    } else {
      if (commitment.trim()) {
        try {
          const key = `mortals.mirror.commitment.${new Date().toISOString().slice(0, 10)}`;
          localStorage.setItem(key, commitment);
        } catch {}
      }
      onExit();
    }
  };

  const prevScreen = () => {
    if (screen > 0) {
      setScreen(screen - 1);
      setCanProgress(true);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        nextScreen();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevScreen();
      } else if (e.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [screen, canProgress, commitment]);

  useEffect(() => {
    setCanProgress(false);
    const timer = setTimeout(() => setCanProgress(true), MIN_SCREEN_TIME);
    return () => clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const reflectionQuestion = useMemo(() => {
    const lowAlignment = mirrorData.valuesAlignment.find(v => v.score < 0.5);
    if (lowAlignment && lowAlignment.checked > 0) {
      return `Your value "${lowAlignment.name}" shows low alignment this week. What specific action will you take to honor it in the next 7 days?`;
    }
    if (!mirrorData.epitaph) {
      return "You haven't written your epitaph yet. If life ended today, what would you want to be remembered for?";
    }
    if (mirrorData.circleSize === 0) {
      return "Your Circle of Influence is empty. Who is one person you want to impact or reconnect with this week?";
    }
    if (mirrorData.timeSpent.length > 0) {
      return `You spent ${mirrorData.timeSpent[0].hours} hours on "${mirrorData.timeSpent[0].tag}" this week. Is this aligned with your deepest priorities?`;
    }
    return "Looking at your life data, what is one thing you will do differently this week to live more intentionally?";
  }, [mirrorData]);

  // Compute weeks grid layout so that ALL life dots fit within a fixed-height box
  const weeksGrid = useMemo(() => {
    const total = mirrorData.weeksTotal || 0;
    if (total <= 0) return { columns: 0, rows: 0 };
    if (weeksView === "year") {
      const columns = 52;
      const rows = Math.max(1, Math.ceil(total / columns));
      return { columns, rows };
    }
    // Fit view: aim for ~24 rows to create a dense field
    const rows = 24;
    const columns = Math.max(12, Math.ceil(total / rows));
    return { columns, rows };
  }, [mirrorData.weeksTotal, weeksView]);

  const finalDecadeStartIndex = useMemo(() => {
    const total = mirrorData.weeksTotal || 0;
    return Math.max(0, total - 520);
  }, [mirrorData.weeksTotal]);

  const screens = [
    <motion.div
      key="mirror"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="mb-12"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-6xl border-4 border-slate-500">
          🪞
        </div>
      </motion.div>
      
      <h1 className="text-5xl md:text-6xl font-bold mb-6">The Mirror</h1>
      <p className="text-xl text-slate-300 mb-4">Look closely. This is who you are right now.</p>
      
      <div className="mt-12 space-y-6 text-center">
        <div className="text-6xl md:text-7xl font-bold tabular-nums">{time.toLocaleTimeString()}</div>
        {mirrorData.dob ? (
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-bold text-slate-300">
              Age {Number.isFinite(mirrorData.age) ? mirrorData.age : "—"}
            </div>
            <div className="text-4xl md:text-5xl font-bold text-slate-400">
              {Number.isFinite(mirrorData.lifePct) ? (mirrorData.lifePct * 100).toFixed(1) : "—"}% of life lived
            </div>
          </div>
        ) : (
          <div className="text-lg text-slate-400">
            Set your Date of Birth in the dashboard to unlock life stats
          </div>
        )}
      </div>
    </motion.div>,

    <motion.div
      key="time"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-900 text-white px-6 py-12"
    >
      <Clock className="w-20 h-20 mb-8 text-blue-300" />
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Time Spent</h1>
      <p className="text-lg text-blue-200 mb-8 max-w-2xl text-center">
        168 hours in a week. This is how you spent yours.
      </p>

      {mirrorData.timeSpent.length > 0 ? (
        <>
          {/* Total tracked time */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 text-center"
          >
            <div className="text-6xl md:text-7xl font-bold text-blue-300 mb-2">
              {mirrorData.totalTimeTracked.toFixed(0)}h
            </div>
            <div className="text-lg text-blue-400">
              of {168} hours tracked ({((mirrorData.totalTimeTracked / 168) * 100).toFixed(0)}% of your week)
            </div>
          </motion.div>

          {/* Time breakdown with visual bars */}
          <div className="space-y-3 w-full max-w-2xl mb-8">
            {mirrorData.timeSpent.slice(0, 8).map((item, i) => (
              <motion.div
                key={item.tag}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-blue-200">{item.tag}</span>
                  <span className="text-blue-300 tabular-nums">
                    {item.hours}h ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-blue-950/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-400"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Reflection prompts */}
          <div className="max-w-xl space-y-4">
            {mirrorData.timeSpent[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-4 bg-blue-800/30 rounded-xl border border-blue-700/50 text-center"
              >
                <p className="text-blue-200 italic">
                  You spent the most time on <span className="font-bold text-blue-100">"{mirrorData.timeSpent[0].tag}"</span>. 
                  Is this what you want to be known for?
                </p>
              </motion.div>
            )}
            
            {mirrorData.totalTimeTracked < 84 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="p-4 bg-amber-900/30 rounded-xl border border-amber-700/50 text-center"
              >
                <p className="text-amber-200">
                  You tracked less than half your week. 
                  <span className="block mt-1 font-medium">Where did the other {(168 - mirrorData.totalTimeTracked).toFixed(0)} hours go?</span>
                </p>
              </motion.div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center text-blue-300 space-y-4">
          <div className="text-2xl italic mb-4">No time logged yet.</div>
          <div className="max-w-md mx-auto p-6 bg-blue-800/30 rounded-xl border border-blue-700">
            <p className="text-blue-200">
              Start using the <span className="font-bold">Gratitude Ledger</span> to track how you spend your days.
            </p>
            <p className="text-sm text-blue-400 mt-2">
              You can't manage what you don't measure.
            </p>
          </div>
        </div>
      )}

      <p className="mt-12 text-blue-400 text-center max-w-lg italic text-sm">
        "The way we spend our time defines who we are." — Jonathan Estrin
      </p>
    </motion.div>,

    <motion.div
      key="values"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 text-white px-6"
    >
      <Target className="w-20 h-20 mb-8 text-purple-300" />
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Values Lived</h1>
      <p className="text-lg text-purple-200 mb-12 max-w-2xl text-center">
        Do your days reflect your values?
      </p>

      <div className="space-y-6 w-full max-w-lg">
        {mirrorData.valuesAlignment.map((v, i) => (
          <motion.div
            key={v.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">{v.name}</span>
              <span className="text-2xl font-bold tabular-nums">
                {(v.score * 100).toFixed(0)}%
                {v.score < 0.5 && " ⚠️"}
                {v.score >= 0.8 && " ✓"}
              </span>
            </div>
            <div className="h-3 bg-purple-950/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${v.score * 100}%` }}
                transition={{ duration: 1, delay: i * 0.2 + 0.3 }}
                className={`h-full ${
                  v.score < 0.5 ? "bg-red-500" : v.score < 0.8 ? "bg-yellow-500" : "bg-emerald-500"
                }`}
              />
            </div>
            <div className="text-xs text-purple-300">
              {v.checked} of 7 days checked
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-12 text-purple-300 text-center max-w-lg italic">
        "The gaps between who you say you are and who you actually are—these are where awareness grows."
      </p>
    </motion.div>,

    <motion.div
      key="legacy"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-amber-900 text-white px-6 py-12"
    >
      <Sparkles className="w-20 h-20 mb-8 text-amber-300" />
      <h1 className="text-4xl md:text-5xl font-bold mb-4">What You're Building</h1>
      <p className="text-lg text-amber-200 mb-10 max-w-2xl text-center">
        Your legacy isn't what you leave behind—it's what you build while you're here.
      </p>

      <div className="w-full max-w-4xl space-y-8">
        {/* Epitaph Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-amber-300" />
            <h2 className="text-2xl font-bold">Your Final Words</h2>
          </div>
          {mirrorData.epitaph ? (
            <div className="p-6 bg-amber-950/50 rounded-xl border border-amber-800">
              <p className="text-xl italic text-amber-100 leading-relaxed">
                "{mirrorData.epitaph}"
              </p>
              <div className="mt-3 text-sm text-amber-400">
                ✓ Written · This is how you want to be remembered
              </div>
            </div>
          ) : (
            <div className="p-6 bg-amber-950/30 rounded-xl border border-amber-700/50">
              <p className="text-amber-300 italic">No epitaph yet.</p>
              <p className="text-sm text-amber-400 mt-2">
                What do you want carved into the world's memory?
              </p>
            </div>
          )}
        </motion.div>

        {/* Circle of Influence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-amber-300" />
            <h2 className="text-2xl font-bold">People You Touch</h2>
          </div>
          
          {mirrorData.circleSize > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-amber-950/50 rounded-xl border border-amber-800 text-center">
                  <div className="text-3xl font-bold text-amber-200">{mirrorData.circleInner.length}</div>
                  <div className="text-xs text-amber-400 mt-1">Inner Circle</div>
                </div>
                <div className="p-4 bg-amber-950/40 rounded-xl border border-amber-700 text-center">
                  <div className="text-3xl font-bold text-amber-300">{mirrorData.circleMiddle.length}</div>
                  <div className="text-xs text-amber-400 mt-1">Middle Circle</div>
                </div>
                <div className="p-4 bg-amber-950/30 rounded-xl border border-amber-600 text-center">
                  <div className="text-3xl font-bold text-amber-400">{mirrorData.circleOuter.length}</div>
                  <div className="text-xs text-amber-400 mt-1">Outer Circle</div>
                </div>
              </div>

              {/* Inner Circle Names */}
              {mirrorData.circleInner.length > 0 && (
                <div className="p-4 bg-amber-950/50 rounded-xl border border-amber-800">
                  <div className="text-sm font-medium text-amber-300 mb-2">Your Inner Circle:</div>
                  <div className="flex flex-wrap gap-2">
                    {mirrorData.circleInner.slice(0, 8).map((person, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="px-3 py-1 bg-amber-800/50 rounded-full text-sm text-amber-100"
                      >
                        {person.name}
                      </motion.div>
                    ))}
                    {mirrorData.circleInner.length > 8 && (
                      <div className="px-3 py-1 text-sm text-amber-400">
                        +{mirrorData.circleInner.length - 8} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-amber-400 italic">
                {mirrorData.circleSize} {mirrorData.circleSize === 1 ? "life" : "lives"} you're actively shaping
              </div>
            </div>
          ) : (
            <div className="p-6 bg-amber-950/30 rounded-xl border border-amber-700/50">
              <p className="text-amber-300 italic">Your circle is empty.</p>
              <p className="text-sm text-amber-400 mt-2">
                Legacy lives in the hearts you touch. Who matters to you?
              </p>
            </div>
          )}
        </motion.div>

        {/* Memory Capsules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-amber-300" />
            <h2 className="text-2xl font-bold">Moments Preserved</h2>
          </div>
          
          {mirrorData.capsules > 0 ? (
            <div className="p-6 bg-amber-950/50 rounded-xl border border-amber-800 text-center">
              <div className="text-5xl font-bold text-amber-200 mb-2">{mirrorData.capsules}</div>
              <p className="text-amber-400">
                {mirrorData.capsules === 1 ? "memory capsule" : "memory capsules"} saved
              </p>
              <p className="text-xs text-amber-500 mt-3">
                Fragments of joy, frozen in time
              </p>
            </div>
          ) : (
            <div className="p-6 bg-amber-950/30 rounded-xl border border-amber-700/50">
              <p className="text-amber-300 italic">No memories captured yet.</p>
              <p className="text-sm text-amber-400 mt-2">
                What moments do you want to remember forever?
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Reflection prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-10 max-w-2xl"
      >
        <div className="p-6 bg-amber-800/30 rounded-xl border border-amber-700/50 text-center">
          <p className="text-amber-100 text-lg italic">
            {mirrorData.epitaph && mirrorData.circleSize > 0 && mirrorData.capsules > 0
              ? "You are building a life worth remembering."
              : mirrorData.circleSize === 0 && !mirrorData.epitaph
              ? "A legacy isn't built in isolation. Start with the words you want remembered, and the people who matter."
              : mirrorData.circleSize === 0
              ? "Beautiful words mean nothing without people to carry them forward."
              : !mirrorData.epitaph
              ? "You're touching lives. But what do you want them to remember?"
              : "You're building something. Keep going."}
          </p>
        </div>
      </motion.div>

      <p className="mt-8 text-amber-400/70 text-center max-w-lg italic text-sm">
        "We die twice. Once when we stop breathing, and again when someone says our name for the last time."
      </p>
    </motion.div>,

    <motion.div
      key="weeks"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white px-6 py-12"
    >
      {mirrorData.weeksTotal > 0 ? (
        <>
          {/* Skull/Death imagery */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Hourglass className="w-20 h-20 text-red-500 opacity-80" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-red-400">Time You Have Left</h1>
          <p className="text-base text-red-300/80 mb-8 max-w-xl text-center">
            Not years. Not months. Weeks. Each one vanishes, never to return.
          </p>

          {/* The terrifying number */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 text-center"
          >
            <div className="text-9xl md:text-[12rem] font-black tabular-nums text-red-500 leading-none mb-3">
              {Number.isFinite(mirrorData.weeksRemaining) ? mirrorData.weeksRemaining.toLocaleString() : "—"}
            </div>
            <div className="text-2xl text-red-400/80">weeks</div>
          </motion.div>

          {/* Time breakdown - making it concrete */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 space-y-2 text-center"
          >
            <div className="text-lg text-red-300">
              That's roughly <span className="font-bold text-red-400">{Math.floor(mirrorData.weeksRemaining / 52)}</span> years
            </div>
            <div className="text-lg text-red-300">
              Or about <span className="font-bold text-red-400">{Math.floor(mirrorData.weeksRemaining * 7)}</span> days
            </div>
            <div className="text-sm text-red-400/60 mt-3">
              {mirrorData.weeksLived.toLocaleString()} weeks already gone forever
            </div>
          </motion.div>

          {/* Stark visualization - limited view */}
          {/* View toggle */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={() => setWeeksView("fit")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                weeksView === "fit" ? "bg-red-600 text-white" : "bg-white/10 text-red-300 hover:bg-white/20"
              }`}
            >
              Weeks view
            </button>
            <button
              onClick={() => setWeeksView("year")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                weeksView === "year" ? "bg-red-600 text-white" : "bg-white/10 text-red-300 hover:bg-white/20"
              }`}
            >
              Years view
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="w-full max-w-4xl mb-8"
          >
            <div className="p-6 bg-black/50 rounded-xl border-2 border-red-900/50">
              <div className="text-sm text-red-400/80 mb-3 text-center">
           {weeksView === 'year' ? 'Each box = 1 month. Gray = lived. Red = remaining.' : 'Each dot = 1 week. Gray = lived. Red = remaining.'}
              </div>
              
              {/* Fixed height; compute cell size so ALL dots fit */}
              <div ref={monthsAreaRef} className={`${weeksView === 'year' ? 'h-[50vh] bg-slate-900/80 rounded-xl p-4' : 'h-48'} overflow-hidden relative flex items-center justify-center`}>
                {weeksView === 'year' ? (() => {
                  // Months grid: 12 rows (months) x N columns (years)
                  const years = mirrorData.lifespanYears || 80;
                  const totalMonths = years * 12;
                  const livedMonths = Math.floor(mirrorData.weeksLived / 4.345); // avg weeks per month
                  const currentMonthIndex = Math.max(0, Math.min(totalMonths - 1, livedMonths));
                  const finalYearStart = Math.max(0, totalMonths - 12);
                  
                  if (totalMonths === 0) {
                    return <div className="text-center text-red-400">No months to display. Check lifespan setting.</div>;
                  }
                  
                  // Compute responsive month cell size so all fit without scrolling
                  // Now: years columns, 12 rows
                  const gap = 2; // px
                  const area = monthsAreaRef.current;
                  let cell = monthCellSize;
                  if (area) {
                    const availW = area.clientWidth - 8;
                    const availH = area.clientHeight - 8;
                    const maxWCell = Math.floor((availW - (years - 1) * gap) / years);
                    const maxHCell = Math.floor((availH - (12 - 1) * gap) / 12);
                    cell = Math.max(2, Math.min(maxWCell, maxHCell));
                    if (cell !== monthCellSize) setMonthCellSize(cell);
                  }
                  
                  // Build grid: month m, year y -> index = y * 12 + m
                  let cells = [];
                  for (let m = 0; m < 12; m++) {
                    for (let y = 0; y < years; y++) {
                      const i = y * 12 + m;
                      const year = y + 1;
                      const month = m + 1;
                      const isCurrent = i === currentMonthIndex;
                      const isFinalYear = i >= finalYearStart;
                      const tooltip = `Year ${year}, Month ${month} — ${i < livedMonths ? 'lived' : 'remaining'}${isCurrent ? ' (current)' : ''}${isFinalYear ? ' (final year)' : ''}`;
                      cells.push(
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + (i * 0.0004) }}
                          className={`rounded-[2px] ${
                            i < livedMonths 
                              ? 'bg-slate-600/60 opacity-60' 
                              : 'bg-red-600 opacity-90'
                          } ${isFinalYear ? 'ring-1 ring-amber-400/50' : ''} ${isCurrent ? 'ring-2 ring-amber-300' : ''}`}
                          whileHover={{ scale: 1.08 }}
                          title={tooltip}
                        />
                      );
                    }
                  }
                  
                  return (
                    <div
                      className="grid gap-[2px] justify-center"
                      style={{ gridTemplateColumns: `repeat(${years}, ${cell}px)`, gridAutoRows: `${cell}px` }}
                    >
                      {cells}
                    </div>
                  );
                })() : (() => {
                  // Fit view (weeks): add a pin for the current week
                  const total = mirrorData.weeksTotal;
                  const lived = mirrorData.weeksLived;
                  const cols = weeksGrid.columns;
                  const currentWeekIndex = Math.min(Math.max(0, lived), Math.max(0, total - 1));
                  let indices = Array.from({ length: total }, (_, i) => i);
                  return (
                    <div
                      className="grid gap-[2px] w-full"
                      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                    >
                      {indices.map((i) => {
                        const isCurrent = i === currentWeekIndex;
                        const inFinalDecade = i >= finalDecadeStartIndex;
                        const livedClass = i < lived ? 'bg-slate-600/60 opacity-60' : 'bg-red-600 opacity-90';
                        const ringClass = inFinalDecade ? 'ring-1 ring-amber-400/60' : '';
                        const title = `Week ${i + 1} of ${total} — ${i < lived ? 'lived' : 'remaining'}${inFinalDecade ? ' (final decade)' : ''}${isCurrent ? ' (current week)' : ''}`;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 + (i * 0.0004) }}
                            className={`relative w-full aspect-square rounded-[2px] ${livedClass} ${ringClass}`}
                            whileHover={{ scale: 1.08 }}
                            title={title}
                          >
                            {isCurrent && (
                              <div className="pointer-events-none absolute inset-0 rounded-[2px] ring-2 ring-cyan-300" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-red-300">
                <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-slate-600/60 rounded-[2px]"></span> Lived</div>
                <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-red-600 rounded-[2px]"></span> Remaining</div>
              </div>
            </div>
          </motion.div>

          {/* Harsh truths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="max-w-xl space-y-4"
          >
            <div className="p-5 bg-red-950/40 rounded-xl border border-red-900/50 text-center">
              <p className="text-red-300 text-lg leading-relaxed">
                <span className="font-bold text-red-400">This number only goes down.</span>
                <br />
                <span className="text-base">Every week that passes is erased from existence.</span>
              </p>
            </div>

            {mirrorData.weeksRemaining < 2000 && (
              <div className="p-5 bg-red-900/30 rounded-xl border border-red-800/50 text-center">
                <p className="text-red-400 font-medium">
                  Less than 2,000 weeks left.
                </p>
                <p className="text-sm text-red-300 mt-2">
                  That's fewer weeks than most people have lived through already.
                </p>
              </div>
            )}

            {mirrorData.weeksRemaining < 1000 && (
              <div className="p-5 bg-red-900/50 rounded-xl border border-red-800 text-center animate-pulse">
                <p className="text-red-300 font-bold text-xl">
                  ⚠ Under 1,000 weeks
                </p>
                <p className="text-sm text-red-400 mt-2">
                  This is the final stretch. Every moment counts now.
                </p>
              </div>
            )}
          </motion.div>

          {/* The confrontation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-10 max-w-2xl"
          >
            <div className="p-6 bg-black/60 rounded-xl border border-red-900/70 text-center">
              <p className="text-red-200 text-xl italic leading-relaxed">
                "What will you do with what remains?"
              </p>
            </div>
          </motion.div>

          <p className="mt-8 text-red-500/50 text-center max-w-lg italic text-xs">
            "We are always getting ready to live, but never living." — Ralph Waldo Emerson
          </p>
        </>
      ) : (
        <div className="max-w-xl text-center text-red-300 space-y-4">
          <Hourglass className="w-16 h-16 mx-auto mb-4 text-red-500/70" />
          <div className="text-2xl font-bold">Time Unknown</div>
          <div className="p-6 bg-red-950/30 rounded-xl border border-red-900/50">
            <p className="text-red-300">
              Set your Date of Birth and lifespan in the dashboard to see how much time you have left.
            </p>
            <p className="text-sm text-red-400 mt-3">
              You can't value what you don't measure.
            </p>
          </div>
        </div>
      )}
    </motion.div>,

    <motion.div
      key="question"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white px-6 py-12 overflow-y-auto"
    >
      <Target className="w-16 h-16 mb-6 text-indigo-300" />
      <h1 className="text-4xl md:text-5xl font-bold mb-3">Life Against Your Ambitions</h1>
      <p className="text-base text-indigo-200 mb-8 max-w-2xl text-center">
        A gentle look at what you've accomplished and what still calls to you
      </p>

      {mirrorData.milestones.all.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mb-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-6 bg-emerald-900/30 rounded-xl border border-emerald-700/50 text-center">
                <div className="text-5xl font-bold text-emerald-300 mb-2">
                  {mirrorData.milestones.achieved.length}
                </div>
                <div className="text-sm text-emerald-400">Milestones Achieved</div>
                <div className="text-xs text-emerald-500 mt-1">
                  {mirrorData.milestones.all.length > 0 
                    ? `${((mirrorData.milestones.achieved.length / mirrorData.milestones.all.length) * 100).toFixed(0)}% complete`
                    : ''}
                </div>
              </div>
              <div className="p-6 bg-yellow-900/30 rounded-xl border border-yellow-700/50 text-center">
                <div className="text-5xl font-bold text-yellow-300 mb-2">
                  {mirrorData.milestones.notYet.length}
                </div>
                <div className="text-sm text-yellow-400">Not Yet Achieved</div>
                <div className="text-xs text-yellow-500 mt-1">
                  {mirrorData.age != null ? `Past due items since age ${mirrorData.age}` : ''}
                </div>
              </div>
              <div className="p-6 bg-amber-900/30 rounded-xl border border-amber-700/50 text-center">
                <div className="text-5xl font-bold text-amber-300 mb-2">
                  {mirrorData.milestones.ahead.length}
                </div>
                <div className="text-sm text-amber-400">Still Ahead</div>
                <div className="text-xs text-amber-500 mt-1">
                  {mirrorData.milestones.ahead.length > 0 && mirrorData.age
                    ? `Next at age ${mirrorData.milestones.ahead[0].age}`
                    : 'Your future awaits'}
                </div>
              </div>
            </div>

            {/* Achieved Milestones */}
            {mirrorData.milestones.achieved.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <h3 className="text-xl font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  What You've Accomplished
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mirrorData.milestones.achieved.slice(-5).reverse().map((m, i) => (
                    <motion.div
                      key={m.id || `${m.title}-${m.age}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-800/50 flex items-center gap-3"
                    >
                      <div className={`w-3 h-3 rounded-full flex-shrink-0`} style={{ backgroundColor: m.color || '#34d399' }} />
                      <div className="flex-1">
                        <div className="font-medium text-emerald-100">{m.title}</div>
                        <div className="text-xs text-emerald-400">Age {m.age}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-emerald-400">✓</div>
                        <button
                          onClick={()=>markMilestone(m, false)}
                          className="px-2 py-1 rounded-lg bg-gray-700/40 hover:bg-gray-700/60 text-gray-200 text-xs inline-flex items-center gap-1"
                          title="Unmark as achieved"
                        >
                          <RotateCcw className="w-3 h-3"/> Unmark
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {mirrorData.milestones.achieved.length > 5 && (
                    <div className="text-xs text-emerald-500 text-center py-2">
                      +{mirrorData.milestones.achieved.length - 5} more achieved
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Not Yet Achieved (past) */}
            {mirrorData.milestones.notYet.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <h3 className="text-xl font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Not Yet Achieved
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mirrorData.milestones.notYet.slice(0, 5).map((m, i) => (
                    <motion.div
                      key={m.id || `${m.title}-${m.age}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="p-3 bg-yellow-950/40 rounded-lg border border-yellow-800/50 flex items-center gap-3"
                    >
                      <div className={`w-3 h-3 rounded-full flex-shrink-0`} style={{ backgroundColor: m.color || '#f59e0b' }} />
                      <div className="flex-1">
                        <div className="font-medium text-yellow-100">{m.title}</div>
                        <div className="text-xs text-yellow-400">
                          Target age {m.age}
                          {Number.isFinite(mirrorData.age) ? ` · ${Math.max(0, mirrorData.age - m.age)} years ago` : ''}
                        </div>
                      </div>
                      <button
                        onClick={()=>markMilestone(m, true)}
                        className="px-2 py-1 rounded-lg bg-emerald-700/40 hover:bg-emerald-700/60 text-emerald-200 text-xs inline-flex items-center gap-1"
                        title="Mark achieved"
                      >
                        <CheckCircle className="w-3.5 h-3.5"/> Achieved
                      </button>
                    </motion.div>
                  ))}
                  {mirrorData.milestones.notYet.length > 5 && (
                    <div className="text-xs text-yellow-500 text-center py-2">
                      +{mirrorData.milestones.notYet.length - 5} more
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Still Ahead (future) */}
            {mirrorData.milestones.ahead.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Still Ahead
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mirrorData.milestones.ahead.slice(0, 5).map((m, i) => (
                    <motion.div
                      key={m.id || `${m.title}-${m.age}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="p-3 bg-amber-950/40 rounded-lg border border-amber-800/50 flex items-center gap-3"
                    >
                      <div className={`w-3 h-3 rounded-full flex-shrink-0`} style={{ backgroundColor: m.color || '#fbbf24' }} />
                      <div className="flex-1">
                        <div className="font-medium text-amber-100">{m.title}</div>
                        <div className="text-xs text-amber-400">
                          Target age {m.age}
                          {Number.isFinite(mirrorData.age) ? ` · ${Math.max(0, m.age - mirrorData.age)} years away` : ''}
                        </div>
                      </div>
                      <button
                        onClick={()=>markMilestone(m, true)}
                        className="px-2 py-1 rounded-lg bg-emerald-700/40 hover:bg-emerald-700/60 text-emerald-200 text-xs inline-flex items-center gap-1"
                        title="Mark achieved"
                      >
                        <CheckCircle className="w-3.5 h-3.5"/> Achieved
                      </button>
                    </motion.div>
                  ))}
                  {mirrorData.milestones.ahead.length > 5 && (
                    <div className="text-xs text-amber-500 text-center py-2">
                      +{mirrorData.milestones.ahead.length - 5} more ahead
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Contextual reflection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mb-6 p-6 bg-indigo-950/50 rounded-2xl border border-indigo-800"
          >
            <p className="text-lg leading-relaxed text-center text-indigo-100">
              {mirrorData.milestones.ahead.length > 0 && mirrorData.milestones.achieved.length > 0
                ? `You've already achieved ${mirrorData.milestones.achieved.length} milestone${mirrorData.milestones.achieved.length !== 1 ? 's' : ''}. What small step can you take this week toward "${mirrorData.milestones.ahead[0]?.title}"?`
                : mirrorData.milestones.ahead.length > 0
                ? `"${mirrorData.milestones.ahead[0]?.title}" awaits you at age ${mirrorData.milestones.ahead[0]?.age}. What needs to happen first?`
                : mirrorData.milestones.notYet.length > 0
                ? `One ambition from your past remains: "${mirrorData.milestones.notYet[0]?.title}". What grace-filled next step would honor it?`
                : mirrorData.milestones.achieved.length > 0
                ? "You've accomplished much. What new ambition is quietly calling to you now?"
                : reflectionQuestion
              }
            </p>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-xl mb-8 text-center"
        >
          <div className="p-8 bg-indigo-950/30 rounded-xl border border-indigo-800/50">
            <Target className="w-16 h-16 mx-auto mb-4 text-indigo-400/70" />
            <p className="text-lg text-indigo-300 mb-4">
              You haven't set any life milestones yet.
            </p>
            <p className="text-sm text-indigo-400 leading-relaxed">
              Visit the <span className="font-semibold">Storyline Arc</span> in your dashboard to add the ambitions and goals that matter to you. Then return here to measure your progress.
            </p>
          </div>
          
          {/* Values-based question fallback */}
          <div className="mt-8 p-6 bg-indigo-950/50 rounded-2xl border border-indigo-800">
            <p className="text-lg leading-relaxed text-center text-indigo-100">
              {reflectionQuestion}
            </p>
          </div>
        </motion.div>
      )}

      {/* Reflection input */}
      <div className="w-full max-w-xl">
        <label className="block text-sm text-indigo-300 mb-2">
          Your reflection (optional):
        </label>
        <textarea
          className="w-full h-32 px-4 py-3 bg-indigo-950/50 border-2 border-indigo-800 rounded-xl text-white placeholder-indigo-600 outline-none focus:border-indigo-600 resize-none"
          placeholder="What action will you take? What insight emerged?"
          value={commitment}
          onChange={(e) => setCommitment(e.target.value)}
        />
      </div>

      <p className="mt-6 text-indigo-300 text-sm text-center max-w-lg italic">
        Progress isn't about speed. It's about direction.
      </p>
    </motion.div>,

    <motion.div
      key="exit"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-6 py-12 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Sparkles className="w-20 h-20 text-purple-400" />
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center">You've Looked in the Mirror</h1>
      <p className="text-base text-purple-300 mb-10 max-w-2xl text-center">
        Seven reflections. One life. This is what you saw.
      </p>
      
      {/* Journey Summary Grid */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {/* Life Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-purple-950/30 rounded-xl border border-purple-800/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-200">Your Time</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Age:</span>
              <span className="font-bold text-purple-100">{mirrorData.age || "—"} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Life lived:</span>
              <span className="font-bold text-purple-100">
                {Number.isFinite(mirrorData.lifePct) ? (mirrorData.lifePct * 100).toFixed(1) : "—"}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Weeks remaining:</span>
              <span className="font-bold text-purple-100">{mirrorData.weeksRemaining.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Values & Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 bg-purple-950/30 rounded-xl border border-purple-800/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-200">Living by Values</h3>
          </div>
          <div className="space-y-2 text-sm">
            {mirrorData.valuesAlignment.slice(0, 3).map((v, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-purple-300">{v.name}:</span>
                <span className={`font-semibold ${v.score >= 0.7 ? 'text-emerald-400' : v.score >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {(v.score * 100).toFixed(0)}%
                </span>
              </div>
            ))}
            {mirrorData.valuesAlignment.length === 0 && (
              <div className="text-purple-400 text-xs italic">Track your values to see alignment</div>
            )}
          </div>
        </motion.div>

        {/* Milestones Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 bg-purple-950/30 rounded-xl border border-purple-800/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-200">Your Ambitions</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Achieved:</span>
              <span className="font-bold text-emerald-400">{mirrorData.milestones.achieved.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Still ahead:</span>
              <span className="font-bold text-amber-400">{mirrorData.milestones.ahead.length}</span>
            </div>
            {mirrorData.milestones.notYet.length > 0 && (
              <div className="flex justify-between">
                <span className="text-purple-300">Not yet:</span>
                <span className="font-bold text-yellow-400">{mirrorData.milestones.notYet.length}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Legacy & Connections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-5 bg-purple-950/30 rounded-xl border border-purple-800/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-200">What You're Building</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Circle of influence:</span>
              <span className="font-bold text-purple-100">{mirrorData.circleSize} people</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Memory capsules:</span>
              <span className="font-bold text-purple-100">{mirrorData.capsules}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Epitaph written:</span>
              <span className={`font-bold ${mirrorData.epitaph ? 'text-emerald-400' : 'text-gray-500'}`}>
                {mirrorData.epitaph ? '✓' : '—'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Your Reflection/Commitment */}
      {commitment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl w-full mb-8 p-6 bg-purple-950/50 rounded-xl border border-purple-800"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-200">Your Reflection</h3>
          </div>
          <p className="text-base text-purple-100 leading-relaxed italic">"{commitment}"</p>
        </motion.div>
      )}

      {/* Closing Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="max-w-2xl text-center space-y-4 mb-8"
      >
        <p className="text-xl text-purple-200 leading-relaxed">
          The mirror doesn't judge. It simply shows what is.
        </p>
        <p className="text-base text-purple-300 leading-relaxed">
          You've seen your life through seven lenses. Now return—not to forget, but to act with awareness.
        </p>
      </motion.div>

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-base text-purple-400"
      >
        Return to the dashboard transformed
      </motion.div>
    </motion.div>
  ];

  return (
    <div className="relative">
      <button
        onClick={onExit}
        className="fixed top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
        title="Exit Mirror (ESC)"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-50">
        {screens.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === screen ? "bg-white w-8" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {screen > 0 && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={prevScreen}
          className="fixed left-6 top-1/2 transform -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all z-50"
          title="Previous (←)"
        >
          <ArrowLeft className="w-8 h-8 text-white" />
        </motion.button>
      )}

      {canProgress && screen < 6 && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={nextScreen}
          className="fixed right-6 top-1/2 transform -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all z-50"
          title="Next (→ or Enter)"
        >
          <ArrowRight className="w-8 h-8 text-white" />
        </motion.button>
      )}

      {canProgress && screen === 6 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={nextScreen}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 px-8 py-4 bg-white text-purple-900 rounded-full font-semibold text-lg hover:bg-purple-100 transition-all z-50"
        >
          Return to Dashboard
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {screens[screen]}
      </AnimatePresence>
    </div>
  );
}
