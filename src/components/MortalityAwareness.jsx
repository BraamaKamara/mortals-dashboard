// src/components/MortalityAwareness.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Hourglass, Activity, Settings2, Eye } from "lucide-react";

/**
 * MortalityAwareness
 * Wrap your app with this to enable "Legacy Mode" when age / horizon >= threshold.
 * - DOB from localStorage "mortals.dob" (YYYY-MM-DD or DD/MM/YYYY)
 * - Horizon from localStorage "mortals.desiredLifespan" (fallbacks checked)
 * - Threshold default 0.8 (80%)
 * - Subtle UI changes + slim top bar when active
 * - If Final-Decade lens is active (<=10y left), it takes visual precedence:
 *   we still show the Legacy top bar & controls, but we do NOT add a second tint.
 */

/* ---------------------- helpers ---------------------- */
function readNumberKeys(keys, fallback) {
  try {
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw != null && raw !== "") return Number(JSON.parse(raw));
    }
  } catch {}
  return fallback;
}
function getHorizon() {
  return readNumberKeys(
    ["mortals.desiredLifespan", "mortals.targetYears", "mortals.horizonYears"],
    80
  );
}
function normalizeISO(s) {
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  const t = new Date(s);
  if (!isNaN(t)) return t.toISOString().slice(0, 10);
  return "";
}
function getDOB() {
  try {
    return normalizeISO(localStorage.getItem("mortals.dob") || "");
  } catch {
    return "";
  }
}
function yearsBetween(d1, d2 = new Date()) {
  const iso = normalizeISO(d1);
  if (!iso) return null;
  const a = new Date(iso), b = new Date(d2);
  let y = b.getFullYear() - a.getFullYear();
  const had = (b.getMonth() > a.getMonth()) || (b.getMonth() === a.getMonth() && b.getDate() >= a.getDate());
  return had ? y : y - 1;
}
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function isFinalDecade(age, horizon) {
  if (age == null || !horizon) return false;
  return (horizon - age) <= 10; // last 10 years
}

/* ---------------------- component ---------------------- */
export default function MortalityAwareness({ children, controlsPosition = "bottom-right", showControls = true, suppressLegacyChrome = false }) {
  const dob = getDOB();
  const ageFromDOB = yearsBetween(dob);
  const [manualAge, setManualAge] = useState(30);
  const age = ageFromDOB ?? manualAge;

  const [horizon, setHorizon] = useState(getHorizon());
  const [threshold, setThreshold] = useState(0.8); // 80%
  const [preview, setPreview] = useState(false);

  // persist horizon if user edits here (non-destructive to other parts)
  useEffect(() => {
    try { localStorage.setItem("mortals.desiredLifespan", JSON.stringify(horizon)); } catch {}
  }, [horizon]);

  const progress = useMemo(() => clamp01((age || 0) / (horizon || 1)), [age, horizon]);
  const legacyActive = preview || progress >= threshold;
  const finalDecade = isFinalDecade(age, horizon);
  const showLegacyTint = legacyActive && !finalDecade;

  // Optional: add/remove a class on <html> for global theming hooks
  useEffect(() => {
    const el = document.documentElement;
    if (showLegacyTint) el.classList.add("legacy-mode");
    else el.classList.remove("legacy-mode");
    return () => el.classList.remove("legacy-mode");
  }, [showLegacyTint]);

  const wrapClass = showLegacyTint
    ? "transition-colors duration-500 bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.04),_transparent_60%)]"
    : "";

  const legacyLabel = finalDecade ? "Final-Decade · Legacy focus" : "Legacy Mode";

  // Positioning for the floating controls pill
  const positionClass = useMemo(() => {
    switch (controlsPosition) {
      case "bottom-right":
        return "fixed bottom-4 right-4";
      case "top-right":
        // push below the slim bar
        return "fixed top-20 right-4";
      case "bottom-center":
        return "fixed bottom-4 left-1/2 transform -translate-x-1/2";
      case "top-center":
        return "fixed top-20 left-1/2 transform -translate-x-1/2";
      case "none":
        return "hidden";
      default:
        return "fixed bottom-4 right-4";
    }
  }, [controlsPosition]);

  return (
    <div className={wrapClass}>
      {/* Top slim bar: shows in both legacy and final-decade */}
      {legacyActive && !suppressLegacyChrome && (
        <div className="fixed top-0 left-0 right-0 z-40">
          <div className="mx-auto max-w-6xl px-3">
            <div className="mt-2 rounded-xl border border-amber-300/60 bg-amber-50/80 backdrop-blur text-amber-900 shadow-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs">
                <Hourglass className="w-3.5 h-3.5" />
                <span className="font-medium">{legacyLabel}</span>
                <span className="mx-1 text-amber-700">•</span>
                <span>{Math.round(progress * 100)}% of chosen lifespan lived</span>
                <span className="mx-1 text-amber-700">•</span>
                <span>“This day will not return.”</span>
              </div>
              <div className="h-1 rounded-b-xl overflow-hidden bg-amber-200">
                <div className="h-full bg-amber-500" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls pill (non-intrusive) */}
      {showControls && !suppressLegacyChrome && (
        <div className={`${positionClass} z-40`} data-testid="mortality-controls-pill">
          <div className="rounded-2xl border bg-white/90 backdrop-blur px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs">
              <Settings2 className="w-3.5 h-3.5" />
              <span className="font-medium">Mortality</span>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <span className="text-gray-600">Age</span>
              {ageFromDOB != null ? (
                <span className="px-2 py-0.5 rounded-xl bg-gray-100">{ageFromDOB}</span>
              ) : (
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={manualAge}
                  onChange={(e) => setManualAge(parseInt(e.target.value || "0", 10))}
                  className="w-14 rounded-xl border px-2 py-0.5"
                  title="Manual age (DOB not set)"
                />
              )}
              <span className="text-gray-600 ml-2">Horizon</span>
              <input
                type="number"
                min={30}
                max={120}
                value={horizon}
                onChange={(e) => setHorizon(parseInt(e.target.value || "80", 10))}
                className="w-16 rounded-xl border px-2 py-0.5"
                title="Desired lifespan (years)"
              />
              <span className="text-gray-600 ml-2">Threshold</span>
              <input
                type="number"
                min={50}
                max={99}
                value={Math.round(threshold * 100)}
                onChange={(e) => setThreshold(clamp01(Number(e.target.value) / 100))}
                className="w-16 rounded-xl border px-2 py-0.5"
                title="Legacy threshold (%)"
              />
              <button
                className={`ml-2 inline-flex items-center gap-1 rounded-xl px-2 py-1 border text-xs ${
                  legacyActive ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-gray-50"
                }`}
                onClick={() => setPreview((v) => !v)}
                title="Preview Legacy Mode"
              >
                <Eye className="w-3.5 h-3.5" />
                {preview ? "Preview: ON" : "Preview"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approaching banner (70–79%) when not yet in Legacy tint */}
      {!showLegacyTint && progress >= 0.7 && (
        <div className="mx-auto mt-3 max-w-6xl px-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs">
              <Activity className="w-3.5 h-3.5" />
              <span className="font-medium">Approaching legacy window</span>
              <span className="mx-1 text-gray-500">•</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1 rounded-b-xl overflow-hidden bg-gray-200">
              <div className="h-full bg-gray-500" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Main app content */}
      <div className={showLegacyTint ? "text-gray-900 [--ring:rgba(120,53,15,0.25)]" : ""}>
        {showLegacyTint && (
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 opacity-90"
            style={{
              background:
                "radial-gradient(1200px 600px at 50% -10%, rgba(120,53,15,0.06), transparent 70%), radial-gradient(1200px 600px at 50% 110%, rgba(120,53,15,0.08), transparent 70%)",
            }}
          />
        )}
        {children}
      </div>
    </div>
  );
}
