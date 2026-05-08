'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { circuitsApi, workflowsApi, healthApi } from '@/lib/api'
import {
  Code2, GitBranch, Shield, Cpu, ArrowRight, TrendingUp,
  Activity, Zap, Plus, Clock, CheckCircle2
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

const mockActivity = [
  { time: '00:00', simulations: 4 }, { time: '04:00', simulations: 8 },
  { time: '08:00', simulations: 15 }, { time: '12:00', simulations: 23 },
  { time: '16:00', simulations: 18 }, { time: '20:00', simulations: 11 },
  { time: '24:00', simulations: 7 },
]

const QUICK_ACTIONS = [
  { icon: Code2, label: 'New Circuit', desc: 'Open Quantum IDE', href: '/ide', color: '#2563EB' },
  { icon: GitBranch, label: 'New Workflow', desc: 'Build automation', href: '/workflow', color: '#7C3AED' },
  { icon: Shield, label: 'PQC Scan', desc: 'Assess crypto risk', href: '/pqc', color: '#0891B2' },
  { icon: Cpu, label: 'Optimize', desc: 'Run optimization', href: '/optimize', color: '#059669' },
]

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [circuits, setCircuits] = useState<any[]>([])
  const [workflows, setWorkflows] = useState<any[]>([])
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [c, w, h] = await Promise.allSettled([
          circuitsApi.list(), workflowsApi.list(), healthApi.check()
        ])
        if (c.status === 'fulfilled') setCircuits(c.value.data)
        if (w.status === 'fulfilled') setWorkflows(w.value.data)
        if (h.status === 'fulfilled') setStatus(h.value.data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          {greeting}, {user?.display_name || user?.email?.split('@')[0] || 'there'} 👋
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your quantum infrastructure overview
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {QUICK_ACTIONS.map(({ icon: Icon, label, desc, href, color }, i) => (
          <motion.button
            key={href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => router.push(href)}
            className="rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${color}15` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Circuits', value: loading ? '—' : circuits.length, icon: Code2, trend: '+2 today', color: '#2563EB' },
          { label: 'Workflows', value: loading ? '—' : workflows.length, icon: GitBranch, trend: 'Active', color: '#7C3AED' },
          { label: 'Simulations', value: '24', icon: Activity, trend: 'This week', color: '#0891B2' },
          { label: 'PQC Scans', value: '3', icon: Shield, trend: '1 critical', color: '#DC2626' },
        ].map(({ label, value, icon: Icon, trend, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.06 }}>
            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={14} style={{ color }} />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{trend}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts + Recent */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Activity chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Simulation Activity</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Last 24 hours</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                <TrendingUp size={12} />
                <span>+18%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={mockActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-muted)' }}
                />
                <Area type="monotone" dataKey="simulations" stroke="#2563EB" strokeWidth={2} fill="url(#simGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Recent circuits */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <Card className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Circuits</h3>
              <button className="text-xs px-2 py-1 rounded-lg hover:opacity-70 transition-opacity"
                onClick={() => router.push('/ide')}
                style={{ color: 'var(--accent)' }}>
                View all
              </button>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : circuits.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                  <Code2 size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No circuits yet</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Build your first quantum circuit</p>
                <button onClick={() => router.push('/ide')}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium text-white"
                  style={{ background: 'var(--accent)' }}>
                  <Plus size={12} /> New Circuit
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {circuits.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:opacity-80 cursor-pointer transition-all"
                    style={{ background: 'var(--bg-primary)' }}
                    onClick={() => router.push(`/ide?circuit=${c.id}`)}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(37,99,235,0.1)' }}>
                      <Code2 size={13} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.num_qubits} qubits</p>
                    </div>
                    <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* System status */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4">
        <Card>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>System Status</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'API Gateway', status: 'operational' },
              { label: 'Simulation Engine', status: 'operational' },
              { label: 'Workflow Engine', status: 'operational' },
              { label: 'Auth Service', status: 'operational' },
            ].map(({ label, status: s }) => (
              <div key={label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ background: 'var(--bg-primary)' }}>
                <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-xs capitalize" style={{ color: '#22C55E' }}>{s}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
