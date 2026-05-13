import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import cytoscape from 'cytoscape';
import type { GraphData, NodeStatus } from '../types';

export interface GraphCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitFlagged: () => void;
}

interface GraphCanvasProps {
  graphData: GraphData;
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  filterStatuses: NodeStatus[];
  searchQuery: string;
}

const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(({
  graphData,
  selectedNodeId,
  onNodeClick,
  filterStatuses,
  searchQuery
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  
  const [tooltip, setTooltip] = useState<{ id: string; label: string; x: number; y: number } | null>(null);
  const [pulsingNodes, setPulsingNodes] = useState<{ id: string; x: number; y: number }[]>([]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (cyRef.current) {
        cyRef.current.zoom(cyRef.current.zoom() * 1.2);
      }
    },
    zoomOut: () => {
      if (cyRef.current) {
        cyRef.current.zoom(cyRef.current.zoom() * 0.8);
      }
    },
    fitFlagged: () => {
      if (cyRef.current) {
        cyRef.current.layout({ name: 'cose', animate: true }).run();
      }
    }
  }));

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'shape': 'ellipse',
            'background-color': '#1C2845',
            'border-width': 2,
            'border-color': '#2D4270',
            'width': 32,
            'height': 32,
            'label': 'data(label)',
            'color': '#8BA3C7',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-opacity': 0,
          }
        },
        {
          selector: 'node[status="flagged"]',
          style: {
            'background-color': '#EF4444',
            'border-width': 3,
            'border-color': '#EF4444',
            'width': 48,
            'height': 48,
          }
        },
        {
          selector: 'node[status="watch"]',
          style: {
            'background-color': '#F59E0B',
            'border-width': 3,
            'border-color': '#F59E0B',
            'width': 40,
            'height': 40,
          }
        },
        {
          selector: 'node[type="account"]',
          style: {
            'content': (ele) => ele.data('label') ? `\u{1F464}\n${ele.data('label')}` : '\u{1F464}',
            'text-wrap': 'wrap',
          }
        },
        {
          selector: 'node[type="ip"]',
          style: {
            'content': (ele) => ele.data('label') ? `IP\n${ele.data('label')}` : 'IP',
            'text-wrap': 'wrap',
          }
        },
        {
          selector: 'node[type="device"]',
          style: {
            'content': (ele) => ele.data('label') ? `DEV\n${ele.data('label')}` : 'DEV',
            'text-wrap': 'wrap',
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#2D4270',
            'curve-style': 'bezier',
          }
        },
        {
          selector: 'edge[?suspicious]',
          style: {
            'width': 2,
            'line-color': '#EF4444',
            'line-style': 'dashed',
          }
        },
        {
          selector: '.selected',
          style: {
            'border-width': 4,
            'border-color': '#4F9CF9',
          }
        },
        {
          selector: '.highlighted',
          style: {
            'border-width': 5,
          }
        }
      ],
      layout: { name: 'preset' },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    cy.on('tap', 'node', (e) => {
      const node = e.target;
      onNodeClick(node.id());
    });

    cy.on('mouseover', 'node', (e) => {
      const node = e.target;
      const pos = node.renderedPosition();
      setTooltip({
        id: node.id(),
        label: node.data('label'),
        x: pos.x,
        y: pos.y
      });
    });

    cy.on('mouseout', 'node', () => {
      setTooltip(null);
    });

    cy.on('render', () => {
      const containerPos = containerRef.current?.getBoundingClientRect();
      if (!containerPos) return;

      const flaggedNodes = cy.nodes('[status="flagged"]:visible');
      const positions = flaggedNodes.map(n => {
        const pos = n.renderedPosition();
        return { id: n.id(), x: pos.x, y: pos.y };
      });
      setPulsingNodes(positions);
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  // Sync Data
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    cy.batch(() => {
      // Remove elements not in data
      const nodeIds = new Set(graphData.nodes.map(n => n.id));
      const edgeIds = new Set(graphData.edges.map(e => e.id));
      cy.elements().forEach(ele => {
        if (ele.isNode() && !nodeIds.has(ele.id())) cy.remove(ele);
        if (ele.isEdge() && !edgeIds.has(ele.id())) cy.remove(ele);
      });

      // Add or update nodes
      graphData.nodes.forEach(node => {
        const existing = cy.getElementById(node.id);
        if (existing.length > 0) {
          existing.data(node);
        } else {
          cy.add({ group: 'nodes', data: node });
        }
      });

      // Add or update edges
      graphData.edges.forEach(edge => {
        const existing = cy.getElementById(edge.id);
        if (existing.length > 0) {
          existing.data(edge);
        } else {
          cy.add({ group: 'edges', data: edge });
        }
      });
    });

    cy.layout({ name: 'cose', animate: false }).run();
  }, [graphData]);

  // Sync Filters
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    cy.batch(() => {
      cy.nodes().forEach(node => {
        if (filterStatuses.includes(node.data('status'))) {
          node.show();
        } else {
          node.hide();
        }
      });
    });
  }, [filterStatuses]);

  // Sync Selection
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    cy.batch(() => {
      cy.nodes().removeClass('selected');
      if (selectedNodeId) {
        cy.getElementById(selectedNodeId).addClass('selected');
      }
    });
  }, [selectedNodeId]);

  // Sync Search
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    cy.batch(() => cy.nodes().removeClass('highlighted'));

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const match = cy.nodes().filter(n => 
        (n.data('label') && n.data('label').toLowerCase().includes(q)) || 
        n.id().toLowerCase().includes(q)
      ).first();

      if (match.length > 0 && match.visible()) {
        match.addClass('highlighted');
        cy.center(match);
        cy.zoom(2);
      }
    }
  }, [searchQuery]);

  return (
    <div className="relative w-full h-full bg-[var(--color-bg-canvas)] overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Pulse Overlays */}
      {pulsingNodes.map(pos => (
        <div 
          key={pos.id}
          className="absolute w-12 h-12 rounded-full border-2 border-[var(--color-status-danger)] pointer-events-none"
          style={{
            left: pos.x,
            top: pos.y,
            transform: 'translate(-50%, -50%)',
            animation: 'node-pulse 1.2s ease-in-out infinite'
          }}
        />
      ))}

      {/* Tooltip Overlay */}
      {tooltip && (
        <div 
          className="absolute z-50 pointer-events-none bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-[var(--radius-default)] px-[var(--spacing-sm)] py-[var(--spacing-micro)] shadow-lg"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y + 15,
          }}
        >
          <span className="text-[var(--font-size-caption)] text-[var(--color-text-primary)] whitespace-nowrap">
            {tooltip.label} (ID: {tooltip.id})
          </span>
        </div>
      )}
      
      <style>{`
        @keyframes node-pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
});

export default GraphCanvas;
