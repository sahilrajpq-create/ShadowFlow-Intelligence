"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Info } from 'lucide-react';
import { IdentityDNA } from '@/components/Dashboard/IdentityDNA';
import { TransactionCanvas } from '@/components/Dashboard/TransactionCanvas';
import { SubjectDossier } from '@/components/Dashboard/SubjectDossier';
import { NodeData, useGraphStore } from '@/store/graphStore';
import Link from 'next/link';

export default function Dashboard() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [status, setStatus] = useState('AWAITING PARSE');
  const [clusterCount, setClusterCount] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const { nodes } = useGraphStore();

  const handleStatusChange = (s: string) => {
    setStatus(s);
    if (s.includes('ONLINE') || s.includes('MAPPING')) setIsOnline(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setTargetNodeId(searchQuery.trim());
      // Reset after a short delay so the mesh can pick it up
      setTimeout(() => setTargetNodeId(null), 100);
    }
  };

  const filteredSuggestions = searchQuery.trim().length > 1 
    ? nodes.filter(n => n.id.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="flex h-screen w-full bg-[#00050A] text-white overflow-hidden relative" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      


      {/* ── LEFT PANEL: Identity DNA ── */}
      <aside className="w-[320px] flex-shrink-0 border-r border-white/[0.06] bg-black/60 backdrop-blur-xl z-20 flex flex-col">
        {/* Panel Header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06] bg-black/40 text-glow">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 border border-[#00E5FF] rotate-[30deg] rounded-sm opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="absolute inset-1 bg-[#00E5FF] rounded-sm animate-pulse" />
            </div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-white group-hover:text-glow transition-colors">SHADOWFLOW</span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#00E5FF] shadow-[0_0_6px_rgba(0,229,255,1)]' : 'bg-white/20'} animate-pulse`} />
            <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase">
              {isOnline ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>

        {/* DNA Panel Content */}
        <div className="flex-1 overflow-y-auto">
          <IdentityDNA
            onStatusChange={handleStatusChange}
            onClusterCountChange={setClusterCount}
          />
        </div>
      </aside>

      {/* ── CENTER PANEL: transaction Canvas ── */}
      <main className="flex-1 relative overflow-hidden z-10">
        <TransactionCanvas
          clusterCount={clusterCount}
          onNodeSelect={setSelectedNode}
          selectedNode={selectedNode}
          targetNodeId={targetNodeId}
        />

        {/* Top Status HUD */}
        <div className="absolute top-0 left-0 right-0 flex items-center gap-3 px-5 py-3 pointer-events-none z-10">
          {/* Status badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold tracking-widest shadow-lg ${
            isOnline
              ? 'bg-black/80 border border-emerald-500/30 text-emerald-400'
              : 'bg-black/80 border border-[#00E5FF]/20 text-[#00E5FF]/70'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-[#00E5FF] animate-pulse'}`} />
            {status}
          </div>

          {/* Cluster count */}
          {clusterCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest rounded shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {clusterCount.toLocaleString()} THREAT CLUSTERS
            </div>
          )}

          {/* ── GLOBAL SEARCH OVERLAY ── */}
          <div className="absolute top-[60px] left-5 z-50 w-[300px] pointer-events-auto">
            <form onSubmit={handleSearch} className="relative group">
              <div className={`flex items-center glass-cyan bg-black/40 backdrop-blur-md rounded-xl border transition-all duration-300 ${isSearchFocused ? 'border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.2)] scale-105' : 'border-white/10 hover:border-white/20'}`}>
                <div className="pl-4 pr-2 text-white/30 group-hover:text-[#00E5FF]/60 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="SEARCH ACCOUNT_ID / CLUSTER..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-full bg-transparent border-none py-2.5 pr-4 text-[10px] font-bold tracking-[0.2em] text-white placeholder:text-white/20 focus:outline-none focus:ring-0"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="pr-4 text-white/20 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Auto-complete suggestions */}
              <AnimatePresence>
                {isSearchFocused && filteredSuggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 glass-cyan border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                  >
                    {filteredSuggestions.map((n) => (
                      <button 
                        key={n.id}
                        onClick={() => {
                          setSearchQuery(n.id);
                          setTargetNodeId(n.id);
                          setTimeout(() => setTargetNodeId(null), 100);
                          setIsSearchFocused(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#00E5FF]/10 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold tracking-widest text-[#00E5FF]">{n.id}</span>
                          <span className="text-[8px] text-white/40 uppercase mt-0.5">CLUSTER: {n.cluster.slice(0, 8)}...</span>
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full ${n.isSuspicious ? 'bg-[#00E5FF]' : 'bg-white/20'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Bottom HUD line */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-2.5 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10">
          <div className="text-[9px] font-mono text-white/15 tracking-widest flex items-center gap-3">
             <span>SHADOWFLOW ENGINE v2.1</span>
             <span className="text-white/5 font-light">|</span>
             <span>WEBGL_ACCELERATED</span>
             <span className="text-white/5 font-light">|</span>
             {nodes.length > 0 && <span>MATRIX SIZE: {nodes.length}V</span>}
          </div>
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[9px] font-mono text-[#00E5FF] tracking-widest flex items-center gap-2"
            >
              <Info className="w-3 h-3" />
              INSPECTION ACTIVE: {selectedNode.id}
            </motion.div>
          )}
        </div>
      </main>

      {/* ── RIGHT PANEL: Slide-out Subject Dossier ── */}
      <AnimatePresence>
        {selectedNode && (
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-[400px] border-l border-white/[0.06] bg-black/40 backdrop-blur-2xl z-30 flex flex-col shadow-2xl"
          >
            {/* Panel Header */}
            <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06] bg-black/40">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,1)]" />
              <h2 className="text-[11px] font-bold tracking-[0.25em] text-white">FORENSIC_INVESTIGATION</h2>
              <button 
                onClick={() => setSelectedNode(null)}
                className="ml-auto p-1.5 border border-white/5 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dossier Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <SubjectDossier node={selectedNode} />
            </div>

            {/* Footer Status */}
            <div className="px-6 py-4 bg-black/40 border-t border-white/[0.06] text-[9px] font-mono text-white/10 tracking-[0.2em] flex items-center justify-between uppercase">
               <span>Forensics Core Online</span>
               <span className="text-[#00E5FF]/40">Secured Layer</span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
