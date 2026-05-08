'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Mail, ArrowRight, Shield, Zap, GitBranch, Loader2, ChevronLeft } from 'lucide-react'

type Step = 'landing' | 'email' | 'otp'

export default function AuthPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuthStore()
  const [step, setStep] = useState<Step>('landing')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, router])

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await authApi.sendOtp(email)
      toast.success('Verification code sent!')
      setStep('otp')
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) {
      toast.error('Enter the 6-digit code')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(email, code)
      const { access_token, user } = res.data
      login(user, access_token)
      toast.success(`Welcome, ${user.display_name || user.email}!`)
      router.replace('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Invalid code')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus()
    if (next.every(d => d) && next.join('').length === 6) {
      setTimeout(() => handleVerifyOtp(), 100)
    }
  }

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      setTimeout(handleVerifyOtp, 100)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left — Quantum Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0B1020 0%, #121826 50%, #0d1829 100%)' }}>
        <QuantumBackground />
        <div className="relative z-10 text-center px-12 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563EB, #60A5FA)', boxShadow: '0 0 30px rgba(96,165,250,0.3)' }}>
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">QuantumOS</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Enterprise Quantum<br />Infrastructure
            </h1>
            <p className="text-base leading-relaxed" style={{ color: '#94A3B8' }}>
              The unified platform for quantum development, PQC migration, and enterprise workflow automation.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { icon: Shield, label: 'PQC Ready' },
                { icon: Zap, label: 'Live Simulation' },
                { icon: GitBranch, label: 'Workflow Automation' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-xl p-4 text-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Icon size={20} className="mx-auto mb-2" style={{ color: '#60A5FA' }} />
                  <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — Auth Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563EB, #60A5FA)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>QuantumOS</span>
          </div>

          <div className="rounded-2xl p-8" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            <AnimatePresence mode="wait">
              {step === 'landing' && (
                <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
                  <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Sign in to your quantum workspace</p>
                  <button onClick={() => setStep('email')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-3 font-medium text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <Mail size={18} style={{ color: 'var(--accent)' }} />
                    Continue with Email
                    <ArrowRight size={16} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
                    By continuing, you agree to our{' '}
                    <a href="#" className="underline hover:opacity-80">Terms</a> and{' '}
                    <a href="#" className="underline hover:opacity-80">Privacy Policy</a>
                  </p>
                </motion.div>
              )}

              {step === 'email' && (
                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setStep('landing')} className="flex items-center gap-1 text-sm mb-6 hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}>
                    <ChevronLeft size={16} /> Back
                  </button>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Enter your email</h2>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>We'll send you a secure login code</p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-xl text-sm mb-4 outline-none transition-all"
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    autoFocus
                  />
                  <button onClick={handleSendOtp} disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    style={{ background: 'var(--accent)' }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    {loading ? 'Sending…' : 'Send Code'}
                  </button>
                </motion.div>
              )}

              {step === 'otp' && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => setStep('email')} className="flex items-center gap-1 text-sm mb-6 hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}>
                    <ChevronLeft size={16} /> Back
                  </button>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Check your email</h2>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Enter the 6-digit code sent to<br />
                    <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{email}</span>
                  </p>
                  <div className="flex gap-2 mb-6" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="flex-1 h-12 text-center text-lg font-semibold rounded-xl outline-none transition-all"
                        style={{
                          background: 'var(--bg-primary)',
                          border: `1px solid ${digit ? 'var(--accent)' : 'var(--border)'}`,
                          color: 'var(--text-primary)',
                        }}
                      />
                    ))}
                  </div>
                  <button onClick={handleVerifyOtp} disabled={loading || otp.join('').length < 6}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    style={{ background: 'var(--accent)' }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                    {loading ? 'Verifying…' : 'Verify & Continue'}
                  </button>
                  <button onClick={handleSendOtp} disabled={loading}
                    className="w-full mt-3 py-2 text-sm transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text-muted)' }}>
                    Didn't receive it? Resend code
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function QuantumBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated circles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: 200 + i * 80,
            height: 200 + i * 80,
            left: '50%',
            top: '50%',
            x: '-50%',
            y: '-50%',
            borderColor: `rgba(96,165,250,${0.03 + i * 0.01})`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      {/* Blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-8 blur-3xl"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
      {/* Dots */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${10 + (i * 17) % 80}%`,
            top: `${10 + (i * 23) % 80}%`,
            background: 'rgba(96,165,250,0.4)',
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}
