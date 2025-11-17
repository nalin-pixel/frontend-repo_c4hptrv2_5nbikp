import React, { useEffect, useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setUser(d))
        .catch(()=>{})
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-950">
      <Nav />
      <Hero />
      <main className="-mt-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-start">
          <Auth onAuth={(u)=>setUser(u)} />
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-3">Why SocialHub Pro?</h3>
            <ul className="space-y-2 text-white/80">
              <li>• Upload once and publish across 50+ platforms</li>
              <li>• Plan-based daily limits with automatic queuing</li>
              <li>• Unified ecommerce to sell and track your products</li>
              <li>• Ultra Pro unlocks AI video editing tools</li>
            </ul>
          </div>
        </div>
        {user && <Dashboard />}
      </main>
      <footer className="text-center text-white/60 py-10">© {new Date().getFullYear()} SocialHub Pro Edition</footer>
    </div>
  )
}

export default App
