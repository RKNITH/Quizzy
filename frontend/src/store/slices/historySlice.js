import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { historyAPI } from '../../services/api.js';

export const fetchHistory = createAsyncThunk(
    'history/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const res = await historyAPI.getAll(params);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'History लोड नहीं हुई');
        }
    }
);

export const fetchHistoryDetail = createAsyncThunk(
    'history/fetchDetail',
    async (id, { rejectWithValue }) => {
        try {
            const res = await historyAPI.getById(id);
            return res.data.data.record;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Detail लोड नहीं हुई');
        }
    }
);

export const fetchAISuggestion = createAsyncThunk(
    'history/fetchSuggestion',
    async (id, { rejectWithValue }) => {
        try {
            const res = await historyAPI.getSuggestion(id);
            return { id, suggestion: res.data.data.suggestion };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'AI सुझाव नहीं मिला');
        }
    }
);

export const deleteHistoryRecord = createAsyncThunk(
    'history/delete',
    async (id, { rejectWithValue }) => {
        try {
            await historyAPI.delete(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Delete नहीं हुआ');
        }
    }
);

const historySlice = createSlice({
    name: 'history',
    initialState: {
        list: [],
        detail: null,
        pagination: null,
        loading: false,
        detailLoading: false,
        suggestionLoading: false,
        error: null,
    },
    reducers: {
        clearDetail(state) { state.detail = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHistory.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchHistory.fulfilled, (s, a) => {
                s.loading = false;
                s.list = a.payload.history;
                s.pagination = a.payload.pagination;
            })
            .addCase(fetchHistory.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

            .addCase(fetchHistoryDetail.pending, (s) => { s.detailLoading = true; s.error = null; })
            .addCase(fetchHistoryDetail.fulfilled, (s, a) => { s.detailLoading = false; s.detail = a.payload; })
            .addCase(fetchHistoryDetail.rejected, (s, a) => { s.detailLoading = false; s.error = a.payload; })

            .addCase(fetchAISuggestion.pending, (s) => { s.suggestionLoading = true; })
            .addCase(fetchAISuggestion.fulfilled, (s, a) => {
                s.suggestionLoading = false;
                if (s.detail && s.detail._id === a.payload.id) {
                    s.detail.aiSuggestion = a.payload.suggestion;
                }
            })
            .addCase(fetchAISuggestion.rejected, (s, a) => { s.suggestionLoading = false; s.error = a.payload; })

            .addCase(deleteHistoryRecord.fulfilled, (s, a) => {
                s.list = s.list.filter((h) => h._id !== a.payload);
            });
    },
});

export const { clearDetail } = historySlice.actions;
export default historySlice.reducer;