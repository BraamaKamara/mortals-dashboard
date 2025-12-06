// src/components/AskMortals.jsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Sparkles, TrendingUp, Heart, Clock, Target,
  Brain, ChevronDown, ChevronUp, Send, Lightbulb, BarChart3
} from "lucide-react";
import { buildSnapshot, answerQuestion, generateInsights } from "../reflect/reflector";

/**
 * Your Inner Mirror
 * 
 * VISION: Not just Q&A, but a reflection companion that helps you see patterns,
 * recognize neglect, celebrate progress, and ask better questions about your life.
 * This transforms raw data into wisdom through contextual prompts and insights.
 */

function Card({ className = "", children }) {
  return <div className={`rounded-3xl border border-slate-200/50 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 shadow-2xl overflow-hidden ${className}`}>{children}</div>;
}
function CardContent({ className = "", children }) {
  return <div className={`p-8 ${className}`}>{children}</div>;
}
function Button({ variant = "default", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = variant === "secondary"
    ? "bg-slate-100 text-slate-900 hover:bg-slate-200 border-2 border-slate-200"
    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:brightness-110 shadow-lg";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
function Input({ className = "", ...props }) {
  return <input className={`w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all ${className}`} {...props} />;
}

// Generate contextual suggested questions based on user data
function generateSuggestedQuestions(snapshot) {
  const questions = [];
  
  // Always available reflection starters
  questions.push({ q: "What have I been neglecting?", icon: Target, color: "text-red-600" });
  questions.push({ q: "How was my week?", icon: TrendingUp, color: "text-blue-600" });
  
  // Contextual based on gratitude
  if (snapshot.gratitude && snapshot.gratitude.length > 0) {
    questions.push({ q: "Who has helped me this week?", icon: Heart, color: "text-rose-600" });
  }
  
  // Contextual based on values
  if (snapshot.values && snapshot.values.length > 0) {
    questions.push({ q: "Am I living my values?", icon: Sparkles, color: "text-amber-600" });
  }
  
  // Time-based
  questions.push({ q: "Where does my time actually go?", icon: Clock, color: "text-purple-600" });
  
  return questions;
}

export default function AskMortals() {
  const snapshot = useMemo(() => {
    try {
      return buildSnapshot(new Date());
    } catch (err) {
      console.error("Snapshot build failed:", err);
      // fall back to a minimal safe structure
      return { now: new Date(), values: [], gratitude: [], ledgerDays: [], capsulesCount: 0 };
    }
  }, []);
  
  const [q, setQ] = useState("");
  const [conversationExpanded, setConversationExpanded] = useState(false);
  const [history, setHistory] = useState(() => {
    const init = [{ role: "system", text: "Welcome. Ask about your time, patterns, values, or what you might be neglecting." }];
    const ins = generateInsights(snapshot);
    if (ins.length) init.push({ role: "insight", text: ins.join(" ") });
    return init;
  });

  const suggestedQuestions = useMemo(() => generateSuggestedQuestions(snapshot), [snapshot]);

  function submit(question = q) {
    if (!question.trim()) return;
    const a = answerQuestion(snapshot, question);
    setHistory(h => [...h, { role: "user", text: question }, { role: "assistant", text: a }]);
    setQ("");
    if (!conversationExpanded) setConversationExpanded(true);
  }

  function askSuggested(question) {
    setQ(question);
    submit(question);
  }

  // Calculate insights for cards
  const totalLoggedMinutes = useMemo(() => {
    return snapshot.ledgerDays?.reduce((sum, day) => sum + (day.minutes || 0), 0) || 0;
  }, [snapshot.ledgerDays]);

  const gratitudeStreak = useMemo(() => {
    try {
      return parseInt(localStorage.getItem("mortals.gratitude.streak") || "0");
    } catch { return 0; }
  }, []);

  const lifeProgress = useMemo(() => {
    return snapshot.progress?.pct || 0;
  }, [snapshot.progress]);

  return (
    <Card className="relative">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />
      
      <CardContent className="relative space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="font-bold text-3xl bg-gradient-to-r from-slate-800 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
            Your Inner Mirror
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Ask questions about your patterns, time, relationships, and values. 
            <span className="text-indigo-600 font-medium"> Reflect</span>, 
            <span className="text-purple-600 font-medium"> recognize</span>, and 
            <span className="text-blue-600 font-medium"> realign</span>. 
            All insights stay private on your device.
          </p>
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border-2 border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-white p-4 shadow-md"
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">Time Logged</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {totalLoggedMinutes > 0 ? `${Math.round(totalLoggedMinutes / 60)}h` : "—"}
            </div>
            <p className="text-xs text-slate-600 mt-1">Past 7 days</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border-2 border-rose-200/50 bg-gradient-to-br from-rose-50 to-white p-4 shadow-md"
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-rose-600" />
              <span className="text-xs font-semibold text-rose-900 uppercase tracking-wide">Gratitude Streak</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {gratitudeStreak > 0 ? `${gratitudeStreak} ${gratitudeStreak === 1 ? "week" : "weeks"}` : "Start today"}
            </div>
            <p className="text-xs text-slate-600 mt-1">Consecutive weeks</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50 to-white p-4 shadow-md"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Life Progress</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {lifeProgress > 0 ? `${Math.round(lifeProgress)}%` : "—"}
            </div>
            <p className="text-xs text-slate-600 mt-1">Of your journey</p>
          </motion.div>
        </div>

        {/* Suggested Questions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-slate-700">Questions to explore</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((sq, idx) => {
              const Icon = sq.icon;
              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  onClick={() => askSuggested(sq.q)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-300 transition-all text-sm font-medium text-slate-700 shadow-sm hover:shadow-md"
                >
                  <Icon className={`w-4 h-4 ${sq.color}`} />
                  <span>{sq.q}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Conversation History (Collapsible) */}
        <div className="space-y-3">
          <button
            onClick={() => setConversationExpanded(!conversationExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">
                Conversation ({history.filter(m => m.role === "user" || m.role === "assistant").length} exchanges)
              </span>
            </div>
            {conversationExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          
          <AnimatePresence>
            {conversationExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 max-h-80 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-slate-100">
                  {history.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`text-sm ${
                        m.role === "assistant"
                          ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 pl-3 pr-3 py-2 rounded-r-xl"
                          : m.role === "user"
                          ? "bg-slate-50 border-l-4 border-slate-400 pl-3 pr-3 py-2 rounded-r-xl"
                          : m.role === "insight"
                          ? "bg-amber-50 border-l-4 border-amber-500 pl-3 pr-3 py-2 rounded-r-xl italic"
                          : "text-slate-600 italic text-center"
                      }`}
                    >
                      <div className="font-semibold text-xs uppercase tracking-wide mb-1 text-slate-700">
                        {m.role === "assistant" ? "Mortals" : m.role === "user" ? "You" : m.role === "insight" ? "Today's Note" : "System"}
                      </div>
                      <span className="whitespace-pre-wrap text-slate-800">{m.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ask Input */}
        <div className="flex gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask something reflective…"
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
          <Button onClick={() => submit()} disabled={!q.trim()}>
            <Send className="w-4 h-4" />
            Ask
          </Button>
        </div>

        {/* Privacy note */}
        <div className="text-center text-xs text-slate-500 italic">
          All reflections stay on your device · No server · No upload
        </div>
      </CardContent>
    </Card>
  );
}
