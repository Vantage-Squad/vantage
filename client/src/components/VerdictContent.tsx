import { useEffect, useState, useMemo } from 'react';
import { X, Terminal, MoreHorizontal, Loader2 } from 'lucide-react';
import type { Verdict, VerdictStatus, KillSwitchState, RiskIndicator, TransactionStatus } from '../types';
import AccountChip from './AccountChip';
import StatusBadge from './StatusBadge';

// --- Sub-components ---

function TrustScoreBar({ score, colorClass, indicators }: { score: number, colorClass: string, indicators: RiskIndicator[] }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Animate to target width after mount
    const timer = setTimeout(() => {
      setWidth(score * 100);
    }, 50);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Bar */}
      <div className="w-full h-1.5 bg-[var(--color-bg-raised)] rounded-[var(--radius-full)] overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-800 ease-out`} 
          style={{ width: `${width}%` }} 
        />
      </div>

      {/* Indicators */}
      <div className="flex flex-col gap-3">
        {indicators.map((ind, idx) => {
          const isNegative = ind.score < 0;
          const scoreStr = (ind.score > 0 ? '+' : '') + ind.score.toFixed(2);
          const scoreColor = isNegative ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-safe)]';
          const maxMagnitude = 0.6;
          const magnitudePercent = Math.min((Math.abs(ind.score) / maxMagnitude) * 100, 100);

          return (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[var(--font-size-caption)]">
                <span className="text-[var(--color-text-secondary)]">{ind.label}</span>
                <span className={`font-[var(--font-weight-medium)] ${scoreColor}`}>{scoreStr}</span>
              </div>
              <div className="w-full h-0.5 bg-[var(--color-bg-raised)] rounded-[var(--radius-full)] overflow-hidden">
                <div 
                  className={`h-full ${isNegative ? 'bg-[var(--color-status-danger)]' : 'bg-[var(--color-status-safe)]'}`} 
                  style={{ width: `${magnitudePercent}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerdictString({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText('');
    
    const intervalId = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 18);

    return () => clearInterval(intervalId);
  }, [text]);

  const renderFormattedText = () => {
    const lines = displayedText.split('\n');
    return lines.map((line, i) => {
      // Style recommendations
      if (line.startsWith('//')) {
        return (
          <span key={i} className="block text-[var(--color-text-muted)] italic mt-2">
            {line}
          </span>
        );
      }
      
      // Inline highlights (simple regex for IDs or quotes)
      const parts = line.split(/(992-XFA|8842-X|"Ghost_Node_91"|'Raven-04')/g);
      
      return (
        <span key={i} className="block mb-2">
          {parts.map((part, j) => {
            if (['992-XFA', '8842-X', '"Ghost_Node_91"', "'Raven-04'"].includes(part)) {
              return (
                <span key={j} className="text-[var(--color-status-warning)] bg-[var(--color-bg-raised)] px-1 py-0.5 rounded-[var(--radius-sm)] font-mono text-[var(--font-size-caption)]">
                  {part}
                </span>
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <div className="text-[var(--font-size-body)] text-[var(--color-text-primary)] leading-relaxed font-mono">
      {renderFormattedText()}
      {displayedText.length < text.length && <span className="animate-pulse">|</span>}
    </div>
  );
}

function KillSwitchButton({ 
  state, 
  riskLevel, 
  onStateChange 
}: { 
  state: KillSwitchState, 
  riskLevel: Verdict['riskLevel'],
  onStateChange: (newState: KillSwitchState) => void 
}) {
  const isCritical = riskLevel === 'CRITICAL RISK';
  const defaultLabel = isCritical ? '⚡ INITIATE FREEZE' : 'FLAG FOR REVIEW';

  const handleClick = () => {
    if (state === 'idle') onStateChange('confirm');
    else if (state === 'confirm') {
      onStateChange('processing');
      setTimeout(() => onStateChange('done'), 1500);
    }
  };

  if (state === 'done') {
    return (
      <button disabled className="w-full py-3 rounded-[var(--radius-default)] bg-[var(--color-status-safe-subtle)] border border-[var(--color-status-safe-border)] text-[var(--color-status-safe)] text-[var(--font-size-body)] font-[var(--font-weight-medium)] flex items-center justify-center transition-all cursor-not-allowed">
        ✓ Account Frozen
      </button>
    );
  }

  if (state === 'processing') {
    return (
      <button disabled className="w-full py-3 rounded-[var(--radius-default)] bg-[var(--color-status-warning-subtle)] border border-[var(--color-status-warning-border)] text-[var(--color-status-warning)] text-[var(--font-size-body)] font-[var(--font-weight-medium)] flex items-center justify-center gap-2 transition-all cursor-wait">
        <Loader2 size={16} className="animate-spin" />
        Processing...
      </button>
    );
  }

  if (state === 'confirm') {
    return (
      <button 
        onClick={handleClick}
        className="w-full py-3 rounded-[var(--radius-default)] bg-[var(--color-status-warning-subtle)] border border-[var(--color-status-warning-border)] text-[var(--color-status-warning)] text-[var(--font-size-body)] font-[var(--font-weight-medium)] transition-all"
      >
        Confirm Freeze? Click again to proceed
      </button>
    );
  }

  return (
    <button 
      onClick={handleClick}
      className="w-full py-3 rounded-[var(--radius-default)] bg-[var(--color-status-danger-subtle)] border border-[var(--color-status-danger-border)] text-[var(--color-status-danger)] hover:bg-[var(--color-status-danger)] hover:text-white text-[var(--font-size-body)] font-[var(--font-weight-medium)] transition-all"
    >
      {defaultLabel}
    </button>
  );
}

// --- Main Component ---

export interface VerdictContentProps {
  verdict: Verdict;
  verdictStatus: VerdictStatus;
  killSwitchState: KillSwitchState;
  onKillSwitch: (newState: KillSwitchState) => void;
  onMarkFalsePositive: () => void;
  onClose?: () => void;
  mode: 'sidebar' | 'fullpage';
}

export default function VerdictContent({
  verdict,
  verdictStatus,
  killSwitchState,
  onKillSwitch,
  onMarkFalsePositive,
  onClose,
  mode
}: VerdictContentProps) {
  
  const scoreValue = Math.round(verdict.trustScore * 100);
  let scoreColorClass = 'bg-[var(--color-status-safe)]';
  let scoreTextColor = 'text-[var(--color-status-safe)]';
  
  if (scoreValue < 40) {
    scoreColorClass = 'bg-[var(--color-status-danger)]';
    scoreTextColor = 'text-[var(--color-status-danger)]';
  } else if (scoreValue < 70) {
    scoreColorClass = 'bg-[var(--color-status-warning)]';
    scoreTextColor = 'text-[var(--color-status-warning)]';
  }

  const getRiskVariant = (risk: string): TransactionStatus => {
    if (risk.includes('CRITICAL')) return 'CRITICAL';
    if (risk.includes('HIGH')) return 'HIGH_RISK';
    return 'SAFE';
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-raised)] flex items-center justify-center text-[var(--color-text-secondary)]">
              <span className="text-xl">👤</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-[var(--font-size-subheading)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)]">
                {verdict.entityName}
              </h2>
              <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] font-mono">
                ID: {verdict.nodeId}
              </span>
            </div>
          </div>
          <div>
            <StatusBadge status={getRiskVariant(verdict.riskLevel)} label={verdict.riskLevel} />
          </div>
        </div>
        {mode === 'sidebar' && onClose && (
          <button 
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* 2. Trust Score */}
      <div className="mb-8">
        <div className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] tracking-wider font-[var(--font-weight-medium)] mb-2">
          TRUST SCORE
        </div>
        <div className={`text-[var(--font-size-display)] font-[var(--font-weight-medium)] mb-4 ${scoreTextColor}`}>
          {scoreValue} <span className="text-[var(--font-size-body)] text-[var(--color-text-muted)]">/ 100</span>
        </div>
        <TrustScoreBar score={verdict.trustScore} colorClass={scoreColorClass} indicators={verdict.indicators} />
      </div>

      {/* 3. Divider */}
      <div className="h-px bg-[var(--color-border-subtle)] mb-8 w-full" />

      {/* 4. KOOG_AGENT_SUMMARY */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-[var(--color-text-muted)]" />
            <span className="text-[var(--font-size-label)] font-[var(--font-weight-medium)] font-mono text-[var(--color-text-primary)]">
              KOOG_AGENT_SUMMARY
            </span>
          </div>
          <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <div className="bg-[var(--color-bg-canvas)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-[var(--spacing-md)]">
          <VerdictString text={verdict.agentSummary} />
        </div>
      </div>

      {/* 5. Divider */}
      <div className="h-px bg-[var(--color-border-subtle)] mb-8 w-full" />

      {/* 6. Actions */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <KillSwitchButton state={killSwitchState} riskLevel={verdict.riskLevel} onStateChange={onKillSwitch} />
        <button 
          onClick={() => {
            console.log("Marked as false positive");
            onMarkFalsePositive();
          }}
          className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors underline underline-offset-2"
        >
          Mark as false positive
        </button>
      </div>

      {/* 7. Divider */}
      <div className="h-px bg-[var(--color-border-subtle)] mb-8 w-full" />

      {/* 8. Account Metadata Grid */}
      <div className="grid grid-cols-2 gap-y-[var(--spacing-sm)] gap-x-4 mb-4">
        {Object.entries(verdict.accountMeta).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)]">{key}</span>
            <span className="text-[var(--font-size-caption)] text-[var(--color-text-primary)]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
