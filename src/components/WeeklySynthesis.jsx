// src/components/WeeklySynthesis.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Clock, Heart, Package, Sparkles, 
  Calendar, BarChart3, Zap, Target 
} from "lucide-react";
import { buildSnapshot } from "../reflect/reflector";

/**
 * Weekly Synthesis
 * 
 * VISION: A weekly review dashboard that surfaces patterns, celebrates progress,
 * and provides actionable insights. Not just numbers, but meaning.
 */

// --- helpers to compute life progress safely ---
const _addYears = (d, y) => {
  const x = new Date(d);
  const target = x.getFullYear() + Number(y || 0);
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
    const span = Number(JSON.parse(localStorage.getItem("mortals.lifespan") || "0"));
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

function Card({ className = "", children }) {
  return <div className={`rounded-3xl border border-slate-200/50 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 shadow-2xl overflow-hidden ${className}`}>{children}</div>;
}
function CardContent({ className = "", children }) {
  return <div className={`p-8 ${className}`}>{children}</div>;
}
function Stat({ icon: Icon, label, value, trend, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-50 to-white border-blue-200/50 text-blue-600",
    rose: "from-rose-50 to-white border-rose-200/50 text-rose-600",
    amber: "from-amber-50 to-white border-amber-200/50 text-amber-600",
    purple: "from-purple-50 to-white border-purple-200/50 text-purple-600",
    green: "from-green-50 to-white border-green-200/50 text-green-600"
  };
  
  return (
    <div className={`rounded-2xl border-2 bg-gradient-to-br p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${color === "blue" ? "text-blue-600" : color === "rose" ? "text-rose-600" : color === "amber" ? "text-amber-600" : color === "purple" ? "text-purple-600" : "text-green-600"}`} />
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? "bg-green-100 text-green-700" : trend < 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
            {trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : "—"}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-800 tabular-nums">{value ?? "—"}</div>
      <div className="text-xs font-medium text-slate-600 mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export default function WeeklySynthesis() {
  const snap = useMemo(() => buildSnapshot(new Date()), []);

  const totals = useMemo(() => {
    const mix = {};
    let total = 0;
    const days = Array.isArray(snap.ledgerDays) ? snap.ledgerDays : [];
    for (const d of days) {
      const entries = Array.isArray(d.entries) ? d.entries : [];
      for (const e of entries) {
        const tag = e.tag || "Unlabeled";
        const m = Number(e.minutes) || 0;
        mix[tag] = (mix[tag] || 0) + m;
        total += m;
      }
    }
    return { total, mix };
  }, [snap]);

  const lifePct = useMemo(() => {
    try {
      const local = lifeProgress01();
      if (local && local > 0) return Math.round(local * 100);
      return Math.round((snap.progress?.pct || 0) * 100);
    } catch {
      return Math.round((snap.progress?.pct || 0) * 100);
    }
  }, [snap]);

  const mixDisplay = Object.entries(totals.mix || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${v}m`)
    .join(" · ");

  const gratitudeCount = Array.isArray(snap.gratitude) ? snap.gratitude.length : 0;
  const capsulesCount = Number(snap.capsulesCount || 0);

  // Calculate Big 3 completion rate for the week
  const big3Completion = useMemo(() => {
    try {
      const days = snap.ledgerDays || [];
      let totalDays = 0;
      let daysWithCompletion = 0;
      
      for (const day of days) {
        const big3Key = `mortals.big3.${day.key}`;
        const big3Data = JSON.parse(localStorage.getItem(big3Key) || "[]");
        if (Array.isArray(big3Data) && big3Data.length > 0) {
          totalDays++;
          const completed = big3Data.filter(t => t?.done).length;
          if (completed > 0) daysWithCompletion++;
        }
      }
      
      return totalDays > 0 ? Math.round((daysWithCompletion / totalDays) * 100) : 0;
    } catch {
      return 0;
    }
  }, [snap]);

  // Generate insight message
  const weekInsight = useMemo(() => {
    const hours = Math.round(totals.total / 60);
    const avgHoursPerDay = (hours / 7).toFixed(1);
    
    if (hours === 0) {
      return "Start tracking your time to see your weekly patterns emerge.";
    }
    
    if (hours < 10) {
      return `Light tracking week (${avgHoursPerDay}h/day avg). Consider logging more activities to gain better insights.`;
    }
    
    if (gratitudeCount === 0) {
      return `${hours}h tracked this week. Add gratitude entries to recognize your connections.`;
    }
    
    if (big3Completion < 30) {
      return `${hours}h of focused time. Boost momentum by completing more Big 3 tasks daily.`;
    }
    
    return `Productive week with ${hours}h tracked, ${gratitudeCount} gratitude entries, and ${big3Completion}% Big 3 completion. Keep the momentum!`;
  }, [totals.total, gratitudeCount, big3Completion]);

  return (
    <Card className="relative">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
      
      <CardContent className="relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-2xl bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Weekly Synthesis
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{snap.wLabel || "Current week"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Stat 
              icon={Clock} 
              label="Time Tracked" 
              value={`${Math.round(totals.total / 60)}h`}
              color="blue"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Stat 
              icon={Heart} 
              label="Gratitude" 
              value={gratitudeCount}
              color="rose"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Stat 
              icon={Target} 
              label="Big 3 Days" 
              value={`${big3Completion}%`}
              color="green"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Stat 
              icon={Package} 
              label="All Capsules" 
              value={capsulesCount}
              color="amber"
            />
          </motion.div>
        </div>

        {/* Time Mix Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border-2 border-slate-200 bg-white p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-700">Time Breakdown</span>
          </div>
          
          {mixDisplay ? (
            <div className="space-y-2">
              {Object.entries(totals.mix || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([tag, minutes], idx) => {
                  const hours = Math.floor(minutes / 60);
                  const mins = minutes % 60;
                  const percentage = totals.total > 0 ? Math.round((minutes / totals.total) * 100) : 0;
                  
                  return (
                    <div key={tag} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{tag}</span>
                          <span className="text-xs text-slate-500 tabular-nums">
                            {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`} · {percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.3 + idx * 0.05, duration: 0.5 }}
                            className={`h-full rounded-full ${
                              idx === 0 ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
                              idx === 1 ? "bg-gradient-to-r from-purple-500 to-pink-500" :
                              idx === 2 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                              idx === 3 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                              "bg-gradient-to-r from-slate-400 to-slate-500"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No time entries yet this week.</p>
          )}
        </motion.div>

        {/* Values & Insight */}
        <div className="space-y-3">
          {Array.isArray(snap.values) && snap.values.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Your Values</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {snap.values.map((value, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 border border-purple-200 text-sm font-medium text-purple-900"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Week Insight</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{weekInsight}</p>
          </motion.div>
          
          {lifePct > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center text-xs text-slate-500 italic"
            >
              You are {lifePct}% through your anticipated journey · Make this week count
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
