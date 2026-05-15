import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Transaction, Alert, DashboardMetrics, StreamStatus } from '../types';

interface DashboardState {
  transactions: Transaction[];
  metrics: DashboardMetrics;
  alerts: Alert[];
  streamStatus: StreamStatus;
}

const initialState: DashboardState = {
  transactions: [],
  alerts: [],
  metrics: {
    flagged: 0,
    flaggedDelta: '0% from previous hour',
    watch: 0,
    cleared: 0
  },
  streamStatus: 'offline'
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    incomingTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
      if (state.transactions.length > 50) {
        state.transactions.pop();
      }

      if (action.payload.status === 'CRITICAL' || action.payload.status === 'HIGH_RISK') {
        state.metrics.flagged += 1;
      }
      if (action.payload.status !== 'SAFE') {
        state.metrics.watch += 1;
      } else {
        state.metrics.cleared += 1;
      }
    },
    setStreamStatus: (state, action: PayloadAction<StreamStatus>) => {
      state.streamStatus = action.payload;
    },
    dismissAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(a => a.id !== action.payload);
    },
    incomingAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload);
      if (state.alerts.length > 20) {
        state.alerts.pop();
      }
    }
  }
});

export const { incomingTransaction, setStreamStatus, dismissAlert, incomingAlert } = dashboardSlice.actions;
export default dashboardSlice.reducer;
