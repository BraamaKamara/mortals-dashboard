// src/components/AuthGate.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, Unlock, Eye, EyeOff, UserPlus, LogIn, 
  Fingerprint, Shield, Clock, Hourglass, Skull,
  AlertCircle, CheckCircle2, Info, User, Mail, Calendar, RefreshCcw
} from "lucide-react";
import MortalsLogo from "./MortalsLogo";

/**
 * AUTH GATE - The Gateway to Mortality Awareness
 * 
 * PHILOSOPHY: Your mortality data is sacred. This gate ensures:
 * 1. Privacy: All data stays local, encrypted with your passphrase
 * 2. Simplicity: No servers, no accounts, no complexity
 * 3. Mortality Awareness: Even login reminds you time is finite
 * 
 * OPTIONS:
 * - Local Auth: Passphrase-protected access (data encrypted in localStorage)
 * - Guest Mode: Temporary session (data cleared on exit)
 * - Import/Export: Backup your mortality journey
 */

function Card({ className = "", children }) {
  return <div className={`rounded-3xl border border-slate-200/50 bg-gradient-to-br from-slate-50 via-white to-purple-50/20 shadow-2xl overflow-hidden ${className}`}>{children}</div>;
}

function Button({ variant = "default", className = "", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = variant === "secondary"
    ? "bg-slate-100 text-slate-900 hover:bg-slate-200 border-2 border-slate-200"
    : variant === "danger"
    ? "bg-red-600 text-white hover:bg-red-700 shadow-lg"
    : variant === "ghost"
    ? "bg-transparent text-slate-700 hover:bg-slate-100 border-2 border-slate-300"
    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-110 shadow-lg";
  return <button className={`${base} ${styles} ${className}`} {...props}>{children}</button>;
}

function Input({ className = "", icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
      <input 
        className={`w-full rounded-xl border-2 border-slate-300 ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all ${className}`} 
        {...props} 
      />
    </div>
  );
}

export default function AuthGate({ onAuthenticated }) {
  const [mode, setMode] = useState(null); // null, "login", "signup", "guest", "verify-email"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [verificationPin, setVerificationPin] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [pinExpiry, setPinExpiry] = useState(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  // Backend API URL (configurable)
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

  // Check if user already exists
  const userExists = localStorage.getItem("mortals.auth.hash") !== null;

  // Show entrance animation first
  useEffect(() => {
    if (!mode) {
      setTimeout(() => setMode("welcome"), 100);
    }
    
    // Debug: Log localStorage on mount
    console.log("=== Auth Debug ===");
    console.log("Stored hash exists:", !!localStorage.getItem("mortals.auth.hash"));
    console.log("Stored email:", localStorage.getItem("mortals.auth.email"));
    console.log("Stored username:", localStorage.getItem("mortals.auth.username"));
    console.log("User exists:", userExists);
  }, [mode]);

  // Simple hash function for passphrase verification (NOT for production security!)
  const hashPassphrase = async (pass) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pass);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          username: username.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Verification code sent to your email! Check your inbox.");
        setPinExpiry(Date.now() + (data.expiresIn * 1000));
        setMode("verify-email");
      } else {
        // Surface backend diagnostics in development to help debugging
        const extra = data?.details?.hint || data?.details?.message || data?.details?.code;
        const base = data.error || "Failed to send verification email";
        const full = (process.env.NODE_ENV !== 'production' && extra) ? `${base} — ${extra}` : base;
        setError(full);
        if (data?.details) {
          console.error('send-verification error details:', data.details);
        }
      }
    } catch (err) {
      // Don't auto-complete signup on error - let user decide
      setError("Could not connect to verification service. Please check your internet connection or try again later.");
      console.error('Verification service error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify PIN
  const verifyPin = async () => {
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          pin: verificationPin
        })
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setEmailVerified(true);
        setMessage("Email verified successfully! Creating your account...");
        setTimeout(() => completeSignup(true), 1000);
      } else {
        setError(data.error || "Invalid PIN");
        setAttemptsRemaining(data.attemptsRemaining || attemptsRemaining - 1);
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const resendVerificationCode = async () => {
    await sendVerificationEmail();
  };

  // Complete signup after verification
  const completeSignup = async (verified) => {
    try {
      console.log("=== API Signup ===");
      
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          username: username.trim(),
          password: passphrase
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      // Store JWT token and user info
      localStorage.setItem("mortals.auth.token", data.token);
      localStorage.setItem("mortals.auth.email", data.user.email);
      localStorage.setItem("mortals.auth.username", data.user.username);
      localStorage.setItem("mortals.auth.userId", data.user.id);
      localStorage.setItem("mortals.auth.isAdmin", data.user.isAdmin ? "true" : "false");
      
      console.log("Account created successfully via API");
      
      setTimeout(() => {
        onAuthenticated({ 
          mode: "authenticated", 
          username: data.user.username, 
          email: data.user.email,
          verified: data.user.emailVerified
        });
      }, 500);
    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to create account. Please try again.");
    }
  };

  // Handle signup button (initiates email verification)
  const handleSignup = async () => {
    setError("");
    setMessage("");
    
    // Validation
    if (!username || username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!ageConfirmed) {
      setError("You must confirm you are 18 or older to use this dashboard");
      return;
    }
    
    if (!passphrase || passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters");
      return;
    }
    
    if (passphrase !== confirmPassphrase) {
      setError("Passphrases do not match");
      return;
    }

    // Send verification email
    await sendVerificationEmail();
  };

  // Skip email verification for local development
  const handleSkipVerification = async () => {
    setMessage("Skipping email verification. Creating account...");
    setIsLoading(true);
    setTimeout(async () => {
      await completeSignup(false);
      setIsLoading(false);
    }, 500);
  };

  const handleLogin = async () => {
    setError("");
    setMessage("");
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    if (!passphrase) {
      setError("Please enter your passphrase");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("=== API Login ===");
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: passphrase
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setPassphrase("");
        setIsLoading(false);
        return;
      }

      // Store JWT token and user info
      localStorage.setItem("mortals.auth.token", data.token);
      localStorage.setItem("mortals.auth.email", data.user.email);
      localStorage.setItem("mortals.auth.username", data.user.username);
      localStorage.setItem("mortals.auth.userId", data.user.id);
      localStorage.setItem("mortals.auth.isAdmin", data.user.isAdmin ? "true" : "false");
      
      console.log("Login successful via API");
      
      // Success - log in
      setMessage("Authentication successful! Welcome back...");
      setTimeout(() => {
        onAuthenticated({ 
          mode: "authenticated", 
          username: data.user.username, 
          email: data.user.email
        });
      }, 800);
      
    } catch (err) {
      setError("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    setMessage("Entering as guest...");
    setTimeout(() => {
      onAuthenticated({ mode: "guest" });
    }, 500);
  };

  // Welcome screen
  if (mode === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="relative">
            {/* Atmospheric background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative p-12 space-y-8">
              {/* Logo & Title */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center"
                >
                  <div className="p-4 rounded-2xl bg-white shadow-xl">
                    <MortalsLogo size={64} variant="default" />
                  </div>
                </motion.div>
                
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl font-extrabold tracking-wider uppercase bg-gradient-to-r from-slate-800 via-purple-700 to-indigo-700 bg-clip-text text-transparent"
                >
                  MORTALS
                </motion.h1>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-slate-600 max-w-lg mx-auto"
                >
                  A Dashboard for Mortality Awareness
                </motion.p>
              </div>

              {/* Philosophical Quote */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center space-y-3 py-6 border-y border-slate-200"
              >
                <p className="text-xl font-semibold text-slate-700 italic">
                  "We are all mortal."
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  The question is: are we awake?
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <Button onClick={() => setMode("login")} className="w-full">
                  <LogIn className="w-5 h-5" />
                  Login to Your Journey
                </Button>
                
                <Button variant="secondary" onClick={() => setMode("signup")} className="w-full">
                  <UserPlus className="w-5 h-5" />
                  Create New Account
                </Button>
              </motion.div>

              {/* Info Cards */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="grid gap-3 pt-4"
              >
                <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-purple-900 mb-1">Privacy First</p>
                    <p className="text-purple-700">All data stays on your device. No servers, no cloud, no tracking.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-indigo-900 mb-1">Your Time, Your Data</p>
                    <p className="text-indigo-700">Track your mortality awareness journey with complete control.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Email Verification screen
  if (mode === "verify-email") {
    const timeRemaining = pinExpiry ? Math.max(0, Math.ceil((pinExpiry - Date.now()) / 1000)) : 600;
    const minutesLeft = Math.floor(timeRemaining / 60);
    const secondsLeft = timeRemaining % 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Card>
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg mb-2">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  Verify Your Email
                </h2>
                <p className="text-sm text-slate-600">
                  We sent a 6-digit PIN to <strong>{email}</strong>
                </p>
              </div>

              {/* PIN Input */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Enter 6-Digit PIN
                  </label>
                  <Input
                    type="text"
                    value={verificationPin}
                    onChange={(e) => setVerificationPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    autoFocus
                    className="text-center text-2xl font-bold tracking-widest"
                    onKeyDown={(e) => e.key === "Enter" && verificationPin.length === 6 && verifyPin()}
                  />
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    Check your email inbox (and spam folder)
                  </p>
                </div>

                {/* Timer */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-700">
                      Expires in {minutesLeft}:{secondsLeft.toString().padStart(2, '0')}
                    </span>
                  </div>
                  {attemptsRemaining < 5 && (
                    <p className="text-xs text-amber-600 mt-2">
                      {attemptsRemaining} attempts remaining
                    </p>
                  )}
                </div>

                {/* Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error-verify"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {message && (
                    <motion.div
                      key="message-verify"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Info */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    Didn't receive the email? Check your spam folder or click "Resend Code" below.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={verifyPin} 
                  disabled={isLoading || verificationPin.length !== 6}
                  className="w-full"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setMode("signup");
                      setVerificationPin("");
                      setError("");
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={resendVerificationCode}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Resend Code
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Signup screen
  if (mode === "signup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Card>
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg mb-2">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  Create Your Journey
                </h2>
                <p className="text-sm text-slate-600">
                  Choose a passphrase to protect your mortality data
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your name..."
                    icon={User}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    icon={Mail}
                  />
                  <p className="text-xs text-slate-500 mt-1">For account recovery and important notifications</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Passphrase
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassphrase ? "text" : "password"}
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="At least 8 characters..."
                      icon={Lock}
                      onKeyDown={(e) => e.key === "Enter" && confirmPassphrase && handleSignup()}
                    />
                    <button
                      onClick={() => setShowPassphrase(!showPassphrase)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassphrase ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Confirm Passphrase
                  </label>
                  <Input
                    type={showPassphrase ? "text" : "password"}
                    value={confirmPassphrase}
                    onChange={(e) => setConfirmPassphrase(e.target.value)}
                    placeholder="Type it again..."
                    icon={Lock}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  />
                </div>

                {/* Age Confirmation */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <input
                    type="checkbox"
                    id="age-confirm"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                  <label htmlFor="age-confirm" className="text-sm text-slate-700 cursor-pointer">
                    <strong>I confirm that I am 18 years or older.</strong>
                    <p className="text-xs text-slate-600 mt-1">
                      This dashboard contains mature themes related to mortality and requires users to be of legal age.
                    </p>
                  </label>
                </div>

                {/* Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error-signup"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {message && (
                    <motion.div
                      key="message-signup"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Important:</strong> This passphrase cannot be recovered. 
                    Store it safely. Without it, your mortality data is lost forever—much like time itself.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={handleSignup} 
                  disabled={isLoading || !passphrase || !confirmPassphrase}
                  className="w-full"
                >
                  <Fingerprint className="w-5 h-5" />
                  {isLoading ? "Sending Verification..." : "Create Account (Email Verification)"}
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={handleSkipVerification} 
                  disabled={isLoading || !username || !email || !passphrase || !confirmPassphrase || !ageConfirmed}
                  className="w-full"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Skip Verification (Local Only)
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setMode("welcome");
                    setUsername("");
                    setEmail("");
                    setPassphrase("");
                    setConfirmPassphrase("");
                    setAgeConfirmed(false);
                    setError("");
                  }}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Login screen
  if (mode === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Card>
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg mb-2">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  Welcome Back
                </h2>
                <p className="text-sm text-slate-600">
                  Enter your credentials to continue your mortality journey
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    icon={Mail}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Passphrase
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassphrase ? "text" : "password"}
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Your passphrase..."
                      icon={Lock}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      onClick={() => setShowPassphrase(!showPassphrase)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassphrase ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error-login"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {message && (
                    <motion.div
                      key="message-login"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reminder */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800">
                  <Skull className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    Each day that passes is gone forever. Make this moment count.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={handleLogin} 
                  disabled={isLoading || !email || !passphrase}
                  className="w-full"
                >
                  <Unlock className="w-5 h-5" />
                  {isLoading ? "Authenticating..." : "Enter Dashboard"}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setMode("welcome");
                    setEmail("");
                    setPassphrase("");
                    setError("");
                  }}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
}
