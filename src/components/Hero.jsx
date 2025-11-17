import React from 'react'
import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/ezRAY9QD27kiJcur/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            SocialHub Pro Edition
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80">
            Upload once. Publish everywhere. Sell smarter. Save hours.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#signup" className="px-6 py-3 rounded-lg bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:opacity-90 transition">Get Started</a>
            <a href="#dashboard" className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition">Live Demo</a>
          </div>
        </div>
      </div>
    </section>
  )
}
