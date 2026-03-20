import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roomAPI } from '../../services/api.js';

export const fetchGlobalLeaderboard = createAsyncThunk(
  'leaderboard/fetchGlobal',
  async (_, { rejectWithValue }) => {
    try {
      const res = await roomAPI.getGlobalLeaderboard();
      return res.data.data.leaderboard;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const fetchRoomLeaderboard = createAsyncThunk(
  'leaderboard/fetchRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await roomAPI.getLeaderboard(roomId);
      return res.data.data.leaderboard;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch room leaderboard');
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: {
    global: [],
    room: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateRoomLeaderboard(state, action) { state.room = action.payload; },
    clearRoomLeaderboard(state) { state.room = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalLeaderboard.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchGlobalLeaderboard.fulfilled, (s, a) => { s.loading = false; s.global = a.payload; })
      .addCase(fetchGlobalLeaderboard.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchRoomLeaderboard.fulfilled, (s, a) => { s.room = a.payload; });
  },
});

export const { updateRoomLeaderboard, clearRoomLeaderboard } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
