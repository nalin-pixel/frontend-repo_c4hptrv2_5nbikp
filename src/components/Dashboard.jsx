import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const socialPalette = {
  instagram: '#E1306C', facebook: '#0866FF', youtube: '#FF0000', tiktok: '#000000', x: '#111111',
  linkedin: '#0A66C2', pinterest: '#E60023', reddit: '#FF4500', twitch: '#6441a5', discord: '#5865F2',
}

export default function Dashboard() {
  const [me, setMe] = useState(null)
  const [platforms, setPlatforms] = useState([])
  const [accounts, setAccounts] = useState([])
  const [stats, setStats] = useState({ plan: 'free', used: 0, limit: 4 })
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [mediaType, setMediaType] = useState('image')
  const [selected, setSelected] = useState([])

  const headers = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }), [])

  const fetchAll = async () => {
    const [pRes, aRes, sRes, meRes] = await Promise.all([
      axios.get(`${API_BASE}/platforms`),
      axios.get(`${API_BASE}/accounts`, { headers }),
      axios.get(`${API_BASE}/uploads/stats`, { headers }),
      axios.get(`${API_BASE}/me`, { headers }),
    ])
    setPlatforms(pRes.data.platforms)
    setAccounts(aRes.data.accounts)
    setStats(sRes.data)
    setMe(meRes.data)
  }

  useEffect(() => { fetchAll().catch(console.error) }, [])

  const toggleSel = (k) => {
    setSelected((prev) => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  }

  const linkQuick = async (pf) => {
    await axios.post(`${API_BASE}/accounts`, { platform: pf.key, username: `${pf.key}_demo` }, { headers })
    fetchAll()
  }

  const startUpload = async () => {
    setUploading(true)
    try {
      await axios.post(`${API_BASE}/upload`, { media_type: mediaType, caption, platforms: selected }, { headers })
      setCaption('')
      setSelected([])
      await fetchAll()
      alert('Queued successfully')
    } catch (e) {
      alert(e.response?.data?.detail || 'Error')
    } finally {
      setUploading(false)
    }
  }

  const redirect = (pf) => {
    window.open(pf.url, '_blank')
  }

  if (!me) return <div className="text-white/80">Loading...</div>

  return (
    <section id="dashboard" className="py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-white">Welcome, {me.name}</h2>
          <div className="text-white/80">Plan: <span className="font-semibold capitalize">{String(stats.plan).replace('_','-')}</span> · Today: {stats.used}{stats.limit ? `/${stats.limit}` : '/∞'}</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {platforms.map((pf) => (
            <div key={pf.key} className={`rounded-xl p-4 bg-white/5 hover:bg-white/10 transition border border-white/10 ${selected.includes(pf.key) ? 'ring-2 ring-fuchsia-500' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-medium" style={{ color: socialPalette[pf.key] || '#fff' }}>{pf.name}</div>
                <button onClick={() => redirect(pf)} className="text-xs text-white/60 hover:text-white">Open</button>
              </div>
              <button onClick={() => toggleSel(pf.key)} className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white">{selected.includes(pf.key) ? 'Selected' : 'Select'}</button>
              <button onClick={() => linkQuick(pf)} className="w-full mt-2 text-xs text-white/70 hover:text-white">Quick link</button>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Unified Uploader</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Media type</label>
                <select value={mediaType} onChange={(e)=>setMediaType(e.target.value)} className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-3 py-2">
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  <option value="text">Text</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-white/70 mb-1">Caption</label>
                <input value={caption} onChange={(e)=>setCaption(e.target.value)} className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-3 py-2" placeholder="Say something..." />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button disabled={!selected.length || uploading} onClick={startUpload} className="px-5 py-2 rounded-lg bg-fuchsia-600 text-white hover:bg-fuchsia-700 disabled:opacity-50">Queue Upload</button>
              <div className="text-white/70 text-sm self-center">Selected: {selected.length}</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-2">Connected Accounts</h3>
            <div className="space-y-2 max-h-64 overflow-auto pr-2">
              {accounts.map((a)=> (
                <div key={a.id} className="flex items-center justify-between text-white/80 bg-white/5 rounded-lg px-3 py-2">
                  <div className="font-medium">{a.platform}</div>
                  <div className="text-xs">{a.username}</div>
                </div>
              ))}
              {!accounts.length && <div className="text-white/50 text-sm">No accounts linked yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
