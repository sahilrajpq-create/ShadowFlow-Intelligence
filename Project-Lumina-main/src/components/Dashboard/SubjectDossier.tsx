import { useGraphStore, NodeData } from '@/store/graphStore';
import { ShieldAlert, ShieldCheck, Network, Fingerprint, GitBranch, Copy, Check, Lock, Unlock, Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useState } from 'react';

interface SubjectDossierProps {
  node: NodeData | null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="text-white/20 hover:text-white/60 transition-colors ml-1.5 flex-shrink-0">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function MetaRow({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0 gap-3">
      <span className="text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span className={`text-[11px] font-mono truncate ${valueClass || 'text-white/70'}`} title={value}>{value}</span>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export function SubjectDossier({ node }: SubjectDossierProps) {
  const { edges, nodes, updateNode } = useGraphStore();
  const [isFreezing, setIsFreezing] = useState(false);

  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12 gap-4">
        <div className="w-16 h-16 border border-white/[0.08] rounded-2xl flex items-center justify-center mb-2">
          <Network className="w-7 h-7 text-white/15" strokeWidth={1} />
        </div>
        <p className="text-[11px] font-bold tracking-[0.2em] text-white/20 uppercase">No Account Selected</p>
        <p className="text-[10px] text-white/15 font-mono leading-relaxed max-w-[200px]">
          Select a node from the 3D mesh to initiate financial analysis
        </p>
        <div className="mt-4 px-4 py-2 border border-white/[0.05] rounded-lg text-[10px] font-mono text-white/15 tracking-wider">
          ANALYSIS IDLE
        </div>
      </div>
    );
  }

  const nodeEdges = edges.filter(e => e.source === node.id || e.target === node.id);
  const connectedNodeIds = new Set(nodeEdges.map(e => e.source === node.id ? e.target : e.source));
  const clusterSiblings = nodes.filter(n => n.cluster === node.cluster && n.id !== node.id);
  const isHighRisk = node.isSuspicious; // Now indicates high volume
  const isFrozen = node.isActive === false;

  const handleFreeze = async () => {
    setIsFreezing(true);
    // Simulate Supabase API latency
    await new Promise(r => setTimeout(r, 1000));
    updateNode(node.id, { isActive: isFrozen });
    setIsFreezing(false);
  };

  const totalSent = node.totalSent || 0;
  const totalReceived = node.totalReceived || 0;
  const totalVolume = totalSent + totalReceived;
  const volumeScore = Math.min(100, Math.round((totalVolume / 100000) * 100));

  return (
    <div className="flex flex-col gap-5 h-full animate-fadeInUp" style={{ animationFillMode: 'both' }}>
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-bold tracking-[0.2em] text-white/30 mb-1.5">ACCOUNT IDENTIFIER</p>
          <div className="flex items-center gap-1.5">
            <p className="text-lg font-black text-white tracking-wider truncate font-mono">{node.id}</p>
            <CopyButton text={node.id} />
          </div>
        </div>
        <div className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-500 ${
          isFrozen 
            ? 'bg-amber-950/20 border-amber-500/30 text-amber-400'
            : (isHighRisk
                ? 'bg-[#00E5FF]/[0.05] border-[#00E5FF]/30 text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.1)]'
                : 'bg-white/[0.02] border-white/10 text-white/50')
        }`}>
          {isFrozen ? <Lock className="w-5 h-5" strokeWidth={1.5} /> : (isHighRisk ? <ArrowUpRight className="w-5 h-5" strokeWidth={1.5} /> : <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />)}
          <span className="text-[8px] font-bold tracking-wider">{isFrozen ? 'FROZEN' : (isHighRisk ? 'HIGH VOL' : 'NORMAL')}</span>
        </div>
      </div>

      {/* ── Volume Score ── */}
      <div className={`bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 transition-all ${isFrozen ? 'opacity-40 grayscale' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] font-bold tracking-[0.2em] text-white/30">ACTIVITY VOLUME</p>
          <p className={`text-base font-black font-mono transition-colors ${isFrozen ? 'text-white/30' : (isHighRisk ? 'text-[#00E5FF]' : 'text-emerald-400')}`}>
            {isFrozen ? '--' : `$${totalVolume.toLocaleString()}`}
          </p>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isFrozen ? 'bg-white/10' : (totalVolume > 50000 ? 'bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]'
              : totalVolume > 10000 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
              : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]')
            }`}
            style={{ width: `${isFrozen ? 0 : Math.max(5, volumeScore)}%` }}
          />
        </div>
      </div>

      {/* ── Risk Intelligence Layer ── */}
      {(node.riskScore !== undefined) && (
        <div className={`bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 transition-all ${isFrozen ? 'opacity-40 grayscale' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-bold tracking-[0.2em] text-white/30">RISK INTELLIGENCE</p>
            <div className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest ${
                node.riskLevel === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                node.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
              }`}>
              {node.riskLevel?.toUpperCase() || 'LOW'} RISK
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-white/50 font-mono">Behavioral Integrity Score</span>
              <span className="text-[11px] font-bold font-mono text-white/80">{node.riskScore} / 100</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    node.riskLevel === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                    node.riskLevel === 'Medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, node.riskScore || 0))}%` }}
               />
            </div>
          </div>

          {node.riskReasons && node.riskReasons.length > 0 ? (
            <div className="space-y-4">
              {node.flags && node.flags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[9px] font-bold tracking-[0.1em] text-white/30 uppercase opacity-60">Suspicious Patterns</p>
                  <div className="flex flex-wrap gap-2">
                    {node.flags.map((flag, i) => (
                      <span key={i} className={`px-2 py-1 bg-white/5 border rounded text-[9px] font-mono
                        ${node.riskLevel === 'High' ? 'text-red-400 border-red-500/20' : 'text-amber-400 border-amber-500/20'}
                      `}>
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[9px] font-bold tracking-[0.1em] text-white/30 uppercase opacity-60">Detected Behaviors</p>
                <div className="space-y-1.5">
                  {node.riskReasons.map((r, i) => (
                    <div key={i} className={`flex items-start gap-2 bg-white/[0.015] border border-white/[0.04] p-2.5 rounded-lg
                      ${node.riskLevel === 'High' ? 'hover:border-red-500/30' : 'hover:border-amber-500/30'} transition-colors`}>
                      <ShieldAlert className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${node.riskLevel === 'High' ? 'text-red-400' : 'text-amber-400'}`} />
                      <span className="text-[10px] text-white/70 leading-relaxed font-mono">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
             <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.05]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-[10px] text-emerald-400/80 leading-tight font-mono">No suspicious patterns detected. Baseline behavior.</span>
             </div>
          )}
        </div>
      )}

      {/* ── Metadata ── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2">
        <MetaRow label="Total Sent" value={`$${totalSent.toLocaleString()}`} valueClass="text-red-400 font-bold" />
        <MetaRow label="Total Received" value={`$${totalReceived.toLocaleString()}`} valueClass="text-emerald-400 font-bold" />
        <MetaRow label="Network Component" value={node.cluster} />
        <MetaRow label="Component Size" value={`${clusterSiblings.length + 1} entities`} />
        <MetaRow label="Direct Transfers" value={String(nodeEdges.length)} valueClass="text-[#00E5FF] font-bold" />
        <MetaRow label="Counterparties" value={String(connectedNodeIds.size)} />
      </div>

      {/* ── Network siblings ── */}
      {clusterSiblings.length > 0 && !isFrozen && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-3.5 h-3.5 text-white/50" strokeWidth={1.5} />
            <p className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase">NETWORK_MEMBERS</p>
            <span className="ml-auto text-[9px] font-mono text-white/30">{Math.min(clusterSiblings.length, 5)} OF {clusterSiblings.length}</span>
          </div>
          <div className="space-y-1.5 overflow-hidden">
            {clusterSiblings.slice(0, 5).map((sibling) => (
              <div key={sibling.id} className="flex items-center justify-between py-1.5 px-2.5 bg-white/[0.02] border border-white/10 rounded-lg group hover:border-white/20 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1 h-1 bg-[#00E5FF] rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-[9px] font-mono text-white/70 truncate uppercase">{sibling.id}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <CopyButton text={sibling.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Direct Transactions Logs ── */}
      {nodeEdges.length > 0 && !isFrozen && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="w-3.5 h-3.5 text-white/50" strokeWidth={1.5} />
            <p className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase">DIRECT_TRANSFERS</p>
            <span className="ml-auto text-[9px] font-mono text-white/30">{Math.min(nodeEdges.length, 8)} OF {nodeEdges.length}</span>
          </div>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {nodeEdges.slice(0, 8).map((edge, idx) => {
              const isOutgoing = edge.source === node.id || (typeof edge.source === 'object' && (edge.source as any).id === node.id);
              const counterparty = isOutgoing ? edge.target : edge.source;
              const counterpartyId = typeof counterparty === 'object' ? (counterparty as any).id : counterparty;
              
              return (
                <div key={idx} className="flex items-center justify-between py-1.5 px-2.5 bg-white/[0.02] border border-white/10 rounded-lg group hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <ArrowUpRight className={`w-3 h-3 flex-shrink-0 ${isOutgoing ? 'text-[#00E5FF]' : 'text-emerald-400 rotate-180'}`} />
                    <span className="text-[9px] font-mono text-white/70 truncate">{counterpartyId}</span>
                  </div>
                  <span className={`text-[10px] font-bold font-mono pl-2 flex-shrink-0 ${isOutgoing ? 'text-[#00E5FF]' : 'text-emerald-400'}`}>
                    ${(edge.amount || 0).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="mt-auto space-y-3">
        {isHighRisk && (
          <button className="w-full py-3 bg-[#00E5FF]/[0.08] border border-[#00E5FF]/25 text-[#00E5FF] text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:bg-[#00E5FF] hover:text-[#00050A] transition-all duration-300 shadow-lg">
            ⚑ FLAG FOR COMPLIANCE REVIEW
          </button>
        )}
        
        <button 
          onClick={() => {
            if (isFrozen) updateNode(node.id, { isActive: true });
            else handleFreeze();
          }}
          disabled={isFreezing}
          className={`w-full py-3 flex items-center justify-center gap-2 border text-[10px] font-black tracking-[0.25em] uppercase rounded-xl transition-all duration-300
            ${isFrozen 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-[#00050A] shadow-[0_0_20px_rgba(245,158,11,0.2)]'}`}
        >
          {isFreezing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {isFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isFrozen ? 'UNFREEZE ACCOUNT' : 'FREEZE ACCOUNT'}
            </>
          )}
        </button>
        
        <button 
          onClick={() => {
            const dataToExport = {
               ...node,
               metadata: {
                  exportTime: new Date().toISOString(),
                  system: "SHADOWFLOW_CORE_V2.1",
                  connectedEntities: Array.from(connectedNodeIds),
                  clusterSize: clusterSiblings.length + 1
               }
            };
            const jsonStr = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `shadowflow_dossier_${node.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="w-full py-3 bg-white/[0.02] border border-white/[0.08] text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300 shadow-lg"
        >
          ↓ EXPORT DOSSIER JSON
        </button>

        <p className="text-[8px] font-mono text-white/10 text-center uppercase tracking-widest">
          Action updates local core forensic state
        </p>
      </div>
    </div>
  );
}
