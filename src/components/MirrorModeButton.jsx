import React from "react";
import { Sparkles } from "lucide-react";

export default function MirrorModeButton({ active, onToggle }) {
  return (
    <button
      className={`flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 shadow hover:from-blue-200 hover:to-blue-300 transition font-semibold ${active ? "ring-2 ring-blue-400" : ""}`}
      onClick={onToggle}
      aria-label="Toggle Mirror Mode"
    >
      <Sparkles size={20} />
      Mirror Mode
    </button>
  );
}
