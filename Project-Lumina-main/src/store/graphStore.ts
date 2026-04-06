import { create } from 'zustand';

export type NodeData = {
  id: string;
  cluster: string;
  isSuspicious: boolean;
  isActive?: boolean;
  x?: number;
  y?: number;
  z?: number;
  totalSent?: number;
  totalReceived?: number;
  riskScore?: number;
  riskLevel?: 'High' | 'Medium' | 'Low';
  riskReasons?: string[];
  flags?: string[];
};

export type EdgeData = {
  source: string;
  target: string;
  strength: number;
  attribute: string;
  amount: number;
};

interface GraphState {
  nodes: NodeData[];
  edges: EdgeData[];
  xRayMode: boolean;
  filterRiskLevel: 'All' | 'High' | 'Medium' | 'Low';
  filterMinAmount: number;
  totalTransactions: number;
  highRiskUsersCount: number;
  setData: (nodes: NodeData[], edges: EdgeData[], metrics?: { totalTransactions: number, highRiskUsersCount: number }) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  setXRayMode: (enabled: boolean) => void;
  setFilterRiskLevel: (level: 'All' | 'High' | 'Medium' | 'Low') => void;
  setFilterMinAmount: (amount: number) => void;
  clear: () => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  xRayMode: false,
  filterRiskLevel: 'All',
  filterMinAmount: 0,
  totalTransactions: 0,
  highRiskUsersCount: 0,
  setData: (nodes, edges, metrics) => set({ 
    nodes, 
    edges, 
    totalTransactions: metrics?.totalTransactions || edges.length,
    highRiskUsersCount: metrics?.highRiskUsersCount || 0
  }),
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, ...data } : n)
  })),
  setXRayMode: (enabled) => set({ xRayMode: enabled }),
  setFilterRiskLevel: (level) => set({ filterRiskLevel: level }),
  setFilterMinAmount: (amount) => set({ filterMinAmount: amount }),
  clear: () => set({ nodes: [], edges: [], totalTransactions: 0, highRiskUsersCount: 0, filterRiskLevel: 'All', filterMinAmount: 0 })
}));
