import { useEffect, useState } from 'react';

interface TrustScoreCircleProps {
  score: number; // 0–1 float
}

export default function TrustScoreCircle({ score }: TrustScoreCircleProps) {
  const [progress, setProgress] = useState(0);

  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const scoreValue = Math.round(score * 100);

  // Color based on score
  let color: string;
  if (scoreValue < 30) {
    color = 'var(--color-status-danger)';
  } else if (scoreValue < 60) {
    color = 'var(--color-status-warning)';
  } else {
    color = 'var(--color-status-safe)';
  }

  useEffect(() => {
    // Small delay then animate to final value over 900ms (handled via CSS transition)
    const t = setTimeout(() => setProgress(score), 80);
    return () => clearTimeout(t);
  }, [score]);

  const dashOffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-bg-raised)"
            strokeWidth={strokeWidth}
          />
          {/* Foreground arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 900ms ease-out' }}
          />
        </svg>

        {/* Centre label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ color }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-display)',
              fontWeight: 'var(--font-weight-medium)',
              lineHeight: 1,
            }}
          >
            {scoreValue}
          </span>
        </div>
      </div>

      <span
        style={{
          fontSize: 'var(--font-size-caption)',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Trust Score
      </span>
    </div>
  );
}
