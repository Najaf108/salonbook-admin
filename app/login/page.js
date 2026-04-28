// app/login/page.js
'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authLib } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputs = useRef([]);

  useEffect(() => {
    if (authLib.isAuthenticated()) router.replace('/dashboard');
  }, [router]);

  useEffect(() => {
    if (timer <= 0) return;
    const iv = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(iv);
  }, [timer]);

  const handlePhone = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s/g, '');
    if (!/^03\d{9}$/.test(cleaned)) {
      toast.error('Enter a valid Pakistani mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await authLib.requestOTP(cleaned);
      toast.success(res.otp ? `OTP: ${res.otp} (dev mode)` : 'OTP sent!');
      setStep('otp');
      setTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 3) inputs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputs.current[idx - 1]?.focus();
    if (next.every(d => d) && val) verifyOtp(next.join(''));
  };

  const verifyOtp = async (code) => {
    setLoading(true);
    try {
      await authLib.verifyOTP(phone.replace(/\s/g, ''), code);
      toast.success('Welcome back!');
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
      setOtp(['', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (timer > 0) return;
    await authLib.requestOTP(phone.replace(/\s/g, ''));
    setTimer(30);
    toast.success('New OTP sent');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-600 rounded-2xl text-2xl mb-4 shadow-lg shadow-purple-600/30">
            💈
          </div>
          <h1 className="text-2xl font-bold text-white">SalonBook Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Platform Administration</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          {step === 'phone' ? (
            <form onSubmit={handlePhone} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Admin Phone Number</label>
                <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/5 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="03XX XXXXXXX"
                    maxLength={11}
                    className="flex-1 bg-transparent px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/40 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {loading ? 'Sending...' : 'Send OTP →'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-300 mb-1">Enter the 4-digit code sent to</p>
                <p className="text-white font-semibold">{phone}</p>
              </div>

              <div className="flex gap-3 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={r => inputs.current[i] = r}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    autoFocus={i === 0}
                    className={`
                      w-14 h-14 text-center text-2xl font-bold rounded-xl border text-white bg-white/5
                      focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all
                      ${digit ? 'border-purple-500 bg-purple-500/10' : 'border-white/10'}
                    `}
                  />
                ))}
              </div>

              {loading && (
                <p className="text-center text-sm text-gray-400">Verifying...</p>
              )}

              <div className="text-center">
                <button
                  onClick={resendOtp}
                  disabled={timer > 0}
                  className="text-sm text-purple-400 hover:text-purple-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                onClick={() => { setStep('phone'); setOtp(['', '', '', '']); }}
                className="w-full py-2.5 text-sm text-gray-400 hover:text-white border border-white/10 rounded-xl transition-colors hover:bg-white/5"
              >
                ← Change number
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Only registered admin accounts can access this panel
        </p>
      </div>
    </div>
  );
}
