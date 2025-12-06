// src/components/ExistenceCurves.jsx
import React, { useMemo } from "react";

/**
 * Existence Curves (log scale)
 * - Robust DOB parsing (YYYY-MM-DD or DD/MM/YYYY)
 * - Avoids overlapping labels (alternate above/below; skip if too close)
 * - Tooltips on all points
 */

const YEAR_MS = 365.25 * 24 * 3600 * 1000;
const log10 = (x) => Math.log(x) / Math.log(10);

// Simple card primitives so the file is self-contained
function Card({ className = "", children }) {
  return <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>{children}</div>;
}
function CardContent({ className = "", children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

/* ----------------------- parsing helpers ----------------------- */
function parseDOBFlexible(raw) {
  if (!raw) return null;
  // Case 1: ISO from <input type="date"> e.g. 1990-04-20
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(raw)) {
    const d = new Date(raw + "T00:00:00");
    return isFinite(d) ? d : null;
  }
  // Case 2: common local form DD/MM/YYYY
  const slash = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const m = slash.exec(raw);
  if (m) {
    const [_, dd, mm, yyyy] = m;
    const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    return isFinite(d) ? d : null;
  }
  // Fallback: let Date try, but guard NaN
  const d = new Date(raw);
  return isFinite(d) ? d : null;
}

/* --------------------- axis + milestones ---------------------- */
const AXIS_MIN_YEARS = 0.5;            // ~6 months
const AXIS_MAX_YEARS = 14_000_000_000; // ~14B

const ROWS = [
  { id: "personal",   label: "Personal",     color: "#111827" }, // gray-900
  { id: "civil",      label: "Civilization", color: "#0EA5E9" }, // sky-500
  { id: "human",      label: "Humanity",     color: "#22C55E" }, // green-500
  { id: "planet",     label: "Planet",       color: "#F59E0B" }, // amber-500
  { id: "cosmos",     label: "Cosmos",       color: "#8B5CF6" }, // violet-500
];

// Years before present (approximate anchors)
const MILESTONES = [
  // Civilization
  { row: "civil",  years: 12_000,     label: "Agriculture begins (~12k yrs)" },
  { row: "civil",  years: 5_000,      label: "Writing systems (~5k yrs)" },
  { row: "civil",  years: 2_500,      label: "Classical era (~2.5k yrs)" },
  { row: "civil",  years: 250,        label: "Industrial Revolution (~250 yrs)" },
  { row: "civil",  years: 30,         label: "Internet age (~30 yrs)" },

  // Humanity
  { row: "human",  years: 300_000,    label: "Homo sapiens (~300k yrs)" },
  { row: "human",  years: 60_000,     label: "Out of Africa (~60k yrs)" },

  // Planet
  { row: "planet", years: 4_540_000_000, label: "Earth forms (~4.54B yrs)" },
  { row: "planet", years: 3_500_000_000, label: "Earliest life (~3.5B yrs)" },
  { row: "planet", years: 2_400_000_000, label: "Great Oxygenation (~2.4B yrs)" },
  { row: "planet", years: 540_000_000,   label: "Cambrian explosion (~540M yrs)" },
  { row: "planet", years: 66_000_000,    label: "Non-avian dinosaurs end (66M yrs)" },

  // Cosmos
  { row: "cosmos", years: 13_800_000_000, label: "Big Bang (~13.8B yrs)" },
  { row: "cosmos", years: 13_600_000_000, label: "Milky Way forms (~13.6B yrs)" },
];

/* -------------------------- Component ------------------------- */
export default function ExistenceCurves({ isFinal = false }) {
  // Read persisted settings
  const rawDob = (() => { try { return localStorage.getItem("mortals.dob") || ""; } catch { return ""; } })();
  const lifespan = (() => { try { return Number(localStorage.getItem("mortals.lifespan") || 80); } catch { return 80; } })();

  const dobDate = parseDOBFlexible(rawDob);
  const now = new Date();

  // Human-history-focused scale (linear years)
  const nowYear = now.getFullYear();
  const YEAR_START = 1000; // anchor for shared human story
  const YEAR_END = Math.max(nowYear + 5, 2025);

  // Era bands to evoke belonging to a lineage
  const ERAS = [
    { label: "Medieval",        start: 1000, end: 1500, color: "#94a3b8" }, // slate-400
    { label: "Early Modern",    start: 1500, end: 1800, color: "#a78bfa" }, // violet-400
    { label: "Industrial",      start: 1800, end: 1950, color: "#60a5fa" }, // blue-400
    { label: "Information Age", start: 1950, end: YEAR_END, color: "#34d399" }, // emerald-400
  ];

  // Global life expectancy reference points (very rough, evocative not exact)
  const LIFE_EXPECTANCY_POINTS = [
    { year: 1000, value: 30 },
    { year: 1500, value: 33 },
    { year: 1800, value: 40 },
    { year: 1900, value: 50 },
    { year: 1950, value: 46 },
    { year: 2000, value: 67 },
    { year: Math.min(2025, YEAR_END), value: 73 },
  ];

  const personal = useMemo(() => {
    if (!dobDate || !isFinite(dobDate)) return null;
    const ageYears = Math.max(0, (now - dobDate) / YEAR_MS);
    if (!isFinite(ageYears)) return null;
    return {
      ageYears,
      lifespanYears: isFinite(lifespan) && lifespan > 0 ? lifespan : 80,
      yearsLeft: Math.max(0, (isFinite(lifespan) ? lifespan : 80) - ageYears),
    };
  }, [dobDate, lifespan, now]);

  // SVG geometry (human history)
  const width = 980;
  const height = 340;
  const paddingLeft = 110;
  const paddingRight = 24;
  const innerW = width - paddingLeft - paddingRight;

  const xForYear = (year) => {
    const t = (Math.max(Math.min(year, YEAR_END), YEAR_START) - YEAR_START) / (YEAR_END - YEAR_START);
    return paddingLeft + t * innerW;
  };

  const band = isFinal ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200";
  const axisColor = isFinal ? "#78350F" : "#334155"; // slate-700
  const personalColor = isFinal ? "#B45309" : "#0f172a"; // slate-900

  // Life expectancy path (map values to vertical range)
  const LE_MIN = 25, LE_MAX = 80; // visual scale bounds
  const leY = (v) => {
    const top = 90, bottom = 210; // reserved band for the curve
    const t = (Math.max(Math.min(v, LE_MAX), LE_MIN) - LE_MIN) / (LE_MAX - LE_MIN);
    // higher expectancy should appear higher visually
    return bottom - t * (bottom - top);
  };

  const lePath = (() => {
    const pts = LIFE_EXPECTANCY_POINTS
      .filter(p => p.year >= YEAR_START && p.year <= YEAR_END)
      .sort((a,b) => a.year - b.year);
    if (!pts.length) return "";
    const segs = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xForYear(p.year)} ${leY(p.value)}`);
    return segs.join(' ');
  })();

  // Human history milestones (evocative)
  const HUMAN_MILESTONES = [
    { year: 1040, label: "Movable type (China)" },
    { year: 1450, label: "Gutenberg press" },
    { year: 1712, label: "Steam engine" },
    { year: 1796, label: "First vaccine" },
    { year: 1879, label: "Practical light bulb" },
    { year: 1903, label: "First powered flight" },
    { year: 1969, label: "Moon landing" },
    { year: 1990, label: "Early Internet" },
    { year: 2007, label: "Smartphone era" },
  ].filter(m => m.year >= YEAR_START && m.year <= YEAR_END);

  // Generational ticks (~30-year cadence)
  const GEN_STEP = 30;
  const generations = useMemo(() => {
    const arr = [];
    for (let y = YEAR_START; y <= YEAR_END; y += GEN_STEP) arr.push(y);
    return arr;
  }, [YEAR_START, YEAR_END]);

  const dobYear = dobDate && isFinite(dobDate) ? dobDate.getFullYear() : null;
  const generationIndex = dobYear ? Math.max(0, Math.floor((dobYear - YEAR_START) / GEN_STEP) + 1) : null;

  return (
    <Card className="shadow-lg border-2">
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-xl text-gray-800">Existence Curves</div>
            <div className="text-sm text-gray-600 mt-1">Your life within human history</div>
          </div>
          <div className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
            Linear years · {YEAR_START} → {YEAR_END}
          </div>
        </div>

        <div className={`rounded-2xl border-2 ${band} p-6 overflow-x-auto shadow-inner`}>
          <svg width={width} height={height} role="img" aria-label="Existence Curves — Human History" style={{ minWidth: '980px' }}>
            {/* Background */}
            <defs>
              <linearGradient id="bgHH" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isFinal ? "#FEF3C7" : "#F1F5F9"} stopOpacity="0.4"/>
                <stop offset="50%" stopColor={isFinal ? "#FDE68A" : "#E2E8F0"} stopOpacity="0.3"/>
                <stop offset="100%" stopColor={isFinal ? "#FEF3C7" : "#F1F5F9"} stopOpacity="0.4"/>
              </linearGradient>
            </defs>
            <rect x={paddingLeft} y="0" width={innerW} height={height-40} fill="url(#bgHH)" rx="10"/>

            {/* Era bands */}
            {ERAS.map((e, i) => (
              <g key={i}>
                <rect
                  x={xForYear(e.start)}
                  y={10}
                  width={Math.max(0, xForYear(e.end) - xForYear(e.start))}
                  height={40}
                  fill={e.color}
                  opacity="0.15"
                  rx="6"
                />
                <text x={xForYear(e.start) + 6} y={34} fontSize="12" fontWeight="600" fill={axisColor}>
                  {e.label}
                </text>
              </g>
            ))}

            {/* Axis */}
            <line x1={paddingLeft} y1={height-28} x2={width-paddingRight} y2={height-28} stroke={axisColor} strokeWidth="2"/>
            {/* Year ticks every 100 years */}
            {Array.from({length: Math.floor((YEAR_END - YEAR_START)/100)+1}).map((_,i)=>{
              const year = YEAR_START + i*100;
              const x = xForYear(year);
              return (
                <g key={year} transform={`translate(${x},${height-28})`}>
                  <line y1="0" y2="8" stroke={axisColor} strokeWidth="1.5" />
                  <text y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill={axisColor}>{year}</text>
                </g>
              );
            })}

            {/* Life expectancy curve */}
            <path d={lePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round"/>
            {/* Shadow/area under curve for feel */}
            <path d={`${lePath} L ${xForYear(YEAR_END)} ${leY(LE_MIN)} L ${xForYear(YEAR_START)} ${leY(LE_MIN)} Z`} fill="#10b981" opacity="0.08"/>
            <text x={paddingLeft} y={leY(75)-10} fontSize="12" fill="#047857" fontWeight="600">Life expectancy (global, indicative)</text>

            {/* Generational ticks (30-year cadence) */}
            {generations.map((y) => (
              <line key={y} x1={xForYear(y)} x2={xForYear(y)} y1={230} y2={height-28} stroke={axisColor} opacity="0.15"/>
            ))}
            <text x={paddingLeft} y={226} fontSize="12" fill={axisColor} fontWeight="600">Generations (~30 years)</text>

            {/* Your generation arc */}
            {dobYear && personal && (
              <>
                <line
                  x1={xForYear(dobYear)}
                  x2={xForYear(Math.min(dobYear + personal.lifespanYears, YEAR_END))}
                  y1={70}
                  y2={70}
                  stroke={personalColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.25"
                />
                {/* Born marker */}
                <circle cx={xForYear(dobYear)} cy={70} r="6" fill={personalColor} />
                <text x={xForYear(dobYear)+8} y={66} fontSize="12" fontWeight="700" fill={personalColor}>You</text>
                {/* Now marker */}
                <circle cx={xForYear(nowYear)} cy={70} r="6" fill={personalColor} stroke="#fff" strokeWidth="2" />
                <text x={xForYear(nowYear)+8} y={66} fontSize="12" fontWeight="700" fill={personalColor}>Now</text>
              </>
            )}

            {/* Human milestones */}
            {HUMAN_MILESTONES.map((m, idx) => (
              <g key={idx} transform={`translate(${xForYear(m.year)}, ${150 + (idx%2 ? -18 : 18)})`}>
                <circle r="5" fill="#0ea5e9" />
                <text x="8" y="4" fontSize="11" fill="#0ea5e9" fontWeight="600">{m.label}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Human lineage note */}
        <div className="rounded-xl border-2 border-slate-200 bg-white p-4">
          {dobYear ? (
            <div className="text-sm text-slate-700">
              You stand roughly <span className="font-semibold">{generationIndex?.toLocaleString()}</span> generations from the year {YEAR_START}. Your life is a link in a chain that has crossed the {ERAS.length} eras above.
            </div>
          ) : (
            <div className="text-sm text-amber-800">
              Set your Date of Birth to see your generation’s arc plotted on this timeline.
            </div>
          )}
        </div>

        <PerspectiveFooter personal={personal} isFinal={isFinal} />
        {!personal && (
          <div className="text-sm text-amber-800 bg-amber-50 border-2 border-amber-300 rounded-xl px-4 py-3">
            <span className="font-semibold">💡 Tip:</span> Your Date of Birth appears to be unset or not in a supported format.
            Use <b>YYYY-MM-DD</b> in the DOB field above (or DD/MM/YYYY; both are accepted).
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* --------------------- Perspective footer --------------------- */
function PerspectiveFooter({ personal, isFinal = false }) {
  const items = useMemo(() => {
    if (!personal) return [];
    const { ageYears } = personal;
    const ratios = [
      { label: "written history", sublabel: "~5,000 years", base: 5_000, color: "#0EA5E9" },
      { label: "agriculture", sublabel: "~12,000 years", base: 12_000, color: "#14B8A6" },
      { label: "Homo sapiens", sublabel: "~300,000 years", base: 300_000, color: "#22C55E" },
      { label: "Earth's age", sublabel: "~4.54B years", base: 4_540_000_000, color: "#F59E0B" },
      { label: "the universe", sublabel: "~13.8B years", base: 13_800_000_000, color: "#8B5CF6" },
    ];
    return ratios.map(r => ({
      ...r,
      pct: Math.max(0, Math.min(1, ageYears / r.base)),
    }));
  }, [personal]);

  if (!personal) return null;

  return (
    <div>
      <div className="text-sm font-semibold text-gray-700 mb-3">Your age as a fraction of:</div>
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((r, i) => (
          <div key={i} className="rounded-xl border-2 border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-800 mb-0.5">{r.label}</div>
            <div className="text-xs text-gray-500 mb-3">{r.sublabel}</div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div
                className="h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.max(0.5, r.pct * 100).toFixed(2)}%`,
                  backgroundColor: r.color
                }}
                title={`${(r.pct * 100).toFixed(6)}%`}
              />
            </div>
            <div className="text-xs font-mono text-gray-600 mt-2">
              {r.pct < 0.000001 ? '<0.0001%' : `${(r.pct * 100).toFixed(4)}%`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- helpers -------------------------- */
function formatYears(y) {
  if (y < 1) return `${Math.round(y * 12)} mo`;
  if (y < 10_000) return `${y.toLocaleString()} y`;
  if (y < 1_000_000) return `${Math.round(y / 1_000)}k y`;
  if (y < 1_000_000_000) return `${Math.round(y / 1_000_000)}M y`;
  return `${(y / 1_000_000_000).toFixed(1)}B y`;
}
function shorten(s, max) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
