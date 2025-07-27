import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import EncryptedStorage from 'react-native-encrypted-storage';
import { User } from '../types';

interface AuthState {
  token: string | null;
  refreshToken?: string | null;
  apiKey?: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.refreshToken = action.payload;
      state.apiKey = action.payload;
      state.isAuthenticated = true;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.apiKey = null;
      state.user = null;
      state.isAuthenticated = false;
      EncryptedStorage.removeItem('auth');
    },
    hydrateAuth: (state, action: PayloadAction<AuthState>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setToken, setUser, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;