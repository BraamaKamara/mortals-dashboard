// src/components/ValuesCompass.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Compass, Check, Minus, X, Edit3, Save, Sparkles, TrendingUp, Calendar, ChevronDown, ChevronUp, Settings } from "lucide-react";

/**
 * Values Compass - Redesigned with Circular Visualization
 * - Define 5 guiding values (default: Truth, Generosity, Courage, Wisdom, Discipline)
 * - Each day, mark: No / Partial / Yes
 * - Visual circular compass showing alignment
 * - Streak tracking with visual rings
 * - Historical sparklines
 * - Stores to localStorage:
 *   - mortals.values.names -> ["Truth","Generosity","Courage","Wisdom","Discipline"]
 *   - mortals.values.check.YYYY-MM-DD -> { Truth: 0|1|2, ... }
 */

const NAMES_KEY = "mortals.values.names";
const DEFAULT_NAMES = ["Truth", "Generosity", "Courage", "Wisdom", "Discipline"];
const MAX_VALUES = 5;
const PARTIAL_WEIGHT = 0.5; // Default: Each Partial contributes this fraction to alignment
const PW_KEY = "mortals.values.partialWeight";

const todayKey = () => new Date().toISOString().slice(0, 10);
const dateKey = (d) => new Date(d).toISOString().slice(0, 10);

function readNames() {
  try {
    const raw = localStorage.getItem(NAMES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...DEFAULT_NAMES];
}
function writeNames(arr) {
  try { localStorage.setItem(NAMES_KEY, JSON.stringify(arr)); } catch {}
}
function readDayMap(dk) {
  try {
    return JSON.parse(localStorage.getItem(`mortals.values.check.${dk}`) || "{}");
  } catch { return {}; }
}
function writeDayMap(dk, map) {
  try { localStorage.setItem(`mortals.values.check.${dk}`, JSON.stringify(map)); } catch {}
}

// Ensure we always operate on exactly MAX_VALUES names
function normalizeNames(list) {
  let cleaned = (list || []).map((s) => (s || "").trim()).filter(Boolean);
  // Fill with defaults if fewer than MAX_VALUES
  let i = 0;
  while (cleaned.length < MAX_VALUES && i < DEFAULT_NAMES.length) {
    // Avoid duplicates when filling
    const candidate = DEFAULT_NAMES[i++];
    if (!cleaned.includes(candidate)) cleaned.push(candidate);
  }
  return cleaned.slice(0, MAX_VALUES);
}

function Streak({ label, count }) {
  return (
    <div className="text-xs text-gray-600">
      <span className="font-medium">{label}</span>: <span className="tabular-nums">{count}</span> day{count === 1 ? "" : "s"}
    </div>
  );
}

// Get last N days of data for sparkline
function getHistoricalData(valueName, days = 7) {
  const data = [];
  const cur = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(cur);
    d.setDate(d.getDate() - i);
    const dk = dateKey(d);
    const m = readDayMap(dk);
    data.push(m[valueName] ?? 0);
  }
  return data;
}

// Mini sparkline component
function Sparkline({ data, width = 60, height = 20 }) {
  if (!data || data.length === 0) return null;
  
  const max = 2; // our scale is 0-2
  const step = width / (data.length - 1 || 1);
  
  const points = data.map((val, i) => {
    const x = i * step;
    const y = height - (val / max) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

export default function ValuesCompass({ accent = "auto" /* "auto" | "gold" | "gray" */ }) {
  const [names, setNames] = useState(() => normalizeNames(readNames()));
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [partialWeight, setPartialWeight] = useState(() => {
    try {
      const raw = localStorage.getItem(PW_KEY);
      const v = raw != null ? Number(raw) : PARTIAL_WEIGHT;
      return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : PARTIAL_WEIGHT;
    } catch {
      return PARTIAL_WEIGHT;
    }
  });

  const dk = todayKey();
  const [map, setMap] = useState(readDayMap(dk)); // { ValueName: 0|1|2 }
  useEffect(() => writeDayMap(dk, map), [dk, map]);

  // persist partial weight
  useEffect(() => {
    try { localStorage.setItem(PW_KEY, String(partialWeight)); } catch {}
  }, [partialWeight]);

  // if values list changes, ensure we keep only known keys in today's record
  useEffect(() => {
    setMap((m) => {
      const next = {};
      names.forEach((v) => (next[v] = m[v] ?? 0));
      return next;
    });
    // Persist normalized names of fixed length
    writeNames(normalizeNames(names));
  }, [names]);

  // streaks = consecutive past days with "Yes" (2)
  const streaks = useMemo(() => {
    const out = {};
    names.forEach((name) => {
      let c = 0;
      // Walk back from yesterday
      const cur = new Date();
      for (let i = 0; i < 3650; i++) { // up to ~10 years
        cur.setDate(cur.getDate() - 1);
        const m = readDayMap(dateKey(cur));
        const s = Number(m?.[name] ?? 0);
        if (s === 2) c += 1;
        else break;
      }
      out[name] = c;
    });
    return out;
  }, [names, dk]); // recompute daily

  const yesCount = names.reduce((a, n) => a + (map[n] === 2 ? 1 : 0), 0);
  const partialCount = names.reduce((a, n) => a + (map[n] === 1 ? 1 : 0), 0);
  const weightedScore = yesCount + partialCount * partialWeight;
  const scorePct = Math.round((weightedScore / (names.length || 1)) * 100);
  
  // Get status color for a value
  const getValueColor = (status) => {
    if (status === 2) return { bg: '#10b981', ring: '#059669', text: 'text-emerald-600' }; // green
    if (status === 1) return { bg: '#f59e0b', ring: '#d97706', text: 'text-amber-600' }; // amber
    return { bg: '#ef4444', ring: '#dc2626', text: 'text-rose-600' }; // red
  };
  
  // Calculate compass alignment (for center circle animation)
  const isFullyAligned = yesCount === names.length; // true only when all are Yes
  const isPartiallyAligned = weightedScore > 0; // any progress counts

  // Cycle a value's status: 0 -> 1 -> 2 -> 0
  const cycleStatus = (name) => {
    setMap((m) => {
      const cur = Number(m?.[name] ?? 0);
      const next = (cur + 1) % 3;
      return { ...m, [name]: next };
    });
  };

  // styling
  const headerTint =
    accent === "gold"
      ? "border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900"
      : accent === "gray"
      ? "border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 text-gray-900"
      : "border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900";

  // Circular Compass Visualization
  const CompassVisualization = () => {
    const size = 380;
    const center = size / 2;
    // Slightly reduce radius when we have 5 values to avoid label overlap
    const radius = names.length > 3 ? 130 : 140;
    
    // Calculate positions for N values (evenly spaced, starting from top)
    const step = 360 / (names.length || 1);
    const positions = names.map((name, i) => {
      const deg = i * step - 90; // -90 to start from top
      const angle = deg * (Math.PI / 180);
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return { name, x, y, angle: deg };
    });

    return (
      <div className="flex justify-center items-center p-6">
        <svg width={size} height={size} className="drop-shadow-lg">
          {/* Background compass rose */}
          <defs>
            <radialGradient id="compassBg" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#f8fafc" stopOpacity="1" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="1" />
            </radialGradient>
            <radialGradient id="centerGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor={isFullyAligned ? "#10b981" : isPartiallyAligned ? "#f59e0b" : "#94a3b8"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isFullyAligned ? "#10b981" : isPartiallyAligned ? "#f59e0b" : "#94a3b8"} stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Outer circle background */}
          <circle cx={center} cy={center} r={radius + 20} fill="url(#compassBg)" stroke="#cbd5e1" strokeWidth="1" />
          
          {/* Compass cardinal marks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg - 90) * (Math.PI / 180);
            const x1 = center + (radius + 10) * Math.cos(rad);
            const y1 = center + (radius + 10) * Math.sin(rad);
            const x2 = center + (radius + 20) * Math.cos(rad);
            const y2 = center + (radius + 20) * Math.sin(rad);
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#94a3b8"
                strokeWidth={deg % 90 === 0 ? "2" : "1"}
                opacity="0.4"
              />
            );
          })}
          
          {/* Center glow effect */}
          <circle cx={center} cy={center} r={80} fill="url(#centerGlow)" />
          
          {/* Value arms and nodes */}
          {positions.map(({ name, x, y, angle }, i) => {
            const status = map[name] ?? 0;
            const color = getValueColor(status);
            const streak = streaks[name] || 0;
            
            return (
              <g key={name}>
                {/* Arm line from center to value */}
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke={color.bg}
                  strokeWidth="3"
                  opacity="0.4"
                  strokeDasharray={status === 0 ? "5,5" : "none"}
                />
                
                {/* Streak ring (if any) */}
                {streak > 0 && (
                  <circle
                    cx={x}
                    cy={y}
                    r={28 + Math.min(streak, 30)}
                    fill="none"
                    stroke={color.ring}
                    strokeWidth="2"
                    opacity="0.2"
                  />
                )}
                
                {/* Value node outer ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={26}
                  fill="white"
                  stroke={color.ring}
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => cycleStatus(name)}
                  title={`Toggle ${name}`}
                  style={{
                    filter: status === 2 ? 'drop-shadow(0 0 8px ' + color.bg + ')' : 'none'
                  }}
                />
                
                {/* Value node inner circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={20}
                  fill={color.bg}
                  opacity={status === 0 ? "0.3" : "0.9"}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => cycleStatus(name)}
                  title={`Toggle ${name}`}
                />
                
                {/* Status icon in node */}
                {status === 2 && (
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="20" fontWeight="bold" style={{ pointerEvents: 'none' }}>✓</text>
                )}
                {status === 1 && (
                  <text x={x} y={y + 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="24" fontWeight="bold" style={{ pointerEvents: 'none' }}>-</text>
                )}
                {status === 0 && (
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="20" fontWeight="bold" opacity="0.7" style={{ pointerEvents: 'none' }}>×</text>
                )}
              </g>
            );
          })}
          
          {/* Center circle - alignment score */}
          <circle
            cx={center}
            cy={center}
            r={50}
            fill="white"
            stroke={isFullyAligned ? "#10b981" : isPartiallyAligned ? "#f59e0b" : "#cbd5e1"}
            strokeWidth="4"
            className="transition-all duration-500"
            style={{
              filter: isFullyAligned ? 'drop-shadow(0 0 12px #10b981)' : 'none'
            }}
          />
          
          {/* Score text */}
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isFullyAligned ? "#10b981" : isPartiallyAligned ? "#f59e0b" : "#64748b"}
            fontSize="28"
            fontWeight="bold"
          >
            {scorePct}%
          </text>
          <text
            x={center}
            y={center + 14}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="500"
          >
            ALIGNED
          </text>
          
          {/* Value labels near nodes */}
            {positions.map(({ name, x, y }) => {
              // Place label slightly outside the node to reduce overlap
              const dy = y < center ? -38 : 42;
              return (
                <text
                  key={name + '-label'}
                  x={x}
                  y={y + dy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#1e293b"
                  fontSize="13"
                  fontWeight="700"
                >
                  {name}
                </text>
              );
            })}
        </svg>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-3 border-b-2 flex items-center justify-between ${headerTint}`}>
        <div className="flex items-center gap-2.5 font-bold text-lg">
          <Compass className="w-5 h-5" /> Values Compass
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-600 hidden sm:flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4" />
            Navigate by your values
          </div>
          <button
            onClick={() => setShowSettings(v => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg border border-indigo-300 bg-white/80 hover:bg-white transition-colors"
            title="Panel settings"
          >
            <Settings className="w-4 h-4 text-indigo-700" />
            Settings
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
  {/* Panel Settings */}
        {showSettings && (
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-sm font-semibold text-indigo-900 flex-1">Partial Weight</div>
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={partialWeight}
                  onChange={(e) => setPartialWeight(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                  aria-label="Partial weight"
                />
              </div>
              <div className="w-24 text-right text-sm font-semibold text-indigo-900 tabular-nums">
                {Math.round(partialWeight * 100)}%
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-indigo-900/70">Quick set:</span>
              {[0.25, 0.5, 0.75, 1].map((v) => (
                <button
                  key={v}
                  onClick={() => setPartialWeight(v)}
                  className={`px-2 py-1 rounded-lg text-xs border ${Math.abs(partialWeight - v) < 0.001 ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'}`}
                >
                  {Math.round(v * 100)}%
                </button>
              ))}
              <span className="text-[11px] text-gray-500 ml-auto">Controls how much a Partial contributes to your daily alignment score.</span>
            </div>
          </div>
        )}
  {/* Top layout: Compass on left, compact Daily Check-In + Summary on right */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <CompassVisualization />
          </div>
          <div className="space-y-6">
            {/* Daily Check-In (compact) */}
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4" />
                  Daily Check-In
                </div>
                <div className="text-[11px] text-gray-500 font-medium">Partial = {Math.round(partialWeight * 100)}%</div>
              </div>
              <div className="divide-y divide-gray-100">
                {names.map((n) => {
                  const status = map[n] ?? 0;
                  const streak = streaks[n] || 0;
                  const history = getHistoricalData(n, 7);
                  return (
                    <div key={n} className="flex items-center gap-3 py-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${status === 2 ? 'bg-emerald-500' : status === 1 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-sm text-gray-900 truncate">{n}</div>
                          {streak > 0 && (
                            <div className="text-[11px] text-gray-600 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span className="font-medium">{streak}d</span>
                            </div>
                          )}
                        </div>
                        <div className="text-gray-400 mt-0.5"><Sparkline data={history} width={70} height={18} /></div>
                      </div>
                      <div className="flex gap-1.5">
                        {[0,1,2].map((state) => {
                          const sel = status === state;
                          const Icon = ({0: X, 1: Minus, 2: Check}[state]);
                          const selectedClass = ({
                            0: 'bg-rose-600 border-rose-700 text-white',
                            1: 'bg-amber-600 border-amber-700 text-white',
                            2: 'bg-emerald-600 border-emerald-700 text-white',
                          })[state];
                          return (
                            <button
                              key={state}
                              onClick={() => setMap((m) => ({ ...m, [n]: state }))}
                              className={`px-2 py-1 rounded-lg border text-[11px] font-medium inline-flex items-center gap-1 transition-all ${
                                sel ? selectedClass : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                              }`}
                              title={{0:'No',1:'Partial',2:'Yes'}[state]}
                            >
                              <Icon className="w-3 h-3" />
                              {{0:'No',1:'Partial',2:'Yes'}[state]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Summary */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-gray-700">Today's Navigation</div>
                <div className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="text-2xl font-bold text-emerald-600">{yesCount}</div>
                  <div className="text-xs text-gray-600 mt-1">On Course</div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="text-2xl font-bold text-amber-600">{partialCount}</div>
                  <div className="text-xs text-gray-600 mt-1">Adjusting</div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="text-2xl font-bold text-rose-600">{names.length - yesCount - partialCount}</div>
                  <div className="text-xs text-gray-600 mt-1">Off Track</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values editor */}
        {!editing ? (
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-200">
            <div className="text-sm text-gray-700">
              <span className="font-medium text-indigo-900">Your guiding values:</span>{" "}
              <span className="font-bold text-indigo-700">{names.join(" · ")}</span>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="text-xs rounded-xl border-2 border-indigo-300 bg-white px-3 py-1.5 hover:bg-indigo-50 transition-colors inline-flex items-center gap-2 font-medium"
              title="Edit values"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-indigo-300 p-4 bg-indigo-50">
            <div className="text-sm font-semibold text-indigo-900 mb-3">Edit Your Five Core Values</div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {names.map((v, i) => (
                <input
                  key={i}
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  value={names[i]}
                  placeholder={`Value ${i + 1}`}
                  onChange={(e) => {
                    const next = [...names];
                    next[i] = e.target.value;
                    setNames(next);
                  }}
                />
              ))}
            </div>
            <div className="flex justify-end mt-3">
              <button
                className="text-xs rounded-xl border-2 border-indigo-600 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 font-semibold"
                onClick={() => {
                  // Trim empties; ensure exactly MAX_VALUES entries
                  let cleaned = names.map((s) => (s || "").trim()).filter(Boolean);
                  // Fill using defaults while avoiding duplicates
                  let idx = 0;
                  while (cleaned.length < MAX_VALUES && idx < DEFAULT_NAMES.length) {
                    const c = DEFAULT_NAMES[idx++];
                    if (!cleaned.includes(c)) cleaned.push(c);
                  }
                  cleaned = cleaned.slice(0, MAX_VALUES);
                  setNames(cleaned);
                  writeNames(cleaned);
                  setEditing(false);
                }}
              >
                <Save className="w-3.5 h-3.5" /> Save Values
              </button>
            </div>
          </div>
        )}

        {/* (Daily Check-In moved next to compass in a compact panel) */}
        
        {/* Historical View Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors text-sm font-medium text-gray-700"
        >
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            7-Day History
          </span>
          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHistory && (
          <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border-2 border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {names.map((name) => {
                const history = getHistoricalData(name, 7);
                return (
                  <div key={name} className="bg-white rounded-xl p-3 border border-gray-200">
                    <div className="font-semibold text-sm text-gray-900 mb-3">{name}</div>
                    <div className="flex items-end justify-between gap-1 h-20">
                      {history.map((val, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i));
                        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const fullDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const color = val === 2 ? 'bg-emerald-500' : val === 1 ? 'bg-amber-500' : 'bg-rose-400';
                        const heightPx = val === 0 ? '25%' : val === 1 ? '60%' : '100%';
                        const label = val === 2 ? 'Yes' : val === 1 ? 'Partial' : 'No';
                        return (
                          <div 
                            key={i} 
                            className="flex-1 flex flex-col items-center justify-end group relative"
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                              {fullDate}: {label}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                            {/* Bar */}
                            <div 
                              className={`w-full ${color} rounded transition-all group-hover:scale-110 group-hover:shadow-md cursor-pointer`} 
                              style={{ height: heightPx, opacity: 0.5 + (val / 2) * 0.5, minHeight: '8px' }}
                            />
                            {/* Day label */}
                            <div className="text-[9px] text-gray-500 mt-1 font-medium">{dayLabel}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 mt-3 text-center font-medium">Hover over bars to see date and status</div>
          </div>
        )}

        {/* Legend */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="font-semibold text-gray-700 mb-1">How to Use Your Compass</div>
          <div className="space-y-1">
            <div>• <span className="font-medium text-emerald-600">Yes</span> = You lived this value in action or decision today</div>
            <div>• <span className="font-medium text-amber-600">Partial</span> = You made some effort toward this value (counts as {Math.round(partialWeight * 100)}%)</div>
            <div>• <span className="font-medium text-rose-600">No</span> = You missed the mark on this value today</div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 text-[11px]">
            The compass shows your alignment. Rings around values indicate active streaks. The center score reflects your overall navigation.
          </div>
        </div>
      </div>
    </div>
  );
}
