import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
  type ThunkDispatch,
  type UnknownAction,
} from '@reduxjs/toolkit';
import { ApiError, isAbortError } from '../../core/api/client';
import { getCurrentUser, loginUser, registerUser, updateUser } from '../../core/api/user';
import { destroyToken, getToken, saveToken } from '../../core/auth/jwt';
import type { AuthState, User } from '../../core/models';

export interface AuthSliceState {
  user: User | null;
  authState: AuthState;
}

const initialState: AuthSliceState = {
  user: null,
  authState: getToken() ? 'loading' : 'unauthenticated',
};

let retryAttempt = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

function cancelRetry(): void {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

type AuthDispatch = ThunkDispatch<unknown, unknown, UnknownAction>;

function scheduleRetry(dispatch: AuthDispatch): void {
  cancelRetry();
  if (!getToken()) {
    return;
  }

  const delaySeconds = Math.min(2 * Math.pow(2, retryAttempt), 16);
  retryAttempt += 1;

  retryTimer = setTimeout(() => {
    if (getToken()) {
      dispatch(setAuthLoading());
      void dispatch(fetchCurrentUser());
    }
  }, delaySeconds * 1000);
}

function applySetAuth(state: AuthSliceState, user: User): void {
  cancelRetry();
  retryAttempt = 0;
  saveToken(user.token);
  state.user = user;
  state.authState = 'authenticated';
}

function applyPurgeAuth(state: AuthSliceState): void {
  cancelRetry();
  retryAttempt = 0;
  destroyToken();
  state.user = null;
  state.authState = 'unauthenticated';
}

function authErrorStatus(err: unknown): number {
  return err instanceof ApiError ? err.status : 0;
}

export const fetchCurrentUser = createAsyncThunk<User, AbortSignal | undefined, { rejectValue: number }>(
  'auth/fetchCurrentUser',
  async (signal, { dispatch, rejectWithValue }) => {
    try {
      const { user } = await getCurrentUser(signal);
      return user;
    } catch (err) {
      if (isAbortError(err)) {
        throw err;
      }
      const status = authErrorStatus(err);
      if (!(status >= 400 && status < 500)) {
        queueMicrotask(() => scheduleRetry(dispatch));
      }
      return rejectWithValue(status);
    }
  },
);

export const login = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: { errors: Record<string, unknown>; status: number } }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { user } = await loginUser(credentials);
    return user;
  } catch (err) {
    if (err instanceof ApiError) {
      return rejectWithValue({ errors: err.errors, status: err.status });
    }
    throw err;
  }
});

export const register = createAsyncThunk<
  User,
  { username: string; email: string; password: string },
  { rejectValue: { errors: Record<string, unknown>; status: number } }
>('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    const { user } = await registerUser(credentials);
    return user;
  } catch (err) {
    if (err instanceof ApiError) {
      return rejectWithValue({ errors: err.errors, status: err.status });
    }
    throw err;
  }
});

export const updateCurrentUser = createAsyncThunk<
  User,
  Partial<User>,
  { rejectValue: { errors: Record<string, unknown>; status: number } }
>('auth/updateCurrentUser', async (payload, { rejectWithValue }) => {
  try {
    const { user } = await updateUser(payload);
    return user;
  } catch (err) {
    if (err instanceof ApiError) {
      return rejectWithValue({ errors: err.errors, status: err.status });
    }
    throw err;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    purgeAuth: applyPurgeAuth,
    setAuth(state, action: PayloadAction<User>) {
      applySetAuth(state, action.payload);
    },
    setAuthLoading(state) {
      state.authState = 'loading';
    },
    setAuthUnavailable(state) {
      state.user = null;
      state.authState = 'unavailable';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        applySetAuth(state, action.payload);
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        const status = action.payload ?? 0;
        if (status >= 400 && status < 500) {
          applyPurgeAuth(state);
        } else {
          state.user = null;
          state.authState = 'unavailable';
        }
      })
      .addCase(login.fulfilled, (state, action) => {
        applySetAuth(state, action.payload);
      })
      .addCase(register.fulfilled, (state, action) => {
        applySetAuth(state, action.payload);
      })
      .addCase(updateCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { purgeAuth, setAuth, setAuthLoading, setAuthUnavailable } = authSlice.actions;

export function handleAuthFetchError(dispatch: AuthDispatch, err: unknown): void {
  const status = authErrorStatus(err);
  if (status >= 400 && status < 500) {
    dispatch(purgeAuth());
  } else {
    dispatch(setAuthUnavailable());
    scheduleRetry(dispatch);
  }
}
export const authReducer = authSlice.reducer;
