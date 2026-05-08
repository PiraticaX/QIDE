'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { pqcApi } from '@/lib/api'
import {
  Shield, AlertTriangle, CheckCircle2, Upload, Loader2,
  TrendingDown, Lock, ChevronRight, FileText
} from 'lucide-react'

const RISK_COLOR = (score: number) =>
  score >= 70 ? '#EF4444' : score >= 40 ? '#F59E0B' : '#22C55E'

const SAMPLE_CONFIG = `# Sample TLS/SSL Configuration
TLSProtocol TLSv1.0 TLSv1.1 TLSv1.2
SSLCipherSuite RSA:ECDSA:AES256-SHA
Certificate: /etc/ssl/server.crt
PrivateKey: /etc/ssl/server.key (RSA 2048-bit)
SignatureAlgorithm: sha256WithRSAEncryption
KeyExchange: ECDHE-RSA-AES256-GCM-SHA384`

export default function PQCPage() {
  const [scanName, setScanName] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runScan = async () => {
    if (!content.trim()) {
      toast.error('Paste configuration text to scan')
      return
    }
    setLoading(true)
    try {
      const res = await pqcApi.scan({
        name: scanName || `Scan ${new Date().toLocaleDateString()}`,
        scan_type: 'config',
        content,
      })
      setResults(res.data)
      toast.success('Scan complete!')
    } catch (err: any) {
      toast.error(err.message || 'Scan failed')
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(8,145,178,0.1)' }}>
            <Shield size={18} style={{ color: '#0891B2' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>PQC Migration Suite</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Post-quantum cryptography risk assessment & migration planning
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText size={16} style={{ color: 'var(--accent)' }} />
              Configuration Scanner
            </h2>

            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Scan Name
              </label>
              <input value={scanName} onChange={e => setScanName(e.target.value)}
                placeholder="e.g., Production TLS Config"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Configuration / Certificate / Architecture Text
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Paste your TLS config, certificate info, or architecture description..."
                rows={10}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none font-mono"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  lineHeight: '1.6',
                  fontSize: '12px',
                }}
              />
            </div>

            <button onClick={() => setContent(SAMPLE_CONFIG)}
              className="text-xs mb-4 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--accent)' }}>
              Load sample config ↗
            </button>

            <button onClick={runScan} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: '#0891B2' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {loading ? 'Scanning…' : 'Run Quantum Risk Scan'}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          {!results && !loading ? (
            <div className="rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', minHeight: '400px' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(8,145,178,0.08)' }}>
                <Lock size={24} style={{ color: '#0891B2' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Awaiting scan</h3>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Paste your configuration and run a scan to get your quantum readiness score and migration roadmap.
              </p>
            </div>
          ) : loading ? (
            <div className="rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', minHeight: '400px' }}>
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: '#0891B2' }} />
                <Shield size={20} className="absolute inset-0 m-auto" style={{ color: '#0891B2' }} />
              </div>
              <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Analyzing cryptographic stack…</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Checking for quantum vulnerabilities</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Risk Score */}
              <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Quantum Risk Score
                </p>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-5xl font-bold" style={{ color: RISK_COLOR(results.risk_score) }}>
                    {Math.round(results.risk_score)}
                  </span>
                  <span className="text-lg mb-1" style={{ color: 'var(--text-muted)' }}>/100</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${results.risk_score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: RISK_COLOR(results.risk_score) }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  {results.risk_score >= 70 ? '🔴 Critical — immediate action required' :
                   results.risk_score >= 40 ? '🟡 Elevated — migration planning needed' :
                   '🟢 Low — maintaining good posture'}
                </p>
              </div>

              {/* Findings */}
              {results.findings?.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <AlertTriangle size={14} style={{ color: '#F59E0B' }} /> Vulnerabilities Found
                  </h3>
                  <div className="space-y-2">
                    {results.findings.map((f: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{
                          background: f.severity === 'critical' ? '#EF4444' : '#F59E0B'
                        }} />
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{f.type}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
                        </div>
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                          style={{
                            background: f.severity === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                            color: f.severity === 'critical' ? '#EF4444' : '#F59E0B',
                          }}>
                          {f.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {results.recommendations?.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={14} style={{ color: '#22C55E' }} /> Recommended Algorithms
                  </h3>
                  <div className="space-y-2">
                    {results.recommendations.map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{r.algorithm}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.type} · {r.nist_status}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                            {r.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
