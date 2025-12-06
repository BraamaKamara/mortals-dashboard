import React, { useEffect, useMemo, useState } from "react";

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white p-4 ${className}`}>{children}</div>;
}

function useLocal(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfWeek(d = new Date()) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 7);
  e.setMilliseconds(-1);
  return e;
}

function Donut({ percent = 0, size = 140, stroke = 14, track = "#f3f4f6", color = "#3b82f6", label = "" }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute -rotate-90">
        {/* Background track with subtle shadow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
        />
        {/* Animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ 
            transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute text-center">
        <div className="text-2xl font-bold" style={{ color }}>{Math.round(percent)}%</div>
        <div className="text-xs text-gray-400 mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function DailyWeeklyJars({ isFinal = false, size = 140 }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dayPercent = useMemo(() => {
    const start = startOfDay(now).getTime();
    const end = endOfDay(now).getTime();
    const pct = ((now.getTime() - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [now]);

  const weekPercent = useMemo(() => {
    const start = startOfWeek(now).getTime();
    const end = endOfWeek(now).getTime();
    const pct = ((now.getTime() - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [now]);

  const yearPercent = useMemo(() => {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const pct = ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [now]);

  // Enhanced colors with gradient-like feel
  const dayColor = isFinal ? "#f59e0b" : "#3b82f6"; // amber-500 or blue-500
  const weekColor = isFinal ? "#d97706" : "#8b5cf6"; // amber-600 or violet-500
  const yearColor = isFinal ? "#b45309" : "#ec4899"; // amber-700 or pink-500

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Daily Progress */}
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">Day Progress</div>
          <div className="text-xs text-gray-500 mt-1">{new Date(now).toLocaleTimeString()}</div>
        </div>
        <Donut percent={dayPercent} size={size} label="elapsed" color={dayColor} />
      </div>

      {/* Weekly Progress */}
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">Week Progress</div>
          <div className="text-xs text-gray-500 mt-1">{getWeekLabel(now)}</div>
        </div>
        <Donut percent={weekPercent} size={size} label="elapsed" color={weekColor} />
      </div>

      {/* Yearly Progress */}
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">Year Progress</div>
          <div className="text-xs text-gray-500 mt-1">{now.getFullYear()}</div>
        </div>
        <Donut percent={yearPercent} size={size} label="elapsed" color={yearColor} />
      </div>
    </div>
  );
  
  function getWeekLabel(d) {
    const dt = new Date(d);
    const year = dt.getFullYear();
    const week = getWeekNumber(dt);
    return `Week ${week}, ${year}`;
  }
  
  function getWeekNumber(d) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  }
}
