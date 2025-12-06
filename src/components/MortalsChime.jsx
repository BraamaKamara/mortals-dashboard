// src/components/MortalsChime.jsx
import React, { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Volume2, Clock, Zap, Hourglass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LS = {
  enabled: "mortals.chime.enabled",
  volume: "mortals.chime.volume",
  quietStart: "mortals.chime.quietStart",
  quietEnd: "mortals.chime.quietEnd",
};

export default function MortalsChime() {
  const [enabled, setEnabled] = useLocalBool(LS.enabled, false);
  const [volume, setVolume] = useLocalNumber(LS.volume, 0.25);
  const [quietStart, setQuietStart] = useLocalNumber(LS.quietStart, 22);
  const [quietEnd, setQuietEnd] = useLocalNumber(LS.quietEnd, 7);
  const [showModal, setShowModal] = useState(false);

  const ctxRef = useRef(null);
  const lastHourRef = useRef(null);
  const tickTimer = useRef(null);

  useEffect(() => {
    cleanup();
    if (!enabled) return;
    if (!ctxRef.current) {
      try { ctxRef.current = new (window.AudioContext || window.webkitAudioContext)(); }
      catch {}
    } else if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume?.();
    }
    lastHourRef.current = currentHourKey();
    tickTimer.current = setInterval(checkAndChime, 10_000);
    setTimeout(checkAndChime, 200);
    return cleanup;
  }, [enabled, volume, quietStart, quietEnd]);

  function cleanup() {
    if (tickTimer.current) { clearInterval(tickTimer.current); tickTimer.current = null; }
  }

  function withinQuietHours(d = new Date()) {
    const h = d.getHours();
    if (quietStart === quietEnd) return false;
    if (quietStart < quietEnd) {
      return h >= quietStart && h < quietEnd;
    } else {
      return h >= quietStart || h < quietEnd;
    }
  }

  function currentHourKey(d = new Date()) {
    return `---`;
  }

  function nearlyTopOfHour(d = new Date()) {
    return d.getMinutes() === 0 && d.getSeconds() < 15;
  }

  function checkAndChime() {
    const now = new Date();
    const hourKey = currentHourKey(now);
    if (!nearlyTopOfHour(now)) return;
    if (hourKey === lastHourRef.current) return;
    if (withinQuietHours(now)) { lastHourRef.current = hourKey; return; }
    playChime();
    lastHourRef.current = hourKey;
    setShowModal(true);
    setTimeout(() => setShowModal(false), 8000);
    try {
      if (Notification?.permission === "granted") {
        new Notification("Mortals Chime", { body: "This hour will not return." });
      }
    } catch {}
  }

  async function ensureContext() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  async function playChime() {
    try {
      const ctx = await ensureContext();
      const now = ctx.currentTime;
      const seq = [
        { freq: 392, dur: 0.6, gap: 0.08 },
        { freq: 523, dur: 0.7, gap: 0.08 },
        { freq: 659, dur: 1.0, gap: 0.00 },
      ];
      let t = now;
      for (const { freq, dur, gap } of seq) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const v = Math.max(0, Math.min(1, volume));
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(v * 0.4, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
        t += dur + gap;
      }
    } catch (e) {}
  }

  function toggleEnabled() {
    if (!enabled) {
      try {
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission?.();
        }
      } catch {}
      setEnabled(true);
      setTimeout(playChime, 150);
    } else {
      setEnabled(false);
    }
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-md p-6">
        <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl opacity-20 bg-amber-300" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-64 h-64 rounded-full blur-3xl opacity-10 bg-orange-300" />
        <div className="flex items-center justify-between relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/70 bg-white/70 backdrop-blur text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Clock className="w-3.5 h-3.5" /> Mortals Chime
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Hourglass className="w-3 h-3" /> Hourly calling
          </div>
        </div>
        <div className="mt-4 relative">
          <div className="text-2xl font-semibold text-slate-900 leading-snug">
            A resonant tone every hour, reminding you:
          </div>
          <div className="mt-2 text-xl text-slate-700 italic">
            "This hour will not return."
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Let it call you back to presence, purpose, and the preciousness of now.
          </div>
        </div>
        <div className="mt-6 grid sm:grid-cols-3 gap-3 relative">
          <div className="rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              {enabled ? <Bell className="w-4 h-4 text-emerald-600" /> : <BellOff className="w-4 h-4 text-gray-400" />}
              {enabled ? "Enabled" : "Disabled"}
            </div>
            <button
              onClick={toggleEnabled}
              className={`px-3 py-2 rounded-2xl text-sm font-medium transition `}
            >
              {enabled ? "Disable" : "Enable"}
            </button>
          </div>
          <div className="rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur p-4">
            <div className="text-sm flex items-center gap-2 font-semibold text-slate-900">
              <Volume2 className="w-4 h-4" /> Volume
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume((+e.target.value) / 100)}
              className="w-full mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">{Math.round(volume * 100)}%</div>
          </div>
          <div className="rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur p-4">
            <div className="text-sm font-semibold text-slate-900">Quiet hours (no chime)</div>
            <div className="mt-2 grid grid-cols-2 gap-2 items-center">
              <SelectHour label="Start" value={quietStart} onChange={setQuietStart} />
              <SelectHour label="End" value={quietEnd} onChange={setQuietEnd} />
            </div>
            <div className="mt-1 text-[11px] text-gray-500">
              Example: 22 to 7 silences overnight.
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between relative">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <Zap className="w-4 h-4" /> The chime rings at the top of every hour (outside quiet hours), even in the background.
          </div>
          <button
            onClick={() => { playChime(); setShowModal(true); setTimeout(() => setShowModal(false), 8000); }}
            className="px-4 py-2 rounded-2xl text-sm bg-gradient-to-br from-slate-800 to-slate-900 text-white hover:brightness-110 shadow"
            title="Play a sample chime now"
          >
            Test chime
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
            <motion.div
              className="relative w-full max-w-lg rounded-3xl border-2 border-white/30 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl p-8 text-white overflow-hidden"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-30 bg-amber-400" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 w-72 h-72 rounded-full blur-3xl opacity-20 bg-orange-400" />
              <div className="relative flex flex-col items-center gap-6 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
                >
                  <Hourglass className="w-20 h-20 text-amber-300 drop-shadow-lg" />
                </motion.div>
                <motion.div
                  className="space-y-3"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="text-3xl font-bold leading-tight">
                    An hour has passed.
                  </div>
                  <div className="text-xl text-amber-200 italic font-light">
                    "This hour will not return."
                  </div>
                </motion.div>
                <motion.div
                  className="text-base text-gray-200 leading-relaxed max-w-md"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  What will you do with the hours you have left? Let this chime call you back to intention, presence, and the life you want to live.
                </motion.div>
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="mt-2 px-5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur text-sm font-medium border border-white/30 transition"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Return to the moment
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SelectHour({ label, value, onChange }) {
  return (
    <label className="text-sm flex items-center gap-2">
      <span className="w-10 text-gray-600">{label}</span>
      <select
        className="w-full rounded-2xl border border-gray-300 bg-white px-2 py-1 text-sm"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      >
        {Array.from({ length: 24 }).map((_, h) => (
          <option key={h} value={h}>
            {String(h).padStart(2, "0")}:00
          </option>
        ))}
      </select>
    </label>
  );
}

function useLocalBool(key, initial = false) {
  const [v, setV] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}
function useLocalNumber(key, initial = 0) {
  const [v, setV] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw != null ? Number(JSON.parse(raw)) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}
