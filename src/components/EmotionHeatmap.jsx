// src/components/EmotionHeatmap.jsx
import React, { useEffect, useMemo, useState } from "react";
import { lastNDaysKeys, readMood, writeMood, MOOD_BY_KEY, MOODS } from "../data/moods";
import { CalendarDays } from "lucide-react";

function nextMoodKey(current) {
  const order = MOODS.map(m => m.key);
  const i = order.indexOf(current);
  if (i === -1) return order[0];               // None -> first mood
  if (i === order.length - 1) return "";       // last mood -> None
  return order[i + 1];
}

export default function EmotionHeatmap({ days = 30 }) {
  const [map, setMap] = useState({});
  const keys = useMemo(() => lastNDaysKeys(days, new Date()), [days]);

  const refresh = () => {
    const m = {};
    for (const dk of keys) m[dk] = readMood(dk);
    setMap(m);
  };

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("mortals-mood-updated", h);
    return () => window.removeEventListener("mortals-mood-updated", h);
    // eslint-disable-next-line
  }, [keys]);

  const summary = useMemo(() => {
    const counts = {};
    for (const k of Object.values(map)) if (k) counts[k] = (counts[k] || 0) + 1;
    let top = null, topCount = 0;
    for (const [k, c] of Object.entries(counts)) if (c > topCount) { top = k; topCount = c; }
    return { counts, top, topCount };
  }, [map]);

  const monthLabel = (dk) => {
    const d = new Date(dk);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <CalendarDays className="w-4 h-4"/> Emotion Heatmap (last {days} days)
        </div>
        {summary.top ? (
          <div className="text-sm">
            Dominant: <b>{summary.top}</b> ({summary.topCount}/{days})
          </div>
        ) : <div className="text-xs text-gray-500">No moods logged</div>}
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="inline-grid grid-flow-col auto-cols-max gap-1">
          {keys.map((dk) => {
            const moodKey = map[dk];
            const color = moodKey ? (MOOD_BY_KEY[moodKey]?.color || "bg-gray-200") : "bg-gray-200";
            const label = moodKey ? `${MOOD_BY_KEY[moodKey]?.label}` : "No entry";
            return (
              <button
                key={dk}
                title={`${monthLabel(dk)} — ${label}\n(Click to change)`}
                className={`w-5 h-5 rounded ${color} border border-black/5`}
                onClick={() => {
                  const next = nextMoodKey(moodKey || "");
                  writeMood(next, dk);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 text-xs text-gray-600 flex items-center gap-2 flex-wrap">
        Legend:
        {Object.values(MOOD_BY_KEY).map(m => (
          <span key={m.key} className="inline-flex items-center gap-1">
            <span className={`w-3 h-3 rounded ${m.color}`} /> {m.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-200 border" /> No entry
        </span>
      </div>
    </div>
  );
}
