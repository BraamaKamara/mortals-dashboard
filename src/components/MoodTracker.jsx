// src/components/MoodTracker.jsx
import React, { useEffect, useMemo, useState } from "react";
import { MOODS, MOOD_BY_KEY, todayKey, readMood, writeMood } from "../data/moods";
import { Heart, BarChart2 } from "lucide-react";

export default function MoodTracker() {
  const dk = todayKey();
  const [value, setValue] = useState(readMood(dk));

  useEffect(() => {
    const h = () => setValue(readMood(dk));
    window.addEventListener("mortals-mood-updated", h);
    return () => window.removeEventListener("mortals-mood-updated", h);
  }, [dk]);

  const selected = MOOD_BY_KEY[value];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Heart className="w-4 h-4"/> Mood (today)
        </div>
        {selected ? (
          <div className="text-sm flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${selected.color}`} />
            <span className="tabular-nums">{selected.emoji} {selected.label}</span>
          </div>
        ) : <div className="text-xs text-gray-500">No mood selected</div>}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {MOODS.map(m => (
          <button
            key={m.key}
            onClick={() => { setValue(m.key); writeMood(m.key, dk); }}
            className={`rounded-2xl border px-3 py-2 text-sm flex flex-col items-center hover:bg-gray-50
              ${value === m.key ? "border-black" : "border-gray-300"}`}
            title={m.label}
          >
            <span className="text-xl">{m.emoji}</span>
            <span className="mt-1">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-600 flex items-center gap-2">
        <BarChart2 className="w-4 h-4"/> Tip: Choose one mood daily; it’ll color the heatmap below.
      </div>
    </div>
  );
}
