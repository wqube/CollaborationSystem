import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserDto } from '../../types/api';

interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
  initialized: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ token: string; user: UserDto }>,
    ) => {
      state.accessToken = action.payload.token;
      state.user = action.payload.user;
      state.initialized = true;
    },

    clearAuth: (state) => {
      state.accessToken = null;
      state.user = null;
      state.initialized = true;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
