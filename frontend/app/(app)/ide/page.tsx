'use client'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { circuitsApi, simulateApi } from '@/lib/api'
import {
  Play, Save, Plus, Trash2, RotateCcw, Code2, Eye,
  Cpu, ChevronDown, Loader2, BarChart2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

const GATES = [
  { id: 'h', label: 'H', desc: 'Hadamard', color: '#2563EB' },
  { id: 'x', label: 'X', desc: 'Pauli-X (NOT)', color: '#7C3AED' },
  { id: 'y', label: 'Y', desc: 'Pauli-Y', color: '#0891B2' },
  { id: 'z', label: 'Z', desc: 'Pauli-Z', color: '#059669' },
  { id: 'cnot', label: '⊕', desc: 'CNOT', color: '#DC2626' },
  { id: 'rx', label: 'Rx', desc: 'Rotation X', color: '#D97706' },
  { id: 'ry', label: 'Ry', desc: 'Rotation Y', color: '#7C3AED' },
  { id: 'rz', label: 'Rz', desc: 'Rotation Z', color: '#0891B2' },
  { id: 'swap', label: '×', desc: 'SWAP', color: '#DC2626' },
  { id: 'measure', label: 'M', desc: 'Measure', color: '#64748B' },
]

const DEFAULT_CODE = `# Quantum Bell State Circuit
from qiskit import QuantumCircuit

# Create a 2-qubit circuit
qc = QuantumCircuit(2, 2)

# Apply Hadamard gate to qubit 0
qc.h(0)

# Apply CNOT gate
qc.cx(0, 1)

# Measure both qubits
qc.measure([0, 1], [0, 1])

print(qc.draw())
`

interface Gate {
  id: string
  type: string
  qubit: number
  column: number
  params?: Record<string, number>
}

export default function IDEPage() {
  const [numQubits, setNumQubits] = useState(2)
  const [gates, setGates] = useState<Gate[]>([
    { id: '1', type: 'h', qubit: 0, column: 0 },
    { id: '2', type: 'cnot', qubit: 0, column: 1, params: { target: 1 } },
    { id: '3', type: 'measure', qubit: 0, column: 2 },
    { id: '4', type: 'measure', qubit: 1, column: 2 },
  ])
  const [activeTab, setActiveTab] = useState<'circuit' | 'code'>('circuit')
  const [code, setCode] = useState(DEFAULT_CODE)
  const [dragGate, setDragGate] = useState<string | null>(null)
  const [simResults, setSimResults] = useState<any>(null)
  const [simLoading, setSimLoading] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)

  const columns = Math.max(4, Math.max(...gates.map(g => g.column), 0) + 2)

  const handleDropOnCell = (qubit: number, column: number) => {
    if (!dragGate) return
    const newGate: Gate = {
      id: Date.now().toString(),
      type: dragGate,
      qubit,
      column,
      params: dragGate === 'cnot' ? { target: qubit === 0 ? 1 : 0 } : {},
    }
    setGates(prev => [...prev, newGate])
    setDragGate(null)
  }

  const removeGate = (id: string) => setGates(prev => prev.filter(g => g.id !== id))
  const clearCircuit = () => setGates([])

  const runSimulation = async () => {
    setSimLoading(true)
    try {
      const res = await simulateApi.run({
        circuit_data: { gates, num_qubits: numQubits },
        shots: 1024,
      })
      setSimResults(res.data.results)
      toast.success('Simulation complete!')
    } catch (err: any) {
      toast.error(err.message || 'Simulation failed')
    }
    setSimLoading(false)
  }

  const saveCircuit = async () => {
    const name = saveName || `Circuit ${new Date().toLocaleDateString()}`
    setSaveLoading(true)
    try {
      await circuitsApi.create({
        name,
        circuit_data: { gates, num_qubits: numQubits },
        code,
        num_qubits: numQubits,
      })
      toast.success('Circuit saved!')
    } catch (err: any) {
      toast.error(err.message || 'Save failed')
    }
    setSaveLoading(false)
  }

  const chartData = simResults?.probabilities
    ? Object.entries(simResults.probabilities).map(([state, prob]: [string, any]) => ({
        state, probability: Math.round(prob * 100), count: simResults.counts[state],
      }))
    : []

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* IDE Header */}
      <div className="px-4 py-3 flex items-center gap-3 shrink-0"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Code2 size={16} style={{ color: 'var(--accent)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Quantum IDE</span>
        </div>
        <div className="h-4 w-px" style={{ background: 'var(--border)' }} />
        {/* Qubit selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Qubits:</span>
          {[2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setNumQubits(n)}
              className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
              style={{
                background: numQubits === n ? 'var(--accent)' : 'var(--bg-primary)',
                color: numQubits === n ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}>
              {n}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input value={saveName} onChange={e => setSaveName(e.target.value)}
            placeholder="Circuit name…"
            className="px-3 py-1.5 rounded-xl text-xs outline-none w-36"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          <button onClick={saveCircuit} disabled={saveLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            {saveLoading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
          </button>
          <button onClick={clearCircuit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <RotateCcw size={12} /> Clear
          </button>
          <button onClick={runSimulation} disabled={simLoading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#22C55E' }}>
            {simLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            {simLoading ? 'Running…' : 'Run Simulation'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Gate Library */}
        <div className="w-44 shrink-0 overflow-y-auto py-3 px-2"
          style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Gates</p>
          {GATES.map(gate => (
            <div
              key={gate.id}
              draggable
              onDragStart={() => setDragGate(gate.id)}
              onDragEnd={() => setDragGate(null)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-1 cursor-grab active:cursor-grabbing transition-all hover:opacity-80"
              style={{ background: `${gate.color}10`, border: `1px solid ${gate.color}25` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: gate.color }}>
                {gate.label}
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{gate.id.toUpperCase()}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{gate.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center px-4 pt-3 gap-1 shrink-0">
            {(['circuit', 'code'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize"
                style={{
                  background: activeTab === tab ? 'var(--bg-secondary)' : 'transparent',
                  color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: activeTab === tab ? '1px solid var(--border)' : '1px solid transparent',
                }}>
                {tab === 'circuit' ? <Eye size={14} /> : <Code2 size={14} />}
                {tab === 'circuit' ? 'Circuit Builder' : 'Code Editor'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'circuit' && (
              <div className="rounded-2xl overflow-auto"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="p-4 min-w-max">
                  {Array.from({ length: numQubits }, (_, q) => (
                    <div key={q} className="flex items-center mb-4 last:mb-0">
                      <div className="w-16 shrink-0 flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>|q{q}⟩</span>
                      </div>
                      {/* Wire */}
                      <div className="flex items-center relative">
                        <div className="absolute inset-y-1/2 left-0 right-0 h-px" style={{ background: 'var(--border)' }} />
                        {Array.from({ length: columns }, (_, col) => {
                          const gate = gates.find(g => g.qubit === q && g.column === col)
                          const gateInfo = gate ? GATES.find(g => g.id === gate.type) : null
                          return (
                            <div
                              key={col}
                              className="relative w-14 h-14 flex items-center justify-center"
                              onDragOver={e => { e.preventDefault() }}
                              onDrop={() => handleDropOnCell(q, col)}
                            >
                              {gate && gateInfo ? (
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white cursor-pointer group"
                                  style={{ background: gateInfo.color, boxShadow: `0 2px 8px ${gateInfo.color}40` }}
                                  title={`${gateInfo.desc} — click to remove`}
                                  onClick={() => removeGate(gate.id)}
                                >
                                  {gateInfo.label}
                                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ fontSize: '9px' }}>×</div>
                                </motion.div>
                              ) : (
                                <div className="w-10 h-10 rounded-xl border-2 border-dashed opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                                  style={{ borderColor: 'var(--border)' }}>
                                  <Plus size={12} style={{ color: 'var(--text-muted)' }} />
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-3">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Drag gates from the library onto the circuit wire · Click a gate to remove it
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="rounded-2xl overflow-hidden h-full"
                style={{ background: '#0B1120', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-3 h-3 rounded-full bg-red-500 opacity-60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-60" />
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-60" />
                  <span className="text-xs ml-2" style={{ color: '#64748B' }}>circuit.py — Qiskit</span>
                </div>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full p-4 resize-none outline-none code-editor"
                  style={{
                    background: 'transparent',
                    color: '#E2E8F0',
                    minHeight: '400px',
                    lineHeight: '1.7',
                    fontSize: '13px',
                    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Results panel */}
        <div className="w-72 shrink-0 overflow-y-auto"
          style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Results</span>
            </div>

            {simLoading ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center animate-pulse"
                  style={{ background: 'rgba(37,99,235,0.1)' }}>
                  <Cpu size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Running simulation…</p>
              </div>
            ) : simResults ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Backend</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{simResults.backend}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Shots</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{simResults.shots?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Measurement Distribution</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                      <XAxis dataKey="state" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                        formatter={(val: any) => [`${val}%`, 'Probability']}
                      />
                      <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={['#2563EB', '#7C3AED', '#0891B2', '#059669'][i % 4]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Counts</p>
                  <div className="space-y-1.5">
                    {Object.entries(simResults.counts || {}).map(([state, count]: [string, any]) => (
                      <div key={state} className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background: 'var(--bg-primary)' }}>
                        <span className="text-xs font-mono font-semibold" style={{ color: 'var(--accent)' }}>|{state}⟩</span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {simResults.note && (
                  <p className="text-xs p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706' }}>
                    ⚠️ {simResults.note}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                  style={{ background: 'var(--bg-primary)' }}>
                  <Play size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No results yet</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Build a circuit and run simulation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
