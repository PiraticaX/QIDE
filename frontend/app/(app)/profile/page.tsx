'use client'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { User, Mail, Calendar, Shield, LogOut, Settings } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.replace('/auth')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your account information</p>
      </motion.div>

      <div className="rounded-2xl p-6 mb-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), #7C3AED)' }}>
            {user?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {user?.display_name || 'Quantum User'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            {user?.is_admin && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--accent)' }}>
                <Shield size={10} /> Admin
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {[
            { icon: User, label: 'Display Name', value: user?.display_name || 'Not set' },
            { icon: Mail, label: 'Email', value: user?.email || '' },
            { icon: Calendar, label: 'Member Since', value: 'Today' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <Icon size={15} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs font-medium w-28" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => router.push('/settings')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          <Settings size={15} /> Edit Settings
        </button>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  )
}
