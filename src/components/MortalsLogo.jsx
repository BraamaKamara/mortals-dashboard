import React from "react";

export default function MortalsLogo({ size = 56, variant = "default", className = "" }) {
  const isFinal = variant === "final";
  const outerFrom = isFinal ? "#f59e0b" : "#8b5cf6";
  const outerTo = isFinal ? "#b45309" : "#4f46e5";
  const hourFrom = isFinal ? "#fbbf24" : "#a78bfa";
  const hourTo = isFinal ? "#d97706" : "#7c3aed";
  const pin = "#22d3ee"; // cyan-400

  const ticks = Array.from({ length: 12 }, (_, i) => i);
  const r = 24; // tick radius

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Mortals logo"
    >
      <defs>
        <linearGradient id="outer" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={outerFrom} />
          <stop offset="100%" stopColor={outerTo} />
        </linearGradient>
        <linearGradient id="hour" x1="20" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={hourFrom} />
          <stop offset="100%" stopColor={hourTo} />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle cx="32" cy="32" r="28" stroke="url(#outer)" strokeWidth="3.5" fill="none" />

      {/* Month ticks */}
      {ticks.map((t) => {
        const angle = (t / 12) * Math.PI * 2 - Math.PI / 2; // start at top
        const x = 32 + Math.cos(angle) * r;
        const y = 32 + Math.sin(angle) * r;
        return <circle key={t} cx={x} cy={y} r={1.6} fill={isFinal ? "#78350f" : "#334155"} />;
      })}

      {/* Current-week pin */}
      {(() => {
        const angle = (5 / 12) * Math.PI * 2 - Math.PI / 2; // ~5 o'clock
        const x = 32 + Math.cos(angle) * (r + 2.5);
        const y = 32 + Math.sin(angle) * (r + 2.5);
        return <circle cx={x} cy={y} r={2.4} fill={pin} stroke="white" strokeWidth={0.8} />;
      })()}

      {/* Hourglass mark */}
      <path
        d="M24 18h16c0 6-5 9-8 14 3 5 8 8 8 14H24c0-6 5-9 8-14-3-5-8-8-8-14z"
        fill="url(#hour)"
        stroke={isFinal ? "#92400e" : "#6d28d9"}
        strokeWidth="1.2"
      />
      <path d="M26 32h12" stroke={isFinal ? "#78350f" : "#4c1d95"} strokeWidth="1" opacity="0.7" />
    </svg>
  );
}
