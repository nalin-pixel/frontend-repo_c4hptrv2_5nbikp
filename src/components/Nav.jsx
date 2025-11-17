import React from 'react'

export default function Nav() {
  return (
    <header className="w-full sticky top-0 z-30 bg-black/40 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="w-3 h-3 rounded-full bg-fuchsia-500 animate-pulse" />
          <span className="font-semibold">SocialHub Pro</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-white/80">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#dashboard" className="hover:text-white">Dashboard</a>
          <a href="#signup" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Login / Sign up</a>
        </nav>
      </div>
    </header>
  )
}
