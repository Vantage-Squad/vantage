import { CheckCircle2 } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { useMemo } from 'react';

interface NetworkVelocityBarProps {
  tps: number;
  label: 'Normal' | 'Elevated' | 'Critical';
}

export default function NetworkVelocityBar({ tps, label }: NetworkVelocityBarProps) {
  const transactions = useAppSelector(state => state.dashboard.transactions);

  // Get 3 most recent SAFE transactions
  const recentSafe = useMemo(() => {
    return transactions.filter(t => t.status === 'SAFE').slice(0, 3);
  }, [transactions]);

  // Generate stable mock latencies
  const latencies = useMemo(() => {
    return recentSafe.map(() => (Math.random() * 1.5).toFixed(1) + "ms");
  }, [recentSafe]);

  const getLabelColor = () => {
    switch (label) {
      case 'Normal': return 'text-[var(--color-status-safe)]';
      case 'Elevated': return 'text-[var(--color-status-warning)]';
      case 'Critical': return 'text-[var(--color-status-danger)]';
      default: return 'text-[var(--color-text-secondary)]';
    }
  };

  return (
    <div className="w-full h-12 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-subtle)] flex items-center px-[var(--spacing-lg)] shrink-0">
      <div className="flex items-center gap-3 w-1/3">
        <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] font-[var(--font-weight-medium)] tracking-wider">
          NETWORK VELOCITY
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-[var(--font-size-subheading)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)]">
            {tps} TPS
          </span>
          <span className={`text-[var(--font-size-caption)] ${getLabelColor()}`}>
            {label}
          </span>
        </div>
      </div>
      
      <div className="flex-1 flex justify-end">
        <div className="flex h-full items-center">
          {recentSafe.map((txn, idx) => (
            <div key={txn.id} className="flex items-center">
              {idx > 0 && <div className="h-6 w-px bg-[var(--color-border-subtle)] mx-4" />}
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[var(--color-status-safe)]" />
                <div className="flex flex-col">
                  <span className="text-[var(--font-size-mono)] text-[var(--color-text-primary)] leading-tight">
                    TXN_{txn.id}_OK
                  </span>
                  <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] leading-tight">
                    Validated by Peer #{10 + idx}
                  </span>
                </div>
                <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] w-8 text-right font-mono">
                  {latencies[idx]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
