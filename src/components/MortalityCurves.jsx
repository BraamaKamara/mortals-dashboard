// src/components/MortalityCurves.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend
} from "recharts";
import { Globe, Activity } from "lucide-react";

/**
 * Mortality Curves — a statistical reflection of fate.
 * - Select a country; we use its approximate life expectancy (yrs).
 * - Your age (from mortals.dob) is compared against the national average.
 * - Curve shown is a smooth "survival-like" shape (Weibull-ish) for intuition.
 * - All state persists in localStorage so it "sticks."
 */

// --- lightweight expectancy table (approximate, 2023–24 era) ---
const EXPECTANCY = [
  { code: "ZMB", name: "Zambia", years: 65 },
  { code: "MWI", name: "Malawi", years: 64 },
  { code: "KEN", name: "Kenya", years: 67 },
  { code: "ZAF", name: "South Africa", years: 63 },
  { code: "NGA", name: "Nigeria", years: 55 },
  { code: "GHA", name: "Ghana", years: 64 },
  { code: "EGY", name: "Egypt", years: 70 },
  { code: "ETH", name: "Ethiopia", years: 67 },
  { code: "RWA", name: "Rwanda", years: 69 },
  { code: "USA", name: "United States", years: 77 },
  { code: "GBR", name: "United Kingdom", years: 81 },
  { code: "FRA", name: "France", years: 82 },
  { code: "DEU", name: "Germany", years: 81 },
  { code: "BRA", name: "Brazil", years: 76 },
  { code: "IND", name: "India", years: 70 },
  { code: "CHN", name: "China", years: 78 },
  { code: "JPN", name: "Japan", years: 84 },
  { code: "KOR", name: "South Korea", years: 83 },
  { code: "CAN", name: "Canada", years: 82 },
  { code: "AUS", name: "Australia", years: 83 },
  { code: "GLOBAL", name: "Global average", years: 73 },
];

const LS_COUNTRY = "mortals.curves.country";
const LS_OVERRIDE = "mortals.curves.overrideYears";

// helpers
const clamp01 = (x) => Math.max(0, Math.min(1, x));
function readLocal(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function writeLocal(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function yearsBetween(d1, d2 = new Date()) {
  if (!d1) return null;
  const a = new Date(d1), b = new Date(d2);
  let y = b.getFullYear() - a.getFullYear();
  const hasHadBirthday = (b.getMonth() > a.getMonth()) || (b.getMonth() === a.getMonth() && b.getDate() >= a.getDate());
  return hasHadBirthday ? y : y - 1;
}
function getDOB() {
  try { const raw = localStorage.getItem("mortals.dob"); return raw || ""; } catch { return ""; }
}

/**
 * A simple "survival-like" curve:
 *   S(age) = exp( - (age / scale) ^ k ), with k in [3..6], scale ~ expectancy / 1.15
 * This is NOT an actuarial model; it's an intuitive shape for reflection.
 */
function survivalCurve(expectancy) {
  const k = 4.5;
  const scale = expectancy / 1.15; // shifts inflection so S(expectancy) ~ small but > 0
  const data = [];
  for (let age = 0; age <= 100; age++) {
    const S = Math.exp(-Math.pow(age / scale, k));
    data.push({ age, survival: +S.toFixed(4) });
  }
  return data;
}

export default function MortalityCurves() {
  // country selection
  const [countryCode, setCountryCode] = useState(readLocal(LS_COUNTRY, "ZMB"));
  const country = useMemo(
    () => EXPECTANCY.find((c) => c.code === countryCode) || EXPECTANCY[0],
    [countryCode]
  );

  // expectancy override
  const [overrideYears, setOverrideYears] = useState(readLocal(LS_OVERRIDE, country?.years || 65));
  useEffect(() => { if (country) setOverrideYears(country.years); }, [countryCode]); // reset when country changes
  useEffect(() => { writeLocal(LS_COUNTRY, countryCode); }, [countryCode]);
  useEffect(() => { writeLocal(LS_OVERRIDE, overrideYears); }, [overrideYears]);

  // age: from DOB if available, else manual
  const dob = getDOB();
  const ageFromDOB = yearsBetween(dob || null);
  const [ageManual, setAgeManual] = useState(ageFromDOB ?? 30);
  const age = ageFromDOB ?? ageManual;

  // data for chart
  const curve = useMemo(() => survivalCurve(overrideYears || country.years), [overrideYears, country]);
  const livedPct = age != null ? clamp01(age / (overrideYears || country.years)) : null;
  const beyondYears = age != null ? Math.max(0, age - (overrideYears || country.years)) : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Activity className="w-4 h-4" /> Mortality Curves
        </div>
        <div className="text-xs text-gray-600 flex items-center gap-2">
          <Globe className="w-4 h-4" /> Compare your age with average life expectancy
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-600 mb-1">Country / Region</div>
          <select
            className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            {EXPECTANCY.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} — {c.years}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-600 mb-1">Life expectancy used (years)</div>
          <input
            type="number"
            min={30}
            max={100}
            value={overrideYears}
            onChange={(e) => setOverrideYears(parseInt(e.target.value || "0", 10))}
            className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
          />
          <div className="text-[11px] text-gray-500 mt-1">Edit to use your preferred horizon or a more recent estimate.</div>
        </div>

        <div className="rounded-2xl border p-3">
          <div className="text-xs text-gray-600 mb-1">Your age (years)</div>
          {ageFromDOB != null ? (
            <div className="text-sm">
              <span className="font-medium">{ageFromDOB}</span>
              <span className="text-gray-600"> (auto from DOB)</span>
              <div className="text-[11px] text-gray-500 mt-1">Set your Date of Birth above to auto-calc.</div>
            </div>
          ) : (
            <input
              type="number"
              min={0}
              max={110}
              value={ageManual}
              onChange={(e) => setAgeManual(parseInt(e.target.value || "0", 10))}
              className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
            />
          )}
        </div>
      </div>

      {/* Narrative */}
      <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm text-gray-800">
        {age == null ? (
          <>Enter your age (or set your DOB above) to compare with <b>{country.name}</b>’s average of <b>{overrideYears}</b> years.</>
        ) : (
          <>
            In <b>{country.name}</b>, the average story ends around <b>{overrideYears} years</b>.
            You’ve lived <b>{age}</b> — <b>{Math.round(livedPct * 100)}%</b> of that statistical journey.
            {beyondYears > 0 ? (
              <> You’re already <b>{beyondYears}</b> years beyond the average — a quiet defiance of the curve.</>
            ) : null}
          </>
        )}
      </div>

      {/* Chart */}
      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={curve} margin={{ top: 30, left: 10, right: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="survivalFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.05} />
              </linearGradient>
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="age" 
              tickLine={false} 
              axisLine={{ stroke: '#9ca3af' }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: 'Age (years)', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
            />
            <YAxis
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tickLine={false}
              axisLine={{ stroke: '#9ca3af' }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: 'Survival Probability', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(v, n) => (n === "survival" ? [`${Math.round(v * 100)}%`, "Survival chance"] : [v, n])}
              labelFormatter={(l) => `Age ${l}`}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
            <Area
              type="monotone"
              dataKey="survival"
              stroke="#8b5cf6"
              strokeWidth={3}
              fill="url(#survivalFill)"
              name="Survival probability"
              style={{ filter: 'url(#shadow)' }}
            />
            {age != null ? (
              <ReferenceLine 
                x={age} 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: "Your age", 
                  position: "top",
                  fill: "#ef4444",
                  fontSize: 13,
                  fontWeight: 600,
                  offset: 10
                }}
              />
            ) : null}
            <ReferenceLine
              x={overrideYears}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ 
                value: "Country avg", 
                position: "top",
                fill: "#10b981",
                fontSize: 13,
                fontWeight: 600,
                offset: 10
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-[11px] text-gray-500">
        Curve is illustrative (not medical advice). It approximates how survival trends decline toward the average life expectancy.
      </div>
    </div>
  );
}
