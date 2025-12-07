import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, AlertCircle } from "lucide-react";
import ModalFramework from "./ModalFramework";

/**
 * Continuity Tracker Modal
 * 
 * Displays:
 * - Weekly "intentional self" bar (deep work + gratitude + care + creation + reflection)
 * - "Continuity line" (streak of days with high presence)
 * - Fade effect for low-awareness weeks
 * 
 * McMahan anchor: Personhood = psychological continuity, not biology.
 * Your identity is a process, not a static object.
 */
export default function ContinuityTrackerModal({ isOpen, onClose }) {
  const [weeklyScores, setWeeklyScores] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    // Generate historical weekly data (in real app, fetch from backend)
    const weeks = Array.from({ length: 12 }, (_, i) => {
      const baseScore = 5 + Math.random() * 4;
      return {
        week: i,
        score: Math.round(baseScore * 10) / 10,
        label: `W${i + 1}`
      };
    });
    setWeeklyScores(weeks);

    // Calculate streaks (days with presence > 5)
    // In real app, would compute from daily presence_index data
    setCurrentStreak(Math.floor(Math.random() * 20) + 5);
    setLongestStreak(Math.floor(Math.random() * 40) + 15);
  }, [isOpen]);

  const avgScore = weeklyScores.length > 0
    ? (weeklyScores.reduce((sum, w) => sum + w.score, 0) / weeklyScores.length).toFixed(1)
    : 0;

  return (
    <ModalFramework isOpen={isOpen} onClose={onClose} title="Continuity Tracker">
      <div className="space-y-8">
        {/* Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4 text-center">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">Current Streak</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">{currentStreak}</span>
              <span className="text-sm text-emerald-600 dark:text-emerald-400">days</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2">Consecutive intentional living</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 text-center">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-2">Longest Streak</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-300">{longestStreak}</span>
              <span className="text-sm text-purple-600 dark:text-purple-400">days</span>
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-400 mt-2">Personal record</p>
          </div>
        </motion.div>

        {/* Weekly Continuity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">12-Week Continuity</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Average: {avgScore}/10</p>
            </div>
            <Flame size={20} className="text-orange-500" />
          </div>

          {/* Bar chart */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-end justify-between gap-1.5 h-40">
              {weeklyScores.map((week, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${(week.score / 10) * 100}%`, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.03 }}
                  className={`flex-1 rounded-t ${
                    week.score >= 7
                      ? "bg-gradient-to-t from-emerald-500 to-green-400"
                      : week.score >= 5
                      ? "bg-gradient-to-t from-blue-500 to-cyan-400"
                      : "bg-gradient-to-t from-slate-400 to-slate-300"
                  } hover:opacity-100 opacity-80 transition-opacity`}
                  title={`${week.label}: ${week.score}/10`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-2">
              <span>{weeklyScores[0]?.label}</span>
              <span>{weeklyScores[weeklyScores.length - 1]?.label}</span>
            </div>
          </div>
        </motion.div>

        {/* What Continuity Means */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4"
        >
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">The Continuity Line</p>
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                A streak represents days where your "intentional self" was present. When the line breaks, identity thins—you drift from your story.
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 italic">
                "Your survival depends not on biology, but on psychological continuity. Keep the narrative thread alive."
              </p>
            </div>
          </div>
        </motion.div>

        {/* Daily Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4"
        >
          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">Today's Continuity Question</p>
          <p className="text-sm text-indigo-800 dark:text-indigo-300 italic mb-3">
            "Did my actions today continue the story I want to live?"
          </p>
          <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors">
            Reflect
          </button>
        </motion.div>
      </div>
    </ModalFramework>
  );
}
