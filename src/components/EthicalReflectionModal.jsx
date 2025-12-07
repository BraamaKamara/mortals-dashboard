import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronRight, RefreshCw, Sparkles, MessageCircle } from "lucide-react";
import ModalFramework from "./ModalFramework";

/**
 * Ethical Reflection Modal (Capstone Experience)
 * 
 * Fullscreen contemplative mode with thought experiments and guided reflection.
 * Each reflection rotates through McMahan's identity-consciousness-ethics framework.
 * 
 * Questions explore:
 * - Psychological continuity (are you the same person tomorrow?)
 * - Moral responsibility (to your future self, to others)
 * - Consciousness quality (animal vs personal life)
 * 
 * McMahan: "Personal identity is constituted by psychological continuity, not biological connection.
 * Therefore, you owe duties not just to others, but to your future self."
 */
export default function EthicalReflectionModal({ isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [responses, setResponses] = useState([]);
  const [showInsight, setShowInsight] = useState(false);

  const REFLECTION_PROMPTS = [
    {
      id: "continuity",
      category: "Psychological Continuity",
      question: "If you died tomorrow, which parts of your consciousness would truly perish? Which would live on?",
      subtext: "McMahan argues identity is constituted by psychological continuity—memory chains, personality evolution, intentions—not biology.",
      prompt: "Reflect on what makes you 'you' and what aspects would survive your death...",
      color: "from-blue-400 to-cyan-600"
    },
    {
      id: "future-self",
      category: "Duty to Your Future Self",
      question: "Is your future self—say, a week from now—the same person you owe duties to as your best friend?",
      subtext: "If personal identity is psychological continuity, you bear moral responsibility to a future person who shares your memories and intentions.",
      prompt: "Write about what you owe to the person you'll become...",
      color: "from-purple-400 to-pink-600"
    },
    {
      id: "consciousness-quality",
      category: "Quality of Consciousness",
      question: "How many hours today were lived as a conscious being versus as an animal organism?",
      subtext: "McMahan distinguishes 'animal life' (instinct, reflex) from 'personal life' (reflection, choice, meaning).",
      prompt: "Describe which parts of today felt truly conscious to you...",
      color: "from-amber-400 to-orange-600"
    },
    {
      id: "moral-arc",
      category: "Your Moral Arc",
      question: "If your life is a story, what would chapters 5 years from now need to say about today to preserve your integrity?",
      subtext: "Your future self will judge your current self's choices. What would make today's version of you admirable to your future self?",
      prompt: "Sketch the moral arc you want your life to trace...",
      color: "from-emerald-400 to-green-600"
    },
    {
      id: "unconsciousness-cost",
      category: "The Cost of Unconsciousness",
      question: "What would you need to realize about an unconscious routine to change it?",
      subtext: "Moral growth requires making the unconscious conscious. Where are you sleepwalking?",
      prompt: "Name one habit you've stopped examining, and why you've stopped...",
      color: "from-rose-400 to-red-600"
    },
    {
      id: "relational-self",
      category: "Your Relational Self",
      question: "Who would be less conscious if you weren't in their life? What consciousness do you hold for them?",
      subtext: "Your presence shapes others' consciousness. Your choices affect who they become.",
      prompt: "Reflect on how your existence matters to someone's inner life...",
      color: "from-indigo-400 to-violet-600"
    }
  ];

  const currentPrompt = REFLECTION_PROMPTS[currentIndex];

  const handleSubmitResponse = () => {
    if (userResponse.trim()) {
      setResponses([...responses, {
        promptId: currentPrompt.id,
        question: currentPrompt.question,
        response: userResponse,
        timestamp: new Date()
      }]);
      setUserResponse("");
      setShowInsight(true);

      // Auto-advance after showing insight
      setTimeout(() => {
        if (currentIndex < REFLECTION_PROMPTS.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowInsight(false);
        }
      }, 3000);
    }
  };

  const handleNextPrompt = () => {
    if (currentIndex < REFLECTION_PROMPTS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowInsight(false);
      setUserResponse("");
    }
  };

  const handlePreviousPrompt = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowInsight(false);
      setUserResponse("");
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setUserResponse("");
    setResponses([]);
    setShowInsight(false);
  };

  return (
    <ModalFramework isOpen={isOpen} onClose={onClose} title="Ethical Reflection">
      <div className="space-y-6 max-h-[70vh] flex flex-col">
        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2"
        >
          {REFLECTION_PROMPTS.map((_, idx) => (
            <motion.div
              key={idx}
              className={`flex-1 h-1 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-gradient-to-r from-blue-500 to-purple-500"
                  : idx < currentIndex
                  ? "bg-emerald-400"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
              animate={{ scale: idx === currentIndex ? 1.1 : 1 }}
            />
          ))}
        </motion.div>

        {/* Prompt content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Category label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${currentPrompt.color}`}>
                  {currentPrompt.category}
                </div>
              </motion.div>

              {/* Main question */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {currentPrompt.question}
                </h3>
              </motion.div>

              {/* Subtext (philosophical context) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3"
              >
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                  {currentPrompt.subtext}
                </p>
              </motion.div>

              {/* Insight display */}
              <AnimatePresence>
                {showInsight && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4"
                  >
                    <div className="flex gap-3">
                      <Sparkles size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 mb-1">Reflection Recorded</p>
                        <p className="text-sm text-emerald-800 dark:text-emerald-300">
                          This insight will inform your ethical evolution. Continue to the next reflection or review your responses.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Response input */}
          {!showInsight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mt-6"
            >
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {currentPrompt.prompt}
              </label>
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Write your thoughts here. There are no right answers—only honest ones."
                className="w-full h-32 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSubmitResponse}
                disabled={!userResponse.trim()}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Record Reflection
              </button>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700"
        >
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPrompt}
              disabled={currentIndex === 0}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium"
            >
              ← Previous
            </button>
            <button
              onClick={handleNextPrompt}
              disabled={currentIndex === REFLECTION_PROMPTS.length - 1 || showInsight}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium flex items-center gap-1"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400">
            {currentIndex + 1} of {REFLECTION_PROMPTS.length}
          </div>

          {responses.length > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium flex items-center gap-1"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </motion.div>

        {/* Responses summary (if any) */}
        {responses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Reflections Recorded ({responses.length}/{REFLECTION_PROMPTS.length})
            </p>
            <div className="space-y-2">
              {responses.map((resp, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2"
                >
                  <Brain size={14} className="flex-shrink-0 mt-0.5 text-blue-500" />
                  <span className="line-clamp-2">{resp.response.substring(0, 100)}...</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* McMahan anchor */}
        <div className="text-xs text-slate-500 dark:text-slate-500 italic border-l-2 border-slate-300 dark:border-slate-600 pl-3">
          "Personal identity is constituted by psychological continuity. Therefore, you bear moral responsibility to your future self and to others whose consciousness you shape."
        </div>
      </div>
    </ModalFramework>
  );
}
