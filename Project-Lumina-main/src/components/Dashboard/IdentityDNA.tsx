"use client";

import { useState, useRef } from 'react';
import { UploadCloud, Loader2, AlertTriangle, CheckCircle2, FileSpreadsheet, X } from 'lucide-react';
import { useGraphStore } from '@/store/graphStore';

interface IdentityDNAProps {
  onStatusChange: (status: string) => void;
  onClusterCountChange: (count: number) => void;
}

export function IdentityDNA({ onStatusChange, onClusterCountChange }: IdentityDNAProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const { setData, nodes, edges, clear, xRayMode, setXRayMode, totalTransactions, highRiskUsersCount } = useGraphStore();

  const processFile = async (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);
    setIsDone(false);
    setError(null);
    setProgress({ processed: 0, total: 0 });
    onStatusChange('UPLOADING FILE...');

    const buffer = await file.arrayBuffer();
    const worker = new Worker(new URL('../../workers/identityResolver.worker.ts', import.meta.url));

    worker.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'STATUS') {
        onStatusChange(payload);
      } else if (type === 'PROGRESS') {
        setProgress(payload);
      } else if (type === 'COMPLETE') {
        onStatusChange('SHADOWFLOW ZERO-TRUST ONLINE. IDENTITY CLUSTERS ISOLATED.');
        onClusterCountChange(payload.clusterCount);
        setData(payload.nodes, payload.edges, { 
          totalTransactions: payload.totalTransactions, 
          highRiskUsersCount: payload.highRiskUsersCount 
        });
        setIsProcessing(false);
        setIsDone(true);
        worker.terminate();
      } else if (type === 'ERROR') {
        onStatusChange('RESOLUTION FAILED.');
        setError(payload);
        setIsProcessing(false);
        worker.terminate();
      }
    };

    worker.postMessage({ fileBuffer: buffer });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleReset = () => {
    clear();
    setIsDone(false);
    setFileName(null);
    setProgress({ processed: 0, total: 0 });
    onStatusChange('AWAITING PARSE');
    onClusterCountChange(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pct = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  return (
    <div className="flex flex-col p-5 space-y-5 h-full">
      {/* ── Section title ── */}
      <div>
        <div className="text-[10px] font-bold tracking-[0.25em] text-[#00E5FF]/60 mb-1 uppercase">Transaction Mapper</div>
        <p className="text-[11px] text-white/30 leading-relaxed">
          Upload transaction logs for money flow mapping. Supported: .xlsx, .csv
        </p>
      </div>

      {/* ── Upload Zone ── */}
      <div
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 overflow-hidden min-h-[150px]
          ${isDragging ? 'border-[#00E5FF] bg-[#00E5FF]/[0.07] shadow-[0_0_30px_rgba(0,229,255,0.1)]' : ''}
          ${isProcessing ? 'border-[#00E5FF]/30 bg-[#00E5FF]/[0.04] cursor-default' : ''}
          ${isDone ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : ''}
          ${!isProcessing && !isDone && !isDragging ? 'border-white/[0.08] hover:border-[#00E5FF]/25 hover:bg-white/[0.02]' : ''}
        `}
      >
        {/* Progress bar fill */}
        {isProcessing && (
          <div
            className="absolute bottom-0 left-0 h-0.5 bg-[#00E5FF] transition-all duration-300 shadow-[0_0_8px_rgba(0,229,255,0.8)]"
            style={{ width: `${pct}%` }}
          />
        )}

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 text-[#00E5FF] py-4">
            <Loader2 className="w-8 h-8 animate-spin" strokeWidth={1.5} />
            <div className="text-center">
              <p className="text-[11px] font-bold tracking-widest">EXTRACTING MATRICES</p>
              {progress.total > 0 && (
                <p className="text-[10px] mt-1 opacity-60 font-mono">
                  {progress.processed.toLocaleString()} / {progress.total.toLocaleString()} rows · {pct}%
                </p>
              )}
            </div>
          </div>
        ) : isDone ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
            <div>
              <p className="text-[11px] font-bold tracking-widest text-emerald-400">SCAN COMPLETE</p>
              <p className="text-[10px] text-white/30 mt-0.5 font-mono truncate max-w-[220px]">{fileName}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors border border-white/10 hover:border-white/20 px-3 py-1 rounded"
            >
              <X className="w-3 h-3" /> RESET SCAN
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl group-hover:border-[#00E5FF]/20 transition-all">
              <UploadCloud className="w-7 h-7 text-[#00E5FF]/50" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold tracking-wider text-white/50">
                {isDragging ? 'DROP FILE TO SCAN' : 'DROP DATASET OR CLICK'}
              </p>
              <p className="text-[10px] text-white/20 font-mono mt-0.5">.xlsx · .xls · .csv · up to 200k rows</p>
            </div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls"
          className="hidden"
        />
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex gap-2.5 p-3.5 bg-red-950/30 border border-red-500/25 rounded-lg animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-[11px] text-red-400/80 leading-relaxed font-mono">{error}</p>
        </div>
      )}

      {/* ── Metrics ── */}
      <div className="space-y-3">
        <div className="text-[10px] font-bold tracking-[0.2em] text-white/25 uppercase">Graph Metrics</div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'ENTITIES', value: nodes.length, color: 'text-white' },
            { label: 'LINKS', value: edges.length, color: 'text-[#00E5FF]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3.5 text-center">
              <p className="text-[9px] font-bold tracking-[0.15em] text-white/25 mb-1.5">{label}</p>
              <p className={`text-2xl font-black ${color} leading-none`}>
                {value > 0 ? value.toLocaleString() : '--'}
              </p>
            </div>
          ))}
        </div>

        {/* Suspicious rate replaced by total volume indicator -> Replaced by X-Ray Intelligence Dashboard */}
        {nodes.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold tracking-[0.2em] text-[#00E5FF] uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">X-RAY ANALYSIS MODE</div>
              <button 
                onClick={() => setXRayMode(!xRayMode)}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all duration-300 shadow-inner ${xRayMode ? 'bg-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.8)]' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform duration-300 ${xRayMode ? 'translate-x-4 border border-white' : 'translate-x-0.5 border border-white/30'}`} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'SUSPICIOUS %', value: `${((highRiskUsersCount / nodes.length) * 100).toFixed(1)}%`, color: 'text-red-400' },
                { label: 'FLAGGED NODES', value: highRiskUsersCount, color: 'text-amber-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`bg-white/[0.02] border rounded-lg p-3.5 text-center transition-all duration-500 ${xRayMode ? 'border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.05)] bg-[#00E5FF]/[0.02]' : 'border-white/[0.06]'}`}>
                  <p className="text-[9px] font-bold tracking-[0.15em] text-white/25 mb-1.5">{label}</p>
                  <p className={`text-xl font-black ${xRayMode ? color : 'text-white/40'} leading-none transition-colors duration-500`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="mt-auto space-y-2 border-t border-white/[0.06] pt-4">
        <div className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase mb-3">Node Legend</div>
        {[
          { color: 'bg-[#00E5FF]', glow: 'shadow-[0_0_6px_rgba(0,229,255,0.8)]', label: 'High Volume Account (> $50k)', pulse: true },
          { color: 'bg-white/30', glow: '', label: 'Standard Account', pulse: false },
        ].map(({ color, glow, label, pulse }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-sm ${color} ${glow} ${pulse ? 'animate-pulse' : ''} flex-shrink-0 rotate-30`} style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
            <span className="text-[10px] text-white/30 font-mono">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
