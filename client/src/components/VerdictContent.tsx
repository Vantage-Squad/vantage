import { useEffect, useState } from 'react';
import { X, Terminal, Settings, ShieldAlert, Loader2 } from 'lucide-react';
import type { Verdict, VerdictStatus, KillSwitchState, RiskIndicator, TransactionStatus } from '../types';
import TrustScoreCircle from './TrustScoreCircle';
import StatusBadge from './StatusBadge';

// ─── TrustScoreBar (sidebar mode) ────────────────────────────────────────────

function TrustScoreBar({ score, colorClass, indicators }: { score: number; colorClass: string; indicators: RiskIndicator[] }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score * 100), 50);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full h-1.5 bg-bg-raised rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-800 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="flex flex-col gap-3">
        {indicators.map((ind, idx) => {
          const isNegative = ind.score < 0;
          const scoreStr = (ind.score > 0 ? '+' : '') + ind.score.toFixed(2);
          const scoreColor = isNegative ? 'text-status-danger' : 'text-status-safe';
          const maxMagnitude = 0.6;
          const magnitudePercent = Math.min((Math.abs(ind.score) / maxMagnitude) * 100, 100);

          return (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-(length:--font-size-caption)">
                <span className="text-text-secondary">{ind.label}</span>
                <span className={`font-medium ${scoreColor}`}>{scoreStr}</span>
              </div>
              <div className="w-full h-0.5 bg-bg-raised rounded-full overflow-hidden">
                <div
                  className={`h-full ${isNegative ? 'bg-status-danger' : 'bg-status-safe'}`}
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

// ─── IndicatorRow (fullpage mode) ────────────────────────────────────────────

function IndicatorRow({ ind }: { ind: RiskIndicator }) {
  const isNegative = ind.score < 0;
  const scoreStr = (ind.score > 0 ? '+' : '') + ind.score.toFixed(2);
  const scoreColor = isNegative ? 'var(--color-status-danger)' : 'var(--color-status-safe)';
  const maxMagnitude = 0.6;
  const magnitudePercent = Math.min((Math.abs(ind.score) / maxMagnitude) * 100, 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center" style={{ fontSize: 'var(--font-size-caption)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>{ind.label}</span>
        <span style={{ color: scoreColor, fontWeight: 'var(--font-weight-medium)' }}>{scoreStr}</span>
      </div>
      <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-raised)' }}>
        <div
          className="h-full"
          style={{
            width: `${magnitudePercent}%`,
            background: scoreColor,
          }}
        />
      </div>
    </div>
  );
}

// ─── VerdictString (typewriter) ───────────────────────────────────────────────

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
      if (line.startsWith('//')) {
        return (
          <span key={i} className="block italic mt-2" style={{ color: 'var(--color-text-muted)' }}>
            {line}
          </span>
        );
      }
      const parts = line.split(/(992-XFA|8842-X|"Ghost_Node_91"|'Raven-04')/g);
      return (
        <span key={i} className="block mb-2">
          {parts.map((part, j) => {
            if (['992-XFA', '8842-X', '"Ghost_Node_91"', "'Raven-04'"].includes(part)) {
              return (
                <span
                  key={j}
                  className="font-mono rounded-sm px-1 py-0.5"
                  style={{
                    color: 'var(--color-status-warning)',
                    background: 'var(--color-bg-raised)',
                    fontSize: 'var(--font-size-caption)',
                  }}
                >
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
    <div
      className="leading-relaxed font-mono"
      style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)' }}
    >
      {renderFormattedText()}
      {displayedText.length < text.length && <span className="animate-pulse">|</span>}
    </div>
  );
}

// ─── KillSwitchButton ─────────────────────────────────────────────────────────

function KillSwitchButton({
  state,
  riskLevel,
  onStateChange,
}: {
  state: KillSwitchState;
  riskLevel: Verdict['riskLevel'];
  onStateChange: (newState: KillSwitchState) => void;
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
      <button
        disabled
        className="w-full py-3 rounded-default flex items-center justify-center cursor-not-allowed"
        style={{
          background: 'var(--color-status-safe-subtle)',
          border: '1px solid var(--color-status-safe-border)',
          color: 'var(--color-status-safe)',
          fontSize: 'var(--font-size-body)',
          fontWeight: 'var(--font-weight-medium)',
        }}
      >
        ✓ Account Frozen
      </button>
    );
  }

  if (state === 'processing') {
    return (
      <button
        disabled
        className="w-full py-3 rounded-default flex items-center justify-center gap-2 cursor-wait"
        style={{
          background: 'var(--color-status-warning-subtle)',
          border: '1px solid var(--color-status-warning-border)',
          color: 'var(--color-status-warning)',
          fontSize: 'var(--font-size-body)',
          fontWeight: 'var(--font-weight-medium)',
        }}
      >
        <Loader2 size={16} className="animate-spin" />
        Processing...
      </button>
    );
  }

  if (state === 'confirm') {
    return (
      <button
        onClick={handleClick}
        className="w-full py-3 rounded-default transition-all"
        style={{
          background: 'var(--color-status-warning-subtle)',
          border: '1px solid var(--color-status-warning-border)',
          color: 'var(--color-status-warning)',
          fontSize: 'var(--font-size-body)',
          fontWeight: 'var(--font-weight-medium)',
        }}
      >
        Confirm Freeze? Click again to proceed
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-full py-3 rounded-default transition-all hover:opacity-90"
      style={{
        background: 'var(--color-status-danger-subtle)',
        border: '1px solid var(--color-status-danger-border)',
        color: 'var(--color-status-danger)',
        fontSize: 'var(--font-size-body)',
        fontWeight: 'var(--font-weight-medium)',
      }}
    >
      {defaultLabel}
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRiskVariant(risk: string): TransactionStatus {
  if (risk.includes('CRITICAL')) return 'CRITICAL';
  if (risk.includes('HIGH')) return 'WARNING';
  return 'SAFE';
}

function getRiskHeadline(riskLevel: Verdict['riskLevel']): string {
  switch (riskLevel) {
    case 'CRITICAL RISK': return 'ANALYSIS COMPLETE: HIGH PROBABILITY OF COORDINATED FRAUD.';
    case 'HIGH RISK':     return 'ANALYSIS COMPLETE: ELEVATED RISK PATTERN DETECTED.';
    case 'MODERATE RISK': return 'ANALYSIS COMPLETE: MODERATE ANOMALIES DETECTED.';
    case 'LOW RISK':      return 'ANALYSIS COMPLETE: WITHIN NORMAL PARAMETERS.';
  }
}

function getRecommendationLine(agentSummary: string): string {
  const line = agentSummary.split('\n').find(l => l.startsWith('//'));
  return line ? line.replace(/^\/\/\s*/, '') : '';
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface VerdictContentProps {
  verdict: Verdict;
  verdictStatus: VerdictStatus;
  killSwitchState: KillSwitchState;
  onKillSwitch: (newState: KillSwitchState) => void;
  onMarkFalsePositive: () => void;
  onClose?: () => void;
  mode: 'sidebar' | 'fullpage';
}

// ─── Full-page layout ─────────────────────────────────────────────────────────

function FullPageLayout({
  verdict,
  killSwitchState,
  onKillSwitch,
  onMarkFalsePositive,
}: Omit<VerdictContentProps, 'verdictStatus' | 'onClose' | 'mode'>) {
  const recommendation = getRecommendationLine(verdict.agentSummary);

  return (
    <div className="flex flex-col gap-0" style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}>

      {/* Two-column body */}
      <div className="flex gap-0">

        {/* ── Left column (40%) ── */}
        <div
          className="flex flex-col gap-6 p-6"
          style={{
            width: '40%',
            borderRight: '1px solid var(--color-border-subtle)',
          }}
        >
          {/* Entity header */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div
                className="rounded-full flex items-center justify-center shrink-0"
                style={{
                  width: 64,
                  height: 64,
                  background: 'var(--color-bg-raised)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 28,
                }}
              >
                👤
              </div>
              <div className="flex flex-col gap-1">
                <h2 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                  {verdict.entityName}
                </h2>
                <span className="font-mono" style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)' }}>
                  ID: {verdict.nodeId}
                </span>
              </div>
            </div>
            <div>
              <StatusBadge status={getRiskVariant(verdict.riskLevel)} label={verdict.riskLevel} />
            </div>
          </div>

          {/* Trust Score circle */}
          <div className="flex justify-center py-4">
            <TrustScoreCircle score={verdict.trustScore} />
          </div>

          {/* Metric decomposition */}
          <div className="flex flex-col gap-3">
            <span
              className="uppercase tracking-wider"
              style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Risk Decomposition
            </span>
            {verdict.indicators.map((ind, i) => (
              <IndicatorRow key={i} ind={ind} />
            ))}
          </div>
        </div>

        {/* ── Right column (60%) ── */}
        <div className="flex flex-col gap-0" style={{ width: '60%' }}>

          {/* Vantage Agent Verdict card */}
          <div className="flex flex-col gap-4 p-6" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            {/* Card header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} style={{ color: 'var(--color-accent)' }} />
                <span
                  className="uppercase tracking-widest font-mono"
                  style={{ fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-accent)' }}
                >
                  Vantage Agent Verdict
                </span>
              </div>
              <Settings size={14} style={{ color: 'var(--color-text-muted)' }} />
            </div>

            {/* Risk headline */}
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-status-danger)' }}>
              {getRiskHeadline(verdict.riskLevel)}
            </p>

            {/* Typewriter body */}
            <VerdictString text={verdict.agentSummary} />

            {/* Blockquote recommendation */}
            {recommendation && (
              <div
                className="italic"
                style={{
                  background: 'var(--color-bg-raised)',
                  borderLeft: '3px solid var(--color-border-emphasis)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-body)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {recommendation}
              </div>
            )}
          </div>

          {/* Enforcement Protocol card */}
          <div className="flex flex-col gap-4 p-6" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div className="flex flex-col gap-1">
              <span style={{ fontSize: 'var(--font-size-subheading)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                Enforcement Protocol
              </span>
              <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)' }}>
                Two-step verification required to initiate full account termination and asset freeze.
              </span>
            </div>
            <KillSwitchButton state={killSwitchState} riskLevel={verdict.riskLevel} onStateChange={onKillSwitch} />
            <button
              onClick={onMarkFalsePositive}
              className="underline underline-offset-2 text-center transition-colors hover:opacity-80"
              style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)' }}
            >
              Mark as false positive
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Sidebar layout (unchanged from Day 3) ────────────────────────────────────

function SidebarLayout({
  verdict,
  killSwitchState,
  onKillSwitch,
  onMarkFalsePositive,
  onClose,
}: Omit<VerdictContentProps, 'verdictStatus' | 'mode'>) {
  const scoreValue = Math.round(verdict.trustScore * 100);
  let scoreColorClass = 'bg-status-safe';
  let scoreTextColor = 'text-status-safe';

  if (scoreValue < 30) {
    scoreColorClass = 'bg-status-danger';
    scoreTextColor = 'text-status-danger';
  } else if (scoreValue < 60) {
    scoreColorClass = 'bg-status-warning';
    scoreTextColor = 'text-status-warning';
  }

  return (
    <div className="flex flex-col w-full">
      {/* 1. Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-bg-raised flex items-center justify-center text-text-secondary">
              <span className="text-xl">👤</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-(length:--font-size-subheading) font-medium text-text-primary">
                {verdict.entityName}
              </h2>
              <span className="text-(length:--font-size-caption) text-text-muted font-mono">
                ID: {verdict.nodeId}
              </span>
            </div>
          </div>
          <div>
            <StatusBadge status={getRiskVariant(verdict.riskLevel)} label={verdict.riskLevel} />
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1">
            <X size={20} />
          </button>
        )}
      </div>

      {/* 2. Trust Score */}
      <div className="mb-8">
        <div className="text-(length:--font-size-caption) text-text-muted tracking-wider font-medium mb-2">
          TRUST SCORE
        </div>
        <div className={`text-(length:--font-size-display) font-medium mb-4 ${scoreTextColor}`}>
          {scoreValue} <span className="text-(length:--font-size-body) text-text-muted">/ 100</span>
        </div>
        <TrustScoreBar score={verdict.trustScore} colorClass={scoreColorClass} indicators={verdict.indicators} />
      </div>

      {/* 3. Divider */}
      <div className="h-px bg-border-subtle mb-8 w-full" />

      {/* 4. KOOG_AGENT_SUMMARY */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-text-muted" />
            <span className="text-(length:--font-size-label) font-medium font-mono text-text-primary">
              KOOG_AGENT_SUMMARY
            </span>
          </div>
        </div>
        <div className="bg-bg-canvas border border-border-subtle rounded-md p-(--spacing-md)">
          <VerdictString text={verdict.agentSummary} />
        </div>
      </div>

      {/* 5. Divider */}
      <div className="h-px bg-border-subtle mb-8 w-full" />

      {/* 6. Actions */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <KillSwitchButton state={killSwitchState} riskLevel={verdict.riskLevel} onStateChange={onKillSwitch} />
        <button
          onClick={() => {
            console.log('Marked as false positive');
            onMarkFalsePositive();
          }}
          className="text-(length:--font-size-caption) text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
        >
          Mark as false positive
        </button>
      </div>

    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function VerdictContent(props: VerdictContentProps) {
  if (props.mode === 'fullpage') {
    return (
      <FullPageLayout
        verdict={props.verdict}
        killSwitchState={props.killSwitchState}
        onKillSwitch={props.onKillSwitch}
        onMarkFalsePositive={props.onMarkFalsePositive}
      />
    );
  }

  return (
    <SidebarLayout
      verdict={props.verdict}
      killSwitchState={props.killSwitchState}
      onKillSwitch={props.onKillSwitch}
      onMarkFalsePositive={props.onMarkFalsePositive}
      onClose={props.onClose}
    />
  );
}
