"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const TERMINAL_LINES = [
  "$ shadowflow --init zero-trust-core",
  "> Scanning identity vectors...",
  "> 116,401 entities loaded.",
  "> Clustering suspicious nodes...",
  "> 2,847 anomalous clusters isolated.",
  "> Neural mesh online. Threat surface mapped.",
  "$ STATUS: SECURE ▊",
];

function TerminalAnimation() {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentLine >= TERMINAL_LINES.length) return;

    const line = TERMINAL_LINES[currentLine];

    if (currentChar < line.length) {
      const t = setTimeout(() => {
        setLines(prev => {
          const next = [...prev];
          next[currentLine] = (next[currentLine] || '') + line[currentChar];
          return next;
        });
        setCurrentChar(c => c + 1);
      }, 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCurrentLine(l => l + 1);
        setCurrentChar(0);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [currentLine, currentChar]);

  return (
    <div className="font-mono text-xs leading-6 text-left">
      {lines.map((line, i) => (
        <div key={i} className={`${line.startsWith('$') ? 'text-[#00E5FF]' : line.startsWith('>') ? 'text-emerald-400' : 'text-white/60'}`}>
          {line}
          {i === lines.length - 1 && currentLine < TERMINAL_LINES.length && (
            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#00E5FF] animate-pulse align-middle" />
          )}
        </div>
      ))}
    </div>
  );
}

function HexGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-sm border border-[#00E5FF] opacity-0"
          style={{
            width: `${Math.random() * 60 + 20}px`,
            height: `${Math.random() * 60 + 20}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            borderRadius: '2px',
            transform: `rotate(${Math.random() * 45}deg)`,
            animation: `fadeIn ${Math.random() * 3 + 1}s ease ${Math.random() * 4}s forwards`,
            borderWidth: '0.5px',
          }}
        />
      ))}
    </div>
  );
}

const STATS = [
  { label: "Entities Processed", value: "116K+", sub: "per scan" },
  { label: "Threat Clusters", value: "99.7%", sub: "detection rate" },
  { label: "Resolve Time", value: "<2s", sub: "on 100K rows" },
  { label: "False Positive Rate", value: "0.03%", sub: "industry leading" },
];

const FEATURES = [
  {
    icon: "⬡",
    title: "Dynamic Network Topology",
    description: "Interactive 2D force-directed graph rendering transaction flows and cluster relationships in real-time."
  },
  {
    icon: "⚡",
    title: "Web Worker Engine",
    description: "Process massive datasets without freezing the UI. Parallel computation of transaction loops and risk flags."
  },
  {
    icon: "🔍",
    title: "Behavioral Risk Scoring",
    description: "Multi-factor intelligence engine automatically detecting layering, structuring, and velocity abuse."
  },
  {
    icon: "🛡",
    title: "Zero-Trust Architecture",
    description: "Every identity is suspect until proven otherwise. ShadowFlow maps trust scores dynamically."
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="min-h-screen bg-[#00050A] text-white overflow-x-hidden relative">
      {/* CRT Scanline effect */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]" />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#00050A]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border border-[#00E5FF] rotate-[30deg] rounded-sm opacity-60" />
            <div className="absolute inset-1 border border-[#00E5FF] rotate-[0deg] rounded-sm opacity-40" />
            <div className="absolute inset-2 bg-[#00E5FF] rounded-sm animate-pulse" />
          </div>
          <span className="font-bold tracking-[0.2em] text-sm text-white uppercase">SHADOWFLOW</span>
          <span className="text-[10px] font-mono text-[#00E5FF]/60 border border-[#00E5FF]/20 px-2 py-0.5 rounded">v2.1</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider text-white/40">
          <span className="hover:text-[#00E5FF] transition-colors cursor-pointer">PLATFORM</span>
          <span className="hover:text-[#00E5FF] transition-colors cursor-pointer">DOCS</span>
          <span className="hover:text-[#00E5FF] transition-colors cursor-pointer">THREAT INTEL</span>
        </div>
        <Link
          href="/login"
          className="px-5 py-2 text-xs font-mono font-bold tracking-widest border border-[#00E5FF]/40 text-[#00E5FF] rounded hover:bg-[#00E5FF] hover:text-[#00050A] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all duration-300"
        >
          OPERATOR LOGIN
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {/* Background glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-[#00E5FF] blur-[180px] opacity-[0.04] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#00E5FF] blur-[150px] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#FF3366] blur-[130px] opacity-[0.025] pointer-events-none" />

        {/* Cyber grid */}
        <div className="absolute inset-0 cyber-grid opacity-40" />
        {mounted && <HexGrid />}

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 mb-8 glass-cyan rounded-full text-[11px] font-mono tracking-widest ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[#00E5FF]">ZERO-TRUST ENGINE ACTIVE</span>
            <span className="text-white/30">·</span>
            <span className="text-white/40">116K ENTITIES / SCAN</span>
          </div>

          {/* Hero headline */}
          <h1 className={`text-6xl md:text-8xl font-black tracking-tight leading-none mb-6 ${mounted ? 'animate-fadeInUp delay-100' : 'opacity-0'}`}
            style={{ animationFillMode: 'both' }}>
            <span className="block text-white">THE TRUTH</span>
            <span className="block bg-gradient-to-r from-[#00E5FF] via-[#00B8D4] to-[#00E5FF] bg-clip-text text-transparent text-glow">
              BEHIND THE IDENTITY.
            </span>
          </h1>

          <p className={`text-lg md:text-xl text-white/40 font-light max-w-2xl mx-auto mb-12 leading-relaxed ${mounted ? 'animate-fadeInUp delay-200' : 'opacity-0'}`}
            style={{ animationFillMode: 'both' }}>
            ShadowFlow maps hidden connections across 116K+ accounts — resolving aliases, shared devices, and coordinated fraud rings in under 2 seconds.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 ${mounted ? 'animate-fadeInUp delay-300' : 'opacity-0'}`}
            style={{ animationFillMode: 'both' }}>
            <Link
              href="/login"
              className="group relative px-8 py-4 bg-[#00E5FF] text-[#00050A] font-black tracking-widest text-sm rounded hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">INITIATE IDENTITY SCAN</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </Link>
            <button className="px-8 py-4 border border-white/10 text-white/60 font-mono tracking-widest text-xs rounded hover:border-white/30 hover:text-white transition-all duration-300">
              VIEW DEMO DATASET ↗
            </button>
          </div>

          {/* Terminal Window */}
          <div className={`max-w-xl mx-auto glass-cyan rounded-xl overflow-hidden shadow-[0_0_60px_rgba(0,229,255,0.08)] ${mounted ? 'animate-fadeInUp delay-400' : 'opacity-0'}`}
            style={{ animationFillMode: 'both' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/30">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-2 text-[10px] font-mono text-white/20 tracking-widest">SHADOWFLOW TERMINAL — IDENTITY RESOLVER</span>
            </div>
            <div className="p-5 min-h-[160px]">
              <TerminalAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="relative z-10 border-y border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-[#00E5FF] text-glow mb-1">{s.value}</div>
              <div className="text-xs font-bold tracking-widest text-white/60 uppercase">{s.label}</div>
              <div className="text-[10px] text-white/25 font-mono mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 border border-[#00E5FF]/20 rounded text-[10px] font-mono tracking-widest text-[#00E5FF]/60">CAPABILITIES</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">Built for the Threat Frontier</h2>
          <p className="text-white/40 mt-4 max-w-xl mx-auto">Every feature engineered for forensic-grade identity intelligence.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group glass rounded-xl p-6 hover:border-[#00E5FF]/20 border border-white/5 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,229,255,0.06)] cursor-pointer"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 glass-cyan rounded-lg flex items-center justify-center text-xl group-hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold tracking-wider text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 py-24 text-center border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E5FF]/[0.02] to-transparent pointer-events-none" />
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            Ready to <span className="text-[#00E5FF] text-glow">expose</span> the network?
          </h2>
          <p className="text-white/40 text-lg mb-10">Upload your dataset. ShadowFlow does the rest.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#00E5FF] text-[#00050A] font-black tracking-widest text-sm rounded hover:shadow-[0_0_50px_rgba(0,229,255,0.4)] transition-all duration-500"
          >
            <span>ENTER THE CORE</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 tracking-widest">
            <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-pulse" />
            SHADOWFLOW INTELLIGENCE © 2026 — CLASSIFIED SYSTEM
          </div>
          <div className="text-[10px] font-mono text-white/10 tracking-wider">
            ZERO-TRUST · BIOLUMINESCENT NEURAL MESH · v2.1.0
          </div>
        </div>
      </footer>
    </main>
  );
}
