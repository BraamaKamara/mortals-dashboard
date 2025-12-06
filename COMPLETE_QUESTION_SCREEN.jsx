/* 
INSTRUCTIONS: Replace "The Question" screen in PhilosophicalMirror.jsx

1. First, add milestones to the data structure (around line 49):
   Change: capsules: 0
   To: capsules: 0,
       milestones: { all: [], achieved: [], pending: [] }

2. Load milestones data (around line 165, before "const capsuleKeys = []"):
   Add these lines:
*/

// Milestones from Storyline Arc
const milestonesData = JSON.parse(localStorage.getItem("mortals.milestones") || '[]');
data.milestones = {
  all: milestonesData,
  achieved: milestonesData.filter(m => m.age <= (data.age || 0)),
  pending: milestonesData.filter(m => m.age > (data.age || 0))
};

/*
3. Replace the entire "question" screen (search for: key="question")
   Replace the entire <motion.div key="question"> ... </motion.div> block with this:
*/

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
        <div className="grid grid-cols-2 gap-4 mb-6">
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
          
          <div className="p-6 bg-amber-900/30 rounded-xl border border-amber-700/50 text-center">
            <div className="text-5xl font-bold text-amber-300 mb-2">
              {mirrorData.milestones.pending.length}
            </div>
            <div className="text-sm text-amber-400">Still Ahead</div>
            <div className="text-xs text-amber-500 mt-1">
              {mirrorData.milestones.pending.length > 0 && mirrorData.age
                ? `Next at age ${mirrorData.milestones.pending[0].age}`
                : 'Your future awaits'}
            </div>
          </div>
        </div>

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
                  key={m.id}
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
                  <div className="text-emerald-400">✓</div>
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

        {mirrorData.milestones.pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              What Still Calls to You
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {mirrorData.milestones.pending.slice(0, 5).map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="p-3 bg-amber-950/40 rounded-lg border border-amber-800/50 flex items-center gap-3"
                >
                  <div className={`w-3 h-3 rounded-full flex-shrink-0`} style={{ backgroundColor: m.color || '#fbbf24' }} />
                  <div className="flex-1">
                    <div className="font-medium text-amber-100">{m.title}</div>
                    <div className="text-xs text-amber-400">
                      Age {m.age}
                      {mirrorData.age ? ` · ${m.age - mirrorData.age} years away` : ''}
                    </div>
                  </div>
                </motion.div>
              ))}
              {mirrorData.milestones.pending.length > 5 && (
                <div className="text-xs text-amber-500 text-center py-2">
                  +{mirrorData.milestones.pending.length - 5} more ahead
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-2xl mb-6 p-6 bg-indigo-950/50 rounded-2xl border border-indigo-800"
      >
        <p className="text-lg leading-relaxed text-center text-indigo-100">
          {mirrorData.milestones.pending.length > 0 && mirrorData.milestones.achieved.length > 0
            ? `You've already achieved ${mirrorData.milestones.achieved.length} milestone${mirrorData.milestones.achieved.length !== 1 ? 's' : ''}. What small step can you take this week toward "${mirrorData.milestones.pending[0]?.title}"?`
            : mirrorData.milestones.pending.length > 0
            ? `"${mirrorData.milestones.pending[0]?.title}" awaits you at age ${mirrorData.milestones.pending[0]?.age}. What needs to happen first?`
            : mirrorData.milestones.achieved.length > 0
            ? "You've accomplished everything you set out to do. What new ambition is calling to you now?"
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
      
      <div className="mt-8 p-6 bg-indigo-950/50 rounded-2xl border border-indigo-800">
        <p className="text-lg leading-relaxed text-center text-indigo-100">
          {reflectionQuestion}
        </p>
      </div>
    </motion.div>
  )}

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
</motion.div>
