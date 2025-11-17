import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password })
        localStorage.setItem('token', data.token)
        onAuth(data.user)
      } else {
        const { data } = await axios.post(`${API_BASE}/auth/signup`, { name, email, password })
        localStorage.setItem('token', data.token)
        onAuth(data.user)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error, try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="signup" className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h3>
        <button className="text-indigo-600" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Need an account?' : 'Have an account?'}
        </button>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}
