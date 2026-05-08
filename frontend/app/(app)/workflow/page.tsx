'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { workflowsApi } from '@/lib/api'
import {
  GitBranch, Play, Plus, Save, Loader2, Database,
  Cpu, Shield, Bell, FileDown, ChevronRight, Check, X
} from 'lucide-react'

const NODE_TYPES = [
  { id: 'data_input', label: 'Data Input', icon: Database, color: '#2563EB', desc: 'CSV, JSON, API' },
  { id: 'ai_analysis', label: 'AI Analysis', icon: Cpu, color: '#7C3AED', desc: 'Process with AI' },
  { id: 'quantum_opt', label: 'Quantum Optimize', icon: GitBranch, color: '#0891B2', desc: 'QAOA optimizer' },
  { id: 'pqc_analysis', label: 'PQC Analysis', icon: Shield, color: '#DC2626', desc: 'Crypto scan' },
  { id: 'notification', label: 'Notification', icon: Bell, color: '#D97706', desc: 'Alert & notify' },
  { id: 'export', label: 'Export Report', icon: FileDown, color: '#059669', desc: 'PDF, JSON, CSV' },
]

interface WorkflowNode {
  id: string
  type: string
  label: string
  color: string
  x: number
  y: number
  status?: 'idle' | 'running' | 'done' | 'error'
}

const DEFAULT_NODES: WorkflowNode[] = [
  { id: 'n1', type: 'data_input', label: 'Data Input', color: '#2563EB', x: 60, y: 160, status: 'idle' },
  { id: 'n2', type: 'ai_analysis', label: 'AI Analysis', color: '#7C3AED', x: 260, y: 160, status: 'idle' },
  { id: 'n3', type: 'quantum_opt', label: 'Quantum Optimize', color: '#0891B2', x: 460, y: 160, status: 'idle' },
  { id: 'n4', type: 'export', label: 'Export Report', color: '#059669', x: 660, y: 160, status: 'idle' },
]

const DEFAULT_EDGES = [
  { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' },
]

export default function WorkflowPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(DEFAULT_NODES)
  const [edges] = useState(DEFAULT_EDGES)
  const [workflowName, setWorkflowName] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [runLoading, setRunLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [executionDone, setExecutionDone] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [dragType, setDragType] = useState<string | null>(null)

  const addNode = (type: string) => {
    const nt = NODE_TYPES.find(n => n.id === type)!
    const newNode: WorkflowNode = {
      id: `n${Date.now()}`,
      type,
      label: nt.label,
      color: nt.color,
      x: 80 + Math.random() * 300,
      y: 80 + Math.random() * 200,
      status: 'idle',
    }
    setNodes(prev => [...prev, newNode])
  }

  const removeNode = (id: string) => setNodes(prev => prev.filter(n => n.id !== id))

  const saveWorkflow = async () => {
    setSaveLoading(true)
    try {
      const res = await workflowsApi.create({
        name: workflowName || `Workflow ${new Date().toLocaleDateString()}`,
        nodes: nodes.map(n => ({ id: n.id, data: { label: n.label, type: n.type } })),
        edges,
      })
      setSavedId(res.data.id)
      toast.success('Workflow saved!')
    } catch (err: any) {
      toast.error(err.message || 'Save failed')
    }
    setSaveLoading(false)
  }

  const runWorkflow = async () => {
    setRunLoading(true)
    setLogs([])
    setExecutionDone(false)
    const newLogs: string[] = []

    const addLog = (msg: string) => {
      newLogs.push(msg)
      setLogs([...newLogs])
    }

    try {
      // If saved, run on backend; otherwise simulate locally
      if (savedId) {
        const res = await workflowsApi.run(savedId)
        res.data.logs?.forEach((l: any) => addLog(`[${l.ts?.slice(11, 19) || '--'}] ${l.msg}`))
      } else {
        // Simulate locally
        for (let i = 0; i < nodes.length; i++) {
          setNodes(prev => prev.map(n => n.id === nodes[i].id ? { ...n, status: 'running' } : n))
          addLog(`[${new Date().toLocaleTimeString()}] Executing: ${nodes[i].label}…`)
          await new Promise(r => setTimeout(r, 800))
          setNodes(prev => prev.map(n => n.id === nodes[i].id ? { ...n, status: 'done' } : n))
          addLog(`[${new Date().toLocaleTimeString()}] ✓ ${nodes[i].label} completed`)
        }
      }
      addLog(`[${new Date().toLocaleTimeString()}] ✅ Workflow execution complete`)
      setExecutionDone(true)
      toast.success('Workflow executed!')
    } catch (err: any) {
      addLog(`[${new Date().toLocaleTimeString()}] ❌ Error: ${err.message}`)
      toast.error(err.message || 'Execution failed')
    }
    setRunLoading(false)
  }

  const resetWorkflow = () => {
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })))
    setLogs([])
    setExecutionDone(false)
  }

  // Node position on SVG canvas for edge drawing
  const getNodeCenter = (id: string) => {
    const n = nodes.find(n => n.id === id)
    return n ? { x: n.x + 80, y: n.y + 32 } : { x: 0, y: 0 }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 shrink-0"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <GitBranch size={16} style={{ color: '#7C3AED' }} />
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Workflow Builder</span>
        <div className="h-4 w-px" style={{ background: 'var(--border)' }} />
        <input value={workflowName} onChange={e => setWorkflowName(e.target.value)}
          placeholder="Workflow name…"
          className="px-3 py-1.5 rounded-xl text-xs outline-none w-40"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        <div className="ml-auto flex items-center gap-2">
          <button onClick={resetWorkflow} disabled={runLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Reset
          </button>
          <button onClick={saveWorkflow} disabled={saveLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            {saveLoading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
          </button>
          <button onClick={runWorkflow} disabled={runLoading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#7C3AED' }}>
            {runLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            {runLoading ? 'Running…' : 'Execute Workflow'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Node palette */}
        <div className="w-48 shrink-0 overflow-y-auto py-3 px-2"
          style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Node Types</p>
          {NODE_TYPES.map(nt => {
            const Icon = nt.icon
            return (
              <div key={nt.id}
                draggable
                onDragStart={() => setDragType(nt.id)}
                onDragEnd={() => { if (dragType) { addNode(nt.id); setDragType(null) } }}
                onClick={() => addNode(nt.id)}
                className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl mb-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: `${nt.color}10`, border: `1px solid ${nt.color}25` }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: nt.color }}>
                  <Icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{nt.label}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{nt.desc}</p>
                </div>
              </div>
            )
          })}
          <p className="px-2 pt-1 text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
            Click or drag to add nodes to canvas
          </p>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--border)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {edges.map((e, i) => {
              const from = getNodeCenter(e.from)
              const to = getNodeCenter(e.to)
              const mx = (from.x + to.x) / 2
              return (
                <g key={i}>
                  <path
                    d={`M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`}
                    fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="6 3"
                  />
                  <circle cx={to.x} cy={to.y} r="3" fill="var(--accent)" />
                </g>
              )
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const nt = NODE_TYPES.find(n => n.id === node.type)
            const Icon = nt?.icon || GitBranch
            const statusIcon = node.status === 'done' ? <Check size={10} style={{ color: '#22C55E' }} /> :
                               node.status === 'running' ? <Loader2 size={10} className="animate-spin" style={{ color: node.color }} /> :
                               node.status === 'error' ? <X size={10} style={{ color: '#EF4444' }} /> : null
            return (
              <motion.div
                key={node.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute rounded-2xl px-4 py-3 cursor-move select-none group"
                style={{
                  left: node.x, top: node.y,
                  width: 160,
                  background: 'var(--bg-secondary)',
                  border: `2px solid ${node.status === 'running' ? node.color : node.status === 'done' ? '#22C55E' : 'var(--border)'}`,
                  boxShadow: node.status === 'running' ? `0 0 16px ${node.color}40` : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: node.color }}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{node.label}</span>
                  {statusIcon && <div className="ml-auto">{statusIcon}</div>}
                </div>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{nt?.desc}</p>
                <button
                  onClick={() => removeNode(node.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ fontSize: '10px' }}>×</button>
              </motion.div>
            )
          })}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <GitBranch size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Empty canvas</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Click node types on the left to add them</p>
              </div>
            </div>
          )}
        </div>

        {/* Logs panel */}
        <div className="w-72 shrink-0 flex flex-col"
          style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: runLoading ? '#22C55E' : 'var(--border)' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Execution Logs
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono" style={{ fontSize: '11px' }}>
            {logs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No logs yet. Run workflow to see execution output.</p>
            ) : (
              logs.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                  className="mb-1 leading-relaxed"
                  style={{ color: log.includes('✅') || log.includes('✓') ? '#22C55E' : log.includes('❌') ? '#EF4444' : 'var(--text-secondary)' }}>
                  {log}
                </motion.div>
              ))
            )}
            {executionDone && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-3 p-2 rounded-xl text-center"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                Workflow completed successfully
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
