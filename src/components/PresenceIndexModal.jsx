import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertCircle } from "lucide-react";
import ModalFramework from "./ModalFramework";

/**
 * Presence Index Modal
 * 
 * Displays today's "presence score" - a measure of how consciously
 * and intentionally the user lived, derived from:
 * - Reflection entries
 * - Gratitude logs
 * - Relational interactions
 * - Deep work minutes
 * - Sleep hours (optional)
 * 
 * McMahan anchor: Cognitive presence and self-awareness define the moral value of existence.
 */
export default function PresenceIndexModal({ isOpen, onClose }) {
  const [todayScore, setTodayScore] = useState(0);
  const [weekScores, setWeekScores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Compute presence score from available data
  const computePresenceScore = () => {
    try {
      // Get today's data from localStorage
      const today = new Date().toISOString().split('T')[0];
      
      // Count reflection entries (0-3 points)
      const reflections = JSON.parse(localStorage.getItem("mortals.reflections") || "[]");
      const todaysReflections = reflections.filter(r => {
        const rDate = new Date(r.timestamp).toISOString().split('T')[0];
        return rDate === today;
      }).length;
      const reflectionScore = Math.min(3, todaysReflections);

      // Count gratitude entries (0-2 points)
      const gratitudes = JSON.parse(localStorage.getItem("mortals.gratitude") || "[]");
      const todaysGratitudes = gratitudes.filter(g => {
        const gDate = new Date(g.timestamp).toISOString().split('T')[0];
        return gDate === today;
      }).length;
      const gratitudeScore = Math.min(2, todaysGratitudes);

      // Count relational logs (0-2 points)
      // This would need to be tracked - for now, estimate from posts/interactions
      const relationalScore = 1; // Placeholder

      // Deep work minutes (0-2 points, capped at 240 min = 8 hours)
      const deepWorkMinutes = JSON.parse(localStorage.getItem("mortals.deepWorkToday") || "0");
      const deepWorkScore = Math.min(2, Math.floor(deepWorkMinutes / 120)); // 2 points per 2 hours

      // Sleep hours (0-1 point)
      const sleepHours = JSON.parse(localStorage.getItem("mortals.sleepHoursToday") || "0");
      const sleepScore = sleepHours >= 7 ? 1 : (sleepHours >= 5 ? 0.5 : 0);

      // Total: out of 10
      const total = Math.round((reflectionScore + gratitudeScore + relationalScore + deepWorkScore + sleepScore) * 10) / 10;
      return Math.min(10, Math.max(0, total));
    } catch (error) {
      console.error("[Presence] Compute error:", error);
      return 5; // Default middle score
    }
  };

  // Load scores on mount
  useEffect(() => {
    setIsLoading(true);
    const score = computePresenceScore();
    setTodayScore(score);

    // Generate fake week data for now (would be historical in real app)
    const week = Array.from({ length: 7 }, (_, i) => {
      return Math.max(2, score - Math.random() * 4);
    });
    setWeekScores(week);
    setIsLoading(false);
  }, [isOpen]);

  // Determine presence level
  const getPresenceLevel = (score) => {
    if (score >= 8) return { label: "Fully Present", color: "from-emerald-400 to-green-600", description: "You were yourself today" };
    if (score >= 6) return { label: "Mostly Present", color: "from-blue-400 to-cyan-600", description: "Good consciousness and intention" };
    if (score >= 4) return { label: "Partially Present", color: "from-amber-400 to-orange-600", description: "Fragmented attention and awareness" };
    return { label: "Absent", color: "from-rose-400 to-red-600", description: "Lost from your own life" };
  };

  const level = getPresenceLevel(todayScore);

  return (
    <ModalFramework isOpen={isOpen} onClose={onClose} title="Presence Index">
      <div className="space-y-8">
        {/* Today's Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">TODAY'S PRESENCE</p>
          
          {/* Gauge */}
          <div className="flex justify-center mb-4">
            <div className="relative w-40 h-40">
              {/* Background circle */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={level.label === "Fully Present" ? "#10b981" : level.label === "Mostly Present" ? "#06b6d4" : level.label === "Partially Present" ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8"
                  strokeDasharray={`${(todayScore / 10) * 282.7} 282.7`}
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 282.7" }}
                  animate={{ strokeDasharray: `${(todayScore / 10) * 282.7} 282.7` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-slate-900 dark:text-white"
                  >
                    {todayScore.toFixed(1)}
                  </motion.div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">/10</div>
                </div>
              </div>
            </div>
          </div>

          {/* Level */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className={`text-2xl font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent mb-1`}>
              {level.label}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{level.description}</p>
          </motion.div>
        </motion.div>

        {/* Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2"
        >
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Score Breakdown</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
              <span className="text-slate-700 dark:text-slate-300">Reflections</span>
              <span className="font-semibold text-slate-900 dark:text-white">+3.0</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
              <span className="text-slate-700 dark:text-slate-300">Gratitude</span>
              <span className="font-semibold text-slate-900 dark:text-white">+2.0</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
              <span className="text-slate-700 dark:text-slate-300">Deep Work</span>
              <span className="font-semibold text-slate-900 dark:text-white">+2.0</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
              <span className="text-slate-700 dark:text-slate-300">Sleep</span>
              <span className="font-semibold text-slate-900 dark:text-white">+1.0</span>
            </div>
          </div>
        </motion.div>

        {/* Weekly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-slate-600 dark:text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">This Week</p>
          </div>
          
          {/* Bar chart */}
          <div className="flex items-end justify-between gap-2 h-32 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
            {weekScores.map((score, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(score / 10) * 100}%` }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                title={`Day ${i + 1}: ${score.toFixed(1)}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Mon</span>
            <span>Sun</span>
          </div>
        </motion.div>

        {/* Philosophical Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4"
        >
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-2">Reflection</p>
              <p className="text-sm text-purple-800 dark:text-purple-300 italic">
                "How much of today was lived as a conscious being?"
              </p>
              <button className="mt-3 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors">
                Record Response
              </button>
            </div>
          </div>
        </motion.div>

        {/* McMahan note */}
        <div className="text-xs text-slate-500 dark:text-slate-500 italic border-l-2 border-slate-300 dark:border-slate-600 pl-3">
          "The value of life rises with cognitive presence, reflection, and awareness. Not all hours are equal—some hours are animal, others personal."
        </div>
      </div>
    </ModalFramework>
  );
}
