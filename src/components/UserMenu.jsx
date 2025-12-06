import React, { useEffect, useRef, useState } from "react";
import { User, LogOut, Info, Menu, Settings, Shield, HelpCircle, RefreshCcw, CreditCard, CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { APP_VERSION } from "../version";

const variants = {
  hidden: { opacity: 0, y: -6, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 180, damping: 18 } },
  exit: { opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.15 } }
};

export default function UserMenu({ onLogout, onAbout, onProfile, displayName, avatarEmoji, avatarImage }) {
  const [open, setOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [plan, setPlan] = useState(() => localStorage.getItem("mortals.subscription.plan") || "free");
  const [lastSeenVersion, setLastSeenVersion] = useState(() => localStorage.getItem("mortals.version.seen") || "");
  const isAdmin = localStorage.getItem("mortals.auth.isAdmin") === "true";
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const handleClick = (e) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(e.target) || btnRef.current.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousedown', handleClick);
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('mousedown', handleClick); };
  }, [open]);

  return (
    <div className="relative" aria-label="User navigation">
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300/40 bg-gradient-to-r from-indigo-950/60 via-purple-900/50 to-black/70 text-amber-200/80 text-sm hover:text-amber-100 hover:border-amber-300/60 transition shadow focus:outline-none focus:ring-2 focus:ring-amber-300/40"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Menu size={18} className="text-amber-200/80 group-hover:text-amber-100 transition" />
        <span className="hidden sm:inline">Menu</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            key="user-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            className="absolute right-0 mt-3 w-60 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-indigo-950/80 via-purple-900/70 to-black/70 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
            role="menu"
            aria-label="User menu"
          >
            <div className="px-4 pt-4 pb-3 border-b border-amber-400/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200/30 border border-amber-300/50 flex items-center justify-center overflow-hidden">
                {avatarImage ? (
                  <img src={avatarImage} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg" role="img" aria-label="avatar-emoji">{avatarEmoji || '🕯️'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-amber-100 truncate" style={{ fontFamily: "'Cinzel', serif" }}>{displayName || 'Mortal'}</div>
                <div className="text-[11px] text-amber-300/70 tracking-wide">Session active</div>
              </div>
              <Settings size={18} className="text-amber-300/70" />
            </div>
            <div className="py-2 text-sm" role="none">
              <button
                role="menuitem"
                onClick={() => { setOpen(false); onProfile?.(); }}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-amber-100 hover:bg-amber-50/10 hover:text-white transition group"
              >
                <User size={18} className="text-amber-300/70 group-hover:text-amber-200" />
                <span>Profile</span>
              </button>
              <button
                role="menuitem"
                onClick={() => { setOpen(false); window.openMessagesPanel?.(); }}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-amber-100 hover:bg-amber-50/10 hover:text-white transition group"
              >
                <span className="text-amber-300/70 group-hover:text-amber-200">💬</span>
                <span>Messages</span>
              </button>
              <button
                role="menuitem"
                onClick={() => { setOpen(false); window.openBookmarksView?.(); }}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-amber-100 hover:bg-amber-50/10 hover:text-white transition group"
              >
                <span className="text-amber-300/70 group-hover:text-amber-200">📑</span>
                <span>Bookmarks</span>
              </button>
              {isAdmin && (
                <button
                  role="menuitem"
                  onClick={() => { setOpen(false); window.openAdminDashboard?.(); }}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-amber-100 hover:bg-amber-50/10 hover:text-white transition group"
                >
                  <Shield size={18} className="text-amber-300/70 group-hover:text-amber-200" />
                  <span>Admin Dashboard</span>
                </button>
              )}
              <button
                role="menuitem"
                onClick={() => { setOpen(false); onAbout?.(); }}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-amber-100 hover:bg-amber-50/10 hover:text-white transition group"
              >
                <Info size={18} className="text-amber-300/70 group-hover:text-amber-200" />
                <span>About</span>
              </button>
              <button
                role="menuitem"
                onClick={() => { setOpen(false); setShowSubscription(true); }}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-amber-100 hover:bg-amber-50/10 hover:text-white transition group"
              >
                <CreditCard size={18} className="text-amber-300/70 group-hover:text-amber-200" />
                <span>Subscription {plan !== 'pro' && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-300/40">Free</span>}</span>
              </button>
              <button
                role="menuitem"
                onClick={() => { setOpen(false); setShowHelp(true); localStorage.setItem("mortals.version.seen", APP_VERSION); setLastSeenVersion(APP_VERSION); }}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-amber-100 hover:bg-amber-50/10 hover:text-white transition group"
              >
                <HelpCircle size={18} className="text-amber-300/70 group-hover:text-amber-200" />
                <span>Help</span>
              </button>
              <button
                role="menuitem"
                onClick={() => { setOpen(false); onLogout?.(); }}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-red-300 hover:bg-red-50/10 hover:text-red-200 transition group"
              >
                <LogOut size={18} className="group-hover:text-red-200" />
                <span>Logout</span>
              </button>
            </div>
            <div className="px-4 py-3 border-t border-amber-400/20 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] tracking-wider text-amber-300/60 uppercase">
                <Shield size={14} className="opacity-70" />
                <span>Secure</span>
              </div>
              <span className="text-[10px] text-amber-400/50">v{APP_VERSION}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showHelp && (
          <motion.div
            key="help-modal"
            className="fixed inset-0 z-[85] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowHelp(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
              className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl border border-amber-400/40 bg-gradient-to-br from-indigo-950/85 via-purple-900/70 to-black/70 shadow-[0_0_0_1px_rgba(251,191,36,0.25),0_18px_38px_-8px_rgba(0,0,0,0.65)] overflow-hidden backdrop-blur-xl"
              role="dialog" aria-modal="true" aria-label="Help & Updates"
            >
              <div className="px-8 py-6 border-b border-amber-400/20 relative">
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 35% 45%, rgba(251,191,36,0.45), transparent 70%)' }} />
                <div className="flex items-center gap-4 relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300/70 to-yellow-200/50 border border-amber-300/60 shadow-inner flex items-center justify-center">
                    <HelpCircle className="w-7 h-7 text-amber-950 drop-shadow" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300" style={{ fontFamily: "'Cinzel', serif" }}>Help & Updates</h3>
                    <p className="text-[11px] tracking-wider text-amber-300/70 uppercase" style={{ fontFamily: "'Cinzel', serif" }}>Guidance • Version • Status</p>
                  </div>
                  <button onClick={() => setShowHelp(false)} className="rounded-xl p-2 text-amber-300/70 hover:text-amber-200 hover:bg-amber-100/10 transition" aria-label="Close help dialog">
                    <Menu className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="px-8 py-6 space-y-7 text-amber-100 overflow-y-auto" style={{ fontFamily: "'Crimson Text', serif" }}>
                <section className="space-y-2">
                  <h4 className="text-sm font-semibold tracking-wide text-amber-200" style={{ fontFamily: "'Cinzel', serif" }}>Overview</h4>
                  <p className="text-[13px] leading-relaxed text-amber-100/90">This dashboard helps you reflect on mortality and meaning. Create posts, explore canonical voices, and revisit evolving thoughts. Profile data and preferences are stored locally.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="text-sm font-semibold tracking-wide text-amber-200" style={{ fontFamily: "'Cinzel', serif" }}>Keyboard Shortcuts</h4>
                  <ul className="space-y-1 text-[12.5px] text-amber-100/90">
                    <li><span className="text-amber-300/80">Ctrl + Enter</span> — Post / save edits</li>
                    <li><span className="text-amber-300/80">Esc</span> — Close menus / dialogs</li>
                    <li><span className="text-amber-300/80">Ctrl + F</span> — Focus search (browser)</li>
                  </ul>
                </section>
                <section className="space-y-2">
                  <h4 className="text-sm font-semibold tracking-wide text-amber-200" style={{ fontFamily: "'Cinzel', serif" }}>Privacy</h4>
                  <p className="text-[13px] leading-relaxed text-amber-100/90">All content stays on this device unless you export or sync in future versions. Clearing browser storage will remove posts and profile data.</p>
                </section>
                <section className="space-y-3">
                  <h4 className="text-sm font-semibold tracking-wide text-amber-200 flex items-center gap-2" style={{ fontFamily: "'Cinzel', serif" }}><RefreshCcw className="w-4 h-4 text-amber-300" /> Software Updates</h4>
                  <div className="text-[13px] leading-relaxed text-amber-100/90 space-y-2">
                    <p>Current version: <span className="font-semibold text-amber-200">{APP_VERSION}</span>{lastSeenVersion !== APP_VERSION ? ' (new)' : ''}</p>
                    <p className="text-amber-100/80">Updates are delivered when you reload the app after a deploy. If something looks outdated, perform a hard refresh.</p>
                    <ol className="list-decimal list-inside space-y-1 text-[12.5px]">
                      <li>Press Ctrl + Shift + R (hard reload)</li>
                      <li>Or clear cache for this site</li>
                      <li>Then reopen the dashboard</li>
                    </ol>
                    <p className="text-[12px] text-amber-300/70">Future builds may add online sync & auto-update checks.</p>
                  </div>
                </section>
                <section className="space-y-2">
                  <h4 className="text-sm font-semibold tracking-wide text-amber-200" style={{ fontFamily: "'Cinzel', serif" }}>Need More?</h4>
                  <p className="text-[13px] leading-relaxed text-amber-100/90">For deeper guidance or to report issues, an upcoming Support channel will appear here.</p>
                </section>
              </div>
              <div className="px-8 py-5 border-t border-amber-400/20 bg-gradient-to-r from-indigo-950/60 via-purple-900/50 to-black/50 backdrop-blur flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] tracking-wider text-amber-300/60 uppercase"><Shield className="w-4 h-4" /><span>Local Only</span></div>
                <button onClick={() => setShowHelp(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300/40 text-amber-200/80 text-xs hover:bg-amber-100/10 transition">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSubscription && (
          <motion.div
            key="subscription-modal"
            className="fixed inset-0 z-[86] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowSubscription(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-amber-400/40 bg-gradient-to-br from-indigo-950/85 via-purple-900/70 to-black/70 shadow-[0_0_0_1px_rgba(251,191,36,0.25),0_18px_38px_-8px_rgba(0,0,0,0.65)] overflow-hidden backdrop-blur-xl"
              role="dialog" aria-modal="true" aria-label="Subscription Plans"
            >
              <div className="px-8 py-6 border-b border-amber-400/20 relative">
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 35% 45%, rgba(251,191,36,0.45), transparent 70%)' }} />
                <div className="flex items-center gap-4 relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300/70 to-yellow-200/50 border border-amber-300/60 shadow-inner flex items-center justify-center">
                    <CreditCard className="w-7 h-7 text-amber-950 drop-shadow" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300" style={{ fontFamily: "'Cinzel', serif" }}>Subscription</h3>
                    <p className="text-[11px] tracking-wider text-amber-300/70 uppercase" style={{ fontFamily: "'Cinzel', serif" }}>Choose your path</p>
                  </div>
                  <button onClick={() => setShowSubscription(false)} className="rounded-xl p-2 text-amber-300/70 hover:text-amber-200 hover:bg-amber-100/10 transition" aria-label="Close subscription dialog">
                    <Menu className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="px-8 py-6 space-y-8 text-amber-100 overflow-y-auto" style={{ fontFamily: "'Crimson Text', serif" }}>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Free Plan */}
                  <div className={`relative rounded-2xl border ${plan==='free' ? 'border-amber-300/70' : 'border-amber-300/40'} bg-gradient-to-br from-amber-50/10 via-white/5 to-amber-50/10 p-5 backdrop-blur-sm`}> 
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-amber-200" style={{ fontFamily: "'Cinzel', serif" }}>Free</h4>
                      {plan==='free' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <ul className="space-y-1 text-[12.5px] text-amber-100/90">
                      <li>• Unlimited personal dictums</li>
                      <li>• Basic search & sorting</li>
                      <li>• Daily prompt inspiration</li>
                      <li>• Local-only storage</li>
                      <li className="opacity-50">• Canonical Voices (limited)</li>
                      <li className="opacity-50">• Thematic Word Cloud (locked)</li>
                      <li className="opacity-50">• Priority roadmap access</li>
                    </ul>
                    {plan!=='free' && <div className="mt-3 text-[11px] text-amber-300/70">Current: Upgraded</div>}
                  </div>
                  {/* Pro Plan */}
                  <div className={`relative rounded-2xl border ${plan==='pro' ? 'border-purple-300/70' : 'border-purple-300/40'} bg-gradient-to-br from-purple-50/10 via-white/5 to-purple-50/10 p-5 backdrop-blur-sm`}> 
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-purple-200" style={{ fontFamily: "'Cinzel', serif" }}>Pro</h4>
                      {plan==='pro' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <ul className="space-y-1 text-[12.5px] text-purple-100/90">
                      <li>• Everything in Free</li>
                      <li>• Full Canonical Voices exploration</li>
                      <li>• Unlock Word Cloud analytics</li>
                      <li>• Advanced reflection metrics (future)</li>
                      <li>• Planned sync & backup (future)</li>
                      <li>• Priority roadmap influence</li>
                    </ul>
                    {plan!=='pro' ? (
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={async () => {
                            try {
                              const email = localStorage.getItem('mortals.auth.email');
                              const res = await fetch('/api/billing/create-checkout-session', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email })
                              });
                              const data = await res.json();
                              if (data.url) {
                                window.mortalsToast?.('Redirecting to secure checkout…', { type: 'info', duration: 1500 });
                                window.location.href = data.url;
                              } else {
                                console.error('No session URL returned', data);
                                window.mortalsToast?.('Failed to start upgrade. See console.', { type: 'error' });
                              }
                            } catch (err) {
                              console.error('Upgrade error', err);
                              window.mortalsToast?.('Upgrade failed. Please try again.', { type: 'error' });
                            }
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold py-2 hover:brightness-110 shadow"
                        >
                          Upgrade to Pro
                        </button>
                        <div className="text-[10px] text-purple-200/60">Secure Stripe checkout • Cancel anytime</div>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-2">
                        <div className="text-[11px] text-purple-200/80">You are on Pro. Thank you.</div>
                        <button
                          onClick={async () => {
                            try {
                              const email = localStorage.getItem('mortals.auth.email');
                              const customerId = localStorage.getItem('mortals.stripe.customerId');
                              const res = await fetch('/api/billing/create-portal-session', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, customerId })
                              });
                              if (!res.ok) {
                                if (res.status === 400) {
                                  window.mortalsToast?.('No subscription found yet. If you just upgraded, refresh to sync and try again.', { type: 'error' });
                                } else {
                                  window.mortalsToast?.('Portal request failed. Please try again.', { type: 'error' });
                                }
                                return;
                              }
                              const data = await res.json();
                              if (data.url) {
                                window.location.href = data.url;
                              } else {
                                window.mortalsToast?.('Portal unavailable (missing URL).', { type: 'error' });
                              }
                            } catch (e) {
                              console.error('Portal error', e);
                              window.mortalsToast?.('Portal failed (network error).', { type: 'error' });
                            }
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-purple-300/40 bg-purple-200/10 text-white text-sm font-semibold py-2 hover:bg-purple-200/20 transition"
                        >
                          Manage Subscription
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-[12px] leading-relaxed text-amber-100/80 border-t border-amber-300/20 pt-4">
                  Billing integration (Stripe or Paddle) will enable real payments. For now this is a local toggle for concept validation. Clearing site data resets plan. Implementation will include: secure auth, server-side webhook validation, and feature entitlements.
                </div>
              </div>
              <div className="px-8 py-5 border-t border-amber-400/20 bg-gradient-to-r from-indigo-950/60 via-purple-900/50 to-black/50 backdrop-blur flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] tracking-wider text-amber-300/60 uppercase"><Shield className="w-4 h-4" /><span>{plan==='pro' ? 'Pro Active' : 'Free Tier'}</span></div>
                <button onClick={() => setShowSubscription(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300/40 text-amber-200/80 text-xs hover:bg-amber-100/10 transition">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
