import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Heart } from "lucide-react";
import ModalFramework from "./ModalFramework";

/**
 * Moral Presence Gauge Modal
 * 
 * Animated pulse circle showing:
 * - Real-time consciousness/awareness level
 * - Color intensity tied to:
 *   - Reflection + gratitude + relationships + mirror mode time
 *   - Inverse of "lost time" (unlogged hours/scrolling)
 * 
 * McMahan anchor: The value of life rises with cognitive presence and reflection.
 * Not all hours are equal—some hours are animal, others personal.
 */
export default function MoralPresenceGaugeModal({ isOpen, onClose }) {
  const [presenceScore, setPresenceScore] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [breakdown, setBreakdown] = useState({
    reflection: 0,
    gratitude: 0,
    relationships: 0,
    mirrorMode: 0,
    lostTime: 0
  });

  useEffect(() => {
    if (!isOpen) return;

    // Simulate real-time data (in real app, subscribe to live updates)
    const reflection = Math.random() * 25;
    const gratitude = Math.random() * 20;
    const relationships = Math.random() * 20;
    const mirrorMode = Math.random() * 15;
    const lostTime = Math.random() * 30;

    const total = Math.max(1, (reflection + gratitude + relationships + mirrorMode) - (lostTime * 0.5));
    const score = Math.min(100, Math.round(total));

    setPresenceScore(score);
    setPulseIntensity(score / 100);
    setBreakdown({ reflection, gratitude, relationships, mirrorMode, lostTime });
  }, [isOpen]);

  const getPresenceColor = (score) => {
    if (score >= 80) return { bg: "from-emerald-400 to-green-600", ring: "ring-emerald-500", label: "Highly Conscious" };
    if (score >= 60) return { bg: "from-blue-400 to-cyan-600", ring: "ring-blue-500", label: "Moderately Conscious" };
    if (score >= 40) return { bg: "from-amber-400 to-orange-600", ring: "ring-amber-500", label: "Minimally Conscious" };
    return { bg: "from-rose-400 to-red-600", ring: "ring-rose-500", label: "Animal Mode" };
  };

  const colors = getPresenceColor(presenceScore);

  return (
    <ModalFramework isOpen={isOpen} onClose={onClose} title="Moral Presence Gauge">
      <div className="space-y-8">
        {/* Animated Pulse Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="relative w-48 h-48">
            {/* Outer pulse rings */}
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className={`absolute inset-0 rounded-full border-2 ${colors.ring} opacity-30`}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.2 + ring * 0.15, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ))}

            {/* Main circle */}
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.bg} shadow-2xl flex items-center justify-center`}
              animate={{ boxShadow: `0 0 ${40 + pulseIntensity * 20}px ${colors.ring}` }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Inner dot */}
              <motion.div
                className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-inner"
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-center">
                  <motion.div
                    className="text-4xl font-bold text-slate-900"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {presenceScore}
                  </motion.div>
                  <div className="text-xs text-slate-600 mt-1">Consciousness %</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Presence Level */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h3 className={`text-2xl font-bold bg-gradient-to-r ${colors.bg} bg-clip-text text-transparent mb-1`}>
            {colors.label}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {presenceScore >= 80
              ? "You are fully present as a conscious being."
              : presenceScore >= 60
              ? "You are moderately conscious and engaged."
              : presenceScore >= 40
              ? "You are drifting toward unconscious existence."
              : "You are lost in automatic, instinctive mode."}
          </p>
        </motion.div>

        {/* Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Consciousness Breakdown</p>
          
          {/* Positive contributors */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
              <span className="text-sm text-emerald-900 dark:text-emerald-200 font-medium">Reflection</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(breakdown.reflection / 25) * 100}%` }}
                    transition={{ delay: 0.5 }}
                  />
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 w-8">+{breakdown.reflection.toFixed(0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <span className="text-sm text-blue-900 dark:text-blue-200 font-medium">Gratitude</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(breakdown.gratitude / 20) * 100}%` }}
                    transition={{ delay: 0.55 }}
                  />
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 w-8">+{breakdown.gratitude.toFixed(0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
              <span className="text-sm text-purple-900 dark:text-purple-200 font-medium">Relationships</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(breakdown.relationships / 20) * 100}%` }}
                    transition={{ delay: 0.6 }}
                  />
                </div>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 w-8">+{breakdown.relationships.toFixed(0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded">
              <span className="text-sm text-indigo-900 dark:text-indigo-200 font-medium">Mirror Mode</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(breakdown.mirrorMode / 15) * 100}%` }}
                    transition={{ delay: 0.65 }}
                  />
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 w-8">+{breakdown.mirrorMode.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Negative detractor */}
          <div className="flex items-center justify-between p-2 bg-rose-50 dark:bg-rose-900/20 rounded">
            <span className="text-sm text-rose-900 dark:text-rose-200 font-medium">Lost Time</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-rose-200 dark:bg-rose-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-rose-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(breakdown.lostTime / 30) * 100}%` }}
                  transition={{ delay: 0.7 }}
                />
              </div>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 w-8">-{breakdown.lostTime.toFixed(0)}</span>
            </div>
          </div>
        </motion.div>

        {/* Philosophical prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4"
        >
          <div className="flex gap-3">
            <Heart size={20} className="text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">The Consciousness Question</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                "How much of today was lived as a conscious being, rather than as a sleepwalking animal?"
              </p>
            </div>
          </div>
        </motion.div>

        {/* McMahan anchor */}
        <div className="text-xs text-slate-500 dark:text-slate-500 italic border-l-2 border-slate-300 dark:border-slate-600 pl-3">
          "The value of life rises with cognitive presence, reflection, and awareness. Not all hours are equal—some hours are animal, others personal."
        </div>
      </div>
    </ModalFramework>
  );
}
