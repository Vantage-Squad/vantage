import type { AppDispatch } from '../store/store';
import { setVerdictLoading, setVerdictSuccess, setVerdictError } from '../store/graphSlice';
import { mockVerdicts } from './mockVerdicts';

export const fetchVerdict = (nodeId: string) => async (dispatch: AppDispatch) => {
  dispatch(setVerdictLoading());
  await new Promise(res => setTimeout(res, 1200));
  const verdict = mockVerdicts[nodeId];
  if (verdict) {
    dispatch(setVerdictSuccess(verdict));
  } else {
    dispatch(setVerdictError());
  }
};
