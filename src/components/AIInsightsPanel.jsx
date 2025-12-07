import React from 'react';
import { Sparkles, RefreshCw, Clock } from 'lucide-react';

export default function AIInsightsPanel({ summary, cached, lastUpdated, onRefresh, loading, error }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="text-sm text-slate-600">AI Synthesis</p>
            <p className="text-base font-semibold text-slate-900">Themes & Suggestions</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-white text-sm font-medium shadow-sm hover:bg-slate-800 disabled:opacity-60"
          title="Regenerate insights"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Thinking…' : 'Synthesize'}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 text-rose-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {!summary && !loading && !error && (
        <p className="text-sm text-slate-600">Tap “Synthesize” to get themes across your recent reflections.</p>
      )}

      {summary && !error && (
        <div className="rounded-2xl bg-indigo-50/80 text-slate-900 p-3 text-sm whitespace-pre-line leading-relaxed">
          {summary}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Clock size={14} />
        {cached ? 'From cache (last 6h)' : 'Freshly generated'}
        {lastUpdated ? ` • ${new Date(lastUpdated).toLocaleString()}` : ''}
      </div>
    </div>
  );
}
