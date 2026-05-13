import type { GraphNode } from '../types';

interface NodeLegendProps {
  nodes: GraphNode[];
}

export default function NodeLegend({ nodes }: NodeLegendProps) {
  const flaggedCount = nodes.filter(n => n.status === 'flagged').length;
  const watchCount = nodes.filter(n => n.status === 'watch').length;
  const cleanCount = nodes.filter(n => n.status === 'clean').length;

  return (
    <div className="absolute bottom-4 left-4 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-[var(--spacing-md)] shadow-lg z-10 min-w-[200px]">
      <div className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] font-[var(--font-weight-medium)] tracking-wider mb-3">
        NODE LEGEND
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-status-safe)]" />
            <span className="text-[var(--font-size-body)] text-[var(--color-text-secondary)]">Verified Clean</span>
          </div>
          <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)]">({cleanCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-status-warning)]" />
            <span className="text-[var(--font-size-body)] text-[var(--color-text-secondary)]">Watch-list</span>
          </div>
          <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)]">({watchCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-status-danger)]" />
            <span className="text-[var(--font-size-body)] text-[var(--color-text-secondary)]">Flagged</span>
          </div>
          <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)]">({flaggedCount})</span>
        </div>
      </div>
    </div>
  );
}
