import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Reset messages when mode changes
    setError('')
    setSuccess('')
  }, [mode])

  const emailValid = useMemo(() => /.+@.+\..+/.test(email), [email])
  const passwordValid = useMemo(() => password.length >= 6, [password])
  const nameValid = useMemo(() => (mode === 'signup' ? name.trim().length >= 2 : true), [mode, name])
  const formValid = emailValid && passwordValid && nameValid

  const submit = async (e) => {
    e.preventDefault()
    if (!formValid || loading) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (mode === 'login') {
        const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password })
        localStorage.setItem('token', data.token)
        setSuccess('Logged in successfully. Redirecting...')
        onAuth?.(data.user)
      } else {
        const { data } = await axios.post(`${API_BASE}/auth/signup`, { name: name.trim(), email, password })
        localStorage.setItem('token', data.token)
        setSuccess('Account created. Welcome!')
        onAuth?.(data.user)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="signup" className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex p-1 rounded-xl bg-slate-100">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            aria-pressed={mode === 'login'}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'signup' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            aria-pressed={mode === 'signup'}
          >
            Sign up
          </button>
        </div>
        <span className="hidden md:block text-slate-500 text-sm">Secure • Encrypted • Session-based</span>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-sm mb-1 text-slate-700">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 outline-none transition ${nameValid ? 'border-slate-200 focus:border-slate-400' : 'border-red-300 focus:border-red-400'}`}
              placeholder="Jane Doe"
              required
              autoFocus
            />
            {!nameValid && <p className="text-red-600 text-xs mt-1">Please enter at least 2 characters.</p>}
          </div>
        )}
        <div>
          <label className="block text-sm mb-1 text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 outline-none transition ${emailValid ? 'border-slate-200 focus:border-slate-400' : 'border-red-300 focus:border-red-400'}`}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          {!emailValid && email.length > 0 && (
            <p className="text-red-600 text-xs mt-1">Enter a valid email address.</p>
          )}
        </div>
        <div>
          <div className="flex justify-between items-end">
            <label className="block text-sm mb-1 text-slate-700">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 outline-none transition ${passwordValid ? 'border-slate-200 focus:border-slate-400' : 'border-red-300 focus:border-red-400'}`}
            placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {!passwordValid && password.length > 0 && (
            <p className="text-red-600 text-xs mt-1">Password must be at least 6 characters.</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm px-3 py-2">{success}</div>
        )}

        <button
          type="submit"
          disabled={!formValid || loading}
          className={`w-full py-3 rounded-lg text-white transition font-medium ${!formValid || loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
        </button>

        <div className="text-center text-sm text-slate-500">
          {mode === 'login' ? (
            <span>
              Don’t have an account?{' '}
              <button type="button" onClick={() => setMode('signup')} className="text-indigo-600 hover:text-indigo-700 font-medium">Sign up</button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')} className="text-indigo-600 hover:text-indigo-700 font-medium">Login</button>
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
