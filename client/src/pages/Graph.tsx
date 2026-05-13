import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectNode, updateGraphData } from '../store/graphSlice';
import { Shield } from 'lucide-react';
import GraphToolbar from '../components/GraphToolbar';
import GraphCanvas, { type GraphCanvasHandle } from '../components/GraphCanvas';
import ZoomControls from '../components/ZoomControls';
import NodeLegend from '../components/NodeLegend';
import NetworkVelocityBar from '../components/NetworkVelocityBar';
import VerdictSidebar from '../components/VerdictSidebar';
import type { NodeStatus } from '../types';
import { fetchVerdict } from '../lib/fetchVerdict';

export default function Graph() {
  const dispatch = useAppDispatch();
  const graphData = useAppSelector(state => state.graph.graphData);
  const selectedNodeId = useAppSelector(state => state.graph.selectedNodeId);
  const networkVelocity = useAppSelector(state => state.graph.networkVelocity);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatuses, setFilterStatuses] = useState<NodeStatus[]>(['flagged', 'watch', 'clean']);
  
  const graphCanvasRef = useRef<GraphCanvasHandle>(null);

  const hasFlaggedOrWatch = graphData.nodes.some(n => n.status === 'flagged' || n.status === 'watch');
  
  // State 3: Empty state
  const showEmptyState = !hasFlaggedOrWatch;

  const handleNodeClick = (nodeId: string) => {
    dispatch(selectNode(nodeId));
    dispatch(fetchVerdict(nodeId));
  };

  const handleRescan = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.fitFlagged();
    }
  };

  const handleCloseSidebar = () => {
    dispatch(selectNode(null));
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <GraphToolbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterStatuses={filterStatuses}
        onFilterChange={setFilterStatuses}
        onRescan={handleRescan}
      />
      
      <div className="flex-1 relative flex overflow-hidden">
        {/* Main Graph Area */}
        <div className={`relative h-full transition-all duration-250 ease-out ${selectedNodeId ? 'w-[60%]' : 'w-full'}`}>
          <GraphCanvas 
            ref={graphCanvasRef}
            graphData={graphData}
            selectedNodeId={selectedNodeId}
            onNodeClick={handleNodeClick}
            filterStatuses={filterStatuses}
            searchQuery={searchQuery}
          />
          
          <NodeLegend nodes={graphData.nodes} />
          
          <ZoomControls 
            onZoomIn={() => graphCanvasRef.current?.zoomIn()}
            onZoomOut={() => graphCanvasRef.current?.zoomOut()}
            onFitFlagged={() => graphCanvasRef.current?.fitFlagged()}
          />

          {showEmptyState && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-[var(--color-bg-canvas)]/60 backdrop-blur-sm">
              <div className="flex flex-col items-center max-w-[480px] text-center gap-4">
                <div className="w-[80px] h-[80px] rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] flex items-center justify-center">
                  <Shield size={40} className="text-[var(--color-status-safe)]" />
                </div>
                <h2 className="text-[var(--font-size-heading)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)] mt-2">
                  System Healthy
                </h2>
                <p className="text-[var(--font-size-body)] text-[var(--color-text-secondary)]">
                  No flagged activity detected in the current network scope. All {graphData.nodes.length} active nodes are operating within established trust parameters.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[var(--font-size-caption)] text-[var(--color-text-muted)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-safe)] animate-pulse" />
                  Live Surveillance Active <span className="mx-1">&middot;</span> Last check: Just now
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Verdict Sidebar */}
        <div 
          className="absolute top-0 right-0 h-full bg-[var(--color-bg-surface)] transition-transform duration-250 ease-out z-20 border-l border-[var(--color-border-subtle)]"
          style={{ 
            width: '40%',
            transform: selectedNodeId ? 'translateX(0)' : 'translateX(100%)' 
          }}
        >
          {selectedNodeId && (
            <VerdictSidebar 
              selectedNodeId={selectedNodeId} 
              onClose={handleCloseSidebar} 
            />
          )}
        </div>
      </div>

      <NetworkVelocityBar tps={networkVelocity.tps} label={networkVelocity.label} />
    </div>
  );
}
