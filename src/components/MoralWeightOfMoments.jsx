import React, { useEffect, useState } from 'react';

/**
 * MoralWeightOfMoments
 * Visualizes the quality of consciousness per hour for a given day.
 * Uses heuristic tiers derived from `moral_presence_log` via API.
 */
export default function MoralWeightOfMoments({ date = null }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('mortals.auth.token');
        if (!token) {
          setError('Not authenticated');
          return;
        }
        const targetDate = date || new Date().toISOString().split('T')[0];
        const resp = await fetch(`${API_BASE}/api/reflection/moral-weight/${targetDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Failed to fetch moral weight');
        const json = await resp.json();
        setData(json);
      } catch (e) {
        setError(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [API_BASE, date]);

  if (loading) return <div className="p-4 text-sm text-gray-600">Calculating your consciousness quality…</div>;
  if (error) return <div className="p-4 text-sm text-gray-600">⚠️ {error}</div>;
  if (!data) return <div className="p-4 text-sm text-gray-600">No data</div>;

  const dist = data.summary?.distribution || {};

  const segments = [
    { key: 'ethical_generative', label: 'Ethical‑Generative', color: '#4c1d95' },
    { key: 'reflective', label: 'Reflective', color: '#7c3aed' },
    { key: 'rich', label: 'Rich', color: '#a78bfa' },
    { key: 'shallow', label: 'Shallow', color: '#9ca3af' }
  ];

  const totalHours = 24;

  return (
    <div className="mwom">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">Moral Weight of Moments</h3>
          <p className="text-xs text-gray-600">Quality of consciousness by hour</p>
        </div>
        <div className="text-sm">
          <span className="font-semibold">{data.summary.quality_pct}%</span>
          <span className="text-gray-600"> of max daily moral value</span>
        </div>
      </div>

      {/* Stacked bar for day distribution */}
      <div className="w-full h-6 rounded-full overflow-hidden border border-gray-200 flex" title="Hourly distribution">
        {segments.map(s => {
          const pct = (dist[s.key]?.pct || 0);
          return (
            <div key={s.key} style={{ width: `${pct}%`, background: s.color }} />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {segments.map(s => (
          <div key={s.key} className="flex items-center gap-2 text-sm">
            <span className="inline-block w-3 h-3 rounded" style={{ background: s.color }} />
            <span className="text-gray-800">{s.label}</span>
            <span className="text-gray-600 ml-auto">{dist[s.key]?.hours ?? 0}h ({dist[s.key]?.pct ?? 0}%)</span>
          </div>
        ))}
      </div>

      {/* Hour-by-hour sparkline */}
      <div className="mt-4">
        <div className="grid grid-cols-24 gap-[2px]">
          {data.hours.map(h => (
            <div key={h.hour} className="h-10 rounded" title={`Hour ${h.hour}: ${h.avg_score} → ${h.tier}`}
              style={{
                background:
                  h.tier === 'ethical_generative' ? '#4c1d95' :
                  h.tier === 'reflective' ? '#7c3aed' :
                  h.tier === 'rich' ? '#a78bfa' : '#9ca3af'
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-gray-500 mt-1">
          <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-600">
        Scoring heuristic (tunable): Shallow=1, Rich=3, Reflective=5, Ethical‑Generative=7 points/hour.
      </p>
    </div>
  );
}
