'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { HelpCircle, MessageSquare, Bug, BookOpen, Loader2, CheckCircle2, ExternalLink } from 'lucide-react'

export default function HelpPage() {
  const [tab, setTab] = useState<'support'|'bug'|'docs'>('support')
  const [form, setForm] = useState({ name:'', org:'', email:'', category:'general', message:'' })
  const [bug, setBug] = useState({ title:'', desc:'', severity:'medium', logs:'' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submitSupport = async () => {
    if (!form.email || !form.message) { toast.error('Fill required fields'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitted(true); setLoading(false); toast.success('Ticket submitted!')
  }

  const submitBug = async () => {
    if (!bug.title || !bug.desc) { toast.error('Fill required fields'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitted(true); setLoading(false); toast.success('Bug report submitted!')
  }

  const inpCls = "w-full px-4 py-2.5 rounded-xl text-sm outline-none"
  const inpStyle = { background:'var(--bg-primary)', border:'1px solid var(--border)', color:'var(--text-primary)' }

  const TABS = [
    { id:'support', icon:MessageSquare, label:'Contact Support' },
    { id:'bug', icon:Bug, label:'Report Bug' },
    { id:'docs', icon:BookOpen, label:'Documentation' },
  ]

  const DOCS = [
    {title:'Getting Started',desc:'Platform overview and first steps',icon:'🚀'},
    {title:'Quantum IDE Guide',desc:'Building and simulating circuits',icon:'⚛️'},
    {title:'PQC Migration',desc:'Post-quantum cryptography guide',icon:'🔐'},
    {title:'Workflow Automation',desc:'Building enterprise workflows',icon:'🔄'},
    {title:'API Reference',desc:'REST API documentation',icon:'📡'},
    {title:'Optimization Engine',desc:'QAOA and quantum optimization',icon:'⚡'},
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'rgba(37,99,235,0.1)'}}>
            <HelpCircle size={18} style={{color:'var(--accent)'}} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{color:'var(--text-primary)'}}>Help & Support</h1>
            <p className="text-sm" style={{color:'var(--text-secondary)'}}>Get help, report bugs, or browse documentation</p>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-2 mb-6">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => { setTab(id as any); setSubmitted(false) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: tab===id ? 'var(--accent)' : 'var(--bg-secondary)',
              color: tab===id ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border)'
            }}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={{background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
        {submitted ? (
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="flex flex-col items-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{background:'rgba(34,197,94,0.1)'}}>
              <CheckCircle2 size={28} style={{color:'#22C55E'}} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{color:'var(--text-primary)'}}>Submitted!</h2>
            <p className="text-sm mb-2" style={{color:'var(--text-secondary)'}}>Your ticket ID: <strong>QP-{Math.floor(Math.random()*90000+10000)}</strong></p>
            <p className="text-sm mb-6" style={{color:'var(--text-muted)'}}>We will respond within 24 hours at your email.</p>
            <button onClick={() => setSubmitted(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{background:'var(--accent)'}}>Submit Another</button>
          </motion.div>
        ) : tab === 'support' ? (
          <div className="space-y-4 max-w-xl">
            <h2 className="font-semibold" style={{color:'var(--text-primary)'}}>Contact Support</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>Name</label>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" className={inpCls} style={inpStyle}/>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>Organization</label>
                <input value={form.org} onChange={e=>setForm({...form,org:e.target.value})} placeholder="Company" className={inpCls} style={inpStyle}/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>Email *</label>
              <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@company.com" type="email" className={inpCls} style={inpStyle}/>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>Category</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className={inpCls} style={inpStyle}>
                {['general','billing','technical','security','feature'].map(c=>(
                  <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>Message *</label>
              <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={5} placeholder="Describe your issue..." className={inpCls+" resize-none"} style={inpStyle}/>
            </div>
            <button onClick={submitSupport} disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{background:'var(--accent)'}}>
              {loading ? <Loader2 size={16} className="animate-spin"/> : <MessageSquare size={16}/>}
              {loading ? 'Submitting…' : 'Send Message'}
            </button>
          </div>
        ) : tab === 'bug' ? (
          <div className="space-y-4 max-w-xl">
            <h2 className="font-semibold" style={{color:'var(--text-primary)'}}>Report a Bug</h2>
            <div>
              <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>Title *</label>
              <input value={bug.title} onChange={e=>setBug({...bug,title:e.target.value})} placeholder="Brief description of the issue" className={inpCls} style={inpStyle}/>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>Severity</label>
              <div className="flex gap-2">
                {['low','medium','high','critical'].map(s => {
                  const colors: Record<string,string> = {low:'#22C55E',medium:'#F59E0B',high:'#EF4444',critical:'#7C3AED'}
                  return (
                    <button key={s} onClick={()=>setBug({...bug,severity:s})}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all"
                      style={{
                        background: bug.severity===s ? colors[s] : 'var(--bg-primary)',
                        color: bug.severity===s ? 'white' : 'var(--text-secondary)',
                        border: '1px solid var(--border)'
                      }}>
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>Description *</label>
              <textarea value={bug.desc} onChange={e=>setBug({...bug,desc:e.target.value})} rows={4} placeholder="Steps to reproduce..." className={inpCls+" resize-none"} style={inpStyle}/>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>Console Logs (optional)</label>
              <textarea value={bug.logs} onChange={e=>setBug({...bug,logs:e.target.value})} rows={3} placeholder="Paste any error logs..." className={inpCls+" resize-none font-mono"} style={{...inpStyle,fontSize:'12px'}}/>
            </div>
            <button onClick={submitBug} disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{background:'#DC2626'}}>
              {loading ? <Loader2 size={16} className="animate-spin"/> : <Bug size={16}/>}
              {loading ? 'Submitting…' : 'Report Bug'}
            </button>
          </div>
        ) : (
          <div>
            <h2 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>Documentation</h2>
            <div className="grid grid-cols-2 gap-3">
              {DOCS.map(doc => (
                <div key={doc.title}
                  className="flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                  style={{background:'var(--bg-primary)',border:'1px solid var(--border)'}}>
                  <span className="text-2xl">{doc.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{doc.title}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>{doc.desc}</p>
                  </div>
                  <ExternalLink size={14} style={{color:'var(--text-muted)'}}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
