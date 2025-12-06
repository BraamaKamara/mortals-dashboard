// src/components/AboutPhilosophy.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Hourglass, BookText, Feather, Sparkles, Target, Calendar, Clock, Users, MessageSquare, Compass } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 16 } },
};

const quotes = [
  { q: "This hour will not return.", a: "Mortals Dashboard" },
  { q: "You could leave life right now. Let that determine what you do and say and think.", a: "Marcus Aurelius" },
  { q: "He who has a why to live can bear almost any how.", a: "Friedrich Nietzsche" },
  { q: "The meaning of life is to give life meaning.", a: "Viktor Frankl (paraphrased)" },
  { q: "Life is not long, but it is wide  and awareness stretches it.", a: "Braama Kamara" },
];

function SectionCard({ icon: Icon, title, children, highlight = false }) {
  return (
    <motion.div 
      variants={item} 
      className={`rounded-2xl border ${highlight ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 bg-white'} shadow-sm p-5 md:p-6`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${highlight ? 'text-purple-600' : 'text-gray-700'}`} />
        <h3 className="font-semibold text-base md:text-lg">{title}</h3>
      </div>
      <div className={`${highlight ? 'text-gray-800' : 'text-gray-700'} leading-relaxed text-sm md:text-base`}>{children}</div>
    </motion.div>
  );
}

function FeatureItem({ icon: Icon, title, description }) {
  return (
    <motion.div variants={item} className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-1">{title}</h4>
        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export default function AboutPhilosophy({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="about"
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 110, damping: 18 }}
            className="relative mx-auto my-6 md:my-10 max-w-4xl w-[92%] md:w-[80%] lg:w-[70%] rounded-2xl bg-gradient-to-b from-white to-gray-50 shadow-2xl overflow-hidden"
          >
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b px-4 md:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" />
                <h2 className="font-semibold">The Mortals Dashboard  Philosophy</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 hover:bg-gray-100 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="max-h-[78vh] overflow-y-auto px-4 md:px-6 py-5 space-y-6"
            >
              <motion.div variants={item} className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  A Mirror for Your Mortality
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-3">
                  The Mortals Dashboard isn't just another productivity tool  it's a philosophical instrument designed to help you live with awareness, intention, and depth.
                </p>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  By making your finite time visible, it transforms abstract mortality into concrete wisdom. Every visualization, every reflection, every chime serves one purpose: to remind you that <span className="font-semibold text-purple-700">this hour will not return</span>.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-4">
                <SectionCard icon={Hourglass} title="Finiteness" highlight>
                  Your life is countable. Approximately 4,000 weeks. This isn't morbid  it's clarifying. When you see your limits, you finally know what matters.
                </SectionCard>
                <SectionCard icon={BookText} title="Reflection" highlight>
                  Time becomes life only when consciously lived. Through daily questions, weekly synthesis, and milestone tracking, transform passing moments into lasting meaning.
                </SectionCard>
                <SectionCard icon={Feather} title="Legacy" highlight>
                  What you create, teach, and strengthen outlives you. Your epitaph, your circle of influence, your memory capsules  these are seeds of immortality.
                </SectionCard>
              </div>

              <motion.div variants={item} className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-lg md:text-xl">What You Can Do</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FeatureItem 
                    icon={Clock}
                    title="Visualize Your Life"
                    description="See your entire lifespan as dots, weeks, or curves. Watch your existence unfold in Years view, Weeks view, or against mortality statistics."
                  />
                  <FeatureItem 
                    icon={Target}
                    title="Track Milestones & Ambitions"
                    description="Set life goals across decades. Mark achievements as they happen. The Question mirror shows what you've accomplished and what still awaits."
                  />
                  <FeatureItem 
                    icon={Heart}
                    title="Live by Your Values"
                    description="Define what matters (Truth, Courage, Love, etc.). Check alignment daily. See weekly patterns. Let values guide decisions, not just productivity."
                  />
                  <FeatureItem 
                    icon={Calendar}
                    title="Track Time Intentionally"
                    description="Log how you spend hours with the Gratitude Ledger. Not to optimize ruthlessly, but to ensure your days reflect your priorities."
                  />
                  <FeatureItem 
                    icon={Users}
                    title="Build Your Circle of Influence"
                    description="Map the people you're impacting  inner circle, middle, outer. Relationships are the currency of legacy."
                  />
                  <FeatureItem 
                    icon={MessageSquare}
                    title="Create Memory Capsules"
                    description="Write letters to your future self. Seal them with dates. Rediscover who you were and measure how you've grown."
                  />
                  <FeatureItem 
                    icon={BookText}
                    title="Write Your Epitaph"
                    description="What will you be remembered for? Write it now, while you can still shape it. Revise it as you evolve."
                  />
                  <FeatureItem 
                    icon={Compass}
                    title="Look in the Philosophical Mirror"
                    description="A guided 7-screen journey through time, values, legacy, and ambition. Exit transformed with clarity about what truly matters."
                  />
                </div>
              </motion.div>
              <SectionCard icon={Sparkles} title="Every Detail Has Purpose">
                <div className="space-y-3">
                  <p>
                    <span className="font-semibold text-gray-900">Weeks View & Years View:</span> Your life reduced to dots. Past weeks fade in gray. Future weeks glow red. Current week ringed in cyan. The final decade shimmers amber.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">The Question (Mirror #6):</span> Shows achieved milestones (emerald), missed opportunities (yellow), and future ambitions (amber). Contextual prompts guide reflection without judgment.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Mortals Chime:</span> Every hour, a gentle bell. A quote. A reminder: "This hour will not return." Not anxiety  awareness.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Mortality Curves:</span> Your age against population survival rates. See yourself within the collective human story.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Weekly Synthesis:</span> AI-powered reflection on your week's mood, values, and time. Not prescriptive  reflective.
                  </p>
                </div>
              </SectionCard>

              <motion.div variants={item} className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Feather className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-lg">Wisdom That Guides This Work</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {quotes.map((q, i) => (
                    <motion.blockquote
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm text-gray-800 italic">"{q.q}"</p>
                      <footer className="mt-2 text-xs text-gray-500 font-medium"> {q.a}</footer>
                    </motion.blockquote>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={item} className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  Not a Countdown to Death  A Count-Up to Meaning
                </h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                  This dashboard is a gentle revolt against numbness. It teaches proportion between doing and being. It shows you that your days are numbered  and that is your freedom.
                </p>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed italic">
                  Use it not to optimize every moment, but to live each one with eyes wide open.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
