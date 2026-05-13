export type TransactionStatus = 'CRITICAL' | 'WARNING' | 'SAFE';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type StreamStatus = 'connecting' | 'live' | 'reconnecting' | 'offline';

export interface Transaction {
  id: string;
  name: string;
  accountId: string;         // masked format: "8824-****-9210"
  amount: number;
  timestamp: string;         // ISO UTC string
  status: TransactionStatus;
  avatarUrl?: string;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;         // relative label e.g. "2m ago"
  actions?: Array<{ label: string; variant: 'primary' | 'ghost' }>;
}

export interface DashboardMetrics {
  flagged: number;
  flaggedDelta: string;       // e.g. "+12% from previous hour"
  watch: number;
  cleared: number;
}
