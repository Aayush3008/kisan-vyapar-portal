'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, 
  ShoppingCart, 
  Phone, 
  User, 
  MapPin, 
  Building2,
  Lock,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  X,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Timer
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function RoleModal() {
  const { showRoleModal, setShowRoleModal, loginUser, currentUser } = useRole();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'buyer'>('farmer');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [district, setDistrict] = useState('Meerut');
  const [state, setState] = useState('Uttar Pradesh');
  const [farmName, setFarmName] = useState('');

  // OTP state
  const [otpStep, setOtpStep] = useState<'form' | 'otp-sent' | 'verified'>('form');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  // If user is already authenticated and modal is not explicitly open, do not render
  if (currentUser && !showRoleModal) return null;

  // ── Send OTP ──
  const handleSendOtp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!phone.trim() || phone.trim().replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number to receive OTP.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name before requesting OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to send OTP.');
        return;
      }

      setOtpStep('otp-sent');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(300); // 5 minutes
      setOtpHint(data.otp_hint || null);
      setSuccessMessage(`OTP sent to ${phone.trim()}! Check your messages.`);

      if (data.otp_hint) {
        toast(`📱 Your OTP is: ${data.otp_hint} (Demo Mode)`, 'success');
      }

      // Focus first OTP input
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'OTP verification failed.');
        return;
      }

      setOtpStep('verified');
      setOtpVerified(true);
      setSuccessMessage('✅ Mobile number verified! Complete your registration below.');
      toast('Mobile number verified successfully!', 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP Input Handler ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // only last char
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (newDigits.every((d) => d) && newDigits.join('').length === 6) {
      setTimeout(handleVerifyOtp, 200);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // ── OTP Paste Handler ──
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newDigits = pastedData.split('');
      setOtpDigits(newDigits);
      otpInputRefs.current[5]?.focus();
      setTimeout(handleVerifyOtp, 200);
    }
  };

  // ── Login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter your phone number / email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      loginUser(data.user);
      toast(data.message || `Welcome back, ${data.user.full_name}!`, 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error. Could not connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Register (after OTP verified) ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('Please provide your full name and mobile phone number.');
      return;
    }

    if (!otpVerified) {
      setErrorMessage('Please verify your mobile number with OTP first.');
      return;
    }

    if (!registerPassword || registerPassword.length < 4) {
      setErrorMessage('Please choose a security password with at least 4 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          password: registerPassword.trim(),
          role: selectedRole,
          district: district.trim() || 'Meerut',
          state: state.trim() || 'Uttar Pradesh',
          farmName: farmName.trim() || (selectedRole === 'farmer' ? `${fullName.trim()}'s Krishi Farm` : undefined),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyRegistered) {
          setLoginIdentifier(phone.trim());
          setActiveTab('login');
        }
        setErrorMessage(data.error || 'Registration failed. Please check inputs.');
        return;
      }

      loginUser(data.user);
      toast(
        data.message || `Welcome, ${data.user.full_name}! Your account is registered.`,
        'success'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset OTP state when switching tabs or changing phone
  const resetOtpState = () => {
    setOtpStep('form');
    setOtpDigits(['', '', '', '', '', '']);
    setOtpHint(null);
    setOtpTimer(0);
    setOtpVerified(false);
    setSuccessMessage(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* iOS Frosted Aero Liquid Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0A1A10]/60 backdrop-blur-2xl"
          style={{
            backdropFilter: 'blur(30px) saturate(210%)',
            WebkitBackdropFilter: 'blur(30px) saturate(210%)',
          }}
        />

        {/* Ambient Liquid Specular Glow Orbs */}
        <div className="fixed -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none animate-pulse" />
        <div className="fixed -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

        {/* Liquid Glass Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          className="relative w-full max-w-xl my-auto rounded-[2rem] p-6 sm:p-8 z-10 text-left border border-white/80 shadow-[0_32px_80px_-16px_rgba(10,35,20,0.35)] overflow-hidden max-h-[90vh] overflow-y-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(245, 252, 247, 0.78) 100%)',
            backdropFilter: 'blur(36px) saturate(220%)',
            WebkitBackdropFilter: 'blur(36px) saturate(220%)',
          }}
        >
          {/* Specular Glare Reflection Sheen */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

          {/* Header Branding */}
          <div className="flex items-center justify-between pb-4 border-b border-black/5 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#246B3C] to-[#3FA863] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(45,122,70,0.35)] border border-white/40">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif text-2xl font-bold tracking-tight text-[#1E2A22]">
                    Kisan Vyapar
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Security Gate
                  </span>
                </div>
                <p className="text-xs text-[#617064] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D7A46]" />
                  Direct Farm-to-Buyer Mandi Verification
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/70 border border-white/80 text-[11px] font-semibold text-[#1E2A22] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Liquid Glass UI</span>
              </div>
              {currentUser && (
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-black/5 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-xs text-red-800 flex items-start space-x-2 relative z-10 shadow-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </motion.div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2 relative z-10 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </motion.div>
          )}

          {/* Tab Selector: Sign In vs Register */}
          <div className="mt-5 grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/[0.04] border border-black/5 relative z-10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'login'
                  ? 'bg-white text-[#1E2A22] shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-white'
                  : 'text-[#617064] hover:text-[#1E2A22]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In to Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'register'
                  ? 'bg-white text-[#1E2A22] shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-white'
                  : 'text-[#617064] hover:text-[#1E2A22]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Register New Account</span>
            </button>
          </div>

          {/* LOGIN VIEW */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="mt-5 space-y-4 text-xs relative z-10">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-[11px] leading-relaxed">
                <strong>Mandatory Verification:</strong> Please sign in with your registered mobile number or email and password. Your previous purchase or crop sales history will load automatically.
              </div>

              <div>
                <label className="font-bold text-[#1E2A22] block mb-1.5">
                  Mobile Number / Email Address *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210 or rameshwar@kisanvyapar.in"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl liquid-glass-input text-[#1E2A22] font-medium placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1E2A22] block mb-1.5">
                  Account Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your security password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl liquid-glass-input text-[#1E2A22] font-medium placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 liquid-glass-btn-primary rounded-xl flex items-center justify-center space-x-2 text-sm shadow-[0_12px_28px_rgba(45,122,70,0.35)]"
                >
                  {isLoading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Verify &amp; Unlock Kisan Vyapar Portal</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-[11px] text-[#617064] pt-2">
                Don&apos;t have an account registered yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-[#2D7A46] hover:underline"
                >
                  Register here in 30 seconds
                </button>
              </div>
            </form>
          )}

          {/* REGISTER VIEW */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="mt-4 space-y-3.5 text-xs relative z-10">
              {/* Role Selection Tabs */}
              <div>
                <label className="font-bold text-[#1E2A22] block mb-1.5">
                  Select Your Agricultural Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedRole('farmer')}
                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex items-center space-x-2.5 ${
                      selectedRole === 'farmer'
                        ? 'border-[#2D7A46] bg-emerald-500/10 shadow-xs'
                        : 'border-black/10 bg-white/60 hover:bg-white/90'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E2A22] text-xs">Farmer / Producer</h4>
                      <p className="text-[10px] text-[#617064]">Sell crops &amp; get orders</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedRole('buyer')}
                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex items-center space-x-2.5 ${
                      selectedRole === 'buyer'
                        ? 'border-[#2D7A46] bg-emerald-500/10 shadow-xs'
                        : 'border-black/10 bg-white/60 hover:bg-white/90'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1E2A22] text-white flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E2A22] text-xs">Buyer / Trader</h4>
                      <p className="text-[10px] text-[#617064]">Procure directly from farm</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E2A22] block mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rameshwar Patel"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl liquid-glass-input text-[#1E2A22]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#1E2A22] block mb-1">Mobile Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        // Reset OTP if phone changes after OTP was sent
                        if (otpStep !== 'form') resetOtpState();
                      }}
                      disabled={otpVerified}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl liquid-glass-input text-[#1E2A22] ${otpVerified ? 'opacity-60' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* ═══════════════ OTP VERIFICATION SECTION ═══════════════ */}
              {otpStep === 'form' && (
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-blue-900 text-xs">Mobile Verification Required</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading || !phone.trim() || !fullName.trim()}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow-sm"
                    >
                      {isLoading ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <Phone className="w-3 h-3" />
                          <span>Send OTP</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-blue-700 mt-1.5">
                    A 6-digit OTP will be sent to your mobile number for verification.
                  </p>
                </div>
              )}

              {otpStep === 'otp-sent' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/60"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-amber-900 text-xs">Enter 6-Digit OTP</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-amber-700 font-semibold">
                      <Timer className="w-3 h-3" />
                      <span>{otpTimer > 0 ? `Expires in ${formatTime(otpTimer)}` : 'OTP Expired'}</span>
                    </div>
                  </div>

                  {/* OTP hint banner (demo mode) */}
                  {otpHint && (
                    <div className="mb-3 p-2 rounded-lg bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-[10px] text-center font-bold">
                      📱 Demo Mode — Your OTP is: <span className="text-sm tracking-[0.3em] font-mono">{otpHint}</span>
                    </div>
                  )}

                  {/* 6-digit OTP input boxes */}
                  <div className="flex justify-center space-x-2 mb-3" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 h-12 text-center text-lg font-bold rounded-xl border-2 border-amber-300 bg-white/80 text-[#1E2A22] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otpDigits.join('').length !== 6}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verify OTP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (otpTimer <= 0) handleSendOtp();
                      }}
                      disabled={otpTimer > 0 || isLoading}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {otpStep === 'verified' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900 text-xs">Mobile Verified</span>
                    <p className="text-[10px] text-emerald-700">
                      {phone} — Number confirmed ✓
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Password (shown after OTP verified) */}
              {otpVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3.5"
                >
                  <div>
                    <label className="font-bold text-[#1E2A22] block mb-1">
                      Create Security Password * <span className="text-[10px] text-stone-500 font-normal">(Min. 4 chars)</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="Choose a password for future sign-ins"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl liquid-glass-input text-[#1E2A22]"
                      />
                    </div>
                  </div>

                  {/* Farmer Farm Name */}
                  {selectedRole === 'farmer' && (
                    <div>
                      <label className="font-bold text-[#1E2A22] block mb-1">Farm / Agribusiness Name</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. Patel Organic Agro Farms"
                          value={farmName}
                          onChange={(e) => setFarmName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl liquid-glass-input text-[#1E2A22]"
                        />
                      </div>
                    </div>
                  )}

                  {/* District & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#1E2A22] block mb-1">District / City</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. Meerut"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl liquid-glass-input text-[#1E2A22]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[#1E2A22] block mb-1">State</label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl liquid-glass-input text-[#1E2A22] font-medium"
                      >
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Bihar">Bihar</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jammu & Kashmir">Jammu &amp; Kashmir</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Telangana">Telangana</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading || !otpVerified}
                      className="w-full py-3.5 liquid-glass-btn-primary rounded-xl flex items-center justify-center space-x-2 text-sm shadow-[0_12px_28px_rgba(45,122,70,0.35)]"
                    >
                      {isLoading ? (
                        <span>Registering Account...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Complete Registration &amp; Enter Portal</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              <div className="text-center text-[11px] text-[#617064] pt-1">
                Already registered previously?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    resetOtpState();
                  }}
                  className="font-bold text-[#2D7A46] hover:underline"
                >
                  Sign In instead
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
