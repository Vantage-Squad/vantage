import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Transaction, Alert, DashboardMetrics, StreamStatus } from '../types';

interface DashboardState {
  transactions: Transaction[];
  metrics: DashboardMetrics;
  alerts: Alert[];
  streamStatus: StreamStatus;
}

const initialState: DashboardState = {
  transactions: [
    {
      id: 't1',
      name: 'J. Adeyemi',
      accountId: '8824-****-9210',
      amount: 12450.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      status: 'CRITICAL'
    },
    {
      id: 't2',
      name: 'B. Okonkwo',
      accountId: '4291-****-1102',
      amount: 3200.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'WARNING'
    },
    {
      id: 't3',
      name: 'T. Mensah',
      accountId: '5512-****-4432',
      amount: 850.22,
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      status: 'SAFE'
    },
    {
      id: 't4',
      name: 'A. Ibrahim',
      accountId: '1092-****-8841',
      amount: 19000.45,
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      status: 'CRITICAL'
    }
  ],
  alerts: [
    {
      id: 'a1',
      severity: 'critical',
      title: 'Velocity Threshold Exceeded',
      description: 'Account 8824-****-9210 initiated 14 transfers in 2 minutes.',
      timestamp: '2m ago',
      actions: [{ label: 'Freeze', variant: 'primary' }, { label: 'Dismiss', variant: 'ghost' }]
    },
    {
      id: 'a2',
      severity: 'warning',
      title: 'Impossible Travel Detection',
      description: 'Login from Lagos and London within 10 minutes.',
      timestamp: '14m ago',
      actions: [{ label: 'View Cluster', variant: 'ghost' }, { label: 'Dismiss', variant: 'ghost' }]
    },
    {
      id: 'a3',
      severity: 'critical',
      title: 'Known Fraud Network Match',
      description: 'Counterparty associated with flagged syndicate Alpha-7.',
      timestamp: '1h ago',
      actions: [{ label: 'Freeze', variant: 'primary' }, { label: 'Dismiss', variant: 'ghost' }]
    }
  ],
  metrics: {
    flagged: 142,
    flaggedDelta: '+12% from previous hour',
    watch: 2841,
    cleared: 89203
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

      if (action.payload.status === 'CRITICAL' || action.payload.status === 'WARNING') {
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
