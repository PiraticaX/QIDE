'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useTheme } from '@/components/ThemeProvider'
import { Settings, Sun, Moon, User, Key, Bell, Shield, Save, Loader2, Copy, RefreshCw } from 'lucide-react'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [apiKey] = useState('qp_live_' + Math.random().toString(36).slice(2, 18))
  const [notifs, setNotifs] = useState({ email: true, simComplete: true, workflowDone: false, pqcAlert: true })

  const saveProfile = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    updateUser({ display_name: displayName })
    setSaving(false)
    toast.success('Profile updated!')
  }

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey).then(() => toast.success('API key copied!'))
  }

  const inpCls = "w-full px-4 py-2.5 rounded-xl text-sm outline-none"
  const inpStyle = { background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="rounded-2xl p-6 mb-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-5" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <Icon size={16} style={{ color: 'var(--accent)' }} />
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      {children}
    </div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.1)' }}>
            <Settings size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your account and preferences</p>
          </div>
        </div>
      </motion.div>

      <Section title="Profile" icon={User}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
              style={{ background: 'var(--accent)' }}>
              {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{user?.email}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Member since today</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" className={inpCls} style={inpStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input value={user?.email || ''} disabled className={inpCls} style={{ ...inpStyle, opacity: 0.6 }} />
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--accent)' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </Section>

      <Section title="Appearance" icon={Sun}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Theme</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Choose your preferred interface theme</p>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
            {(['light', 'dark'] as const).map(t => (
              <button key={t} onClick={() => { if (theme !== t) toggleTheme() }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                style={{ background: theme === t ? 'var(--bg-secondary)' : 'transparent', color: theme === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: theme === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {t === 'light' ? <Sun size={12} /> : <Moon size={12} />} {t}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="API Keys" icon={Key}>
        <div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Use this key to access the Quantum Platform API programmatically.</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 rounded-xl font-mono text-xs" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              {apiKey.slice(0, 20)}••••••••••••
            </div>
            <button onClick={copyKey} className="p-2.5 rounded-xl transition-all hover:opacity-70" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              <Copy size={14} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button onClick={() => toast.success('New key generated!')} className="p-2.5 rounded-xl transition-all hover:opacity-70" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              <RefreshCw size={14} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>
      </Section>

      <Section title="Notifications" icon={Bell}>
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email notifications', desc: 'Receive updates via email' },
            { key: 'simComplete', label: 'Simulation complete', desc: 'When a simulation finishes' },
            { key: 'workflowDone', label: 'Workflow executed', desc: 'When a workflow run completes' },
            { key: 'pqcAlert', label: 'PQC risk alerts', desc: 'Critical security findings' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <button onClick={() => setNotifs(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className="relative w-11 h-6 rounded-full transition-all"
                style={{ background: notifs[key as keyof typeof notifs] ? 'var(--accent)' : 'var(--border)' }}>
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: notifs[key as keyof typeof notifs] ? '1.5rem' : '0.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
