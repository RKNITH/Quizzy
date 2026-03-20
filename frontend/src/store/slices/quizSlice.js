import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quizAPI } from '../../services/api.js';

export const fetchQuizzes = createAsyncThunk('quiz/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await quizAPI.getAll(params);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch quizzes');
  }
});

export const fetchQuizById = createAsyncThunk('quiz/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await quizAPI.getById(id);
    return res.data.data.quiz;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch quiz');
  }
});

export const generateAIQuiz = createAsyncThunk('quiz/generateAI', async (data, { rejectWithValue }) => {
  try {
    const res = await quizAPI.generateAI(data);
    return res.data.data.quiz;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to generate AI quiz');
  }
});

export const fetchCategories = createAsyncThunk('quiz/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await quizAPI.getCategories();
    return res.data.data.categories;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const seedQuizzes = createAsyncThunk('quiz/seed', async (_, { rejectWithValue }) => {
  try {
    const res = await quizAPI.seed();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    list: [],
    current: null,
    categories: [],
    pagination: null,
    loading: false,
    aiLoading: false,
    error: null,
    generatedQuiz: null,
    filters: { category: '', difficulty: '', page: 1 },
  },
  reducers: {
    setFilters(state, action) { state.filters = { ...state.filters, ...action.payload }; },
    clearCurrent(state) { state.current = null; },
    clearGenerated(state) { state.generatedQuiz = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchQuizzes.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.quizzes;
        s.pagination = a.payload.pagination;
      })
      .addCase(fetchQuizzes.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchQuizById.pending, (s) => { s.loading = true; })
      .addCase(fetchQuizById.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(fetchQuizById.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(generateAIQuiz.pending, (s) => { s.aiLoading = true; s.error = null; })
      .addCase(generateAIQuiz.fulfilled, (s, a) => { s.aiLoading = false; s.generatedQuiz = a.payload; })
      .addCase(generateAIQuiz.rejected, (s, a) => { s.aiLoading = false; s.error = a.payload; })

      .addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload; });
  },
});

export const { setFilters, clearCurrent, clearGenerated, clearError } = quizSlice.actions;
export default quizSlice.reducer;
