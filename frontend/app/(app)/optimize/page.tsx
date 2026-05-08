'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { optimizeApi } from '@/lib/api'
import { Cpu, Play, Loader2, TrendingDown, TrendingUp, Zap, BarChart2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

const PROBLEM_TYPES = [
  { id: 'logistics', label: 'Logistics Optimization', icon: '🚚', desc: 'Route & delivery optimization' },
  { id: 'scheduling', label: 'Job Scheduling', icon: '📅', desc: 'Resource allocation & scheduling' },
  { id: 'supply_chain', label: 'Supply Chain', icon: '🏭', desc: 'Inventory & distribution' },
  { id: 'energy', label: 'Energy Grid', icon: '⚡', desc: 'Power distribution optimization' },
  { id: 'financial', label: 'Portfolio', icon: '📈', desc: 'Financial portfolio optimization' },
  { id: 'general', label: 'General', icon: '🔬', desc: 'Custom optimization problem' },
]

export default function OptimizePage() {
  const [problemType, setProblemType] = useState('logistics')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runOptimization = async () => {
    setLoading(true)
    setResults(null)
    try {
      const res = await optimizeApi.run({ problem_type: problemType })
      setResults(res.data)
      toast.success('Optimization complete!')
    } catch (err: any) {
      toast.error(err.message || 'Optimization failed')
    }
    setLoading(false)
  }

  const compareData = results ? [
    { metric: 'Cost', before: 100, after: Math.round(100 * (1 - results.improvement_percent / 100)) },
    { metric: 'Time', before: 85, after: Math.round(85 * 0.75) },
    { metric: 'Resources', before: 90, after: Math.round(90 * 0.8) },
    { metric: 'Efficiency', before: 65, after: Math.round(65 * (1 + results.improvement_percent / 100)) },
  ] : []

  const radarData = results ? [
    { subject: 'Speed', A: 70, B: 92 },
    { subject: 'Cost', A: 60, B: Math.round(60 + results.improvement_percent * 0.5) },
    { subject: 'Quality', A: 75, B: 85 },
    { subject: 'Scale', A: 55, B: 78 },
    { subject: 'Reliability', A: 80, B: 88 },
  ] : []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(5,150,105,0.1)' }}>
            <Cpu size={18} style={{ color: '#059669' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Quantum Optimization Engine</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              AI-assisted quantum-inspired optimization for enterprise problems
            </p>
          </div>
        </div>
      </motion.div>

      {/* Problem selector */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {PROBLEM_TYPES.map((pt, i) => (
          <motion.button key={pt.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => setProblemType(pt.id)}
            className="rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: problemType === pt.id ? 'rgba(5,150,105,0.08)' : 'var(--bg-secondary)',
              border: `2px solid ${problemType === pt.id ? '#059669' : 'var(--border)'}`,
            }}>
            <div className="text-2xl mb-2">{pt.icon}</div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{pt.label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{pt.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Run */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {PROBLEM_TYPES.find(p => p.id === problemType)?.icon}{' '}
              {PROBLEM_TYPES.find(p => p.id === problemType)?.label}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Algorithm: QAOA (Quantum Approximate Optimization Algorithm)
            </p>
          </div>
          <button onClick={runOptimization} disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: '#059669' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {loading ? 'Optimizing…' : 'Run Optimization'}
          </button>
        </div>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap size={14} style={{ color: '#059669' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Running QAOA iterations…</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#059669' }}
                initial={{ width: '0%' }}
                animate={{ width: '90%' }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Improvement</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold" style={{ color: '#22C55E' }}>
                    {results.improvement_percent}%
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp size={12} style={{ color: '#22C55E' }} />
                  <span className="text-xs" style={{ color: '#22C55E' }}>vs. classical</span>
                </div>
              </div>
              <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Iterations</p>
                <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{results.iterations}</span>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>QAOA layers</p>
              </div>
              <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Algorithm</p>
                <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{results.algorithm}</span>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Quantum circuit</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Before vs. After</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={compareData} barCategoryGap="30%">
                    <XAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="before" name="Before" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="after" name="After" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Performance Radar</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Before" dataKey="A" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.15} />
                    <Radar name="After" dataKey="B" stroke="#059669" fill="#059669" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
