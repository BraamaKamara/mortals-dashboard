import React, { useState } from 'react';
import { X, BookOpen, Lightbulb, Brain, Clock, Zap, TrendingUp, Compass } from 'lucide-react';
import DegreesOfSelfSpiral from './DegreesOfSelfSpiral';
import './McMahanHub.css';

/**
 * McMahan Enhancements Hub
 * 
 * Central hub for all Phase 4 philosophical features based on 
 * Jeff McMahan's "The Ethics of Killing"
 * 
 * Features (in order of completion):
 * 1. Degrees of Self Spiral (COMPLETE) - Identity continuity visualization
 * 2. Future Selves Map (Coming) - Multiverse of possible futures
 * 3. Moral Weight of Moments (Coming) - Consciousness quality meter
 * 4. Threshold Moments (Coming) - Identity crossing alerts
 * 5. Counterfactual Survival (Coming) - Which parts of you survive?
 * 6. Moral Harm of Wasted Time (Coming) - Future value accounting
 * 7. Life's Potential Curve (Coming) - Moral value projection
 */

export default function McMahanHub({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('spiral');

  const features = [
    {
      id: 'spiral',
      name: 'Degrees of Self',
      icon: Brain,
      status: 'COMPLETE',
      badge: '✓',
      description: 'Identity continuity across four dimensions',
      component: <DegreesOfSelfSpiral />
    },
    {
      id: 'futures',
      name: 'Future Selves Map',
      icon: Compass,
      status: 'COMING',
      badge: '→',
      description: 'Your multiverse of possible selves',
      component: <ComingSoon name="Future Selves Map" />
    },
    {
      id: 'moments',
      name: 'Moral Weight',
      icon: TrendingUp,
      status: 'COMING',
      badge: '→',
      description: 'Quality of consciousness per hour',
      component: <ComingSoon name="Moral Weight of Moments" />
    },
    {
      id: 'thresholds',
      name: 'Threshold Moments',
      icon: Zap,
      status: 'COMING',
      badge: '→',
      description: 'When you cross identity boundaries',
      component: <ComingSoon name="Threshold Moments Alerts" />
    },
    {
      id: 'counterfactual',
      name: 'Counterfactual',
      icon: Brain,
      status: 'COMING',
      badge: '→',
      description: 'What parts of you would survive?',
      component: <ComingSoon name="Counterfactual Survival Simulator" />
    },
    {
      id: 'wastedtime',
      name: 'Lost Value',
      icon: Clock,
      status: 'COMING',
      badge: '→',
      description: 'Moral harm of wasted time',
      component: <ComingSoon name="Moral Harm of Wasted Time" />
    },
    {
      id: 'potential',
      name: 'Potential Curve',
      icon: TrendingUp,
      status: 'COMING',
      badge: '→',
      description: 'Your projected moral value over time',
      component: <ComingSoon name="Life's Potential Curve" />
    }
  ];

  const activeFeature = features.find(f => f.id === activeTab);

  if (!isOpen) return null;

  return (
    <div className="mcmahan-hub-overlay" onClick={onClose}>
      <div className="mcmahan-hub-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="hub-header">
          <div className="hub-title-section">
            <BookOpen className="hub-icon" size={28} />
            <div>
              <h1>McMahan Enhancements</h1>
              <p>Philosophy of Identity & Mortality</p>
            </div>
          </div>
          <button className="hub-close" onClick={onClose} title="Close">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="hub-nav">
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                className={`hub-nav-item ${activeTab === feature.id ? 'active' : ''} ${feature.status === 'COMPLETE' ? 'complete' : 'coming'}`}
                onClick={() => setActiveTab(feature.id)}
                title={feature.description}
              >
                <Icon size={18} />
                <span className="nav-label">{feature.name}</span>
                <span className="nav-badge">{feature.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="hub-content">
          {activeFeature && (
            <div className="feature-container">
              <div className="feature-header">
                <h2>{activeFeature.name}</h2>
                <span className={`status-badge ${activeFeature.status.toLowerCase()}`}>
                  {activeFeature.status}
                </span>
              </div>
              <div className="feature-body">
                {activeFeature.component}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="hub-footer">
          <p className="footer-text">
            💭 <em>Based on Jeff McMahan's "The Ethics of Killing" - Making moral philosophy tangible and personal</em>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Coming Soon Placeholder
 */
function ComingSoon({ name }) {
  return (
    <div className="coming-soon">
      <Lightbulb size={48} />
      <h3>{name}</h3>
      <p>Building deeper philosophical insights...</p>
      <div className="coming-soon-description">
        <p>This feature is in development. Check back soon for:</p>
        <ul>
          <li>Interactive visualizations</li>
          <li>Personalized insights</li>
          <li>Philosophical context</li>
          <li>Actionable reflections</li>
        </ul>
      </div>
    </div>
  );
}
