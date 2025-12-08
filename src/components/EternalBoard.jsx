// src/components/EternalBoard.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Feather, Sparkles, Upload, Download, X, Crown, Cog, Bell } from "lucide-react";
import MortalsLogo from "./MortalsLogo";
import ProfilePage from "./ProfilePage";
import ReactionsBar from "./ReactionsBar";
import NotificationsPanel from "./NotificationsPanel";
import MarkdownEditor from "./MarkdownEditor";
import MarkdownContent from "./MarkdownContent";
import TagSelector from "./TagSelector";
import PostActions from "./PostActions";
import ScrollToTop from "./ScrollToTop";
import { SkeletonPostList } from "./SkeletonLoaders";
import { useSocket, useSocketEvent } from "../hooks/useSocket";
import { useInfiniteScroll, useScrollRestoration } from "../hooks/useInfiniteScroll";
import { usePullToRefresh, PullToRefreshIndicator } from "../hooks/usePullToRefresh";
import { PHILOSOPHERS } from "../data/philosophers";

// Reflection prompts and stopwords
const DAILY_PROMPTS = [
  "What truth did you resist this week?",
  "What small act of courage can you take today?",
  "Which value do you want to embody more fully?",
  "What would your 80-year-old self thank you for?",
  "What can you let go of right now?",
  "What pattern keeps repeating—and why?",
  "Where have you been avoiding the obvious?",
  "What would be enough if you stopped here?",
  "Which relationship needs attention—today?",
  "What do you wish you’d learned sooner?",
  "Which failure secretly grew you the most?",
  "Where could you choose craft over speed?",
  "What deserves a ritual in your life?",
  "What constraint could become a feature?",
  "Where are you trading depth for breadth?",
  "What truth feels both scary and relieving?",
  "Which habit would future-you declare sacred?",
  "What’s the kindest interpretation you’re missing?",
  "What do you want to remember about today?",
  "If not now, when? If not you, who?"
];

const STOPWORDS = new Set([
  "the","and","for","you","your","with","that","have","this","are","but","not","from","they","their","our","was","were","been","will","can","into","about","what","when","who","how","why","where","which","all","any","each","few","more","most","other","some","such","no","nor","too","very","of","to","in","on","at","as","it","is","be","or","by","an","a","i","me","my","we","us","he","she","his","her","them","those","these"
]);

// API helpers
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function fetchPosts(page = 1, limit = 20, filters = {}) {
  try {
    const params = new URLSearchParams({ page, limit });
    if (filters.search) params.append('search', filters.search);
    if (filters.author) params.append('author', filters.author);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.tags) params.append('tags', filters.tags);
    
    // Use feed endpoint if in following mode
    const endpoint = filters.feedMode === 'following' ? '/profile/feed/following' : '/posts';
    const token = localStorage.getItem('mortals.auth.token');
    const headers = filters.feedMode === 'following' && token 
      ? { 'Authorization': `Bearer ${token}` } 
      : {};
    
    const response = await fetch(`${API_URL}${endpoint}?${params}`, { headers });
    if (!response.ok) return { posts: [], pagination: null };
    const data = await response.json();
    
    // Transform API format to component format
    const posts = (data.posts || []).map(post => ({
      id: post.id,
      author: post.author_username,
      text: post.content,
      createdAt: post.created_at,
      comments: [], // Comments loaded separately
      likeCount: post.likes_count || 0,
      commentCount: parseInt(post.comment_count) || 0,
      reactions: post.reactions || {},
      userReactions: post.user_reactions || [],
      tags: post.tags || []
    }));
    
    return {
      posts,
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], pagination: null };
  }
}

async function createPostAPI(content, token, tags = []) {
  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, tags })
    });
    
    if (!response.ok) return null;
    const post = await response.json();
    
    // Transform to component format
    return {
      id: post.id,
      author: post.author_username,
      text: post.content,
      createdAt: post.created_at,
      comments: [],
      likeCount: post.likes_count || 0,
      commentCount: 0,
      reactions: post.reactions || {},
      userReactions: post.user_reactions || []
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

async function fetchComments(postId) {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`);
    if (!response.ok) return [];
    const data = await response.json();
    
    // Transform to component format
    return (data.comments || []).map(comment => ({
      id: comment.id,
      author: comment.author_username,
      text: comment.content,
      createdAt: comment.created_at
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

async function addCommentAPI(postId, content, token) {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) return null;
    const comment = await response.json();
    
    return {
      id: comment.id,
      author: comment.author_username,
      text: comment.content,
      createdAt: comment.created_at
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}

async function updatePostAPI(postId, content, token) {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error updating post:', error);
    return null;
  }
}

async function deletePostAPI(postId, token) {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) return false;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}

async function reactToPostAPI(postId, reactionType, token) {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/react`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reaction_type: reactionType })
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error reacting to post:', error);
    return null;
  }
}

// Small UI helpers
function GlowButton({ children, className = "", disabled, ...props }) {
  return (
    <button
      className={`relative inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-purple-700 to-indigo-700 shadow-lg hover:brightness-110 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {!disabled && <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-500/30 to-indigo-500/30 blur-sm" />}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

function Parchment({ children, className = "", shape = "default", active = false }) {
  // Organic shape variants - varied border-radius and subtle transforms
  const shapeStyles = {
    default: "rounded-3xl",
    scroll: "rounded-[2.5rem_1rem_2.5rem_1rem]", // tall uneven corners
    tablet: "rounded-[1rem_2rem_1rem_2rem]", // wide uneven
    torn: "rounded-[2rem_0.5rem_1.5rem_2.5rem]", // irregular torn edges
    leaf: "rounded-[3rem_1rem_3rem_1rem]", // organic leaf-like
    wave: "rounded-[1.5rem_2.5rem_0.8rem_2rem]", // wavy edges
    ancient: "rounded-[2rem_1.2rem_2.2rem_0.8rem]", // aged asymmetric
    hexagon: "rounded-[0.8rem_2rem_0.8rem_2rem_0.8rem_2rem]", // hexagonal feel
    diamond: "rounded-[0.5rem_3rem_0.5rem_3rem]", // diamond-like
    cloud: "rounded-[3rem_2rem_2.5rem_1.5rem]", // soft cloud edges
    fragment: "rounded-[1rem_0.4rem_2rem_1.2rem]", // broken fragment
    petal: "rounded-[2.5rem_0.8rem_2.5rem_1.5rem]", // flower petal
  };
  
  // Enhanced glow for immortal artifacts
  const glowColor = "rgba(251,191,36,0.15)"; // Amber glow
  
  // Shape-specific decorative borders
  const shapeDecorations = {
    scroll: (
      <>
        {/* Rolled edge effect */}
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-amber-200/30 to-transparent rounded-r-[1rem] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-full bg-gradient-to-r from-amber-200/30 to-transparent rounded-l-[2.5rem] pointer-events-none" />
      </>
    ),
    tablet: (
      <>
        {/* Chiseled corner marks */}
        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400/40 rounded-tl-md pointer-events-none" />
        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400/40 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400/40 rounded-bl-md pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400/40 rounded-br-lg pointer-events-none" />
      </>
    ),
    torn: (
      <>
        {/* Rough torn edge shadows */}
        <div className="absolute top-0 right-2 w-1/3 h-px bg-gradient-to-r from-amber-800/20 via-amber-600/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-1 left-3 w-1/4 h-px bg-gradient-to-l from-amber-800/20 to-transparent pointer-events-none" />
      </>
    ),
    hexagon: (
      <>
        {/* Angular facet lines */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1/3 h-px bg-amber-300/30 pointer-events-none" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-px bg-amber-300/30 pointer-events-none" />
      </>
    ),
    diamond: (
      <>
        {/* Diamond facet effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-amber-100/20 pointer-events-none" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
      </>
    ),
    cloud: (
      <>
        {/* Soft cloudy gradients at edges */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1/3 bg-gradient-to-b from-amber-100/20 to-transparent rounded-t-[3rem] blur-sm pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/3 bg-gradient-to-t from-amber-100/20 to-transparent rounded-b-[2rem] blur-sm pointer-events-none" />
      </>
    ),
    fragment: (
      <>
        {/* Cracked edge lines */}
        <div className="absolute top-3 right-0 w-px h-6 bg-amber-400/30 rotate-12 pointer-events-none" />
        <div className="absolute bottom-5 left-2 w-px h-8 bg-amber-400/30 -rotate-6 pointer-events-none" />
      </>
    ),
    petal: (
      <>
        {/* Organic vein-like lines */}
        <div className="absolute top-1/4 left-1/2 w-px h-1/2 bg-gradient-to-b from-transparent via-amber-300/20 to-transparent pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-1/4 h-px bg-gradient-to-r from-transparent via-amber-300/15 to-transparent pointer-events-none" />
      </>
    ),
  };
  
  const shapeClass = shapeStyles[shape] || shapeStyles.default;
  const decoration = shapeDecorations[shape] || null;
  
  return (
    <div className={`relative ${shapeClass} border-2 border-amber-300/70 bg-gradient-to-br from-amber-50 via-amber-50/90 to-white ${className}`}
         style={{ boxShadow: active ? `0 18px 40px -12px rgba(0,0,0,0.4), 0 0 0 2px rgba(251,191,36,0.55)` : `inset 0 3px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(251,191,36,0.12)` }}>
      {decoration}
      
      {/* Subtle divine glow */}
      <div className={`pointer-events-none absolute inset-0 ${shapeClass} bg-[radial-gradient(120%_100%_at_50%_-20%,rgba(251,191,36,${active ? '0.30' : '0.18'}),transparent_60%)]`} />
      {active && (
        <div className={`pointer-events-none absolute -inset-1 ${shapeClass} opacity-70`} style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(251,191,36,0.35), transparent 70%)',
          filter: 'blur(12px)'
        }} />
      )}
      
      {/* Aged paper texture */}
      <div className={`pointer-events-none absolute inset-0 ${shapeClass} opacity-[0.03] mix-blend-multiply`}
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="200" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)" /%3E%3C/svg%3E")' }} />
      
      <div className="relative">{children}</div>
    </div>
  );
}

export default function EternalBoard({ open: openProp, onClose }) {
  const [open, setOpen] = useState(false);
  
  // Sync with prop
  useEffect(() => {
    if (openProp !== undefined) {
      setOpen(openProp);
    }
  }, [openProp]);
  const [plan, setPlan] = useState(() => {
    try { return localStorage.getItem('mortals.subscription.plan') || 'free'; } catch { return 'free'; }
  });
  const [text, setText] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [limit] = useState(480);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const fileRef = useRef(null);
  // Reflection feature state
  const [dailyPrompt, setDailyPrompt] = useState("");
  const [showWordCloud, setShowWordCloud] = useState(false);
  const [showPhilosophers, setShowPhilosophers] = useState(false);
  const [philoEra, setPhiloEra] = useState('all');
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [postTags, setPostTags] = useState([]);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, longest, shortest
  const [timeFilter, setTimeFilter] = useState("all"); // all, season, year, morning, evening
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [feedMode, setFeedMode] = useState("all"); // "all" or "following"
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  
  // Comments state
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [commentText, setCommentText] = useState({});
  
  // Profile modal state
  const [profileUsername, setProfileUsername] = useState(null);
  
  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Active/focused post state for depth effect
  const [activePostId, setActivePostId] = useState(null);
  const [composerExpanded, setComposerExpanded] = useState(false);
  
  // Cool-down timer state
  const [lastPostTime, setLastPostTime] = useState(() => {
    try { return parseInt(localStorage.getItem("mortals.eternalBoard.lastPost") || "0"); } catch { return 0; }
  });
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
  
  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(24);
  const POSTS_PER_SCROLL = 12;

  // Profile info for avatars
  const profileName = useMemo(() => {
    try { return localStorage.getItem("mortals.profile.name") || ""; } catch { return ""; }
  }, []);
  const [avatarImage, setAvatarImage] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🕯️");
  useEffect(() => {
    // refresh avatar when board opens
    try { setAvatarImage(localStorage.getItem("mortals.profile.avatarImage") || ""); } catch {}
    try { setAvatarEmoji(localStorage.getItem("mortals.profile.avatarEmoji") || "🕯️"); } catch {}
  }, [open]);

  // React to plan changes from other tabs/components
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'mortals.subscription.plan') {
        setPlan(e.newValue || 'free');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Fallback entitlement refresh: if board opens and plan still free, attempt fetch by email
  useEffect(() => {
    if (!open) return;
    if (plan === 'pro') return; // already pro
    const email = (() => { try { return localStorage.getItem('mortals.auth.email') || ''; } catch { return ''; } })();
    if (!email) return;
    (async () => {
      try {
        const res = await fetch(`/api/entitlement?email=${encodeURIComponent(email)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.plan === 'pro') {
          try { localStorage.setItem('mortals.subscription.plan', 'pro'); } catch {}
          setPlan('pro');
          if (window.mortalsToast) window.mortalsToast('✅ Synced Pro entitlement', { type: 'success', duration: 2600 });
        }
      } catch {}
    })();
  }, [open, plan]);

  // Cinematic intro state
  const [introActive, setIntroActive] = useState(false);
  const [introShownOnce, setIntroShownOnce] = useState(false);
  const [skipIntro, setSkipIntro] = useState(() => {
    try { return localStorage.getItem('mortals.eternalBoard.skipIntro') === 'true'; } catch { return false; }
  });
  // Settings and audio
  const [showSettings, setShowSettings] = useState(false);
  const [muteAudio, setMuteAudio] = useState(() => {
    try {
      const v = localStorage.getItem('mortals.eternalBoard.muteAudio');
      return v ? v === 'true' : false; // default to unmuted
    } catch { return false; }
  });
  const [clickStyle, setClickStyle] = useState(() => {
    try { return localStorage.getItem('mortals.eternalBoard.clickStyle') || 'brick'; } catch { return 'brick'; }
  });
  const [clickVolume, setClickVolume] = useState(() => {
    try {
      const v = parseFloat(localStorage.getItem('mortals.eternalBoard.clickVolume'));
      return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.8;
    } catch { return 0.8; }
  });
  useEffect(() => { try { localStorage.setItem('mortals.eternalBoard.clickStyle', clickStyle); } catch {} }, [clickStyle]);
  useEffect(() => { try { localStorage.setItem('mortals.eternalBoard.clickVolume', String(clickVolume)); } catch {} }, [clickVolume]);
  useEffect(() => {
    try { localStorage.setItem('mortals.eternalBoard.muteAudio', String(muteAudio)); } catch {}
  }, [muteAudio]);
  // Shared AudioContext for UI sounds
  const audioCtxRef = useRef(null);
  const getAudioCtx = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      return audioCtxRef.current;
    } catch { return null; }
  };
  
  // WebAudio shimmer player
  const playShimmer = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      gain.connect(ctx.destination);

      // Two shimmering oscillators sweeping upward
      const makeOsc = (startFreq, endFreq, detune) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const g = ctx.createGain();
        g.gain.setValueAtTime(1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
        const f = osc.frequency;
        f.setValueAtTime(startFreq, now);
        f.exponentialRampToValueAtTime(endFreq, now + 1.4);
        osc.detune.setValueAtTime(detune, now);
        osc.connect(g);
        g.connect(gain);
        osc.start(now);
        osc.stop(now + 1.7);
      };
      makeOsc(440, 1320, -3);
      makeOsc(660, 1760, +3);

      // Gentle noise sparkle
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.2;
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1800, now);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, now);
      ng.gain.exponentialRampToValueAtTime(0.05, now + 0.1);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      whiteNoise.connect(filter);
      filter.connect(ng);
      ng.connect(gain);
      whiteNoise.start(now);
      whiteNoise.stop(now + 0.9);
    } catch {}
  };
  useEffect(() => {
    if (open) {
      const shouldShow = !skipIntro;
      setIntroActive(shouldShow);
      setIntroShownOnce(shouldShow);
    } else {
      setIntroActive(false);
      setIntroShownOnce(false);
    }
  }, [open, skipIntro]);
  // Play shimmer when intro activates
  useEffect(() => {
    if (introActive && !muteAudio) {
      playShimmer();
    }
  }, [introActive, muteAudio]);

  // Click sound by style with volume scaling
  const playClick = async (style = 'brick', vol = 0.8) => {
    if (muteAudio) return; // guard
    const ctx = getAudioCtx();
    if (!ctx) return;
    try { if (ctx.state === 'suspended') await ctx.resume(); } catch {}
    const now = ctx.currentTime;
    const master = ctx.createGain();
    const peak = Math.max(0.05, Math.min(1, vol));
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(peak, now + 0.01);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    master.connect(ctx.destination);

    const makeNoise = (type, freq, dur, gainPeak) => {
      const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const noiseBuffer = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1);
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filt = ctx.createBiquadFilter();
      filt.type = type;
      filt.frequency.setValueAtTime(freq, now);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.001, now);
      ng.gain.exponentialRampToValueAtTime(gainPeak * peak, now + 0.01);
      ng.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.9);
      noise.connect(filt); filt.connect(ng); ng.connect(master);
      noise.start(now); noise.stop(now + dur);
    };

    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    let fStart = 140, fEnd = 80, oType = 'sine', oDur = 0.2, nType = 'lowpass', nFreq = 500, nDur = 0.1, nGain = 0.08;
    if (style === 'wood') {
      fStart = 220; fEnd = 160; oType = 'triangle'; oDur = 0.16; nType = 'bandpass'; nFreq = 1200; nDur = 0.08; nGain = 0.06;
    } else if (style === 'stone') {
      fStart = 100; fEnd = 60; oType = 'sine'; oDur = 0.22; nType = 'lowpass'; nFreq = 300; nDur = 0.11; nGain = 0.09;
    }
    osc.type = oType;
    osc.frequency.setValueAtTime(fStart, now);
    osc.frequency.exponentialRampToValueAtTime(fEnd, now + (oDur - 0.06));
    og.gain.setValueAtTime(1, now);
    og.gain.exponentialRampToValueAtTime(0.001, now + (oDur - 0.04));
    osc.connect(og); og.connect(master);
    osc.start(now); osc.stop(now + oDur);

    makeNoise(nType, nFreq, nDur, nGain);
  };
  const handleEnterBoard = () => setIntroActive(false);
  const handleToggleSkipIntro = () => {
    setSkipIntro((v) => {
      const nv = !v;
      try { localStorage.setItem('mortals.eternalBoard.skipIntro', String(nv)); } catch {}
      return nv;
    });
  };

  const author = useMemo(() => {
    try { return localStorage.getItem("mortals.auth.username") || "Anonymous Mortal"; } catch { return "Anonymous Mortal"; }
  }, []);

  const token = useMemo(() => {
    try { return localStorage.getItem("mortals.auth.token") || null; } catch { return null; }
  }, []);

  // WebSocket connection
  const socket = useSocket(token);

  // WebSocket event handlers
  const handleNewPost = useCallback((post) => {
    // Transform API format to component format
    const newPost = {
      id: post.id,
      author: post.author_username,
      text: post.content,
      createdAt: post.created_at,
      comments: [],
      likeCount: post.likes_count || 0,
      commentCount: 0,
      reactions: post.reactions || {},
      userReactions: post.user_reactions || []
    };
    
    // Only add if on first page and not already present
    setPosts((prev) => {
      if (currentPage === 1 && !prev.find(p => p.id === post.id)) {
        return [newPost, ...prev];
      }
      return prev;
    });
  }, [currentPage]);

  const handleNewComment = useCallback(({ postId, comment }) => {
    setPosts((prev) => prev.map(p => {
      if (p.id === postId) {
        const newComment = {
          id: comment.id,
          author: comment.author_username,
          text: comment.content,
          createdAt: comment.created_at
        };
        return {
          ...p,
          comments: [...(p.comments || []), newComment],
          commentCount: (p.commentCount || 0) + 1
        };
      }
      return p;
    }));
  }, []);

  const handleReactionUpdate = useCallback(({ postId, reactions, userReactions }) => {
    setPosts((prev) => prev.map(p => 
      p.id === postId 
        ? { ...p, reactions, userReactions }
        : p
    ));
  }, []);

  // Register WebSocket event listeners
  useSocketEvent(socket, 'new_post', handleNewPost);
  useSocketEvent(socket, 'new_comment', handleNewComment);
  useSocketEvent(socket, 'reaction_update', handleReactionUpdate);

  const applyFilters = async () => {
    const filters = {};
    if (searchQuery.trim()) filters.search = searchQuery.trim();
    if (authorFilter.trim()) filters.author = authorFilter.trim();
    if (selectedTags.length > 0) filters.tags = selectedTags.join(',');
    filters.feedMode = feedMode; // Include feed mode
    
    // Convert timeFilter to date range
    if (timeFilter === 'year') {
      const start = new Date();
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      filters.dateFrom = start.toISOString();
    } else if (timeFilter === 'season') {
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      filters.dateFrom = start.toISOString();
    }
    
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setAuthorFilter("");
    setSelectedTags([]);
    setTimeFilter("all");
    setFeedMode("all");
    setAppliedFilters({});
    setCurrentPage(1);
  };

  // Auto-apply filters when feedMode changes
  useEffect(() => {
    applyFilters();
  }, [feedMode]);

  // Fetch posts from API on mount or when filters change
  useEffect(() => {
    async function loadPostsFromAPI() {
      setLoading(true);
      const { posts: fetchedPosts, pagination } = await fetchPosts(currentPage, 50, appliedFilters);
      setPosts(fetchedPosts);
      if (pagination) {
        setTotalPages(pagination.totalPages);
        setHasMore(pagination.page < pagination.totalPages);
      }
      setLoading(false);
    }
    loadPostsFromAPI();
  }, [currentPage, appliedFilters]);

  // WebSocket replaces polling - real-time updates now handled by socket events

  // Load more posts function
  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = currentPage + 1;
    const { posts: morePosts, pagination } = await fetchPosts(nextPage, 50);
    setPosts([...posts, ...morePosts]);
    setCurrentPage(nextPage);
    if (pagination) {
      setHasMore(pagination.page < pagination.totalPages);
    }
    setLoading(false);
  };

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Cool-down timer effect
  useEffect(() => {
    const checkCooldown = () => {
      const elapsed = Date.now() - lastPostTime;
      const remaining = Math.max(0, COOLDOWN_MS - elapsed);
      setCooldownRemaining(remaining);
    };
    
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastPostTime, COOLDOWN_MS]);

  const remaining = limit - text.length;
  const editRemaining = limit - editText.length;

  // Helper: calculate reading time in minutes
  const getReadingTime = (text) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // 200 words per minute
    return minutes;
  };

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.text.toLowerCase().includes(q) || 
        p.author.toLowerCase().includes(q)
      );
    }
    
    // Filter by time/season
    if (timeFilter !== "all") {
      const now = new Date();
      result = result.filter(p => {
        const dt = new Date(p.createdAt);
        switch (timeFilter) {
          case "season": {
            // Same season (meteorological: spring=3-5, summer=6-8, fall=9-11, winter=12-2)
            const nowSeason = Math.floor((now.getMonth() % 12) / 3);
            const postSeason = Math.floor((dt.getMonth() % 12) / 3);
            return nowSeason === postSeason;
          }
          case "year":
            return dt.getFullYear() === now.getFullYear();
          case "morning": {
            const hour = dt.getHours();
            return hour >= 5 && hour < 12;
          }
          case "evening": {
            const hour = dt.getHours();
            return hour >= 17 && hour < 24;
          }
          default:
            return true;
        }
      });
    }
    
    // Sort
    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "longest":
        result.sort((a, b) => b.text.length - a.text.length);
        break;
      case "shortest":
        result.sort((a, b) => a.text.length - b.text.length);
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return result;
  }, [posts, searchQuery, sortBy, timeFilter]);
  
  // Only show visibleCount posts
  const visiblePosts = filteredAndSortedPosts.slice(0, visibleCount);
  
  // Infinite scroll handler
  useEffect(() => {
    if (!open) return;
    const handleScroll = () => {
      const el = document.querySelector('.eternal-board-scroll');
      if (!el) return;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
        if (visibleCount < filteredAndSortedPosts.length) {
          setVisibleCount(v => Math.min(v + POSTS_PER_SCROLL, filteredAndSortedPosts.length));
        }
      }
    };
    const el = document.querySelector('.eternal-board-scroll');
    if (el) el.addEventListener('scroll', handleScroll);
    return () => { if (el) el.removeEventListener('scroll', handleScroll); };
  }, [open, visibleCount, filteredAndSortedPosts.length, POSTS_PER_SCROLL]);

  // Reset visible count when filters/dataset change
  useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, sortBy, timeFilter, posts.length]);

  // Daily prompt - one per day when board opens
  useEffect(() => {
    if (!open) return;
    const todayKey = new Date().toISOString().slice(0,10);
    const key = 'mortals.eternalBoard.dailyPrompt';
    const keyDate = 'mortals.eternalBoard.dailyPromptDate';
    try {
      const savedDate = localStorage.getItem(keyDate);
      const savedPrompt = localStorage.getItem(key);
      if (savedDate === todayKey && savedPrompt) {
        setDailyPrompt(savedPrompt);
        return;
      }
    } catch {}
    const hash = Array.from(todayKey).reduce((h, ch) => ((h << 5) - h) + ch.charCodeAt(0), 0);
    const idx = Math.abs(hash) % DAILY_PROMPTS.length;
    const prompt = DAILY_PROMPTS[idx];
    setDailyPrompt(prompt);
    try {
      localStorage.setItem(keyDate, todayKey);
      localStorage.setItem(key, prompt);
    } catch {}
  }, [open]);

  // My posts for reflection features
  const myPosts = useMemo(() => posts.filter(p => p.author === author), [posts, author]);

  // "On this day" - previous years on same month/day
  const onThisDayPosts = useMemo(() => {
    const today = new Date();
    const m = today.getMonth();
    const d = today.getDate();
    return myPosts
      .filter(p => {
        const dt = new Date(p.createdAt);
        return dt.getMonth() === m && dt.getDate() === d && dt.getFullYear() < today.getFullYear();
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [myPosts]);

  // Dictum of the day: prefer On This Day; else longest from last 180 days; else longest overall
  const dailyDictum = useMemo(() => {
    const pickText = (arr) => {
      if (!arr || !arr.length) return "";
      const longest = [...arr].sort((a,b)=> b.text.length - a.text.length)[0];
      return longest?.text || "";
    };
    if (onThisDayPosts.length) return pickText(onThisDayPosts);
    const cutoff = Date.now() - 180 * 24 * 60 * 60 * 1000;
    const recent = posts.filter(p => new Date(p.createdAt).getTime() >= cutoff);
    const txtRecent = pickText(recent);
    if (txtRecent) return txtRecent;
    return pickText(posts);
  }, [onThisDayPosts, posts]);

  // Featured canonical quote (stable per day)
  const featuredCanon = useMemo(() => {
    if (!PHILOSOPHERS.length) return null;
    const seed = new Date().toISOString().slice(0,10);
    let h = 0; for (let i=0;i<seed.length;i++) h = (h*31 + seed.charCodeAt(i)) >>> 0;
    const idx = h % PHILOSOPHERS.length;
    return PHILOSOPHERS[idx];
  }, []);

  const categorizeEra = (era) => {
    era = (era||'').toLowerCase();
    if (era.includes('stoic')) return 'Stoic';
    if (era.includes('classical')) return 'Classical';
    if (era.includes('pre-socratic') || era.includes('ancient china')) return 'Ancient';
    if (era.includes('19th') || era.includes('20th')) return 'Modern';
    return 'Other';
  };

  // Word cloud from my posts
  const wordCloud = useMemo(() => {
    const counts = new Map();
    for (const p of myPosts) {
      const words = String(p.text)
        .toLowerCase()
        .replace(/[^a-z\s']/g, ' ')
        .split(/\s+/)
        .filter(w => w && w.length > 2 && !STOPWORDS.has(w));
      for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);
    }
    const entries = Array.from(counts.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 60);
    const max = entries[0]?.count || 1;
    const min = entries[entries.length - 1]?.count || 1;
    const scale = (c) => {
      if (max === min) return 1;
      return (c - min) / (max - min);
    };
    return entries.map(e => ({
      ...e,
      size: 14 + Math.round(20 * scale(e.count)),
      opacity: 0.55 + 0.45 * scale(e.count)
    }));
  }, [myPosts]);

  const createPost = async () => {
    setError("");
    
    if (!token) {
      setError("You must be logged in to post.");
      return;
    }
    
    // Check cooldown
    if (cooldownRemaining > 0) {
      const mins = Math.ceil(cooldownRemaining / 60000);
      setError(`Patience, mortal. Wait ${mins} more minute${mins > 1 ? 's' : ''} before posting again.`);
      return;
    }
    
    const t = text.trim();
    if (!t) { setError("Write something worth leaving."); return; }
    if (t.length > limit) { setError("Too long. Distill the essence."); return; }
    
    const now = Date.now();
    
    // Create post via API
    const newPost = await createPostAPI(t, token, postTags);
    if (newPost) {
      setPosts([newPost, ...posts]);
      setText("");
      setPostTags([]);
      setLastPostTime(now);
      localStorage.setItem("mortals.eternalBoard.lastPost", now.toString());
    } else {
      setError("Failed to create post. Please try again.");
    }
  };

  const toggleComments = async (postId) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      const wasExpanded = next.has(postId);
      
      if (wasExpanded) {
        next.delete(postId);
      } else {
        next.add(postId);
        // Load comments from API when expanding
        fetchComments(postId).then(comments => {
          setPosts(prevPosts => prevPosts.map(p => 
            p.id === postId ? { ...p, comments } : p
          ));
        });
      }
      return next;
    });
  };

  const addComment = async (postId) => {
    const txt = (commentText[postId] || '').trim();
    if (!txt) return;
    if (txt.length > 280) {
      setError("Comment too long (max 280 chars).");
      return;
    }
    
    if (!token) {
      setError("You must be logged in to comment.");
      return;
    }
    
    const newComment = await addCommentAPI(postId, txt, token);
    if (newComment) {
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, comments: [...(p.comments || []), newComment], commentCount: (p.commentCount || 0) + 1 };
        }
        return p;
      }));
      
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      setError("");
    } else {
      setError("Failed to add comment. Please try again.");
    }
  };

  const removeComment = (postId, commentId) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) };
      }
      return p;
    }));
  };

  const removePost = async (id) => {
    if (!token) {
      setError("You must be logged in to delete posts.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      return;
    }
    
    const deleted = await deletePostAPI(id, token);
    if (deleted) {
      setPosts((arr) => arr.filter(p => p.id !== id));
      if (editingId === id) setEditingId(null);
    } else {
      setError("Failed to delete post. Please try again.");
    }
  };

  const handleReact = async (postId, reactionType) => {
    if (!token) {
      setError("You must be logged in to react to posts.");
      return;
    }

    const result = await reactToPostAPI(postId, reactionType, token);
    if (result) {
      // Update post with new reactions data
      setPosts((arr) => arr.map(p => 
        p.id === postId 
          ? { ...p, reactions: result.reactions, userReactions: result.user_reactions }
          : p
      ));
    } else {
      setError("Failed to add reaction. Please try again.");
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setEditText(post.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id) => {
    const t = editText.trim();
    if (!t) { setError("Cannot save empty post."); return; }
    if (t.length > limit) { setError("Too long. Distill the essence."); return; }
    
    if (!token) {
      setError("You must be logged in to edit posts.");
      return;
    }
    
    const updated = await updatePostAPI(id, t, token);
    if (updated) {
      setPosts((arr) => arr.map(p => p.id === id ? { ...p, text: t, editedAt: new Date().toISOString() } : p));
      setEditingId(null);
      setEditText("");
      setError("");
    } else {
      setError("Failed to update post. Please try again.");
    }
  };

  const exportPosts = () => {
    const blob = new Blob([JSON.stringify(posts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eternal-board-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileRef.current?.click();
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("Invalid file");
        const sanitized = data
          .filter(x => x && typeof x.text === "string")
          .map(x => ({
            id: x.id || uid(),
            author: x.author || author,
            text: String(x.text).slice(0, limit),
            createdAt: x.createdAt || new Date().toISOString()
          }));
        setPosts((prev) => [...sanitized, ...prev]);
      } catch {
        setError("Import failed. Use a valid JSON export.");
      } finally {
        setImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Layout variants
  const overlay = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  const portal = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 18 } }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto"
            initial="hidden" animate="visible" exit="hidden" variants={overlay}
          >
            {/* Cosmic Eternal Backdrop - deep space with stars and nebula */}
            <div className="min-h-full bg-gradient-to-br from-indigo-950 via-purple-900 to-black pointer-events-none" />
            
            {/* Animated cosmic dust/particles */}
            <motion.div
              className="fixed inset-0 pointer-events-none opacity-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.4, 0.3, 0.5, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                                  radial-gradient(2px 2px at 60% 70%, white, transparent),
                                  radial-gradient(1px 1px at 50% 50%, white, transparent),
                                  radial-gradient(1px 1px at 80% 10%, white, transparent),
                                  radial-gradient(2px 2px at 90% 60%, white, transparent),
                                  radial-gradient(1px 1px at 33% 80%, white, transparent),
                                  radial-gradient(1px 1px at 15% 55%, white, transparent)`,
                backgroundSize: '200px 200px, 300px 300px, 150px 150px, 250px 250px, 180px 180px, 220px 220px, 280px 280px',
                backgroundPosition: '0 0, 40px 60px, 130px 270px, 70px 100px, 150px 50px, 250px 180px, 90px 210px'
              }}
            />
            
            {/* Ethereal glow - pulsing light from above */}
            <motion.div
              className="fixed inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.3, 0.6, 0.4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: "radial-gradient(ellipse 1400px 700px at 50% -20%, rgba(139,92,246,0.35), rgba(168,85,247,0.2) 40%, transparent 70%)" }}
            />
            
            {/* Aurora borealis effect */}
            <motion.div
              className="fixed inset-0 pointer-events-none"
              initial={{ opacity: 0, y: -100 }}
              animate={{ 
                opacity: [0, 0.15, 0.1, 0.2, 0.15, 0],
                y: [-100, 0, 50, 100, 200, 300]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ 
                background: "linear-gradient(to bottom, rgba(56,189,248,0.3), rgba(147,51,234,0.25), transparent)",
                filter: "blur(60px)"
              }}
            />

            {/* Content wrapper with proper background */}
            <div className="absolute inset-0 overflow-y-auto eternal-board-scroll">
              {/* Top Controls: Notifications + Settings + Close */}
              <div className="sticky top-6 z-10 flex items-center justify-end gap-3 pr-6">
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative inline-flex items-center gap-2 rounded-xl border-2 border-amber-400/60 bg-white/10 px-3 py-2 text-amber-100 hover:bg-white/20 transition backdrop-blur"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSettings(v => !v)}
                  className="relative inline-flex items-center gap-2 rounded-xl border-2 border-amber-400/60 bg-white/10 px-3 py-2 text-amber-100 hover:bg-white/20 transition backdrop-blur"
                  title="Settings"
                >
                  <Cog className="w-5 h-5" />
                </button>
                <GlowButton className="px-3 py-2" onClick={() => { setOpen(false); if (onClose) onClose(); }}>
                  <X className="w-5 h-5" /> Close
                </GlowButton>
              </div>

              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    key="settings-panel"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="fixed top-20 right-6 z-[55] w-72 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-indigo-950/70 via-purple-900/60 to-black/60 backdrop-blur-xl shadow-2xl p-4 text-amber-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Cog className="w-4 h-4" />
                        <span className="font-semibold tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>Settings</span>
                      </div>
                      <button className="text-amber-300/70 text-xs hover:text-amber-200" onClick={() => setShowSettings(false)}>Hide</button>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Mute audio</span>
                        <button
                          onClick={() => setMuteAudio(v => !v)}
                          className={`px-2 py-1 rounded-lg border ${muteAudio ? 'border-amber-300/60 bg-amber-100/10' : 'border-emerald-300/60 bg-emerald-100/10'}`}
                        >
                          {muteAudio ? 'Muted' : 'On'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Click style</span>
                        <select
                          value={clickStyle}
                          onChange={e => setClickStyle(e.target.value)}
                          className="bg-white/10 border border-amber-300/40 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                        >
                          <option value="brick" className="bg-slate-900">Brick</option>
                          <option value="wood" className="bg-slate-900">Wood</option>
                          <option value="stone" className="bg-slate-900">Stone</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Click volume</span>
                          <span className="text-[10px] text-amber-300/70">{Math.round(clickVolume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={clickVolume}
                          onChange={e => setClickVolume(parseFloat(e.target.value))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Skip intro on open</span>
                        <button
                          onClick={handleToggleSkipIntro}
                          className={`px-2 py-1 rounded-lg border ${skipIntro ? 'border-amber-300/60 bg-amber-100/10' : 'border-emerald-300/60 bg-emerald-100/10'}`}
                        >
                          {skipIntro ? 'Skip' : 'Show'}
                        </button>
                      </div>
                      <div className="pt-1 flex items-center justify-between">
                        <span>Replay intro now</span>
                        <GlowButton className="px-3 py-1.5" onClick={() => setIntroActive(true)}>Replay</GlowButton>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cinematic Intro Layer */}
              <AnimatePresence>
                {introActive && (
                  <motion.div
                    key="eternal-intro"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center px-6 py-12"
                  >
                    {/* Star veil */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06), transparent 70%)" }}
                      animate={{ opacity: [0.2, 0.35, 0.25, 0.4, 0.2] }}
                      transition={{ duration: 10, repeat: Infinity }}
                    />
                    {/* Concentric rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {[180, 340, 520].map((r, idx) => (
                        <motion.div
                          key={r}
                          className="absolute rounded-full border border-amber-300/20"
                          style={{ width: r, height: r }}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: [0.7, 1, 1.05, 1], opacity: [0, 0.8, 0.9, 0.85] }}
                          transition={{ duration: 6 + idx * 2, repeat: Infinity, delay: idx * 0.4 }}
                        />
                      ))}
                    </div>
                    {/* Rotating glyph circle */}
                    <motion.div
                      className="absolute w-[600px] h-[600px] pointer-events-none"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                      style={{
                        backgroundImage: 'radial-gradient(circle at center, transparent 48%, rgba(251,191,36,0.08) 50%, transparent 51%), repeating-conic-gradient(from 0deg, rgba(251,191,36,0.12) 0deg 4deg, transparent 4deg 8deg)'
                      }}
                    />
                    {/* Center sigil/logo */}
                    <motion.div
                      className="absolute w-[120px] h-[120px] flex items-center justify-center rounded-full"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: [0.9, 1, 0.98, 1], opacity: 1 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ boxShadow: '0 0 40px rgba(251,191,36,0.15), inset 0 0 18px rgba(251,191,36,0.08)' }}
                    >
                      <motion.div animate={{ rotate: [0, -360] }} transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}>
                        <MortalsLogo size={96} variant="final" />
                      </motion.div>
                    </motion.div>
                    {/* Intro content card */}
                    <motion.div
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 90, damping: 14 }}
                      className="relative max-w-2xl w-full mx-auto text-center space-y-6 p-10 rounded-3xl border border-amber-400/40 bg-gradient-to-br from-indigo-950/70 via-purple-900/60 to-black/60 backdrop-blur-xl shadow-2xl"
                    >
                      <h2 className="text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300" style={{ fontFamily: "'Cinzel', serif" }}>THE ARCHIVE OPENS</h2>
                      <div className="text-amber-100/80 text-lg italic font-serif space-y-3" style={{ fontFamily: "'Crimson Text', serif" }}>
                        {dailyDictum ? (
                          <>
                            <div className="text-sm uppercase tracking-widest text-amber-300/70">Dictum of the Day</div>
                            <div>“{dailyDictum.length > 220 ? dailyDictum.slice(0,217) + '…' : dailyDictum}”</div>
                            {featuredCanon && (
                              <div className="pt-4 text-base not-italic space-y-1">
                                <div className="text-[11px] tracking-wider uppercase text-purple-300/70">Featured Canon</div>
                                <div className="text-purple-100/90 font-serif">“{featuredCanon.text.length>160?featuredCanon.text.slice(0,157)+'…':featuredCanon.text}”</div>
                                <div className="text-[11px] text-purple-200/70">{featuredCanon.author} · {featuredCanon.source}</div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div>Where your reflections join the endless chorus.</div>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-4 flex-wrap">
                        <GlowButton onClick={handleEnterBoard} className="px-7 py-3 text-lg bg-gradient-to-r from-amber-500 to-yellow-500">
                          Enter the Eternal Archive
                        </GlowButton>
                        <button
                          onClick={handleToggleSkipIntro}
                          className="text-xs px-4 py-2 rounded-xl border border-amber-300/50 text-amber-200 hover:bg-amber-200/10 transition"
                        >
                          {skipIntro ? 'Show intro next time' : 'Skip intro next time'}
                        </button>
                      </div>
                      <div className="text-[10px] tracking-widest text-amber-300/50 uppercase">{new Date().toLocaleDateString('en-US',{year:'numeric', month:'short', day:'numeric'})}</div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Portal */}
              <motion.div
                className="relative mx-auto mt-4 mb-10 max-w-6xl px-6 pb-20"
                initial={{ opacity: 0, y: 20, scale: 0.98, filter: 'blur(8px)' }}
                animate={{ opacity: introActive ? 0.2 : 1, y: introActive ? 10 : 0, scale: introActive ? 0.995 : 1, filter: introActive ? 'blur(6px)' : 'blur(0px)' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
              {/* Header - Majestic and Timeless */}
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0.7, y: -50, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
                  className="relative inline-block"
                >
                  {/* Glowing halo effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-3xl"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.6), rgba(168,85,247,0.3), transparent)" }}
                  />
                  
                  <div className="relative inline-flex items-center gap-4 rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-black/40 px-8 py-4 backdrop-blur-xl shadow-2xl">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Crown className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    </motion.div>
                    <div>
                      <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300" style={{ fontFamily: "'Cinzel', 'Crimson Text', serif" }}>
                        ETERNAL BOARD
                      </h1>
                      <motion.div 
                        className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mt-1"
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    </div>
                  </div>
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 text-base text-amber-100/80 font-light tracking-wide italic"
                  style={{ fontFamily: "'Crimson Text', serif" }}
                >
                  "Where thoughts transcend time, and wisdom becomes immortal"
                </motion.p>
                
                {/* Decorative constellation marks */}
                <div className="flex items-center justify-center gap-3 mt-3">
                  <motion.span 
                    className="text-amber-400/60 text-xs"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  >✦</motion.span>
                  <motion.span 
                    className="text-amber-400/60 text-xs"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  >✦</motion.span>
                  <motion.span 
                    className="text-amber-400/60 text-xs"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  >✦</motion.span>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="mb-6 space-y-3">
                {/* Feed Mode Toggle */}
                {token && (
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setFeedMode('all')}
                      className={`px-4 py-2 rounded-xl border-2 transition-colors font-medium text-sm ${
                        feedMode === 'all'
                          ? 'border-purple-400 bg-purple-600 text-white'
                          : 'border-purple-300/60 bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      All Posts
                    </button>
                    <button
                      onClick={() => setFeedMode('following')}
                      className={`px-4 py-2 rounded-xl border-2 transition-colors font-medium text-sm ${
                        feedMode === 'following'
                          ? 'border-purple-400 bg-purple-600 text-white'
                          : 'border-purple-300/60 bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      Following
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    className="flex-1 min-w-[200px] rounded-xl border-2 border-purple-300/60 bg-white/10 backdrop-blur px-4 py-2 text-sm text-white placeholder:text-purple-200/60 outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <input
                    type="text"
                    placeholder="Filter by author..."
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    className="flex-1 min-w-[150px] rounded-xl border-2 border-purple-300/60 bg-white/10 backdrop-blur px-4 py-2 text-sm text-white placeholder:text-purple-200/60 outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="rounded-xl border-2 border-purple-300/60 bg-white/10 backdrop-blur px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="all" className="bg-slate-900">All Time</option>
                    <option value="year" className="bg-slate-900">This Year</option>
                    <option value="season" className="bg-slate-900">Last 3 Months</option>
                  </select>
                  <button
                    onClick={applyFilters}
                    className="rounded-xl border-2 border-purple-300/60 bg-purple-600 backdrop-blur px-4 py-2 text-sm text-white hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Apply
                  </button>
                  {(Object.keys(appliedFilters).length > 0 || searchQuery || authorFilter || selectedTags.length > 0) && (
                    <button
                      onClick={clearFilters}
                      className="rounded-xl border-2 border-purple-300/60 bg-white/10 backdrop-blur px-3 py-2 text-sm text-white hover:bg-white/20 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Tag Filter */}
                <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-purple-300/30">
                  <TagSelector
                    selectedTags={selectedTags}
                    onChange={setSelectedTags}
                    maxTags={3}
                    className=""
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border-2 border-purple-300/60 bg-white/10 backdrop-blur px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="newest" className="bg-slate-900">Newest First</option>
                    <option value="oldest" className="bg-slate-900">Oldest First</option>
                    <option value="longest" className="bg-slate-900">Longest First</option>
                    <option value="shortest" className="bg-slate-900">Shortest First</option>
                  </select>
                  <button
                    onClick={() => setAnonymousMode(v => !v)}
                    className={`rounded-xl border-2 border-purple-300/60 backdrop-blur px-3 py-2 text-sm text-white hover:bg-white/20 transition-colors ${anonymousMode ? 'bg-purple-500/30' : 'bg-white/10'}`}
                    title={anonymousMode ? "Show authors" : "Hide authors"}
                  >
                    {anonymousMode ? "👁️" : "👁️‍🗨️"}
                  </button>
                  <div className="text-xs text-purple-200">
                    {filteredAndSortedPosts.length} {filteredAndSortedPosts.length === 1 ? 'post' : 'posts'}
                  </div>
                  {Object.keys(appliedFilters).length > 0 && (
                    <div className="text-xs text-amber-300 bg-amber-900/30 px-3 py-1 rounded-full">
                      Filters active
                    </div>
                  )}
                </div>
              </div>

              {/* Composer - Compact with expand on click */}
              <motion.div
                className="mb-6 rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-50/80 via-white/60 to-amber-50/70 backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer relative"
                initial={{ scale: 0.92, opacity: 0.8 }}
                animate={{ 
                  scale: composerExpanded ? 1 : 0.92,
                  opacity: composerExpanded ? 1 : 0.8,
                  filter: composerExpanded ? 'none' : 'brightness(0.85) saturate(0.75)'
                }}
                whileHover={{ scale: composerExpanded ? 1 : 0.94, opacity: composerExpanded ? 1 : 0.9 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                onClick={() => !composerExpanded && setComposerExpanded(true)}
                style={{ zIndex: composerExpanded ? 20 : 2 }}
              >
                <div className={`transition-all duration-300 ${composerExpanded ? 'p-5' : 'p-3'}`} onClick={(e) => composerExpanded && e.stopPropagation()}>
                  {/* Collapsed preview */}
                  {!composerExpanded && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-amber-800">
                        <Feather className="w-4 h-4" />
                        <span className="font-medium">Write a new dictum...</span>
                      </div>
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                  )}
                  
                  {/* Expanded composer */}
                  {composerExpanded && (
                    <>
                      {/* Close button - top right corner */}
                      <button
                        onClick={() => { setComposerExpanded(false); setText(''); setError(''); }}
                        className="absolute top-0.5 right-2.5 text-amber-600/70 hover:text-amber-800 hover:bg-amber-100/30 transition rounded-lg p-1 z-10 backdrop-blur-sm"
                        title="Collapse"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      {/* Daily Prompt - Embedded as inspiration */}
                      {dailyPrompt && (
                        <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-100/40 border border-amber-200/60 px-3 py-2.5">
                          <Sparkles className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                          <div className="text-[13px] text-amber-900 italic font-serif leading-relaxed" style={{ fontFamily: "'Crimson Text', serif" }}>
                            {dailyPrompt}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {/* Author + char count header */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-amber-800">
                            <Feather className="w-3.5 h-3.5" />
                            <span className="font-medium">{author}</span>
                          </div>
                          <div className={`${remaining < 0 ? "text-red-600" : "text-amber-700"}`}>
                            {remaining} chars
                          </div>
                        </div>
                        
                        {/* Markdown Editor */}
                        <MarkdownEditor
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Write your dictum here... (Markdown supported)"
                          maxLength={limit}
                        />
                        
                        <TagSelector
                          selectedTags={postTags}
                          onChange={setPostTags}
                          maxTags={5}
                        />
                        
                        {error && <div className="text-xs text-red-600 px-1">{error}</div>}
                        {cooldownRemaining > 0 && (
                          <div className="text-xs text-amber-800 bg-amber-100/60 rounded-lg px-3 py-1.5 border border-amber-300/50">
                            ⏳ Cool-down: {Math.ceil(cooldownRemaining / 60000)} min remaining
                          </div>
                        )}
                        
                        {/* Compact action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <button
                            onClick={createPost}
                            disabled={cooldownRemaining > 0}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow hover:brightness-110 transition ${cooldownRemaining > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Sparkles className="w-4 h-4" /> Post
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={exportPosts}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300/70 bg-indigo-50/60 px-3 py-1.5 text-xs font-medium text-indigo-800 hover:bg-indigo-100/70 transition"
                            >
                              <Download className="w-3.5 h-3.5" /> Export
                            </button>
                            <button
                              onClick={handleImportClick}
                              disabled={importing}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/70 bg-emerald-50/60 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100/70 transition"
                            >
                              <Upload className="w-3.5 h-3.5" /> {importing ? "Importing..." : "Import"}
                            </button>
                            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* On This Day - Standalone reflection panel */}
              {onThisDayPosts.length > 0 && (
                <div className="mb-6 rounded-xl border border-purple-300/40 bg-gradient-to-br from-purple-50/60 via-white/50 to-indigo-50/60 backdrop-blur-sm shadow-md p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-purple-900">On this day</span>
                    <span className="text-[11px] text-purple-700/70 ml-1">
                      {onThisDayPosts.length} {onThisDayPosts.length === 1 ? 'memory' : 'memories'}
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {onThisDayPosts.slice(0, 3).map((p) => (
                      <li key={p.id} className="text-[13px] flex gap-2">
                        <span className="text-purple-600 font-medium flex-shrink-0 min-w-[3rem]">
                          {new Date(p.createdAt).getFullYear()}
                        </span>
                        <span className="text-slate-800 font-serif leading-relaxed" style={{ fontFamily: "'Crimson Text', serif" }}>
                          {p.text.length > 140 ? p.text.slice(0, 137) + '…' : p.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Utility Toggles */}
              <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => setShowPhilosophers(v => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-purple-400/60 bg-purple-100/70 px-3 py-1.5 text-xs font-medium text-purple-900 hover:bg-purple-200/70 transition shadow-sm"
                >
                  <Crown className="w-3.5 h-3.5" /> {showPhilosophers ? 'Hide Canon' : 'Canonical Voices'}
                </button>
                <button
                  onClick={() => { if (plan === 'pro') { setShowWordCloud(v => !v); } }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-amber-400/70 px-3 py-1.5 text-xs font-medium transition backdrop-blur-sm shadow-sm ${plan==='pro' ? 'bg-amber-100/80 text-amber-900 hover:bg-amber-200/80' : 'bg-amber-50/60 text-amber-700/50 cursor-not-allowed line-through'}`}
                  title={plan==='pro' ? 'View thematic word cloud' : 'Upgrade to Pro to unlock Themes'}
                >
                  <Sparkles className="w-3.5 h-3.5" /> {plan==='pro' ? (showWordCloud ? 'Hide Themes' : 'View Themes') : 'Themes Locked'}
                </button>
                <div className="ml-auto text-[10px] px-2 py-0.5 rounded-full border border-amber-300/50 bg-amber-100/30 text-amber-800">{plan === 'pro' ? 'Pro' : 'Free'}</div>
              </div>

              {showWordCloud && (
                <Parchment className="mb-8">
                  <div className="p-5 relative">
                    {plan !== 'pro' && (
                      <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/40 rounded-3xl border border-amber-300/40 flex items-center justify-center">
                        <div className="text-xs text-amber-800 bg-amber-100/80 border border-amber-300/60 rounded-xl px-3 py-1.5">Themes are a Pro feature. Open Menu → Subscription to upgrade.</div>
                      </div>
                    )}
                    {wordCloud.length === 0 ? (
                      <div className="text-sm text-amber-700">Write a few dictums to see your themes.</div>
                    ) : (
                      <div className="flex flex-wrap gap-x-3 gap-y-2">
                        {wordCloud.map((w, idx) => (
                          <span
                            key={w.word + idx}
                            className="text-amber-900 hover:text-amber-700 transition-colors"
                            style={{ fontSize: w.size, opacity: w.opacity, fontFamily: "'Crimson Text', 'Georgia', 'Times New Roman', serif" }}
                            title={`${w.word} • ${w.count}`}
                          >
                            {w.word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Parchment>
              )}

              {showPhilosophers && (
                <Parchment className="mb-8">
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-3 text-purple-900">
                      <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span className="font-semibold text-sm tracking-wide">Canonical Voices</span>
                      <span className="text-[11px] text-purple-700/70">{PHILOSOPHERS.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={philoEra}
                          onChange={e=>setPhiloEra(e.target.value)}
                          className="text-[11px] rounded-md border border-purple-300/60 bg-white/60 px-2 py-1 text-purple-900"
                          title="Filter by era"
                        >
                          <option value="all" className="bg-slate-900">All Eras</option>
                          <option value="Stoic" className="bg-slate-900">Stoic</option>
                          <option value="Classical" className="bg-slate-900">Classical</option>
                          <option value="Ancient" className="bg-slate-900">Ancient</option>
                          <option value="Modern" className="bg-slate-900">Modern</option>
                          <option value="Other" className="bg-slate-900">Other</option>
                        </select>
                      </div>
                    </div>
                    {/* Scrollable container with max height */}
                    <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300/60 scrollbar-track-purple-100/30">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {(function(){
                          const list = PHILOSOPHERS.filter(p => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return p.author.toLowerCase().includes(q) || p.text.toLowerCase().includes(q) || (p.source||'').toLowerCase().includes(q);
                        }).filter(p => philoEra==='all' ? true : categorizeEra(p.era)===philoEra);
                          const limited = plan==='pro' ? list : list.slice(0, 12);
                          return limited.map(ph => (
                          <div key={ph.id} className="relative group rounded-xl border border-purple-300/70 bg-gradient-to-br from-purple-50 via-white to-purple-100 p-3 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[12px] font-semibold text-purple-800">{ph.author}</span>
                              <span className="text-[10px] text-purple-600">{ph.era}</span>
                            </div>
                            <div className="text-[13px] leading-relaxed font-serif text-slate-800" style={{ fontFamily: "'Crimson Text', serif" }}>
                              {ph.text.length > 160 ? ph.text.slice(0,157) + '…' : ph.text}
                            </div>
                            {ph.source && (
                              <div className="mt-1 text-[10px] italic text-purple-700/70">{ph.source}</div>
                            )}
                          </div>
                          ));
                        })()}
                        {PHILOSOPHERS.filter(p => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return p.author.toLowerCase().includes(q) || p.text.toLowerCase().includes(q) || (p.source||'').toLowerCase().includes(q);
                        }).filter(p => philoEra==='all' ? true : categorizeEra(p.era)===philoEra).length === 0 && (
                          <div className="col-span-full text-xs text-purple-700/70">No canonical matches your search.</div>
                        )}
                      </div>
                    </div>
                    {plan!=='pro' && (
                      <div className="mt-3 text-[11px] text-purple-800 bg-purple-100/70 border border-purple-200/70 rounded-lg px-2 py-1 inline-block">Showing a subset. Upgrade via Menu → Subscription for full library.</div>
                    )}
                    <div className="mt-4 pt-3 border-t border-purple-200/40 space-y-1">
                      <div className="text-[10px] text-purple-700/70 font-semibold">Public Domain Notice:</div>
                      <div className="text-[10px] text-purple-700/60 leading-relaxed">
                        All philosophical excerpts are from public domain sources (authors who died before 1955 or ancient/classical works). 
                        Quotes are paraphrased interpretations for educational and inspirational purposes. 
                        For scholarly work, please verify original texts and translations.
                      </div>
                    </div>
                  </div>
                </Parchment>
              )}

              {/* Board - organic layout with depth effect */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-300 border-t-amber-600 mx-auto"></div>
                    <p className="text-amber-800 font-serif italic">Loading reflections from eternity...</p>
                  </div>
                </div>
              ) : visiblePosts.length === 0 && feedMode === 'following' ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-xl text-amber-800 font-serif mb-2">Your following feed is empty</p>
                  <p className="text-amber-700/70">Follow other mortals to see their reflections here</p>
                  <button
                    onClick={() => { setFeedMode('all'); applyFilters(); }}
                    className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium"
                  >
                    Browse All Posts
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
                  <AnimatePresence mode="popLayout">
                    {visiblePosts.map((p, i) => {
                    // Deterministic shape selection based on post id - expanded palette
                    const shapes = ["scroll", "tablet", "torn", "leaf", "wave", "ancient", "hexagon", "diamond", "cloud", "fragment", "petal"];
                    const hash = Array.from(p.id).reduce((h, ch) => ((h << 5) - h) + ch.charCodeAt(0), 0);
                    const shapeIdx = Math.abs(hash) % shapes.length;
                    const shape = shapes[shapeIdx];
                    
                    // Dramatic rotation for organic feel (-2.5 to 2.5 degrees)
                    const rotationSeed = (hash >> 8) % 11;
                    const rotation = (rotationSeed - 5) * 0.5; // -2.5 to 2.5 degrees in 0.5° steps
                    
                    const isActive = activePostId === p.id;
                    
                    return (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.75, rotate: rotation }}
                        animate={{ 
                          opacity: isActive ? 1 : 0.6,
                          y: isActive ? -12 : 0,
                          z: isActive ? 100 : -20,
                          scale: isActive ? 1.15 : 0.75,
                          rotate: isActive ? 0 : rotation
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.75, rotate: 0 }}
                        whileHover={{ 
                          scale: isActive ? 1.15 : 0.80, 
                          y: isActive ? -12 : -3,
                          opacity: isActive ? 1 : 0.75,
                          transition: { duration: 0.2 }
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 260,
                          damping: 22,
                          delay: i * 0.05 
                        }}
                        style={{ 
                          transformOrigin: 'center center',
                          filter: isActive ? 'none' : 'brightness(0.78) saturate(0.65) blur(0.4px)',
                          cursor: 'pointer',
                          position: 'relative',
                          zIndex: isActive ? 15 : 1
                        }}
                        className={isActive 
                          ? '' 
                          : ''
                        }
                        onClick={() => {
                          if (!muteAudio && !isActive) {
                            playClick(clickStyle, clickVolume);
                          }
                          setActivePostId(isActive ? null : p.id);
                        }}
                      >
                        <Parchment shape={shape} active={isActive}>
                        <div className="p-5 space-y-3">
                          {/* Decorative top border */}
                          <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                            <div className="text-amber-700/50 text-[10px]">✦</div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                          </div>
                          
                          <div className="text-xs text-amber-800/90 font-serif italic">
                            <div className="flex items-center justify-between gap-2">
                              {!anonymousMode && (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full overflow-hidden bg-amber-200/60 flex items-center justify-center flex-shrink-0">
                                    {(() => {
                                      const me = (p.author || '').toLowerCase() === (author || '').toLowerCase() || (p.author || '').toLowerCase() === (profileName || '').toLowerCase();
                                      if (me && avatarImage) {
                                        return <img src={avatarImage} alt="avatar" className="w-full h-full object-cover" />;
                                      }
                                      if (me && avatarEmoji) {
                                        return <span className="text-base not-italic" role="img" aria-label="avatar-emoji">{avatarEmoji}</span>;
                                      }
                                      const initial = (p.author?.[0] || '?').toUpperCase();
                                      return <span className="text-[10px] font-semibold text-amber-900 not-italic">{initial}</span>;
                                    })()}
                                  </div>
                                  <div className="flex items-center flex-wrap gap-1">
                                    <button
                                      onClick={() => setProfileUsername(p.author)}
                                      className="font-semibold not-italic text-sm hover:text-amber-600 hover:underline transition"
                                    >
                                      {p.author}
                                    </button>
                                    <span className="mx-1.5 text-amber-700/60">·</span>
                                    <time title={new Date(p.createdAt).toLocaleString()} className="text-[11px]">
                                      {new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </time>
                                    {p.editedAt && (
                                      <span className="ml-1.5 text-[10px] text-amber-600" title={`Edited ${new Date(p.editedAt).toLocaleString()}`}>
                                        (edited)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              {anonymousMode && (
                                <div className="flex items-center gap-1 text-amber-700/70">
                                  <time title={new Date(p.createdAt).toLocaleString()} className="text-[11px]">
                                    {new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </time>
                                  {p.editedAt && (
                                    <span className="ml-1.5 text-[10px] text-amber-600" title={`Edited ${new Date(p.editedAt).toLocaleString()}`}>
                                      (edited)
                                    </span>
                                  )}
                                </div>
                              )}
                              {/* Reading time badge */}
                              {(() => {
                                const readTime = getReadingTime(p.text);
                                if (readTime >= 2) {
                                  return (
                                    <div className="text-[10px] text-amber-700/60 bg-amber-100/40 px-2 py-0.5 rounded-full border border-amber-300/30 not-italic">
                                      {readTime} min read
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                          
                          {/* The eternal dictum - editable or display */}
                          {editingId === p.id ? (
                            <div className="space-y-2">
                              <MarkdownEditor
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                placeholder="Edit your dictum..."
                                maxLength={limit}
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => saveEdit(p.id)}
                                  className="rounded-lg bg-amber-600 px-3 py-1 text-white hover:bg-amber-700 font-serif text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="rounded-lg border border-amber-300 px-3 py-1 text-amber-800 hover:bg-amber-100 font-serif text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <MarkdownContent 
                              content={p.text}
                              className="text-[15px] leading-[1.7] text-slate-900 tracking-wide font-serif first-letter:text-3xl first-letter:font-bold first-letter:float-left first-letter:mr-1.5 first-letter:mt-0.5 first-letter:text-amber-900"
                            />
                          )}

                          {/* Tags */}
                          {p.tags && p.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {p.tags.map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => {
                                    setSelectedTags([tag]);
                                    applyFilters();
                                  }}
                                  className="text-xs px-2 py-0.5 bg-amber-100/60 text-amber-800 rounded-full hover:bg-amber-200/60 transition border border-amber-300/30 font-medium"
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Decorative bottom border */}
                          <div className="flex items-center gap-2 pt-1">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                          </div>
                          
                          {editingId !== p.id && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <ReactionsBar
                                    postId={p.id}
                                    reactions={p.reactions || {}}
                                    userReactions={p.userReactions || []}
                                    onReact={handleReact}
                                  />
                                  <button
                                    onClick={() => toggleComments(p.id)}
                                    className="text-[11px] rounded-lg border border-purple-300/60 bg-purple-50/40 px-2.5 py-0.5 text-purple-800 hover:bg-purple-100/60 transition-colors font-serif flex items-center gap-1"
                                    title="View comments"
                                  >
                                    💬 {p.commentCount || (p.comments || []).length}
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Only show edit/delete for own posts */}
                                  {p.author === author && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => startEdit(p)}
                                        className="text-[11px] rounded-lg border border-amber-300/70 px-2.5 py-0.5 text-amber-800 hover:bg-amber-100 transition-colors font-serif"
                                        title="Edit this dictum"
                                      >Edit</button>
                                      <button
                                        onClick={() => removePost(p.id)}
                                        className="text-[11px] rounded-lg border border-red-300/70 px-2.5 py-0.5 text-red-800 hover:bg-red-100 transition-colors font-serif"
                                        title="Remove this dictum"
                                      >Remove</button>
                                    </div>
                                  )}
                                  {/* Post actions menu (bookmark, hide, report) */}
                                  <PostActions 
                                    post={p} 
                                    onUpdate={(updatedPost) => {
                                      setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post));
                                    }}
                                    onHide={(postId) => {
                                      setPosts(posts.filter(post => post.id !== postId));
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Comments section */}
                          {expandedComments.has(p.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-amber-200/60 space-y-2"
                            >
                              {/* Existing comments */}
                              {(p.comments || []).length > 0 && (
                                <div className="space-y-2 mb-3">
                                  {p.comments.map(comment => (
                                    <div key={comment.id} className="bg-white/40 rounded-lg p-2 text-xs">
                                      <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 rounded-full overflow-hidden bg-purple-200/60 flex items-center justify-center flex-shrink-0">
                                          {(() => {
                                            const isMe = (comment.author || '').toLowerCase() === (author || '').toLowerCase();
                                            if (isMe && avatarImage) {
                                              return <img src={avatarImage} alt="avatar" className="w-full h-full object-cover" />;
                                            }
                                            if (isMe && avatarEmoji) {
                                              return <span className="text-xs">{avatarEmoji}</span>;
                                            }
                                            const initial = (comment.author?.[0] || '?').toUpperCase();
                                            return <span className="text-[9px] font-semibold text-purple-900">{initial}</span>;
                                          })()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="font-semibold text-purple-900">{comment.author}</span>
                                            <span className="text-[10px] text-amber-700/70">
                                              {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                            {comment.author === author && (
                                              <button
                                                onClick={() => removeComment(p.id, comment.id)}
                                                className="ml-auto text-[9px] text-red-600 hover:text-red-800"
                                                title="Delete comment"
                                              >×</button>
                                            )}
                                          </div>
                                          <div className="text-slate-800 leading-relaxed font-serif" style={{ fontFamily: "'Crimson Text', serif" }}>
                                            {comment.text}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Add comment */}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  value={commentText[p.id] || ''}
                                  onChange={(e) => setCommentText(prev => ({ ...prev, [p.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      addComment(p.id);
                                    }
                                  }}
                                  className="flex-1 text-xs rounded-lg border border-purple-200 bg-white/60 px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-purple-400 font-serif"
                                  style={{ fontFamily: "'Crimson Text', serif" }}
                                  maxLength={280}
                                />
                                <button
                                  onClick={() => addComment(p.id)}
                                  className="text-[11px] rounded-lg bg-purple-600 px-3 py-1.5 text-white hover:bg-purple-700 transition font-serif"
                                >
                                  Send
                                </button>
                              </div>
                              <div className="text-[10px] text-amber-700/60">
                                {280 - (commentText[p.id] || '').length} chars
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </Parchment>
                    </motion.div>
                    );
                    })}
                  </AnimatePresence>
                  {filteredAndSortedPosts.length === 0 && !loading && (
                    <div className="col-span-full text-center text-purple-100/80 py-12">
                      {searchQuery ? (
                        <>No posts match your search. Try different keywords.</>
                      ) : (
                        <>No dictums yet. Be the first to leave something eternal.</>
                      )}
                    </div>
                  )}
                  {/* Load More button */}
                  {hasMore && !searchQuery && (
                    <div className="col-span-full flex justify-center py-8">
                      <button
                        onClick={loadMorePosts}
                        disabled={loading}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-serif text-sm shadow-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Loading...' : 'Load More Reflections'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      {profileUsername && (
        <ProfilePage
          username={profileUsername}
          onClose={() => setProfileUsername(null)}
        />
      )}

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  );
}
