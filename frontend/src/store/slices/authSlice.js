import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api.js';

// Thunks
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authAPI.getMe();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

const getStoredUser = () => {
  try {
    const u = localStorage.getItem('quizbattle_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};

const initialState = {
  user: getStoredUser(),
  token: localStorage.getItem('quizbattle_token') || null,
  isAuthenticated: !!localStorage.getItem('quizbattle_token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('quizbattle_token');
      localStorage.removeItem('quizbattle_user');
    },
    clearError(state) { state.error = null; },
    updateUserPowerUps(state, action) {
      if (state.user) {
        state.user.powerUps = { ...state.user.powerUps, ...action.payload };
        localStorage.setItem('quizbattle_user', JSON.stringify(state.user));
      }
    },
    updateUserStats(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('quizbattle_user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    const handleAuth = (state, action) => {
      state.loading = false;
      state.error = null;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('quizbattle_token', action.payload.token);
      localStorage.setItem('quizbattle_user', JSON.stringify(action.payload.user));
    };

    builder
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, handleAuth)
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, handleAuth)
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchMe.fulfilled, (s, a) => {
        s.user = a.payload.user;
        localStorage.setItem('quizbattle_user', JSON.stringify(a.payload.user));
      })
      .addCase(fetchMe.rejected, (s) => {
        s.user = null; s.token = null; s.isAuthenticated = false;
        localStorage.removeItem('quizbattle_token');
        localStorage.removeItem('quizbattle_user');
      });
  },
});

export const { logout, clearError, updateUserPowerUps, updateUserStats } = authSlice.actions;
export default authSlice.reducer;
