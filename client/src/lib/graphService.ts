import axiosInstance from './axiosInstance';
import type { GraphData, GraphNode, GraphEdge, NodeStatus } from '../types';

interface RawNode {
  id: string;
  type: string;
  trustScore?: number;
  isBlacklisted?: boolean;
  name?: string;
}

interface RawEdge {
  source: string;
  target: string;
  amount?: number;
  currency?: string;
}

interface RawGraphResponse {
  nodes: RawNode[];
  edges: RawEdge[];
}

function tierToStatus(trustScore: number, isBlacklisted: boolean): NodeStatus {
  if (isBlacklisted) return 'flagged';
  if (trustScore < 0.4) return 'flagged';
  if (trustScore < 0.7) return 'watch';
  return 'clean';
}

export async function fetchGraphNetwork(): Promise<GraphData> {
  const { data } = await axiosInstance.get<RawGraphResponse>('/api/v1/graph/network?limit=150');

  // Deduplicate nodes by id
  const nodeMap = new Map<string, GraphNode>();
  for (const raw of data.nodes) {
    if (!raw.id || nodeMap.has(raw.id)) continue;
    const isBlacklisted = raw.isBlacklisted ?? false;
    const trustScore = raw.trustScore ?? 0.5;
    const status = tierToStatus(trustScore, isBlacklisted);
    const nodeType = raw.type === 'Account' ? 'account' : raw.type === 'Counterparty' ? 'device' : 'ip';

    nodeMap.set(raw.id, {
      id: raw.id,
      label: raw.name ? raw.name : raw.id.length > 10 ? raw.id.substring(0, 10) + '…' : raw.id,
      type: nodeType,
      status,
      trustScore: Math.round(trustScore * 100),
      accountId: nodeType === 'account' ? raw.id : undefined,
    });
  }

  // Build edges with stable ids
  const edges: GraphEdge[] = data.edges
    .filter(e => e.source && e.target && nodeMap.has(e.source) && nodeMap.has(e.target))
    .map((e, i) => ({
      id: `e${i}-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      weight: e.amount,
      suspicious: (nodeMap.get(e.source)?.status === 'flagged') || (nodeMap.get(e.target)?.status === 'flagged'),
    }));

  return { nodes: Array.from(nodeMap.values()), edges };
}
