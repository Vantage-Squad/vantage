import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GraphData, Verdict, VerdictStatus, KillSwitchState } from '../types';

interface GraphState {
  graphData: GraphData;
  selectedNodeId: string | null;
  verdict: Verdict | null;
  verdictStatus: VerdictStatus;
  killSwitchState: KillSwitchState;
  networkVelocity: { tps: number; label: 'Normal' | 'Elevated' | 'Critical' };
}

const initialState: GraphState = {
  graphData: {
    nodes: [
      { id: "992-XFA", label: "J. Adeyemi", type: "account", status: "flagged", trustScore: 12, accountId: "8824-****-9210" },
      { id: "412-Z", label: "B. Okonkwo", type: "account", status: "watch", trustScore: 44, accountId: "4291-****-1102" },
      { id: "771-M", label: "T. Mensah", type: "account", status: "clean", trustScore: 81, accountId: "5512-****-4432" },
      { id: "8842-X", label: "A. Ibrahim", type: "account", status: "flagged", trustScore: 9, accountId: "1092-****-8841" },
      { id: "IP-001", label: "IP 41.58.x.x", type: "ip", status: "flagged" },
      { id: "IP-002", label: "IP 196.3.x.x", type: "ip", status: "watch" },
      { id: "DEV-001", label: "Device Ghost_Node_91", type: "device", status: "flagged" },
    ],
    edges: [
      { id: "e1", source: "992-XFA", target: "8842-X", suspicious: true, weight: 14 },
      { id: "e2", source: "8842-X", target: "IP-001", suspicious: true, weight: 8 },
      { id: "e3", source: "992-XFA", target: "DEV-001", suspicious: true, weight: 6 },
      { id: "e4", source: "412-Z", target: "IP-002", suspicious: false, weight: 3 },
      { id: "e5", source: "771-M", target: "IP-002", suspicious: false, weight: 2 },
      { id: "e6", source: "8842-X", target: "DEV-001", suspicious: true, weight: 5 },
    ]
  },
  selectedNodeId: null,
  verdict: null,
  verdictStatus: 'idle',
  killSwitchState: 'idle',
  networkVelocity: { tps: 84.2, label: 'Normal' },
};

const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
      state.verdictStatus = 'idle';
      state.verdict = null;
    },
    setVerdictLoading: (state) => {
      state.verdictStatus = 'loading';
    },
    setVerdictSuccess: (state, action: PayloadAction<Verdict>) => {
      state.verdict = action.payload;
      state.verdictStatus = 'success';
    },
    setVerdictError: (state) => {
      state.verdictStatus = 'error';
    },
    setKillSwitchState: (state, action: PayloadAction<KillSwitchState>) => {
      state.killSwitchState = action.payload;
    },
    updateGraphData: (state, action: PayloadAction<GraphData>) => {
      state.graphData = action.payload;
    }
  }
});

export const {
  selectNode,
  setVerdictLoading,
  setVerdictSuccess,
  setVerdictError,
  setKillSwitchState,
  updateGraphData
} = graphSlice.actions;

export default graphSlice.reducer;
