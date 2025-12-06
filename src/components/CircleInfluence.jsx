// src/components/CircleInfluence.jsx
import React, { useEffect, useMemo, useState } from "react";
import { 
  Users, Plus, Trash2, Mail, Phone, Clock, CalendarDays, Zap, Info, 
  Edit2, Check, X, Heart, Briefcase, GraduationCap, Coffee, Home,
  MessageCircle, Video, User, Star, TrendingUp, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react";

/**
 * Circle of Influence Map - Enhanced
 * - Visual rings (Inner / Middle / Outer) for closeness
 * - Contacts with detailed tracking: category, importance, relationship strength, communication history
 * - Smart prioritization and relationship health monitoring
 * - "Ping" marks an interaction with type tracking
 * - Overdue highlighting and visual relationship aging
 * - localStorage: "mortals.influence.contacts"
 */

const LS_KEY = "mortals.influence.contacts";
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) =>
  Math.floor((new Date(b).setHours(0,0,0,0) - new Date(a).setHours(0,0,0,0)) / 86400000);

function readContacts() {
  try { 
    const data = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    // Migrate old format
    return data.map(c => ({
      ...c,
      category: c.category || "other",
      relationshipStrength: c.relationshipStrength || 3,
      communicationHistory: c.communicationHistory || [],
      createdAt: c.createdAt || todayISO(),
    }));
  } catch { 
    return []; 
  }
}
function writeContacts(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const RINGS = [
  { id: 1, label: "Inner Circle",    radius: 60,  tip: "Family & closest friends" },
  { id: 2, label: "Middle Circle",   radius: 110, tip: "Close friends & mentors" },
  { id: 3, label: "Outer Circle",    radius: 160, tip: "Colleagues & acquaintances" },
];

const CATEGORIES = [
  { id: "family", label: "Family", icon: Home, color: "bg-rose-500" },
  { id: "friend", label: "Friend", icon: Heart, color: "bg-blue-500" },
  { id: "mentor", label: "Mentor", icon: GraduationCap, color: "bg-purple-500" },
  { id: "colleague", label: "Colleague", icon: Briefcase, color: "bg-green-500" },
  { id: "community", label: "Community", icon: Users, color: "bg-amber-500" },
  { id: "other", label: "Other", icon: User, color: "bg-gray-500" },
];

const CONTACT_TYPES = [
  { id: "call", label: "Phone Call", icon: Phone },
  { id: "text", label: "Text/Chat", icon: MessageCircle },
  { id: "email", label: "Email", icon: Mail },
  { id: "video", label: "Video Call", icon: Video },
  { id: "in-person", label: "In Person", icon: Coffee },
];

function relationshipHealth(daysSince, cadence, relationshipStrength) {
  if (cadence <= 0) return { status: "no-cadence", color: "#9CA3AF", label: "No Schedule" };
  const ratio = daysSince / cadence;
  
  if (ratio > 2) return { status: "critical", color: "#DC2626", label: "Critical" };
  if (ratio > 1.5) return { status: "danger", color: "#F97316", label: "Neglected" };
  if (ratio > 1) return { status: "warning", color: "#F59E0B", label: "Overdue" };
  if (ratio > 0.7) return { status: "approaching", color: "#FBBF24", label: "Soon" };
  return { status: "healthy", color: "#10B981", label: "Healthy" };
}

export default function CircleInfluence({ isFinal = false }) {
  const [contacts, setContacts] = useState(readContacts());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  
  useEffect(() => writeContacts(contacts), [contacts]);

  // Add form state
  const [formData, setFormData] = useState({
    name: "",
    category: "friend",
    ring: 2,
    cadenceDays: 14,
    importance: 3,
    relationshipStrength: 3,
    email: "",
    phone: "",
    notes: "",
  });

  function addContact() {
    if (!formData.name.trim()) return;
    const c = {
      id: uid(),
      ...formData,
      name: formData.name.trim(),
      lastContact: "",
      touchCount: 0,
      communicationHistory: [],
      createdAt: todayISO(),
    };
    setContacts([c, ...contacts]);
    setFormData({
      name: "",
      category: "friend",
      ring: 2,
      cadenceDays: 14,
      importance: 3,
      relationshipStrength: 3,
      email: "",
      phone: "",
      notes: "",
    });
    setShowAddForm(false);
  }

  function removeContact(id) {
    setContacts(contacts.filter(c => c.id !== id));
    if (selectedContact?.id === id) setSelectedContact(null);
  }

  function ping(id, type = "in-person") {
    setContacts(contacts.map(c => {
      if (c.id !== id) return c;
      const history = c.communicationHistory || [];
      return {
        ...c,
        lastContact: todayISO(),
        lastContactType: type,
        touchCount: (c.touchCount || 0) + 1,
        communicationHistory: [{ date: todayISO(), type }, ...history].slice(0, 10)
      };
    }));
  }

  function updateContact(id, updates) {
    setContacts(contacts.map(c => c.id === id ? { ...c, ...updates } : c));
  }

  // Computed stats
  const now = todayISO();
  
  const stats = useMemo(() => {
    const total = contacts.length;
    const byCategory = {};
    const byRing = { 1: 0, 2: 0, 3: 0 };
    let neglected = 0;
    let healthy = 0;
    
    contacts.forEach(c => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      byRing[c.ring] = (byRing[c.ring] || 0) + 1;
      
      const last = c.lastContact || c.createdAt || now;
      const daysSince = daysBetween(last, now);
      const health = relationshipHealth(daysSince, c.cadenceDays, c.relationshipStrength);
      
      if (health.status === "critical" || health.status === "danger") neglected++;
      if (health.status === "healthy") healthy++;
    });
    
    return { total, byCategory, byRing, neglected, healthy };
  }, [contacts, now]);

  const priorityList = useMemo(() => {
    return contacts
      .map(c => {
        const last = c.lastContact || c.createdAt || now;
        const daysSince = daysBetween(last, now);
        const health = relationshipHealth(daysSince, c.cadenceDays, c.relationshipStrength);
        const priority = (c.importance + c.relationshipStrength) * (daysSince / Math.max(1, c.cadenceDays));
        return { c, daysSince, health, priority };
      })
      .sort((a, b) => b.priority - a.priority);
  }, [contacts, now]);

  const byRing = useMemo(() => {
    const map = { 1: [], 2: [], 3: [] };
    contacts.forEach(c => map[c.ring]?.push(c));
    return map;
  }, [contacts]);

  // Visual settings
  const size = 420;
  const center = size / 2;

  const nodeFor = (c, index, N, radius) => {
    const angle = (index / Math.max(1, N)) * Math.PI * 2 - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);

    const last = c.lastContact || c.createdAt || now;
    const daysSince = daysBetween(last, now);
    const health = relationshipHealth(daysSince, c.cadenceDays, c.relationshipStrength);
    
    // Node size based on importance + relationship strength
    const r = 6 + ((c.importance + c.relationshipStrength) / 2) * 2.5;
    
    // Get category color
    const categoryData = CATEGORIES.find(cat => cat.id === c.category) || CATEGORIES[5];
    const fillColor = health.color;

    return (
      <g 
        key={c.id} 
        transform={`translate(${x},${y})`} 
        cursor="pointer"
        onClick={() => setSelectedContact(c)}
        className="hover:opacity-80 transition-opacity"
      >
        <circle r={r + 3} fill="white" opacity="0.9" />
        <circle r={r} fill={fillColor} stroke="#1F2937" strokeWidth="1.5" />
        {/* Importance indicator - inner glow */}
        {c.importance >= 4 && (
          <circle r={r - 2} fill="white" opacity="0.4" />
        )}
        <title>
          {c.name} • {categoryData.label}
          {`\nRelationship Strength: ${c.relationshipStrength}/5`}
          {`\nImportance: ${c.importance}/5`}
          {`\nLast contact: ${c.lastContact || "Never"} (${daysSince}d ago)`}
          {`\nStatus: ${health.label}`}
          {`\nClick for details`}
        </title>
      </g>
    );
  };

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-xl">
      {/* Enhanced Header */}
      <div className="px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-2xl text-gray-800">Circle of Influence</h2>
              <p className="text-sm text-gray-600">Map and nurture your meaningful relationships</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:from-blue-700 hover:to-purple-700 shadow-md transition-all"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? "Cancel" : "Add Person"}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Dashboard */}
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
            <TrendingUp className="w-5 h-5" />
            Relationship Dashboard
          </div>
          {showStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <Users className="w-4 h-4" />
                Total Contacts
              </div>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            </div>
            <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <Heart className="w-4 h-4" />
                Healthy
              </div>
              <div className="text-2xl font-bold text-green-700">{stats.healthy}</div>
            </div>
            <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <AlertCircle className="w-4 h-4" />
                Neglected
              </div>
              <div className="text-2xl font-bold text-red-700">{stats.neglected}</div>
            </div>
            <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <Star className="w-4 h-4" />
                Inner Circle
              </div>
              <div className="text-2xl font-bold text-purple-700">{stats.byRing[1] || 0}</div>
            </div>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-5 shadow-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-3">Add New Contact</h3>
            
            {/* Explanation Box */}
            <div className="mb-4 p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <span className="font-bold">Contact Cadence:</span> How often (in days) you want to stay in touch with this person. 
                    Example: 7 days = weekly, 14 days = bi-weekly, 30 days = monthly.
                  </p>
                  <p>
                    <span className="font-bold">Relationship Health:</span> Automatically determined by comparing time since last contact vs. your cadence goal:
                  </p>
                  <ul className="ml-4 space-y-1 text-xs">
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span><span className="font-semibold">Healthy</span> - Contacted within 70% of cadence (e.g., within 10 days for 14-day cadence)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                      <span><span className="font-semibold">Soon</span> - 70-100% of cadence elapsed (e.g., 10-14 days)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-600"></span>
                      <span><span className="font-semibold">Overdue</span> - 100-150% past cadence (e.g., 14-21 days)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                      <span><span className="font-semibold">Neglected</span> - 150-200% past cadence (e.g., 21-28 days)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-600"></span>
                      <span><span className="font-semibold">Critical</span> - Over 200% past cadence (e.g., 28+ days)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Name *</label>
                <input 
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Category</label>
                <select 
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Circle</label>
                <select 
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.ring}
                  onChange={(e) => setFormData({...formData, ring: Number(e.target.value)})}
                >
                  <option value={1}>Inner Circle</option>
                  <option value={2}>Middle Circle</option>
                  <option value={3}>Outer Circle</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Contact Cadence (days)
                  <span className="text-gray-500 font-normal">- How often you want to connect</span>
                </label>
                <input 
                  type="number"
                  min="1"
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="14 (bi-weekly)"
                  value={formData.cadenceDays}
                  onChange={(e) => setFormData({...formData, cadenceDays: Number(e.target.value)})}
                />
                <div className="mt-1 text-[10px] text-gray-500">
                  Examples: 7 (weekly), 14 (bi-weekly), 30 (monthly), 90 (quarterly)
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  Importance (1-5)
                  <span className="text-gray-500 font-normal">- How significant they are to your life</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData({...formData, importance: val})}
                      className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                        formData.importance >= val 
                          ? 'bg-amber-500 border-amber-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-600'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="mt-1 text-[10px] text-gray-500">
                  1 = Acquaintance, 3 = Important, 5 = Essential/VIP
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  Relationship Strength (1-5)
                  <span className="text-gray-500 font-normal">- How close/strong the bond</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData({...formData, relationshipStrength: val})}
                      className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                        formData.relationshipStrength >= val 
                          ? 'bg-blue-500 border-blue-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-600'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="mt-1 text-[10px] text-gray-500">
                  1 = Distant, 3 = Good rapport, 5 = Deep connection
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Email</label>
                <input 
                  type="email"
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="john@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Phone</label>
                <input 
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Notes</label>
                <textarea 
                  rows={2}
                  className="w-full rounded-xl border-2 border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="How you met, shared interests, etc..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={addContact}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 shadow-md"
              >
                <Check className="w-4 h-4" />
                Add Contact
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Circle Visualization */}
          <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">Visual Map</h3>
              <Info className="w-4 h-4 text-gray-500" title="Click nodes for details" />
            </div>
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="max-h-[400px]">
              {/* Rings */}
              {RINGS.map(r => (
                <circle 
                  key={r.id} 
                  cx={center} 
                  cy={center} 
                  r={r.radius} 
                  fill="none" 
                  stroke="#D1D5DB" 
                  strokeWidth="2"
                  strokeDasharray="8 4" 
                />
              ))}
              {/* Center "You" */}
              <circle cx={center} cy={center} r="8" fill="#6366F1" stroke="#FFF" strokeWidth="2" />
              <text x={center} y={center + 20} textAnchor="middle" className="text-xs fill-gray-600 font-medium">
                YOU
              </text>
              {/* Contact Nodes */}
              {RINGS.map(r => {
                const list = byRing[r.id] || [];
                return list.map((c, i) => nodeFor(c, i, list.length, r.radius));
              })}
              {/* Ring Labels */}
              {RINGS.map(r => (
                <text 
                  key={r.id} 
                  x={center} 
                  y={center - r.radius - 12} 
                  textAnchor="middle" 
                  className="text-[11px] fill-gray-500 font-medium"
                >
                  {r.label}
                </text>
              ))}
            </svg>
            {/* Legend */}
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-2">Status Colors:</div>
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Healthy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Soon/Overdue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Neglected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-600" />
                  <span>Critical</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Node size = (Importance + Relationship Strength) / 2
              </div>
            </div>
          </div>

          {/* Right: Priority List */}
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-gray-200 bg-white p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800">Priority Outreach</h3>
                <span className="text-xs text-gray-500">Sorted by urgency</span>
              </div>
              {priorityList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No contacts yet. Add your first!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {priorityList.map(({ c, daysSince, health }) => {
                    const categoryData = CATEGORIES.find(cat => cat.id === c.category) || CATEGORIES[5];
                    const CategoryIcon = categoryData.icon;
                    
                    return (
                      <div 
                        key={c.id}
                        className="p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
                        onClick={() => setSelectedContact(c)}
                      >
                        <div className="flex items-start gap-3">
                          <span 
                            className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: health.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-800 truncate">{c.name}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs ${categoryData.color} text-white`}>
                                <CategoryIcon className="w-3 h-3" />
                                {categoryData.label}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-0.5">
                              <div>Last contact: {c.lastContact ? `${daysSince}d ago` : "Never"}</div>
                              <div>Status: <span className="font-medium" style={{color: health.color}}>{health.label}</span></div>
                              <div>Strength: {"❤️".repeat(c.relationshipStrength)}</div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); ping(c.id); }}
                              className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                              title="Mark as contacted"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeContact(c.id); }}
                              className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Contact Modal */}
        {selectedContact && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedContact.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const categoryData = CATEGORIES.find(cat => cat.id === selectedContact.category) || CATEGORIES[5];
                        const CategoryIcon = categoryData.icon;
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm ${categoryData.color} text-white font-medium`}>
                            <CategoryIcon className="w-4 h-4" />
                            {categoryData.label}
                          </span>
                        );
                      })()}
                      <span className="text-sm text-gray-600">• {RINGS.find(r => r.id === selectedContact.ring)?.label}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-xs text-gray-600">Relationship</div>
                    <div className="text-lg font-bold text-blue-700">
                      {"❤️".repeat(selectedContact.relationshipStrength)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="text-xs text-gray-600">Importance</div>
                    <div className="text-lg font-bold text-amber-700">
                      {"⭐".repeat(selectedContact.importance)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-xs text-gray-600">Contacts</div>
                    <div className="text-lg font-bold text-green-700">{selectedContact.touchCount || 0}</div>
                  </div>
                </div>

                {/* Contact Info */}
                {(selectedContact.email || selectedContact.phone) && (
                  <div className="space-y-2">
                    {selectedContact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                          {selectedContact.email}
                        </a>
                      </div>
                    )}
                    {selectedContact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:underline">
                          {selectedContact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedContact.notes && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-xs font-medium text-gray-600 mb-1">Notes</div>
                    <p className="text-sm text-gray-700">{selectedContact.notes}</p>
                  </div>
                )}

                {/* Log Contact */}
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-800 mb-3">Log Contact</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {CONTACT_TYPES.map(type => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => ping(selectedContact.id, type.id)}
                          className="p-3 rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                          <div className="text-xs font-medium">{type.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Communication History */}
                {selectedContact.communicationHistory && selectedContact.communicationHistory.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-bold text-gray-800 mb-3">Recent History</h3>
                    <div className="space-y-2">
                      {selectedContact.communicationHistory.slice(0, 5).map((entry, idx) => {
                        const typeData = CONTACT_TYPES.find(t => t.id === entry.type);
                        const Icon = typeData?.icon || MessageCircle;
                        return (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{typeData?.label || entry.type}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500">{entry.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
