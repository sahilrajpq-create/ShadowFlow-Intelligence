"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useGraphStore, NodeData } from '@/store/graphStore';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface TransactionCanvasProps {
  clusterCount: number;
  onNodeSelect: (node: NodeData | null) => void;
  selectedNode: NodeData | null;
  targetNodeId?: string | null;
}

export function TransactionCanvas({ clusterCount, onNodeSelect, selectedNode, targetNodeId }: TransactionCanvasProps) {
  const { nodes, edges, xRayMode, filterRiskLevel, filterMinAmount, setFilterRiskLevel, setFilterMinAmount } = useGraphStore();
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Configure the force engine physics to push nodes nicely
  useEffect(() => {
    if (fgRef.current) {
      // Manage repulsion to be reasonable so disjoint subgraphs don't fly to infinity
      fgRef.current.d3Force('charge').strength(-150);
      fgRef.current.d3Force('link').distance(70);
    }
  }, [nodes.length]); // re-run if graph scale changes significantly

  // Handle resizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Format nodes and links for react-force-graph
  const graphData = useMemo(() => {
    const formattedNodes = nodes.map(n => ({ ...n }));
    const formattedLinks = edges.map(e => ({
      ...e,
      source: e.source,
      target: e.target
    }));
    return { nodes: formattedNodes, links: formattedLinks };
  }, [nodes, edges]);

  const connectedIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const ids = new Set<string>();
    ids.add(selectedNode.id);
    edges.forEach(e => {
      if (e.source === selectedNode.id) ids.add(e.target);
      if (e.target === selectedNode.id) ids.add(e.source);
    });
    return ids;
  }, [selectedNode, edges]);

  // Handle external search targeting. Pan and Zoom beautifully to the node.
  useEffect(() => {
    if (targetNodeId && fgRef.current) {
      const targetNode = graphData.nodes.find((n: any) => n.id === targetNodeId);
      if (targetNode && targetNode.x !== undefined && targetNode.y !== undefined) {
        fgRef.current.centerAt(targetNode.x, targetNode.y, 1000);
        fgRef.current.zoom(4, 1000);
        onNodeSelect(targetNode as NodeData);
      }
    }
  }, [targetNodeId, graphData.nodes, onNodeSelect]);

  const handleNodeClick = useCallback((node: any) => {
    onNodeSelect(node);
    if (fgRef.current && node.x !== undefined && node.y !== undefined) {
      fgRef.current.centerAt(node.x, node.y, 800);
      fgRef.current.zoom(3, 800);
    }
  }, [onNodeSelect]);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode?.id === node.id;
    const volume = (node.totalSent || 0) + (node.totalReceived || 0);

    let isFilteredOut = false;
    if (filterRiskLevel !== 'All' && node.riskLevel !== filterRiskLevel) isFilteredOut = true;
    if (volume < filterMinAmount) isFilteredOut = true;

    const isDimmed = (selectedNode !== null && !connectedIds.has(node.id)) || isFilteredOut;
    
    // Scale node based on volume - stabilized size
    let baseRadius = 4;
    if (xRayMode && node.riskLevel === 'High') baseRadius = 6;
    const radius = volume > 0 ? baseRadius + Math.log10(volume) * 1.5 : baseRadius;

    // Base Colors (Cyan/White) when X-Ray is off
    let fillStyle = node.isSuspicious ? '#00E5FF' : '#ffffff';
    let ringColor = '#00E5FF';
    let shadowColor = node.isSuspicious ? '#00E5FF' : 'transparent';
    let alphaMultiplier = node.isSuspicious ? 0.9 : 0.4;

    // Apply Fraud Colors when X-Ray is ON
    if (xRayMode) {
      if (node.riskLevel === 'High') {
         fillStyle = '#EF4444'; 
         shadowColor = '#EF4444';
         ringColor = '#EF4444';
         alphaMultiplier = 1;
      } else if (node.riskLevel === 'Medium') {
         fillStyle = '#F59E0B'; 
         shadowColor = '#F59E0B';
         ringColor = '#F59E0B';
         alphaMultiplier = 0.8;
      } else {
         fillStyle = '#10B981'; 
         shadowColor = 'transparent';
         ringColor = '#10B981';
         alphaMultiplier = 0.15; // Low risk items fade slightly back
      }
    }

    if (isSelected) fillStyle = '#ffffff';

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    
    // Dim logic heavily overrides alpha
    if (isFilteredOut) {
       ctx.globalAlpha = 0.02; // Practically invisible
    } else if (isDimmed) {
      ctx.globalAlpha = xRayMode && node.riskLevel === 'High' ? 0.15 : 0.05; // Slightly more visible if high risk in dim mode
    } else if (isSelected) {
      ctx.globalAlpha = 1;
      
      // Outer glow for selected
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      
      // Outline ring
      ctx.lineWidth = 1;
      ctx.strokeStyle = ringColor;
      ctx.stroke();
    } else {
      ctx.globalAlpha = alphaMultiplier;
      if (shadowColor !== 'transparent') {
        ctx.shadowColor = shadowColor;
        // high risk pulses more
        ctx.shadowBlur = (node.riskLevel === 'High') ? 15 : 10;
      }
    }

    ctx.fill();
    ctx.globalAlpha = 1; // reset alpha
    ctx.shadowBlur = 0; // reset shadow
    
    // Label drawing (removed the zoom scale constraint so labels are always visible)
    if (!isDimmed) {
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      let labelColor = isSelected ? '#ffffff' : (node.isSuspicious ? '#00E5FF' : 'rgba(255, 255, 255, 0.7)');
      if (xRayMode) {
         if (node.riskLevel === 'High') labelColor = '#EF4444';
         else if (node.riskLevel === 'Medium') labelColor = '#F59E0B';
         else labelColor = 'rgba(16, 185, 129, 0.7)';
      }
      ctx.fillStyle = isSelected ? '#ffffff' : labelColor;
      
      // Background pill for label contrast
      const label = node.id;
      const bckgDimensions = ctx.measureText(label);
      ctx.fillStyle = 'rgba(0, 5, 10, 0.6)';
      ctx.fillRect(node.x - bckgDimensions.width / 2 - 2, node.y + radius + fontSize / 2 - 2, bckgDimensions.width + 4, fontSize + 4);
      
      ctx.fillStyle = isSelected ? '#ffffff' : labelColor;
      ctx.fillText(label, node.x, node.y + radius + fontSize);
    }
  }, [selectedNode, connectedIds, xRayMode]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-[#00050A]" onClick={() => onNodeSelect(null)}>
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        backgroundColor="#00050A"
        
        nodeRelSize={4}
        nodeCanvasObject={paintNode}
        
        // Link mapping
        linkColor={(link: any) => {
          const sourceVol = (link.source.totalSent || 0) + (link.source.totalReceived || 0);
          const targetVol = (link.target.totalSent || 0) + (link.target.totalReceived || 0);
          const sourceFiltered = (filterRiskLevel !== 'All' && link.source.riskLevel !== filterRiskLevel) || sourceVol < filterMinAmount;
          const targetFiltered = (filterRiskLevel !== 'All' && link.target.riskLevel !== filterRiskLevel) || targetVol < filterMinAmount;
          
          if (sourceFiltered || targetFiltered) return 'transparent';
          
          const isRelated = selectedNode && (link.source.id === selectedNode.id || link.target.id === selectedNode.id);
          if (selectedNode && !isRelated) return 'rgba(255, 255, 255, 0.02)';
          return isRelated ? '#ffffff' : 'rgba(0, 229, 255, 0.2)';
        }}
        linkWidth={(link: any) => {
          const isRelated = selectedNode && (link.source.id === selectedNode.id || link.target.id === selectedNode.id);
          const base = Math.max(0.2, Math.min((link.amount || 0) / 10000, 3));
          return isRelated ? Math.max(1, base * 1.5) : base;
        }}
        
        // Animated particles for money flow
        linkDirectionalParticles={(link: any) => {
          const sourceVol = (link.source.totalSent || 0) + (link.source.totalReceived || 0);
          const targetVol = (link.target.totalSent || 0) + (link.target.totalReceived || 0);
          if ((filterRiskLevel !== 'All' && link.source.riskLevel !== filterRiskLevel) || sourceVol < filterMinAmount) return 0;
          if ((filterRiskLevel !== 'All' && link.target.riskLevel !== filterRiskLevel) || targetVol < filterMinAmount) return 0;

          const isRelated = selectedNode && (link.source.id === selectedNode.id || link.target.id === selectedNode.id);
          if (selectedNode && !isRelated) return 0;
          return Math.min(Math.floor((link.amount || 0) / 10000) + 1, 5); // 1 to 5 particles max
        }}
        linkDirectionalParticleSpeed={(link: any) => Math.max(0.005, Math.min(link.amount / 1000000, 0.015))}
        linkDirectionalParticleWidth={(link: any) => {
           const isRelated = selectedNode && (link.source.id === selectedNode.id || link.target.id === selectedNode.id);
           return isRelated ? 3 : 2;
        }}
        linkDirectionalParticleColor={(link: any) => {
           const isRelated = selectedNode && (link.source.id === selectedNode.id || link.target.id === selectedNode.id);
           return isRelated ? '#ffffff' : '#00E5FF';
        }}
        
        // Tooltip and Amount Drawing
        linkLabel={(link: any) => `Transfer: $${(link.amount || 0).toLocaleString()}`}
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const sourceVol = (link.source.totalSent || 0) + (link.source.totalReceived || 0);
          const targetVol = (link.target.totalSent || 0) + (link.target.totalReceived || 0);
          if ((filterRiskLevel !== 'All' && link.source.riskLevel !== filterRiskLevel) || sourceVol < filterMinAmount) return;
          if ((filterRiskLevel !== 'All' && link.target.riskLevel !== filterRiskLevel) || targetVol < filterMinAmount) return;

          const start = link.source;
          const end = link.target;
            
            // ignore unbound links
            if (typeof start !== 'object' || typeof end !== 'object') return;
            
            const textPos = { x: start.x + (end.x - start.x) / 2, y: start.y + (end.y - start.y) / 2 };
            const relLink = { x: end.x - start.x, y: end.y - start.y };
            let textAngle = Math.atan2(relLink.y, relLink.x);
            // keep text upright
            if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
            if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

            const label = `$${(link.amount || 0).toLocaleString()}`;
            const fontSize = 10 / globalScale;
            ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
            ctx.fillStyle = '#00E5FF';
            
            ctx.save();
            ctx.translate(textPos.x, textPos.y);
            ctx.rotate(textAngle);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Background for readability
            const bckgDimensions = ctx.measureText(label);
            ctx.fillStyle = 'rgba(0, 5, 10, 0.8)';
            ctx.fillRect(-bckgDimensions.width / 2 - 2, -fontSize / 2 - 2, bckgDimensions.width + 4, fontSize + 4);
            ctx.fillStyle = '#00E5FF';
            ctx.fillText(label, 0, 0);
            
            ctx.restore();
        }}
        
        // Force engine settings
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={100}
        
        // Interactions
        onNodeClick={handleNodeClick}
        onBackgroundClick={() => onNodeSelect(null)}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
      
      {/* Floating Toolbar inside graph for actions */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-black/60 border border-white/[0.05] p-2 rounded-xl backdrop-blur-xl shadow-2xl">
        <button 
          onClick={(e) => { e.stopPropagation(); fgRef.current?.zoomToFit(800, 50); }}
          className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-white/50 hover:text-white hover:bg-white/5 rounded transition-all"
        >
          ZOOM FIT
        </button>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            // Give a little "pulse" to the simulation to redistribute nodes if they drag them weirdly
            fgRef.current?.d3ReheatSimulation(); 
          }}
          className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-[#00E5FF]/70 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 rounded transition-all"
        >
          REBALANCE
        </button>
      </div>

      {/* Floating Filter Panel */}
      <div className="absolute top-20 right-6 flex flex-col gap-3 bg-black/60 border border-white/[0.05] p-4 rounded-xl backdrop-blur-xl shadow-2xl w-56 z-20" onClick={e => e.stopPropagation()}>
         <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-white">INTELLIGENCE FILTERS</h3>
         </div>
         
         <div className="space-y-1">
            <label className="text-[8px] font-mono tracking-widest text-white/40 uppercase">Risk Level</label>
            <select 
              value={filterRiskLevel} 
              onChange={(e) => setFilterRiskLevel(e.target.value as any)}
              className="w-full bg-white/[0.02] border border-white/10 text-xs text-white p-2 rounded outline-none focus:border-[#00E5FF]/50 transition-colors cursor-pointer"
            >
              <option value="All" className="bg-[#00050A]">ALL RISKS</option>
              <option value="High" className="bg-[#00050A]">HIGH RISK</option>
              <option value="Medium" className="bg-[#00050A]">MEDIUM RISK</option>
              <option value="Low" className="bg-[#00050A]">LOW RISK</option>
            </select>
         </div>

         <div className="space-y-1 mt-2">
            <div className="flex justify-between items-end">
               <label className="text-[8px] font-mono tracking-widest text-white/40 uppercase">Volume Floor</label>
               <span className="text-[10px] font-mono text-[#00E5FF]">${filterMinAmount.toLocaleString()}</span>
            </div>
            <input 
              type="range" min="0" max="100000" step="5000"
              value={filterMinAmount}
              onChange={(e) => setFilterMinAmount(Number(e.target.value))}
              className="w-full accent-[#00E5FF] cursor-pointer"
            />
         </div>
      </div>

      {clusterCount > 100 && (
        <div className="absolute bottom-20 right-6 px-4 py-2 bg-black/60 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs tracking-widest backdrop-blur shadow-[0_0_15px_rgba(0,229,255,0.2)] rounded pointer-events-none">
          MACRO VIEW ACTIVE
        </div>
      )}
    </div>
  );
}
