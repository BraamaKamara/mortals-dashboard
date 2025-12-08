import React, { useState, useEffect } from 'react';
import './DegreesOfSelfSpiral.css';

/**
 * Degrees of Self Spiral Component
 * 
 * McMahan philosophical visualization: Shows identity continuity as an animated spiral
 * that tightens when unified, loosens when fragmented.
 * 
 * Dimensions tracked:
 * - Memory continuity: Do I remember my past selves?
 * - Intention continuity: Am I following commitments?
 * - Value continuity: Am I living by my values?
 * - Narrative continuity: Does my day cohere as a story?
 */

export default function DegreesOfSelfSpiral({ date = null, onRefresh = null }) {
  const [spiral, setSpiral] = useState(null);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredDimension, setHoveredDimension] = useState(null);
  const [expandedView, setExpandedView] = useState('today'); // 'today' or 'trend'

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Fetch spiral data
  useEffect(() => {
    const fetchSpiral = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('mortals.auth.token');
        if (!token) {
          setError('Not authenticated');
          return;
        }

        const targetDate = date || new Date().toISOString().split('T')[0];

        const response = await fetch(`${API_BASE}/api/reflection/identity-spiral/${targetDate}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch spiral: ${response.statusText}`);
        }

        const data = await response.json();
        setSpiral(data.spiral);
      } catch (err) {
        console.error('[DegreesOfSelfSpiral] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpiral();
  }, [date, API_BASE]);

  // Fetch trend data
  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const token = localStorage.getItem('mortals.auth.token');
        if (!token) return;

        const response = await fetch(`${API_BASE}/api/reflection/identity-spiral-trend?days=30`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTrend(data.stats);
        }
      } catch (err) {
        console.error('[DegreesOfSelfSpiral] Trend fetch error:', err);
      }
    };

    fetchTrend();
  }, [API_BASE]);

  // Generate SVG spiral path
  const generateSpiralPath = (tightness) => {
    // tightness: 0 = loose spiral, 1 = tight spiral
    // Tightness controls the spiral's radius variation

    const cx = 150;
    const cy = 150;
    const maxRadius = 120;
    const minRadius = 30;
    const numTurns = 2.5;
    const points = 300;

    let path = `M ${cx} ${cy - minRadius}`;

    for (let i = 1; i < points; i++) {
      const t = i / points;
      const angle = t * numTurns * Math.PI * 2;
      
      // Interpolate radius based on tightness
      const radiusRange = maxRadius - minRadius;
      const radius = minRadius + radiusRange * t;
      
      // Add tightness effect: tight spirals have variable radius, loose are more consistent
      const radiusVariation = (1 - tightness) * (Math.sin(angle * 2) * 10);
      const finalRadius = radius + radiusVariation;

      const x = cx + finalRadius * Math.cos(angle);
      const y = cy + finalRadius * Math.sin(angle);

      path += ` L ${x} ${y}`;
    }

    return path;
  };

  // Render dimensions as colored rings
  const renderDimensionRings = (spiral) => {
    const dimensions = [
      { name: 'Memory', value: spiral.memory_continuity, color: '#8b5cf6' },
      { name: 'Intention', value: spiral.intention_continuity, color: '#06b6d4' },
      { name: 'Value', value: spiral.value_continuity, color: '#ec4899' },
      { name: 'Narrative', value: spiral.narrative_continuity, color: '#f59e0b' }
    ];

    const cx = 150;
    const cy = 150;
    const baseRadius = 30;
    const ringWidth = 20;

    return dimensions.map((dim, idx) => {
      const radius = baseRadius + idx * ringWidth;
      const circumference = 2 * Math.PI * radius;
      const strokeDasharray = circumference * dim.value;

      return (
        <circle
          key={dim.name}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={dim.color}
          strokeWidth={ringWidth - 2}
          strokeDasharray={`${strokeDasharray} ${circumference}`}
          opacity={hoveredDimension === dim.name ? 1 : 0.6}
          onMouseEnter={() => setHoveredDimension(dim.name)}
          onMouseLeave={() => setHoveredDimension(null)}
          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
        />
      );
    });
  };

  if (loading) {
    return (
      <div className="degrees-of-self-spiral loading">
        <div className="loader">Measuring your identity continuity...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="degrees-of-self-spiral error">
        <p className="text-sm text-gray-500">💭 Spiral temporarily unavailable (backend sync in progress)</p>
      </div>
    );
  }

  if (!spiral) {
    return (
      <div className="degrees-of-self-spiral empty">
        <p>No spiral data available</p>
      </div>
    );
  }

  return (
    <div className="degrees-of-self-spiral">
      <div className="spiral-header">
        <div>
          <h2>🌀 Degrees of Self</h2>
          <p className="subtitle">Your Identity Continuity Spiral (McMahan)</p>
        </div>
        <div className="controls">
          <button
            className={`view-toggle ${expandedView === 'today' ? 'active' : ''}`}
            onClick={() => setExpandedView('today')}
          >
            Today
          </button>
          <button
            className={`view-toggle ${expandedView === 'trend' ? 'active' : ''}`}
            onClick={() => setExpandedView('trend')}
          >
            Trend
          </button>
        </div>
      </div>

      {expandedView === 'today' && (
        <div className="spiral-today">
          <div className="spiral-visualization">
            <svg viewBox="0 0 300 300" className="spiral-svg">
              <defs>
                <radialGradient id="spiralGradient">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.1)" />
                  <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
                </radialGradient>
              </defs>

              {/* Background circle */}
              <circle cx="150" cy="150" r="130" fill="url(#spiralGradient)" />

              {/* Dimension rings */}
              {renderDimensionRings(spiral)}

              {/* Overall unity circle at center */}
              <circle
                cx="150"
                cy="150"
                r={15 + spiral.overall_unity * 15}
                fill="#8b5cf6"
                opacity="0.7"
              />

              {/* Center label */}
              <text
                x="150"
                y="155"
                textAnchor="middle"
                className="spiral-center-label"
              >
                {Math.round(spiral.overall_unity * 100)}%
              </text>
            </svg>

            <div className="spiral-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#8b5cf6' }} />
                <span>Memory Continuity</span>
                <span className="value">{Math.round(spiral.memory_continuity * 100)}%</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#06b6d4' }} />
                <span>Intention Continuity</span>
                <span className="value">{Math.round(spiral.intention_continuity * 100)}%</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#ec4899' }} />
                <span>Value Continuity</span>
                <span className="value">{Math.round(spiral.value_continuity * 100)}%</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#f59e0b' }} />
                <span>Narrative Continuity</span>
                <span className="value">{Math.round(spiral.narrative_continuity * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="spiral-interpretation">
            <h3>Today's Identity Reading</h3>
            <p className="interpretation-text">
              {spiral.overall_unity > 0.8 && '✨ Highly unified self'}
              {spiral.overall_unity > 0.6 && spiral.overall_unity <= 0.8 && '🌙 Well-integrated identity'}
              {spiral.overall_unity > 0.4 && spiral.overall_unity <= 0.6 && '🌓 Moderate fragmentation'}
              {spiral.overall_unity <= 0.4 && '⚠️ Significant fragmentation'}
            </p>
            <p className="interpretation-detail">
              Your identity consists of psychological continuity across four dimensions. Each measures how connected you feel to your:
            </p>
            <ul className="dimension-explanations">
              <li><strong>Memory:</strong> Continuity with your past self and decisions</li>
              <li><strong>Intention:</strong> Following through on your commitments</li>
              <li><strong>Value:</strong> Living aligned with your stated principles</li>
              <li><strong>Narrative:</strong> Sense of coherent story in your day</li>
            </ul>

            <p className="philosophical-note">
              💭 <em>Based on Jeff McMahan's "The Ethics of Killing": Personal identity isn't binary but scalar. You are more yourself when these continuities are strong.</em>
            </p>
          </div>
        </div>
      )}

      {expandedView === 'trend' && trend && (
        <div className="spiral-trend">
          <div className="trend-stats">
            <div className="stat">
              <span className="stat-label">30-Day Average</span>
              <span className="stat-value">{Math.round(trend.average_unity * 100)}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Highest</span>
              <span className="stat-value">{Math.round(trend.highest_unity * 100)}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Lowest</span>
              <span className="stat-value">{Math.round(trend.lowest_unity * 100)}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Direction</span>
              <span className={`stat-value ${trend.trend_direction}`}>
                {trend.trend_direction === 'improving' && '📈'}
                {trend.trend_direction === 'declining' && '📉'}
                {trend.trend_direction === 'stable' && '➡️'}
                {' ' + trend.trend_direction}
              </span>
            </div>
          </div>

          <p className="trend-insight">
            Your identity continuity over the past month shows a <strong>{trend.trend_direction}</strong> trend.
            {trend.trend_direction === 'improving' && ' Keep strengthening your continuity dimensions!'}
            {trend.trend_direction === 'declining' && ' Consider which dimensions need attention.'}
            {trend.trend_direction === 'stable' && ' You maintain consistent identity coherence.'}
          </p>
        </div>
      )}
    </div>
  );
}
