import { getToken } from './jwt';
import type { RootState } from '../../app/store';

export function setupDebugInterface(store: { getState: () => RootState }): void {
  window.__conduit_debug__ = {
    getToken,
    getAuthState: () => store.getState().auth.authState,
    getCurrentUser: () => store.getState().auth.user,
  };
}
