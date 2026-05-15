import { mockVerdicts } from './mockVerdicts';
import type { Verdict } from '../types';

export async function fetchVerdictById(nodeId: string): Promise<Verdict> {
  await new Promise(res => setTimeout(res, 1200));
  const verdict = mockVerdicts[nodeId];
  if (!verdict) throw new Error(`No verdict found for node: ${nodeId}`);
  return verdict;
}
