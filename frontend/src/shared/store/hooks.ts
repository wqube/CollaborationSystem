import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatcher = () => useDispatch<AppDispatch>();
export const userAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector);
