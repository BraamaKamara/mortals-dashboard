// src/components/WeeklyMoodSummary.jsx
import React, { useMemo } from "react";
import { lastNDaysKeys, readMood, MOOD_BY_KEY, MOODS } from "../data/moods";
import { BarChart2 } from "lucide-react";

export default function WeeklyMoodSummary() {
  const keys = useMemo(() => lastNDaysKeys(7, new Date()), []);
  const counts = useMemo(() => {
    const c = {};
    for (const dk of keys) {
      const k = readMood(dk);
      if (k) c[k] = (c[k] || 0) + 1;
    }
    return c;
  }, [keys]);

  const dominant = useMemo(() => {
    let top = null, n = 0;
    for (const [k, v] of Object.entries(counts)) if (v > n) { top = k; n = v; }
    return { key: top, count: n };
  }, [counts]);

  // tiny streak calc (consecutive non-empty from most recent backwards)
  const streak = useMemo(() => {
    let s = 0;
    for (let i = keys.length - 1; i >= 0; i--) {
      if (readMood(keys[i])) s += 1; else break;
    }
    return s;
  }, [keys]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
      <div className="flex items-center gap-2 font-semibold">
        <BarChart2 className="w-4 h-4"/> Weekly Mood Summary (7 days)
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
        <Stat label="Days logged" value={`${Object.values(counts).reduce((a,b)=>a+b,0)}/7`} />
        <Stat label="Streak (days)" value={streak} />
        <Stat
          label="Dominant mood"
          value={dominant.key ? `${MOOD_BY_KEY[dominant.key].label} (${dominant.count})` : "—"}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {MOODS.map(m => {
          const n = counts[m.key] || 0;
          return (
            <div key={m.key} className="flex items-center gap-2 text-sm">
              <span className={`inline-block w-3 h-3 rounded ${m.color}`} />
              <span className="w-20">{m.label}</span>
              <div className="h-2 w-40 bg-gray-200 rounded">
                <div className={`h-2 rounded ${m.color}`} style={{ width: `${(n/7)*100}%`, backgroundColor: "currentColor" }} />
              </div>
              <span className="tabular-nums">{n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-3">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
