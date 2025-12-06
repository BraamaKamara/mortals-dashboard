// src/data/moods.js
export const MOODS = [
  { key: "joy",    label: "Joy",    emoji: "😊", color: "bg-green-500" },
  { key: "calm",   label: "Calm",   emoji: "🙂", color: "bg-teal-500"  },
  { key: "neutral",label: "Neutral",emoji: "😐", color: "bg-gray-400"  },
  { key: "anxious",label: "Anxious",emoji: "😟", color: "bg-amber-500" },
  { key: "sad",    label: "Sad",    emoji: "😔", color: "bg-blue-500"  },
];

export const MOOD_BY_KEY = Object.fromEntries(MOODS.map(m => [m.key, m]));

export const todayKey = () => new Date().toISOString().slice(0,10);
export const dateKey  = (d) => new Date(d).toISOString().slice(0,10);

export function readMood(key = todayKey()) {
  try { return localStorage.getItem(`mortals.mood.${key}`) || ""; } catch { return ""; }
}
export function writeMood(moodKey, key = todayKey()) {
  try { localStorage.setItem(`mortals.mood.${key}`, moodKey || ""); } catch {}
  try { window.dispatchEvent(new Event("mortals-mood-updated")); } catch {}
}

export function lastNDaysKeys(n=30, end = new Date()) {
  const out = [];
  const d = new Date(end);
  for (let i = 0; i < n; i++) {
    const dk = dateKey(d);
    out.unshift(dk);
    d.setDate(d.getDate() - 1);
  }
  return out;
}
