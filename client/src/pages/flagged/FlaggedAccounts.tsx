import { useAppDispatch } from '../../store/hooks';
import { selectNode } from '../../store/graphSlice';
import { fetchVerdict } from '../../lib/fetchVerdict';
import { mockVerdicts } from '../../lib/mockVerdicts';
import { ShieldAlert, ExternalLink } from 'lucide-react';
import type { Verdict } from '../../types';

// Build the flagged list from mock data (will be replaced with real API data)
const flaggedAccounts = Object.values(mockVerdicts).filter(
  v => v.riskLevel === 'CRITICAL RISK' || v.riskLevel === 'HIGH RISK'
);

function getRiskBadgeColors(riskLevel: Verdict['riskLevel']): { bg: string; border: string; color: string } {
  if (riskLevel === 'CRITICAL RISK') return {
    bg: 'var(--color-status-danger-subtle)',
    border: 'var(--color-status-danger-border)',
    color: 'var(--color-status-danger)',
  };
  if (riskLevel === 'HIGH RISK') return {
    bg: 'var(--color-status-warning-subtle)',
    border: 'var(--color-status-warning-border)',
    color: 'var(--color-status-warning)',
  };
  return {
    bg: 'var(--color-bg-raised)',
    border: 'var(--color-border-subtle)',
    color: 'var(--color-text-muted)',
  };
}

export default function FlaggedAccounts() {
  const dispatch = useAppDispatch();

  const handleOpenVerdict = (nodeId: string) => {
    dispatch(selectNode(nodeId));
    dispatch(fetchVerdict(nodeId));
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Page header */}
      <div
        className="flex items-center gap-3 mb-6"
        style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <div
          className="flex items-center justify-center rounded-sm"
          style={{ width: 32, height: 32, background: 'var(--color-status-danger-subtle)', border: '1px solid var(--color-status-danger-border)' }}
        >
          <ShieldAlert size={16} style={{ color: 'var(--color-status-danger)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
            Flagged Accounts
          </h1>
          <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)' }}>
            {flaggedAccounts.length} accounts flagged — click any row to open the Verdict Panel
          </p>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-(--radius-lg) overflow-hidden"
        style={{ border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-card)' }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-[1fr_160px_120px_120px_48px] px-5 py-3"
          style={{
            background: 'var(--color-bg-surface)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          {['Account', 'Node Origin', 'Trust Score', 'Risk Level', ''].map(col => (
            <span
              key={col}
              className="uppercase tracking-wider"
              style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', fontWeight: 500 }}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {flaggedAccounts.map((account, i) => {
          const scoreValue = Math.round(account.trustScore * 100);
          const scoreColor = scoreValue < 30
            ? 'var(--color-status-danger)'
            : scoreValue < 60
              ? 'var(--color-status-warning)'
              : 'var(--color-status-safe)';

          return (
            <div
              key={account.nodeId}
              onClick={() => handleOpenVerdict(account.nodeId)}
              className="grid grid-cols-[1fr_160px_120px_120px_48px] items-center px-5 py-4 cursor-pointer transition-colors hover:bg-bg-raised group"
              style={{
                borderTop: i > 0 ? '1px solid var(--color-border-subtle)' : undefined,
              }}
            >
              {/* Account name + ID */}
              <div className="flex flex-col gap-0.5">
                <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {account.entityName}
                </span>
                <span
                  className="font-mono"
                  style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)' }}
                >
                  {account.nodeId}
                </span>
              </div>

              {/* Node origin */}
              <span
                className="font-mono"
                style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
              >
                {account.nodeOrigin}
              </span>

              {/* Trust score */}
              <div className="flex items-center gap-2">
                <span
                  className="font-mono"
                  style={{ fontSize: 'var(--font-size-body)', fontWeight: 600, color: scoreColor }}
                >
                  {scoreValue}
                </span>
                <div
                  className="flex-1 h-1 rounded-full overflow-hidden"
                  style={{ background: 'var(--color-bg-raised)', maxWidth: 48 }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${scoreValue}%`, background: scoreColor }}
                  />
                </div>
              </div>

              {/* Risk level badge */}
              <div>
                {(() => {
                  const { bg, border, color } = getRiskBadgeColors(account.riskLevel);
                  return (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${border}`,
                        background: bg,
                        color,
                        fontSize: 'var(--font-size-label)',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {account.riskLevel}
                    </span>
                  );
                })()}
              </div>

              {/* Open verdict icon */}
              <div className="flex justify-end">
                <ExternalLink
                  size={14}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--color-accent)' }}
                />
              </div>
            </div>
          );
        })}

        {flaggedAccounts.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ShieldAlert size={32} />
            <span style={{ fontSize: 'var(--font-size-body)' }}>No flagged accounts found</span>
          </div>
        )}
      </div>
    </div>
  );
}
