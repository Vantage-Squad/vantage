import { Plus, Minus, Maximize } from 'lucide-react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitFlagged: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut, onFitFlagged }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-[var(--color-bg-raised)] border border-[var(--color-border-subtle)] rounded-[var(--radius-default)] p-[var(--spacing-micro)] shadow-lg z-10">
      <button 
        onClick={onZoomIn}
        className="w-9 h-9 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] rounded-[var(--radius-sm)] transition-colors"
        aria-label="Zoom in"
      >
        <Plus size={18} />
      </button>
      <div className="h-px bg-[var(--color-border-subtle)] mx-1" />
      <button 
        onClick={onZoomOut}
        className="w-9 h-9 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] rounded-[var(--radius-sm)] transition-colors"
        aria-label="Zoom out"
      >
        <Minus size={18} />
      </button>
      <div className="h-px bg-[var(--color-border-subtle)] mx-1" />
      <button 
        onClick={onFitFlagged}
        className="w-9 h-9 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] rounded-[var(--radius-sm)] transition-colors"
        aria-label="Fit graph"
      >
        <Maximize size={16} />
      </button>
    </div>
  );
}
