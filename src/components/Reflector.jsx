// src/components/Reflector.jsx
import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Feather, Sparkles, TrendingUp, Heart, Clock, 
  Target, Eye, Brain, Sunrise, Moon, Star, Zap, 
  ArrowRight, ChevronDown, ChevronUp, Calendar, Award,
  Lightbulb, CheckCircle2, AlertCircle, RefreshCw
} from "lucide-react";

/**
 * THE REFLECTION ENGINE
 * 
 * REVOLUTIONARY VISION: This is not just a panel—it's the philosophical heart of Mortals.
 * 
 * Daily Reflection transforms raw data into wisdom through:
 * 1. AWARENESS: What happened today? (Data synthesis)
 * 2. RECOGNITION: What patterns emerge? (Intelligent insights)
 * 3. MEANING: What does it mean for your life? (Existential integration)
 * 4. COMMITMENT: What will you do about it? (Actionable wisdom)
 * 
 * This is where mortality awareness becomes lived philosophy.
 * This is where tracking becomes transformation.
 * This is where data becomes dharma.
 */
function Card({ className = "", children }) {
  return <div className={`rounded-3xl border border-slate-200/50 bg-gradient-to-br from-slate-50 via-white to-purple-50/20 shadow-2xl overflow-hidden ${className}`}>{children}</div>;
}
function CardContent({ className = "", children }) {
  return <div className={`p-8 ${className}`}>{children}</div>;
}

// Insight Badge Component
function InsightBadge({ type, icon: Icon, text, color = "blue" }) {
  const colors = {
    blue: "from-blue-50 to-blue-100 border-blue-300 text-blue-800",
    green: "from-green-50 to-green-100 border-green-300 text-green-800",
    amber: "from-amber-50 to-amber-100 border-amber-300 text-amber-800",
    red: "from-red-50 to-red-100 border-red-300 text-red-800",
    purple: "from-purple-50 to-purple-100 border-purple-300 text-purple-800",
    rose: "from-rose-50 to-rose-100 border-rose-300 text-rose-800"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 bg-gradient-to-br ${colors[color]} text-sm font-medium`}
    >
      <Icon className="w-4 h-4" />
      <span>{text}</span>
    </motion.div>
  );
}

/* helpers mirrored from the app */
const startOfWeek = (d) => {
  const x = new Date(d); x.setHours(0,0,0,0);
  const day = x.getDay(); const diff = (day === 0 ? -6 : 1 - day);
  x.setDate(x.getDate() + diff); return x;
};
const endOfWeek = (d) => { const s = startOfWeek(d); const e = new Date(s); e.setDate(s.getDate() + 7); e.setMilliseconds(-1); return e; };
const dateKey = (d) => new Date(d).toISOString().slice(0,10);
const todayKey = () => dateKey(new Date());

/**
 * Reflector panel: The Daily Reflection Engine - philosophical heart of the dashboard
 */
export default function Reflector({ snapshot }) {
  const now = new Date();
  const [reflectionText, setReflectionText] = useState("");
  const [commitment, setCommitment] = useState("");
  const [insightsExpanded, setInsightsExpanded] = useState(true);
  const [journalExpanded, setJournalExpanded] = useState(false);
  const [savedReflection, setSavedReflection] = useState(null);

  // Load saved reflection for today
  useEffect(() => {
    try {
      const key = `mortals.reflection.${todayKey()}`;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        setSavedReflection(parsed);
        setReflectionText(parsed.reflection || "");
        setCommitment(parsed.commitment || "");
      }
    } catch {}
  }, []);

  // Calculate today's synthesis
  const todayData = useMemo(() => {
    const dk = todayKey();
    
    // Big 3
    const big3 = JSON.parse(localStorage.getItem(`mortals.big3.${dk}`) || "[]");
    const big3Done = big3.filter(t => t?.done).length;
    const big3Total = big3.length;
    
    // Time tracking
    const ledger = JSON.parse(localStorage.getItem(`mortals.ledger.${dk}`) || "[]");
    const totalMinutes = ledger.reduce((sum, e) => sum + (Number(e.minutes) || 0), 0);
    const byTag = {};
    ledger.forEach(e => {
      const tag = e.tag || "Unlabeled";
      byTag[tag] = (byTag[tag] || 0) + (Number(e.minutes) || 0);
    });
    
    // Gratitude
    const weekKey = `${now.getFullYear()}-W${Math.ceil((now.getDate() + 6) / 7)}`;
    const gratitude = JSON.parse(localStorage.getItem(`mortals.gratitude.${weekKey}`) || "[]");
    const todayGratitude = gratitude.filter(g => g.date === dk);
    
    return {
      big3Done,
      big3Total,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      byTag,
      topTag: Object.entries(byTag).sort((a, b) => b[1] - a[1])[0],
      gratitudeCount: todayGratitude.length,
      hasData: big3Total > 0 || totalMinutes > 0 || todayGratitude.length > 0
    };
  }, [now]);

  // Generate intelligent insights
  const insights = useMemo(() => {
    const results = [];
    
    // Pattern: Big 3 completion
    if (todayData.big3Total > 0) {
      const rate = (todayData.big3Done / todayData.big3Total) * 100;
      if (rate === 100) {
        results.push({ type: "celebration", icon: Award, text: `All ${todayData.big3Total} Big 3 tasks completed!`, color: "green" });
      } else if (rate >= 66) {
        results.push({ type: "positive", icon: TrendingUp, text: `${todayData.big3Done}/${todayData.big3Total} Big 3 completed`, color: "blue" });
      } else if (rate > 0) {
        results.push({ type: "attention", icon: Target, text: `${todayData.big3Total - todayData.big3Done} Big 3 tasks remaining`, color: "amber" });
      } else {
        results.push({ type: "nudge", icon: AlertCircle, text: "None of today's Big 3 completed yet", color: "red" });
      }
    }
    
    // Pattern: Time allocation
    if (todayData.totalMinutes > 0) {
      if (todayData.totalMinutes >= 240) { // 4+ hours
        results.push({ type: "positive", icon: Clock, text: `${todayData.totalHours}h tracked today`, color: "blue" });
      } else if (todayData.totalMinutes >= 60) {
        results.push({ type: "neutral", icon: Clock, text: `${todayData.totalHours}h tracked so far`, color: "purple" });
      }
      
      // Dominant activity insight
      if (todayData.topTag) {
        const [tag, minutes] = todayData.topTag;
        const pct = Math.round((minutes / todayData.totalMinutes) * 100);
        if (pct >= 50) {
          results.push({ type: "pattern", icon: Eye, text: `${tag} dominates today (${pct}%)`, color: "purple" });
        }
      }
    }
    
    // Pattern: Gratitude
    if (todayData.gratitudeCount > 0) {
      results.push({ type: "celebration", icon: Heart, text: `${todayData.gratitudeCount} ${todayData.gratitudeCount === 1 ? "connection" : "connections"} recorded`, color: "rose" });
    }
    
    // Pattern: Balance check
    const hasDeepWork = Object.keys(todayData.byTag).includes("Deep Work");
    const hasCare = Object.keys(todayData.byTag).includes("Care");
    const hasRest = Object.keys(todayData.byTag).includes("Rest");
    
    if (todayData.totalMinutes > 120 && !hasDeepWork) {
      results.push({ type: "nudge", icon: Brain, text: "No Deep Work tracked yet", color: "amber" });
    }
    if (todayData.totalMinutes > 180 && !hasCare) {
      results.push({ type: "nudge", icon: Heart, text: "Consider logging Care time", color: "amber" });
    }
    
    // Encouragement if nothing happening
    if (!todayData.hasData) {
      results.push({ type: "gentle", icon: Sunrise, text: "Your day is a blank canvas. What will you create?", color: "purple" });
    }
    
    return results;
  }, [todayData]);

  // Generate reflection prompts
  const reflectionPrompts = useMemo(() => {
    const prompts = [
      "What brought you alive today?",
      "What drained your energy?",
      "What would you do differently?",
      "What are you grateful for?",
      "What pattern do you notice?",
      "What truth are you avoiding?",
      "What matters most right now?"
    ];
    
    // Contextual prompts based on data
    if (todayData.big3Done === todayData.big3Total && todayData.big3Total > 0) {
      prompts.unshift("You completed all your Big 3. How does that feel?");
    }
    if (todayData.gratitudeCount === 0) {
      prompts.push("Who helped you today, even in small ways?");
    }
    if (todayData.totalMinutes === 0) {
      prompts.unshift("No time tracked yet. What's keeping you from your intentions?");
    }
    
    return prompts;
  }, [todayData]);

  // Save reflection
  const saveReflection = () => {
    try {
      const key = `mortals.reflection.${todayKey()}`;
      const data = {
        date: todayKey(),
        timestamp: new Date().toISOString(),
        reflection: reflectionText,
        commitment: commitment,
        data: {
          big3: { done: todayData.big3Done, total: todayData.big3Total },
          time: todayData.totalMinutes,
          gratitude: todayData.gratitudeCount
        }
      };
      localStorage.setItem(key, JSON.stringify(data));
      setSavedReflection(data);
    } catch (err) {
      console.error("Failed to save reflection:", err);
    }
  };

  // Get time of day greeting
  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return { text: "Good Morning", icon: Sunrise, color: "amber" };
    if (hour < 17) return { text: "Good Afternoon", icon: Eye, color: "blue" };
    return { text: "Good Evening", icon: Moon, color: "purple" };
  }, [now]);

  const GreetingIcon = greeting.icon;

  return (
    <Card className="relative">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
      
      <CardContent className="relative space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center gap-3 mb-2"
          >
            <div className={`p-3 rounded-2xl bg-gradient-to-br shadow-lg ${
              greeting.color === "amber" ? "from-amber-500 to-orange-600" :
              greeting.color === "blue" ? "from-blue-500 to-indigo-600" :
              "from-purple-500 to-indigo-600"
            }`}>
              <GreetingIcon className="w-7 h-7 text-white" />
            </div>
          </motion.div>
          <div>
            <motion.h2
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-bold text-3xl bg-gradient-to-r from-slate-800 via-purple-700 to-indigo-700 bg-clip-text text-transparent"
            >
              {greeting.text}
            </motion.h2>
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-sm text-slate-600 mt-1"
            >
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </motion.p>
          </div>
        </div>

        {/* Today's Awareness - Data Synthesis */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-lg text-slate-800">Today's Awareness</h3>
            </div>
            {savedReflection && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Reflected
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900 uppercase">Big 3</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{todayData.big3Done}/{todayData.big3Total}</div>
            </div>
            
            <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-900 uppercase">Time</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{todayData.totalHours}h</div>
            </div>
            
            <div className="rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-semibold text-rose-900 uppercase">Gratitude</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{todayData.gratitudeCount}</div>
            </div>
          </div>
        </motion.div>

        {/* Intelligent Insights */}
        <div className="space-y-3">
          <button
            onClick={() => setInsightsExpanded(!insightsExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-lg text-slate-800">Pattern Recognition</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                {insights.length} {insights.length === 1 ? "insight" : "insights"}
              </span>
            </div>
            {insightsExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {insightsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {insights.map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                    >
                      <InsightBadge {...insight} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reflection Journal */}
        <div className="space-y-3">
          <button
            onClick={() => setJournalExpanded(!journalExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Feather className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-lg text-slate-800">Deep Reflection</h3>
            </div>
            {journalExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {journalExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-4"
              >
                {/* Reflection Prompts */}
                <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">Reflection Prompts</span>
                  </div>
                  <div className="grid gap-2">
                    {reflectionPrompts.slice(0, 5).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setReflectionText(prev => prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`)}
                        className="text-left text-sm text-slate-700 hover:text-purple-700 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-purple-200"
                      >
                        • {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reflection Textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Your Reflection
                  </label>
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="What did today teach you? What patterns do you notice? What matters most?"
                    className="w-full h-32 px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none resize-none text-sm leading-relaxed"
                  />
                </div>

                {/* Commitment Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Tomorrow's Commitment
                  </label>
                  <input
                    type="text"
                    value={commitment}
                    onChange={(e) => setCommitment(e.target.value)}
                    placeholder="One thing you'll do differently tomorrow..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none text-sm"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={saveReflection}
                  disabled={!reflectionText.trim() && !commitment.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <Feather className="w-4 h-4" />
                  Save Reflection
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wisdom Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-4 border-t border-slate-200"
        >
          <p className="text-xs text-slate-500 italic leading-relaxed">
            "The unexamined life is not worth living." — Socrates
            <br />
            <span className="text-purple-600 font-medium">This day will not return. What will you learn from it?</span>
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
