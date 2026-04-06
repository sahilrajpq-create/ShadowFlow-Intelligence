"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Demo credentials — replace with a real auth backend before production use
const DEMO_OPERATOR_ID = 'IDENTITY_LEAD';
const DEMO_PASSCODE = 'SECURE_2026';


const AUTH_LINES = [
  "Establishing secure channel...",
  "Verifying operator credentials...",
  "ACCESS GRANTED. Welcome, Operator.",
];

function AuthProgress({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const add = () => {
      if (i < AUTH_LINES.length) {
        setLines(prev => [...prev, AUTH_LINES[i]]);
        i++;
        setTimeout(add, 300);
      } else {
        setTimeout(() => { setDone(true); onDone(); }, 300);
      }
    };
    setTimeout(add, 100);
  }, [onDone]);

  return (
    <div className="font-mono text-xs space-y-2 text-left">
      {lines.map((line, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 animate-fadeInUp ${i === lines.length - 1 && !done ? 'text-[#00E5FF]' : 'text-emerald-400'}`}
          style={{ animationFillMode: 'both' }}
        >
          <span className="text-[#00E5FF]/40">&gt;</span>
          {line}
          {i === lines.length - 1 && !done && (
            <span className="inline-block w-1 h-3 bg-[#00E5FF] animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Login() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const idRef = useRef<HTMLInputElement>(null);

  useEffect(() => { idRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (id.trim() === DEMO_OPERATOR_ID && password === DEMO_PASSCODE) {
      setAuthenticating(true);
    } else {
      setError('ACCESS DENIED — Invalid operator credentials.');
    }
  };

  const handleAuthDone = () => {
    setFadeOut(true);
    setTimeout(() => router.push('/dashboard'), 400);
  };

  return (
    <div className="min-h-screen bg-[#00050A] flex items-center justify-center relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5FF] rounded-full blur-[200px] opacity-[0.04] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#FF3366] rounded-full blur-[150px] opacity-[0.03] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 cyber-grid opacity-30" />

      {/* Smooth dark fade-out transition — avoids the solid cyan flash bug */}
      <div
        className="fixed inset-0 bg-[#00050A] z-50 pointer-events-none"
        style={{
          opacity: fadeOut ? 1 : 0,
          transition: fadeOut ? 'opacity 0.35s ease-in' : 'none',
        }}
      />

      {/* Rotating hex ring */}
      <div
        className="absolute w-[500px] h-[500px] border border-[#00E5FF]/05 rounded-full pointer-events-none"
        style={{ animation: 'rotate-slow 30s linear infinite' }}
      />
      <div
        className="absolute w-[700px] h-[700px] border border-[#00E5FF]/03 rounded-full pointer-events-none"
        style={{ animation: 'rotate-slow 50s linear infinite reverse' }}
      />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10 animate-fadeInUp" style={{ animationFillMode: 'both' }}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border border-[#00E5FF] rotate-[30deg] rounded-sm opacity-50" />
              <div className="absolute inset-1 border border-[#00E5FF] rotate-[0deg] rounded-sm opacity-30" />
              <div className="absolute inset-2 bg-[#00E5FF] rounded-sm animate-pulse" />
            </div>
            <div>
              <div className="font-black text-lg tracking-[0.3em] text-white">SHADOWFLOW</div>
              <div className="text-[9px] font-mono tracking-widest text-[#00E5FF]/50">ZERO-TRUST IDENTITY CORE</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,229,255,0.06)] animate-fadeInUp delay-100" style={{ animationFillMode: 'both' }}>
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-pulse shadow-[0_0_6px_rgba(0,229,255,1)]" />
              <h1 className="text-xs font-mono font-bold tracking-[0.3em] text-[#00E5FF]">SECURE ACCESS TERMINAL</h1>
            </div>
            <p className="text-xs text-white/25 font-mono mt-1">Authorized personnel only. All sessions logged.</p>
          </div>

          <div className="p-8">
            {authenticating ? (
              // Auth loading state
              <div className="space-y-6">
                <div className="glass-cyan rounded-xl p-5">
                  <AuthProgress onDone={handleAuthDone} />
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-white/20 tracking-widest">
                  <div className="w-1 h-1 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Operator ID */}
                <div>
                  <label className="block text-[10px] font-mono font-bold tracking-[0.2em] text-[#00E5FF]/70 mb-2 uppercase">
                    Operator ID
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00E5FF]/30 font-mono text-sm select-none">&gt;_</span>
                    <input
                      ref={idRef}
                      type="text"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      placeholder="IDENTITY_LEAD"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 bg-black/40 text-white border border-white/10 rounded-lg font-mono text-sm placeholder:text-white/15 focus:border-[#00E5FF]/50 focus:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Passcode */}
                <div>
                  <label className="block text-[10px] font-mono font-bold tracking-[0.2em] text-[#00E5FF]/70 mb-2 uppercase">
                    Passcode
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00E5FF]/30 font-mono text-sm select-none">🔒</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-4 py-3 bg-black/40 text-white border border-white/10 rounded-lg font-mono text-sm placeholder:text-white/15 focus:border-[#00E5FF]/50 focus:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-950/40 border border-red-500/30 rounded-lg animate-fadeIn">
                    <span className="text-red-400 text-base">⚠</span>
                    <p className="text-red-400 text-[11px] font-mono tracking-wider">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-black font-mono tracking-[0.3em] rounded-lg hover:bg-[#00E5FF] hover:text-[#00050A] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all duration-300 uppercase"
                >
                  ACCESS CORE →
                </button>

                {/* Hint — only shown in development */}
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-center text-[10px] font-mono text-white/15 tracking-wider pt-1">
                    Demo: {DEMO_OPERATOR_ID} / {DEMO_PASSCODE}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] font-mono text-white/15 tracking-wider mt-6 animate-fadeInUp delay-300" style={{ animationFillMode: 'both' }}>
          SESSION ENCRYPTED · TLS 1.3 · ZERO-TRUST ENFORCED
        </p>
      </div>
    </div>
  );
}
