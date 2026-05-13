import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setKillSwitchState } from '../store/graphSlice';
import VerdictContent from './VerdictContent';
import LoadingSkeleton from './LoadingSkeleton';
import { fetchVerdict } from '../lib/fetchVerdict';

interface VerdictSidebarProps {
  selectedNodeId: string | null;
  onClose: () => void;
}

export default function VerdictSidebar({ selectedNodeId, onClose }: VerdictSidebarProps) {
  const dispatch = useAppDispatch();
  const { verdict, verdictStatus, killSwitchState } = useAppSelector(state => state.graph);

  const handleKillSwitch = (newState: any) => {
    dispatch(setKillSwitchState(newState));
  };

  const handleRetry = () => {
    if (selectedNodeId) {
      dispatch(fetchVerdict(selectedNodeId));
    }
  };

  return (
    <div className="w-full h-full bg-[var(--color-bg-surface)] border-l border-[var(--color-border-subtle)] p-[var(--spacing-lg)] overflow-y-auto shrink-0 flex flex-col">
      {verdictStatus === 'loading' && (
        <div className="flex-1">
          <LoadingSkeleton variant="alert" rows={5} />
        </div>
      )}

      {verdictStatus === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-[var(--color-text-muted)] text-[var(--font-size-body)]">Could not load verdict. Try again.</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-[var(--color-bg-raised)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-[var(--radius-default)] hover:bg-[var(--color-border-subtle)] transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {verdictStatus === 'success' && verdict && (
        <VerdictContent 
          verdict={verdict}
          verdictStatus={verdictStatus}
          killSwitchState={killSwitchState}
          onKillSwitch={handleKillSwitch}
          onMarkFalsePositive={() => {}}
          onClose={onClose}
          mode="sidebar"
        />
      )}
    </div>
  );
}
