import { configureStore } from '@reduxjs/toolkit';
import { onUnauthorized } from '../core/api/client';
import { setupDebugInterface } from '../core/auth/debug';
import { getToken } from '../core/auth/jwt';
import { authReducer, fetchCurrentUser, purgeAuth } from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

onUnauthorized(() => {
  store.dispatch(purgeAuth());
});

setupDebugInterface(store);

export function initAuth(): void {
  if (getToken()) {
    void store.dispatch(fetchCurrentUser());
  } else {
    store.dispatch(purgeAuth());
  }
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
