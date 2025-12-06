// src/components/StillnessModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function StillnessModal({ open, onClose, seconds = 60 }) {
  const [remaining, setRemaining] = useState(seconds);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [intention, setIntention] = useState("");
  const audioCtx = useRef(null);
  const disturbFlag = useRef(false);
  const [calmSeconds, setCalmSeconds] = useState(0);
  const [lastEventAt, setLastEventAt] = useState(null);
  const [rippleKey, setRippleKey] = useState(0);
  const particles = useRef(
    Array.from({ length: 28 }).map((_, i) => ({
      angle: (i / 28) * Math.PI * 2 + Math.random() * 0.3,
      radius: 94 + Math.random() * 10,
      size: 3 + Math.random() * 3,
      delay: Math.random() * 2,
    }))
  );
  const [mark, setMark] = useState("");

  // Reset state on open
  useEffect(() => {
    if (!open) return;
    setRemaining(seconds);
    setStarted(false);
    setCompleted(false);
    setIntention("");
    setCalmSeconds(0);
    setLastEventAt(null);
  }, [open, seconds]);

  // Timer once started
  useEffect(() => {
    if (!open || !started || completed) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          return 0;
        }
        return r - 1;
      });
      // calm tracking once per second
      if (!disturbFlag.current && document.visibilityState === 'visible') {
        setCalmSeconds((c) => c + 1);
      }
      disturbFlag.current = false;
    }, 1000);
    return () => clearInterval(id);
  }, [open, started, completed]);

  // Completion detection and logging
  useEffect(() => {
    if (!open) return;
    if (remaining === 0 && started && !completed) {
      setCompleted(true);
      playBell(660, 0.25);
      try {
        const calmPct = seconds > 0 ? Math.round((calmSeconds / seconds) * 100) : 0;
        logStillness({ seconds, intention, calmPct });
      } catch {}
    }
  }, [remaining, started, completed, open, seconds, intention, calmSeconds]);

  // Disturbance listeners
  useEffect(() => {
    if (!open || !started || completed) return;
    const mark = () => { disturbFlag.current = true; setLastEventAt(Date.now()); setRippleKey((k)=>k+1); };
    const onVis = () => { if (document.visibilityState !== 'visible') mark(); };
    window.addEventListener('mousemove', mark, { passive: true });
    window.addEventListener('mousedown', mark, { passive: true });
    window.addEventListener('keydown', mark, { passive: true });
    window.addEventListener('scroll', mark, { passive: true });
    window.addEventListener('touchstart', mark, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('mousemove', mark);
      window.removeEventListener('mousedown', mark);
      window.removeEventListener('keydown', mark);
      window.removeEventListener('scroll', mark);
      window.removeEventListener('touchstart', mark);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [open, started, completed]);

  // Breath guidance (box breathing for sessions >= 30s)
  const useBreath = seconds >= 30;
  const cycleLen = 12; // 4-4-4
  const phase = useMemo(() => {
    if (!useBreath || !started || completed) return { label: "", t: 0 };
    const elapsed = seconds - remaining;
    const inCycle = elapsed % cycleLen;
    if (inCycle < 4) return { label: "Inhale", t: inCycle / 4 };
    if (inCycle < 8) return { label: "Hold", t: (inCycle - 4) / 4 };
    return { label: "Exhale", t: (inCycle - 8) / 4 };
  }, [useBreath, started, completed, seconds, remaining]);

  const pct = (seconds - remaining) / seconds;
  const label = remaining > 0 ? `${remaining}s` : "Complete";

  if (!open) return null;

  function ensureAudio() {
    if (!audioCtx.current) {
      try {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch {}
    }
    return audioCtx.current;
  }

  function playBell(freq = 440, dur = 0.2) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function start() {
    setStarted(true);
    playBell(520, 0.15);
  }

  const handleClose = () => {
    if (completed && mark && mark.trim().length) {
      try { appendMarkToLastSession(mark.trim()); } catch {}
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative flex flex-col items-center gap-5 text-white select-none w-full max-w-xl">
        {/* Ring progress */}
        <div
          className="relative grid place-items-center rounded-full"
          style={{
            width: 240,
            height: 240,
            background: `conic-gradient(rgba(255,255,255,0.8) ${pct * 360}deg, rgba(255,255,255,0.12) 0deg)`,
          }}
        >
          {/* Orbiting particles reacting to disturbance */}
          <div className="absolute inset-0" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.35))' }}>
            {particles.current.map((p, idx) => {
              const disturbed = started && !completed && lastEventAt && Date.now() - lastEventAt < 1200;
              const R = completed ? 10 : disturbed ? p.radius + 22 : p.radius;
              const x = Math.cos(p.angle) * R;
              const y = Math.sin(p.angle) * R;
              return (
                <span
                  key={idx}
                  className="absolute rounded-full bg-white/80"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: p.size,
                    height: p.size,
                    transform: `translate(${x}px, ${y}px)`,
                    transition: 'transform 0.8s ease-out, opacity 0.8s ease-out',
                    opacity: disturbed ? 0.9 : 0.6,
                  }}
                />
              );
            })}
          </div>
          <div className="absolute inset-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 grid place-items-center">
            <motion.div
              className="rounded-full"
              animate={useBreath && started && !completed ? { scale: phase.label === "Inhale" ? [1, 1.1] : phase.label === "Exhale" ? [1.05, 0.95] : 1 } : { scale: 1 }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 140, height: 140, border: "2px solid rgba(255,255,255,0.6)" }}
            />
            <div className="absolute text-center">
              <div className="text-5xl font-bold tabular-nums">{label}</div>
              {useBreath && started && !completed ? (
                <div className="mt-1 text-sm text-gray-200">{phase.label}</div>
              ) : (
                <div className="mt-1 text-sm text-gray-200">This minute will not return</div>
              )}
            </div>
          </div>
          {/* Disturbance ripple */}
          {started && !completed && (
            <motion.div
              key={rippleKey}
              className="absolute rounded-full"
              initial={{ opacity: 0.35, scale: 0.8, borderColor: 'rgba(239,68,68,0.7)' }}
              animate={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ width: 220, height: 220, borderWidth: 2, borderStyle: 'solid' }}
            />
          )}
        </div>

        {/* Pre-start intention */}
        {!started && !completed && (
          <div className="w-full">
            <label className="block text-xs text-gray-200 mb-1">Set an intention (optional)</label>
            <input
              type="text"
              value={intention}
              onChange={(e)=> setIntention(e.target.value)}
              className="w-full rounded-2xl border border-white/30 bg-white/10 text-white placeholder-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/40"
              placeholder="Gratitude, clarity, release…"
            />
          </div>
        )}

        {/* Progress bar + calm score */}
        <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
          <motion.div
            className="h-2 bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ type: "tween", duration: 0.2 }}
          />
        </div>
        {started && (
          <div className="text-xs text-gray-200">Stillness score: <span className="font-semibold text-white">{Math.max(0, Math.min(100, Math.round((calmSeconds / Math.max(1, seconds - remaining)) * 100))) || 0}%</span></div>
        )}
        {completed && (
          <div className="w-full mt-2 space-y-3">
            <div className="text-center text-sm text-gray-200">You were here for a minute. Presence: <span className="text-white font-semibold">{Math.round((calmSeconds/seconds)*100)}%</span></div>
            <div className="flex items-center gap-2 justify-center">
              <input
                value={mark}
                onChange={(e)=>setMark(e.target.value)}
                placeholder="One-word mark for this moment (optional)"
                className="w-72 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                onClick={()=>{ if (mark.trim()) { try { appendMarkToLastSession(mark.trim()); } catch {} } }}
                className="px-3 py-2 rounded-md bg-white/15 hover:bg-white/25 text-sm"
              >Save</button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-1 flex items-center justify-center gap-2">
          {!started && !completed ? (
            <button
              className="px-4 py-2 rounded-2xl bg-white text-black text-sm hover:bg-gray-100"
              onClick={start}
            >
              Begin
            </button>
          ) : (
            <button
              className="px-4 py-2 rounded-2xl bg-white text-black text-sm hover:bg-gray-100"
              onClick={handleClose}
            >
              {completed ? "Close" : "End Early"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- storage helpers ---
function logStillness(entry) {
  const key = "mortals.stillness.log";
  const now = new Date();
  const rec = {
    ts: now.toISOString(),
    date: now.toISOString().slice(0,10),
    seconds: Number(entry.seconds) || 0,
    intention: entry.intention || "",
    completed: true,
    calmPct: typeof entry.calmPct === 'number' ? entry.calmPct : undefined,
  };
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(rec);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {}
}

function appendMarkToLastSession(mark) {
  const key = "mortals.stillness.log";
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return;
    const last = arr[arr.length - 1];
    last.mark = mark;
    arr[arr.length - 1] = last;
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {}
}
