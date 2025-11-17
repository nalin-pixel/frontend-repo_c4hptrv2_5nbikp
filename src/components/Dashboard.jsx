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

  // Ecommerce state
  const [products, setProducts] = useState([])
  const emptyProduct = { title: '', description: '', price: 0, product_type: 'digital', status: 'active' }
  const [formProduct, setFormProduct] = useState(emptyProduct)
  const [editingId, setEditingId] = useState(null)
  const [orderLoading, setOrderLoading] = useState(false)

  // AI edit state
  const [aiSource, setAiSource] = useState('')
  const [aiOps, setAiOps] = useState({ autocut: true, resize: true, captions: true, thumbnail: true })
  const [aiLoading, setAiLoading] = useState(false)

  const headers = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }), [])

  const fetchAll = async () => {
    const [pRes, aRes, sRes, meRes, prodRes] = await Promise.all([
      axios.get(`${API_BASE}/platforms`),
      axios.get(`${API_BASE}/accounts`, { headers }),
      axios.get(`${API_BASE}/uploads/stats`, { headers }),
      axios.get(`${API_BASE}/me`, { headers }),
      axios.get(`${API_BASE}/products`, { headers }),
    ])
    setPlatforms(pRes.data.platforms)
    setAccounts(aRes.data.accounts)
    setStats(sRes.data)
    setMe(meRes.data)
    setProducts(prodRes.data.products)
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

  const faviconFor = (url) => {
    try {
      const u = new URL(url)
      return `https://icons.duckduckgo.com/ip3/${u.hostname}.ico`
    } catch {
      return `https://icons.duckduckgo.com/ip3/${url.replace('https://','')}.ico`
    }
  }

  // Products CRUD
  const saveProduct = async (e) => {
    e?.preventDefault()
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/products/${editingId}`, formProduct, { headers })
      } else {
        await axios.post(`${API_BASE}/products`, formProduct, { headers })
      }
      setFormProduct(emptyProduct)
      setEditingId(null)
      await fetchAll()
    } catch (e) {
      alert(e.response?.data?.detail || 'Error saving product')
    }
  }

  const editProduct = (p) => {
    setEditingId(p.id)
    setFormProduct({ title: p.title, description: p.description || '', price: p.price, product_type: p.product_type, status: p.status })
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await axios.delete(`${API_BASE}/products/${id}`, { headers })
      await fetchAll()
    } catch (e) {
      alert('Delete failed')
    }
  }

  const createOrder = async (p) => {
    setOrderLoading(true)
    try {
      await axios.post(`${API_BASE}/orders`, { product_id: p.id, buyer_email: me.email }, { headers })
      alert('Order created (simulated paid).')
    } catch (e) {
      alert(e.response?.data?.detail || 'Checkout failed')
    } finally {
      setOrderLoading(false)
    }
  }

  // AI edit submit
  const startAiEdit = async () => {
    setAiLoading(true)
    try {
      const ops = Object.entries(aiOps).filter(([,v]) => v).map(([k]) => k)
      const { data } = await axios.post(`${API_BASE}/ai/edit`, { source_url: aiSource || null, operations: ops }, { headers })
      alert(`AI job ${data.job_id} started`)
      setAiSource('')
    } catch (e) {
      alert(e.response?.data?.detail || 'AI edit failed')
    } finally {
      setAiLoading(false)
    }
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
                <div className="flex items-center gap-2">
                  <img src={faviconFor(pf.url)} alt={pf.name} className="w-5 h-5 rounded" />
                  <div className="text-white font-medium" style={{ color: socialPalette[pf.key] || '#fff' }}>{pf.name}</div>
                </div>
                <button onClick={() => redirect(pf)} className="text-xs text-white/60 hover:text-white">Open</button>
              </div>
              <button onClick={() => toggleSel(pf.key)} className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white">{selected.includes(pf.key) ? 'Selected' : 'Select'}</button>
              <button onClick={() => linkQuick(pf)} className="w-full mt-2 text-xs text-white/70 hover:text-white">Quick link</button>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
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

        {/* Products */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-2 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Products</h3>
              <div className="text-white/60 text-sm">Total: {products.length}</div>
            </div>
            <table className="min-w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Type</th>
                  <th className="text-left py-2 pr-4">Price</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-white/10 text-white">
                    <td className="py-2 pr-4">{p.title}</td>
                    <td className="py-2 pr-4 capitalize">{p.product_type}</td>
                    <td className="py-2 pr-4">${p.price}</td>
                    <td className="py-2 pr-4 capitalize">{p.status}</td>
                    <td className="py-2 pr-4 space-x-2">
                      <button onClick={() => editProduct(p)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">Edit</button>
                      <button onClick={() => deleteProduct(p.id)} className="text-xs px-2 py-1 rounded bg-red-500/70 hover:bg-red-500 text-white">Delete</button>
                      <button disabled={orderLoading} onClick={() => createOrder(p)} className="text-xs px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">Test Checkout</button>
                    </td>
                  </tr>
                ))}
                {!products.length && (
                  <tr><td colSpan="5" className="text-white/50 py-6">No products yet. Add one below.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3">{editingId ? 'Edit product' : 'Add product'}</h3>
            <form onSubmit={saveProduct} className="space-y-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Title</label>
                <input value={formProduct.title} onChange={(e)=>setFormProduct(v=>({...v, title: e.target.value}))} className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Description</label>
                <textarea value={formProduct.description} onChange={(e)=>setFormProduct(v=>({...v, description: e.target.value}))} className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-3 py-2" rows="3" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Price</label>
                  <input type="number" step="0.01" value={formProduct.price} onChange={(e)=>setFormProduct(v=>({...v, price: parseFloat(e.target.value||'0')}))} className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Type</label>
                  <select value={formProduct.product_type} onChange={(e)=>setFormProduct(v=>({...v, product_type: e.target.value}))} className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-3 py-2">
                    <option value="digital">Digital</option>
                    <option value="physical">Physical</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Status</label>
                <select value={formProduct.status} onChange={(e)=>setFormProduct(v=>({...v, status: e.target.value}))} className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-3 py-2">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">{editingId ? 'Update' : 'Create'}</button>
                {editingId && <button type="button" onClick={()=>{setEditingId(null); setFormProduct(emptyProduct)}} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white">Cancel</button>}
              </div>
            </form>
          </div>
        </div>

        {/* AI Edit */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">AI Video Editing</h3>
            {me.plan !== 'ultra_pro' && (
              <span className="text-xs text-white/60">Ultra Pro only</span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 opacity-100">
            <div className="md:col-span-2">
              <label className="block text-sm text-white/70 mb-1">Source URL</label>
              <input disabled={me.plan !== 'ultra_pro'} value={aiSource} onChange={(e)=>setAiSource(e.target.value)} className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-3 py-2" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Operations</label>
              <div className="grid grid-cols-2 gap-2 text-white/80">
                {[
                  ['autocut','Auto-cut'],
                  ['resize','Resize'],
                  ['captions','Captions'],
                  ['thumbnail','Thumbnail'],
                ].map(([k,label]) => (
                  <label key={k} className="flex items-center gap-2">
                    <input type="checkbox" disabled={me.plan !== 'ultra_pro'} checked={!!aiOps[k]} onChange={(e)=>setAiOps(v=>({...v,[k]: e.target.checked}))} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button disabled={me.plan !== 'ultra_pro' || aiLoading} onClick={startAiEdit} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">Start AI Edit</button>
          </div>
        </div>
      </div>
    </section>
  )
}
