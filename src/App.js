import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MortalityAwareness from "./components/MortalityAwareness";
import PhilosophicalMirror from "./components/PhilosophicalMirror";
import MortalsDashboard from "./MortalsDashboard";
import AuthGate from "./components/AuthGate";
import EternalBoard from "./components/EternalBoard";
import MessagesPanel from "./components/MessagesPanel";
import BookmarksView from "./components/BookmarksView";
import AdminDashboard from "./components/AdminDashboard";

// Simple uid helper for toast IDs
function toastUid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState(null); // "authenticated" or "guest"
  const [currentUser, setCurrentUser] = useState(null);
  const [mirrorOn, setMirrorOn] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [toasts, setToasts] = useState([]); // {id, message, type}
  const [showMessages, setShowMessages] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleAuthenticated = (authData) => {
    setAuthMode(authData.mode);
    setCurrentUser({
      username: authData.username,
      email: authData.email
    });
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    // Call logout API if we have a token
    const token = localStorage.getItem('mortals.auth.token');
    if (token) {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    
    // Clear all auth data
    localStorage.removeItem('mortals.auth.token');
    localStorage.removeItem('mortals.auth.email');
    localStorage.removeItem('mortals.auth.username');
    localStorage.removeItem('mortals.auth.userId');
    
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthMode(null);
    setMirrorOn(false);
  };

  const handleEnterMirror = () => {
    setIsEntering(true);
    setTimeout(() => {
      setMirrorOn(true);
      setIsEntering(false);
    }, 2000);
  };

  const handleExitMirror = () => {
    setMirrorOn(false);
  };

  // Handle Stripe checkout success: if redirected with session_id, verify and set Pro plan
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgrade = params.get('upgrade');
    const sessionId = params.get('session_id');
    if (upgrade === 'success' && sessionId) {
      (async () => {
        try {
          const res = await fetch(`/api/billing/session?session_id=${encodeURIComponent(sessionId)}`);
          const data = await res.json();
          if (data && data.status) {
            // Mark as Pro locally and store Stripe references
            const prevPlan = (() => { try { return localStorage.getItem('mortals.subscription.plan') || 'free'; } catch { return 'free'; }})();
            try { localStorage.setItem('mortals.subscription.plan', 'pro'); } catch {}
            if (data.customerId) try { localStorage.setItem('mortals.stripe.customerId', data.customerId); } catch {}
            if (prevPlan !== 'pro') {
              // Show upgrade toast
              if (window.mortalsToast) window.mortalsToast('✨ Upgrade activated! Pro features unlocked.', { type: 'success' });
            }
          }
        } catch (e) {
          // Non-fatal: user can still toggle plan manually
          // console.error('Failed to verify Stripe session', e);
        } finally {
          // Clean URL
          const url = new URL(window.location.href);
          url.searchParams.delete('upgrade');
          url.searchParams.delete('session_id');
          window.history.replaceState({}, document.title, url.toString());
        }
      })();
    }
  }, []);

  // Toast API exposure
  useEffect(() => {
    window.mortalsToast = (message, { type = 'info', duration = 4200 } = {}) => {
      const id = toastUid();
      setToasts(t => [...t, { id, message, type }]);
      setTimeout(() => {
        setToasts(t => t.filter(x => x.id !== id));
      }, duration);
    };
    return () => { delete window.mortalsToast; };
  }, []);

  // Global panel openers
  useEffect(() => {
    window.openMessagesPanel = () => setShowMessages(true);
    window.openBookmarksView = () => setShowBookmarks(true);
    window.openAdminDashboard = () => setShowAdmin(true);
    return () => {
      delete window.openMessagesPanel;
      delete window.openBookmarksView;
      delete window.openAdminDashboard;
    };
  }, []);

  // Sync entitlement after authentication
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.email) return;
    (async () => {
      try {
        const email = currentUser.email;
        const res = await fetch(`/api/entitlement?email=${encodeURIComponent(email)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.plan === 'pro') {
          const prevPlan = (() => { try { return localStorage.getItem('mortals.subscription.plan') || 'free'; } catch { return 'free'; }})();
          try { localStorage.setItem('mortals.subscription.plan', 'pro'); } catch {}
          if (data.customerId) try { localStorage.setItem('mortals.stripe.customerId', data.customerId); } catch {}
          if (prevPlan !== 'pro' && window.mortalsToast) {
            window.mortalsToast('🔁 Pro plan restored', { type: 'success', duration: 3000 });
          }
        }
      } catch (e) {
        // Silent fail
      }
    })();
  }, [isAuthenticated, currentUser]);

  // Show AuthGate if not authenticated
  if (!isAuthenticated) {
    return <AuthGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <>
      {/* Eternal Board available everywhere after authentication */}
      <EternalBoard />
      
      {/* Feature Panels */}
      {showMessages && <MessagesPanel onClose={() => setShowMessages(false)} />}
      {showBookmarks && <BookmarksView onClose={() => setShowBookmarks(false)} />}
      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
      
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[200] space-y-2 w-72">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-xl px-4 py-3 text-sm shadow-lg backdrop-blur border flex items-start gap-3 ${
                t.type === 'success' ? 'bg-emerald-600/80 border-emerald-400/40 text-white' :
                t.type === 'error' ? 'bg-red-600/80 border-red-400/40 text-white' :
                'bg-purple-700/80 border-purple-400/40 text-white'
              }`}
            >
              <div className="flex-1 leading-snug">{t.message}</div>
              <button
                onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}
                className="text-xs opacity-70 hover:opacity-100 transition"
              >✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <MortalityAwareness controlsPosition="top-right" showControls={mirrorOn}>
        <AnimatePresence mode="wait">
          {isEntering && (
            <motion.div
              key="entrance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
            >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 3, opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 bg-gradient-radial from-purple-600/30 via-purple-900/20 to-transparent"
            />
            
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 3], opacity: [0, 0.5, 0] }}
                transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
                className="absolute w-96 h-96 rounded-full border-2 border-purple-400/50"
              />
            ))}

            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], rotate: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative z-10"
            >
              <motion.div
                animate={{ boxShadow: ["0 0 20px rgba(168, 85, 247, 0.4)", "0 0 60px rgba(168, 85, 247, 0.8)", "0 0 20px rgba(168, 85, 247, 0.4)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-7xl border-4 border-purple-400"
              >
                🪞
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute bottom-1/3 text-center"
            >
              <motion.h2 
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                animate={{ textShadow: ["0 0 10px rgba(168, 85, 247, 0.5)", "0 0 20px rgba(168, 85, 247, 0.8)", "0 0 10px rgba(168, 85, 247, 0.5)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Entering the Mirror
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-purple-300 text-lg"
              >
                Prepare to see yourself clearly...
              </motion.p>
            </motion.div>

            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ 
                  x: Math.cos((i / 20) * Math.PI * 2) * 300,
                  y: Math.sin((i / 20) * Math.PI * 2) * 300,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ duration: 1.5, delay: 0.5 + (i * 0.03), ease: "easeOut" }}
                className="absolute w-2 h-2 bg-purple-400 rounded-full"
                style={{ left: '50%', top: '50%' }}
              />
            ))}
          </motion.div>
        )}

        {mirrorOn ? (
          <motion.div
            key="mirror"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <div className="mx-auto max-w-6xl p-6 md:p-10">
              <PhilosophicalMirror onExit={handleExitMirror} />
            </div>
          </motion.div>
        ) : !isEntering ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MortalsDashboard 
              onEnterMirror={handleEnterMirror} 
              currentUser={currentUser} 
              onLogout={handleLogout}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MortalityAwareness>
    </>
  );
}