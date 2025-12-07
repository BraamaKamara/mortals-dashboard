import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, X, Lightbulb } from "lucide-react";
import ModalFramework from "./ModalFramework";

/**
 * Ethical Nudge Modal
 * 
 * Pattern-detection alerts for unexamined habits.
 * Nudges user when patterns suggest moral unconsciousness:
 * 
 * - 3 days without gratitude → "You've drifted into taking for granted"
 * - 7 days without relationship logs → "You are living alone, not in relationship"
 * - 1 week without creativity → "Are you deferring your creative self?"
 * - 2 weeks without care acts → "Who are you serving? Only yourself?"
 * - Daily lost time >4 hours → "That's 4 hours as pure animal"
 * 
 * McMahan: We are responsible not just for conscious acts, but for allowing
 * ourselves to drift into unconsciousness.
 */
export default function EthicalNudgeModal({ isOpen, onClose }) {
  const [nudges, setNudges] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    if (!isOpen) return;

    // Simulate nudge detection (in real app, check against actual data)
    const detectedNudges = [];

    // Check gratitude patterns
    const lastGratitude = 3; // days ago
    if (lastGratitude >= 3) {
      detectedNudges.push({
        id: "gratitude",
        severity: "warning",
        title: "Drifting into Unconsciousness",
        message: `${lastGratitude} days without gratitude. You've fallen into taking the world for granted.`,
        icon: "AlertCircle",
        color: "amber"
      });
    }

    // Check relationship patterns
    const lastRelationship = 8; // days ago
    if (lastRelationship >= 7) {
      detectedNudges.push({
        id: "relationship",
        severity: "alert",
        title: "Isolation Alert",
        message: `${lastRelationship} days without relationship logs. Are you living for yourself alone?`,
        icon: "AlertCircle",
        color: "rose"
      });
    }

    // Check creativity patterns
    const lastCreativity = 10; // days ago
    if (lastCreativity >= 7) {
      detectedNudges.push({
        id: "creativity",
        severity: "warning",
        title: "Creative Silence",
        message: `${lastCreativity} days without creative expression. Your most personal self is dormant.`,
        icon: "AlertCircle",
        color: "purple"
      });
    }

    // Check care patterns
    const lastCareAct = 14; // days ago
    if (lastCareAct >= 14) {
      detectedNudges.push({
        id: "care",
        severity: "critical",
        title: "Moral Atrophy",
        message: `${lastCareAct} days without care acts. Who are you serving? Only yourself.`,
        icon: "AlertCircle",
        color: "red"
      });
    }

    // Check daily lost time
    const lostTimeToday = Math.floor(Math.random() * 8); // 0-8 hours
    if (lostTimeToday >= 4) {
      detectedNudges.push({
        id: "lostTime",
        severity: "warning",
        title: "Unconscious Hours",
        message: `${lostTimeToday} hours lost to autopilot today. That's ${lostTimeToday} hours as pure animal.`,
        icon: "AlertCircle",
        color: "slate"
      });
    }

    setNudges(detectedNudges.length > 0 ? detectedNudges : [
      {
        id: "excellent",
        severity: "positive",
        title: "Moral Excellence",
        message: "No patterns of unconsciousness detected. You are living with intention.",
        icon: "CheckCircle2",
        color: "emerald"
      }
    ]);
  }, [isOpen]);

  const handleDismiss = (nudgeId) => {
    setDismissed(new Set([...dismissed, nudgeId]));
  };

  const handleAcknowledge = (nudgeId) => {
    setDismissed(new Set([...dismissed, nudgeId]));
    // In real app, record acknowledgment for follow-up
  };

  const activatedNudges = nudges.filter(n => !dismissed.has(n.id));

  return (
    <ModalFramework isOpen={isOpen} onClose={onClose} title="Ethical Nudges">
      <div className="space-y-6">
        {/* Intro text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-600 dark:text-slate-400"
        >
          Your dashboard detects patterns that suggest moral unconsciousness. These nudges invite you
          to examine habits you may have stopped noticing.
        </motion.div>

        {/* Nudge list */}
        <AnimatePresence mode="popLayout">
          {activatedNudges.length > 0 ? (
            <div className="space-y-3">
              {activatedNudges.map((nudge, idx) => (
                <motion.div
                  key={nudge.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ delay: idx * 0.1 + 0.2 }}
                  className={`border-l-4 p-4 rounded-lg flex items-start gap-3 ${
                    nudge.severity === "positive"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400"
                      : nudge.severity === "critical"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-400"
                      : nudge.severity === "alert"
                      ? "bg-rose-50 dark:bg-rose-900/20 border-rose-400"
                      : nudge.severity === "warning"
                      ? `bg-${nudge.color}-50 dark:bg-${nudge.color}-900/20 border-${nudge.color}-400`
                      : "bg-slate-50 dark:bg-slate-800 border-slate-400"
                  }`}
                >
                  {/* Icon */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {nudge.icon === "CheckCircle2" ? (
                      <CheckCircle2
                        size={24}
                        className={
                          nudge.severity === "positive"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-600 dark:text-slate-400"
                        }
                      />
                    ) : (
                      <AlertCircle
                        size={24}
                        className={
                          nudge.severity === "critical"
                            ? "text-red-600 dark:text-red-400"
                            : nudge.severity === "alert"
                            ? "text-rose-600 dark:text-rose-400"
                            : `text-${nudge.color}-600 dark:text-${nudge.color}-400`
                        }
                      />
                    )}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm mb-1 ${
                      nudge.severity === "positive"
                        ? "text-emerald-900 dark:text-emerald-200"
                        : nudge.severity === "critical"
                        ? "text-red-900 dark:text-red-200"
                        : nudge.severity === "alert"
                        ? "text-rose-900 dark:text-rose-200"
                        : `text-${nudge.color}-900 dark:text-${nudge.color}-200`
                    }`}>
                      {nudge.title}
                    </h4>
                    <p className={`text-sm ${
                      nudge.severity === "positive"
                        ? "text-emerald-800 dark:text-emerald-300"
                        : nudge.severity === "critical"
                        ? "text-red-800 dark:text-red-300"
                        : nudge.severity === "alert"
                        ? "text-rose-800 dark:text-rose-300"
                        : `text-${nudge.color}-800 dark:text-${nudge.color}-300`
                    }`}>
                      {nudge.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {nudge.severity !== "positive" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAcknowledge(nudge.id)}
                        className={`px-3 py-1 rounded text-xs font-semibold text-white transition ${
                          nudge.severity === "critical"
                            ? "bg-red-600 hover:bg-red-700"
                            : nudge.severity === "alert"
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "bg-slate-600 hover:bg-slate-700"
                        }`}
                      >
                        Acknowledge
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDismiss(nudge.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
              <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">All Clear</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">You've dismissed all nudges.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Philosophical explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4"
        >
          <div className="flex gap-3">
            <Lightbulb size={20} className="text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">Pattern Detection</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                These nudges are not judgments. They invite you to examine habits you may have stopped noticing.
                Consciousness requires constant attention.
              </p>
            </div>
          </div>
        </motion.div>

        {/* McMahan anchor */}
        <div className="text-xs text-slate-500 dark:text-slate-500 italic border-l-2 border-slate-300 dark:border-slate-600 pl-3">
          "We are responsible not just for conscious acts, but for allowing ourselves to drift into unconsciousness."
        </div>
      </div>
    </ModalFramework>
  );
}
