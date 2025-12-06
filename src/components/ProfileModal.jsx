import React, { useEffect, useRef, useState } from "react";
import { X, User, Mail, Image as ImageIcon, Save, Trash2, Info, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Local storage helper
const ls = {
  get: (k, d = null) => { try { const v = localStorage.getItem(k); return v ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  remove: (k) => { try { localStorage.removeItem(k); } catch {} }
};

export default function ProfileModal({ open, onClose, currentUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🕯️");
  const [avatarImage, setAvatarImage] = useState("");
  // Social / links
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [status, setStatus] = useState(() => ls.get("mortals.profile.status", "active"));
  // Destructive action confirmation flags
  const [confirmAction, setConfirmAction] = useState(null); // 'deactivate' | 'delete' | null
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setName(ls.get("mortals.profile.name", currentUser?.username || ""));
    setEmail(ls.get("mortals.auth.email", currentUser?.email || ""));
    setBio(ls.get("mortals.profile.bio", ""));
    setAvatarEmoji(ls.get("mortals.profile.avatarEmoji", "🕯️"));
    setAvatarImage(ls.get("mortals.profile.avatarImage", ""));
    setWebsite(ls.get("mortals.profile.link.website", ""));
    setTwitter(ls.get("mortals.profile.link.twitter", ""));
    setGithub(ls.get("mortals.profile.link.github", ""));
    setLinkedin(ls.get("mortals.profile.link.linkedin", ""));
    setStatus(ls.get("mortals.profile.status", "active"));
  }, [open, currentUser]);

  const hasImage = !!avatarImage;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setAvatarImage(String(reader.result)); ls.set("mortals.profile.avatarImage", String(reader.result)); };
    reader.readAsDataURL(file);
  };
  const clearImage = () => { setAvatarImage(""); ls.remove("mortals.profile.avatarImage"); };

  const handleSave = () => {
    if (!name || name.trim().length < 2) { window.mortalsToast?.("Please enter a display name (at least 2 characters)", { type: 'error' }); return; }
    ls.set("mortals.profile.name", name.trim());
    ls.set("mortals.profile.bio", bio.trim());
    ls.set("mortals.profile.avatarEmoji", avatarEmoji || "🕯️");
    ls.set("mortals.profile.updated", new Date().toISOString());
    // Persist links (sanitized)
    const sanitizeUrl = (u) => {
      if (!u) return "";
      let v = u.trim();
      if (!/^https?:\/\//i.test(v) && !v.startsWith("mailto:")) {
        v = "https://" + v.replace(/^\/+/, "");
      }
      try { return new URL(v).toString(); } catch { return ""; }
    };
    ls.set("mortals.profile.link.website", sanitizeUrl(website));
    ls.set("mortals.profile.link.twitter", twitter.trim());
    ls.set("mortals.profile.link.github", github.trim());
    ls.set("mortals.profile.link.linkedin", linkedin.trim());
    ls.set("mortals.profile.status", status);
    onClose?.({ saved: true });
  };

  const resetProfile = () => {
    setName("");
    setBio("");
    setAvatarEmoji("🕯️");
    setAvatarImage("");
    setWebsite(""); setTwitter(""); setGithub(""); setLinkedin("");
    ["mortals.profile.name","mortals.profile.bio","mortals.profile.avatarEmoji","mortals.profile.avatarImage","mortals.profile.link.website","mortals.profile.link.twitter","mortals.profile.link.github","mortals.profile.link.linkedin"].forEach(k=> ls.remove(k));
    setConfirmReset(false);
    window.mortalsToast?.('Profile reset to defaults', { type: 'success', duration: 2500 });
  };

  const requestDeactivate = () => { setConfirmAction("deactivate"); };
  const confirmDeactivate = () => {
    ls.set("mortals.profile.status","deactivated");
    setStatus("deactivated");
    setConfirmAction(null);
    window.mortalsToast?.('Profile deactivated', { type: 'success', duration: 2500 });
  };
  const requestDelete = () => { setConfirmAction("delete"); };
  const confirmDelete = () => {
    // Remove all mortals.profile.* keys
    Object.keys(localStorage).forEach(k => { if (k.startsWith("mortals.profile.")) ls.remove(k); });
    setName(""); setBio(""); setAvatarEmoji("🕯️"); setAvatarImage(""); setWebsite(""); setTwitter(""); setGithub(""); setLinkedin(""); setStatus("deleted");
    setConfirmAction(null);
    window.mortalsToast?.('Profile data deleted', { type: 'success', duration: 2500 });
    onClose?.({ deleted: true });
  };
  const cancelConfirm = () => setConfirmAction(null);

  // Prevent background scroll while modal open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="profile-modal"
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => onClose?.({ saved: false })}
        />
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 20, scale: 0.94, filter: 'blur(6px)' }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-amber-400/40 bg-gradient-to-br from-indigo-950/85 via-purple-900/70 to-black/70 shadow-[0_0_0_1px_rgba(251,191,36,0.25),0_20px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-xl"
          role="dialog" aria-modal="true" aria-label="Profile settings"
        >
          {/* Header */}
          <div className="relative px-8 py-6 border-b border-amber-400/20">
            <div className="absolute inset-0 opacity-[0.09] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(251,191,36,0.4), transparent 70%)' }} />
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300/70 to-yellow-200/50 border border-amber-300/60 shadow-inner overflow-hidden flex items-center justify-center text-2xl">
                {hasImage ? <img src={avatarImage} alt="avatar" className="w-full h-full object-cover" /> : <span aria-label="avatar" role="img" className="drop-shadow-lg">{avatarEmoji || '🕯️'}</span>}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300" style={{ fontFamily: "'Cinzel', serif" }}>Profile</h3>
                <p className="text-[12px] tracking-wider text-amber-300/70 uppercase" style={{ fontFamily: "'Cinzel', serif" }}>Customize your mortal imprint</p>
              </div>
              <button onClick={() => onClose?.({ saved: false })} className="rounded-xl p-2 text-amber-300/70 hover:text-amber-200 hover:bg-amber-100/10 transition" aria-label="Close profile dialog">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-7 space-y-8 text-amber-100 overflow-y-auto" style={{ fontFamily: "'Crimson Text', serif" }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-amber-300/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>Avatar</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAvatarEmoji(avatarEmoji === '🕯️' ? '⏳' : avatarEmoji === '⏳' ? '🌿' : '🕯️')}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-200/60 to-yellow-100/40 flex items-center justify-center text-3xl border border-amber-300/50 shadow-inner hover:ring-2 hover:ring-amber-300/60 transition"
                    title="Cycle avatar emoji"
                  >
                    <span role="img" aria-label="avatar-emoji" className="drop-shadow">{avatarEmoji || '🕯️'}</span>
                  </button>
                  <div className="space-y-2">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 text-[12px] rounded-lg border border-amber-300/50 bg-amber-100/10 hover:bg-amber-100/20 text-amber-200/90"><ImageIcon className="w-4 h-4" /> Upload</button>
                    {hasImage && <button onClick={clearImage} className="inline-flex items-center gap-2 px-3 py-2 text-[12px] rounded-lg border border-red-300/50 bg-red-100/10 hover:bg-red-100/20 text-red-200/90"><Trash2 className="w-4 h-4" /> Remove</button>}
                  </div>
                </div>
                <p className="text-[11px] text-amber-300/70 leading-relaxed">Use an emoji or upload an image. Stored locally — never leaves this device.</p>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs uppercase tracking-wider text-amber-300/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300/50" />
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="How should the archive address you?" className="w-full rounded-xl border border-amber-300/40 bg-white/10 backdrop-blur px-12 pr-4 py-3 text-[15px] leading-relaxed outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 text-amber-100" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-amber-300/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300/50" />
                <input value={email || ''} readOnly className="w-full rounded-xl border border-amber-300/30 bg-white/5 px-12 pr-4 py-3 text-[14px] outline-none text-amber-200/80" />
              </div>
              <p className="text-[11px] text-amber-300/60">Email is linked to your account. It cannot be changed here.</p>
            </div>
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-amber-300/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A brief mortal note (optional)" rows={4} className="w-full rounded-xl border border-amber-300/40 bg-white/10 backdrop-blur px-4 py-3 text-[14px] leading-relaxed outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 text-amber-100" />
            </div>
            {/* Social / Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-amber-300/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>Website</label>
                <input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="your-site.com" className="w-full rounded-xl border border-amber-300/30 bg-white/5 px-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 text-amber-100" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-amber-300/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>Twitter / X</label>
                <input value={twitter} onChange={e=>setTwitter(e.target.value)} placeholder="@handle" className="w-full rounded-xl border border-amber-300/30 bg-white/5 px-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 text-amber-100" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-amber-300/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>GitHub</label>
                <input value={github} onChange={e=>setGithub(e.target.value)} placeholder="github username" className="w-full rounded-xl border border-amber-300/30 bg-white/5 px-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 text-amber-100" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-amber-300/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>LinkedIn</label>
                <input value={linkedin} onChange={e=>setLinkedin(e.target.value)} placeholder="linkedin profile" className="w-full rounded-xl border border-amber-300/30 bg-white/5 px-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 text-amber-100" />
              </div>
            </div>
            <div className="relative p-4 rounded-2xl border border-amber-300/30 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-black/40 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(251,191,36,0.35), transparent 70%)' }} />
              <div className="flex items-start gap-3 relative">
                <Info className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] leading-relaxed text-amber-100/90">Profile data never leaves your device. Clearing browser storage will reset it. Avatar images & links are stored locally. Status: <span className="font-semibold text-amber-200">{status}</span>.</p>
              </div>
            </div>
            {/* Destructive Actions */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-red-300/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>Danger Zone</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => setConfirmReset(true)} className="text-[12px] px-3 py-2 rounded-lg border border-amber-300/40 bg-amber-100/10 text-amber-200 hover:bg-amber-100/20 transition">Reset Profile</button>
                <button onClick={requestDeactivate} className="text-[12px] px-3 py-2 rounded-lg border border-purple-300/40 bg-purple-100/10 text-purple-200 hover:bg-purple-100/20 transition">Deactivate</button>
                <button onClick={requestDelete} className="text-[12px] px-3 py-2 rounded-lg border border-red-400/50 bg-red-100/10 text-red-200 hover:bg-red-100/20 transition">Delete</button>
              </div>
              {confirmReset && (
                <div className="mt-2 p-4 rounded-xl border border-amber-400/40 bg-amber-900/30 backdrop-blur-sm space-y-2">
                  <p className="text-[12px] leading-relaxed text-amber-100">
                    Reset will clear avatar, bio, and social links. Display name will be emptied. This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={resetProfile} className="text-[12px] px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700">Confirm Reset</button>
                    <button onClick={() => setConfirmReset(false)} className="text-[12px] px-3 py-1.5 rounded-lg border border-amber-300/40 text-amber-200 hover:bg-amber-100/10">Cancel</button>
                  </div>
                </div>
              )}
              {confirmAction && (
                <div className="mt-2 p-4 rounded-xl border border-red-400/40 bg-red-900/30 backdrop-blur-sm space-y-2">
                  <p className="text-[12px] leading-relaxed text-red-100">
                    {confirmAction === 'delete' ? 'Deleting removes all profile data permanently. This cannot be undone.' : 'Deactivation hides your profile (you can reactivate by saving again).'}
                  </p>
                  <div className="flex gap-3">
                    {confirmAction === 'delete' ? (
                      <button onClick={confirmDelete} className="text-[12px] px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700">Confirm Delete</button>
                    ) : (
                      <button onClick={confirmDeactivate} className="text-[12px] px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700">Confirm Deactivate</button>
                    )}
                    <button onClick={cancelConfirm} className="text-[12px] px-3 py-1.5 rounded-lg border border-red-300/40 text-red-200 hover:bg-red-100/10">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="px-8 py-6 border-t border-amber-400/20 bg-gradient-to-r from-indigo-950/60 via-purple-900/50 to-black/50 backdrop-blur flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] tracking-wider text-amber-300/60 uppercase"><Sparkles className="w-4 h-4" /><span>Profile Ritual</span></div>
            <div className="flex items-center gap-3">
              <button onClick={() => onClose?.({ saved: false })} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300/40 text-amber-200/80 text-sm hover:bg-amber-100/10 transition">Cancel</button>
              <button onClick={handleSave} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-yellow-500 shadow hover:brightness-110"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
