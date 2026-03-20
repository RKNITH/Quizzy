import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roomAPI } from '../../services/api.js';

export const createRoom = createAsyncThunk('room/create', async (data, { rejectWithValue }) => {
  try {
    const res = await roomAPI.create(data);
    return res.data.data.room;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create room');
  }
});

export const joinRoom = createAsyncThunk('room/join', async (code, { rejectWithValue }) => {
  try {
    const res = await roomAPI.join({ code });
    return res.data.data.room;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to join room');
  }
});

export const fetchRoom = createAsyncThunk('room/fetch', async (id, { rejectWithValue }) => {
  try {
    const res = await roomAPI.getById(id);
    return res.data.data.room;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch room');
  }
});

export const startGame = createAsyncThunk('room/start', async (id, { rejectWithValue }) => {
  try {
    const res = await roomAPI.start(id);
    return res.data.data.room;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to start game');
  }
});

export const finishGame = createAsyncThunk('room/finish', async (id, { rejectWithValue }) => {
  try {
    const res = await roomAPI.finish(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to finish game');
  }
});

const roomSlice = createSlice({
  name: 'room',
  initialState: {
    current: null,
    participants: [],
    loading: false,
    error: null,
    gameResult: null,
  },
  reducers: {
    clearRoom(state) {
      state.current = null;
      state.participants = [];
      state.error = null;
      state.gameResult = null;
    },
    clearError(state) { state.error = null; },
    setGameResult(state, action) { state.gameResult = action.payload; },
    updateParticipants(state, action) { state.participants = action.payload; },
    updateRoomStatus(state, action) {
      if (state.current) state.current.status = action.payload;
    },
    addParticipant(state, action) {
      const exists = state.participants.find((p) => p.userId === action.payload.userId);
      if (!exists) state.participants.push(action.payload);
    },
    removeParticipant(state, action) {
      state.participants = state.participants.filter((p) => p.userId !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRoom.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createRoom.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(createRoom.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(joinRoom.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(joinRoom.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(joinRoom.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchRoom.fulfilled, (s, a) => { s.current = a.payload; })

      .addCase(startGame.fulfilled, (s, a) => {
        s.loading = false;
        if (s.current) s.current.status = 'active';
      })
      .addCase(startGame.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(finishGame.fulfilled, (s, a) => {
        s.loading = false;
        s.gameResult = a.payload;
        if (s.current) s.current.status = 'finished';
      });
  },
});

export const {
  clearRoom, clearError, setGameResult, updateParticipants,
  updateRoomStatus, addParticipant, removeParticipant,
} = roomSlice.actions;
export default roomSlice.reducer;
