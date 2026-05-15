import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { VerdictPageState, KillSwitchState } from '../../types';
import { fetchVerdictById } from '../../lib/fetchVerdictById';
import VerdictContent from '../../components/VerdictContent';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function Verdict() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<VerdictPageState>({
    verdict: null,
    status: 'idle',
  });
  const [killSwitchState, setKillSwitchState] = useState<KillSwitchState>('idle');

  const load = () => {
    if (!id) return;
    setPageState({ verdict: null, status: 'loading' });
    setKillSwitchState('idle');
    fetchVerdictById(id)
      .then(v => setPageState({ verdict: v, status: 'success' }))
      .catch(() => setPageState({ verdict: null, status: 'error' }));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleKillSwitch = (newState: KillSwitchState) => {
    setKillSwitchState(newState);
  };

  return (
    <div
      className="w-full h-full overflow-y-auto"
      style={{ padding: 'var(--spacing-xl) 0' }}
    >
      {/* Centred content column */}
      <div className="mx-auto w-full" style={{ maxWidth: 960, padding: '0 var(--spacing-lg)' }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 transition-colors hover:opacity-80"
          style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Loading */}
        {pageState.status === 'loading' && (
          <div className="w-full">
            <LoadingSkeleton variant="alert" rows={6} />
          </div>
        )}

        {/* Error */}
        {pageState.status === 'error' && (
          <div className="flex flex-col items-center justify-center gap-4 text-center py-20">
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 56, height: 56, background: 'var(--color-status-danger-subtle)', border: '1px solid var(--color-status-danger-border)' }}
            >
              <AlertCircle size={24} style={{ color: 'var(--color-status-danger)' }} />
            </div>
            <div className="flex flex-col gap-2">
              <h2 style={{ fontSize: 'var(--font-size-heading)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>
                Could not load verdict
              </h2>
              <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', maxWidth: 420 }}>
                The node ID <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'var(--color-bg-raised)', color: 'var(--color-status-warning)', fontSize: 'var(--font-size-caption)' }}>{id}</code> was not found or the verdict could not be retrieved.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => navigate('/network-forensic')}
                style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ← Back to Graph
              </button>
              <button
                onClick={load}
                className="px-4 py-2 rounded transition-colors hover:opacity-80"
                style={{
                  fontSize: 'var(--font-size-body)',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-raised)',
                  border: '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {pageState.status === 'success' && pageState.verdict && (
          <VerdictContent
            verdict={pageState.verdict}
            verdictStatus={pageState.status}
            killSwitchState={killSwitchState}
            onKillSwitch={handleKillSwitch}
            onMarkFalsePositive={() => console.log('Marked as false positive:', id)}
            mode="fullpage"
          />
        )}
      </div>
    </div>
  );
}
