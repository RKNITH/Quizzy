import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roomAPI } from '../../services/api.js';

export const submitAnswer = createAsyncThunk(
  'game/submitAnswer',
  async ({ roomId, data }, { rejectWithValue }) => {
    try {
      const res = await roomAPI.submitAnswer(roomId, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit answer');
    }
  }
);

export const skipQuestion = createAsyncThunk(
  'game/skipQuestion',
  async ({ roomId, questionIndex }, { rejectWithValue }) => {
    try {
      const res = await roomAPI.skipQuestion(roomId, { questionIndex });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to skip question');
    }
  }
);

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    currentQuestionIndex: 0,
    totalQuestions: 0,
    score: 0,
    answers: [],            // { questionIndex, selectedOption, isCorrect, earnedScore }
    selectedOption: null,   // currently selected option (before submission)
    isAnswered: false,      // has current question been answered/submitted
    isCorrect: null,
    correctAnswer: null,
    explanation: null,
    earnedScore: 0,
    questionStartTime: null,
    timeLeft: 30,
    timerActive: false,
    loading: false,
    error: null,
    powerUps: { skip: 3, doubleScore: 2 },
    doubleScoreActive: false,
    gamePhase: 'idle',      // idle | countdown | question | result | finished
    leaderboard: [],
    chatMessages: [],
  },
  reducers: {
    initGame(state, action) {
      state.currentQuestionIndex = 0;
      state.totalQuestions = action.payload.totalQuestions;
      state.score = 0;
      state.answers = [];
      state.selectedOption = null;
      state.isAnswered = false;
      state.isCorrect = null;
      state.correctAnswer = null;
      state.explanation = null;
      state.timeLeft = action.payload.timePerQuestion || 30;
      state.gamePhase = 'countdown';
      state.leaderboard = [];
      state.powerUps = action.payload.powerUps || { skip: 3, doubleScore: 2 };
      state.doubleScoreActive = false;
      state.error = null;
    },
    startQuestion(state, action) {
      state.gamePhase = 'question';
      state.selectedOption = null;
      state.isAnswered = false;
      state.isCorrect = null;
      state.correctAnswer = null;
      state.explanation = null;
      state.earnedScore = 0;
      state.currentQuestionIndex = action.payload.index;
      state.timeLeft = action.payload.timePerQuestion || 30;
      state.timerActive = true;
      state.questionStartTime = Date.now();
      state.doubleScoreActive = false;
    },
    setSelectedOption(state, action) {
      if (!state.isAnswered) state.selectedOption = action.payload;
    },
    tickTimer(state) {
      if (state.timeLeft > 0 && state.timerActive && !state.isAnswered) {
        state.timeLeft -= 1;
      } else if (state.timeLeft <= 0 && !state.isAnswered) {
        state.timerActive = false;
        state.isAnswered = true;
        state.gamePhase = 'result';
      }
    },
    setTimeLeft(state, action) { state.timeLeft = action.payload; },
    setGamePhase(state, action) { state.gamePhase = action.payload; },
    setLeaderboard(state, action) { state.leaderboard = action.payload; },
    addChatMessage(state, action) {
      state.chatMessages.push(action.payload);
      if (state.chatMessages.length > 50) state.chatMessages.shift();
    },
    toggleDoubleScore(state) {
      if (state.powerUps.doubleScore > 0 && !state.isAnswered) {
        state.doubleScoreActive = !state.doubleScoreActive;
      }
    },
    useSkip(state) {
      if (state.powerUps.skip > 0) state.powerUps.skip -= 1;
    },
    clearGame(state) {
      state.currentQuestionIndex = 0;
      state.score = 0;
      state.answers = [];
      state.selectedOption = null;
      state.isAnswered = false;
      state.isCorrect = null;
      state.gamePhase = 'idle';
      state.leaderboard = [];
      state.chatMessages = [];
      state.doubleScoreActive = false;
      state.timerActive = false;
      state.error = null;
    },
    setQuestionStartTime(state, action) { state.questionStartTime = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitAnswer.pending, (s) => { s.loading = true; })
      .addCase(submitAnswer.fulfilled, (s, a) => {
        s.loading = false;
        s.isAnswered = true;
        s.timerActive = false;
        s.isCorrect = a.payload.isCorrect;
        s.correctAnswer = a.payload.correctAnswer;
        s.explanation = a.payload.explanation;
        s.earnedScore = a.payload.earnedScore;
        s.score = a.payload.totalScore;
        s.gamePhase = 'result';
        if (s.doubleScoreActive && a.payload.isCorrect) {
          s.powerUps.doubleScore -= 1;
        }
        s.answers.push({
          questionIndex: s.currentQuestionIndex,
          selectedOption: s.selectedOption,
          isCorrect: a.payload.isCorrect,
          earnedScore: a.payload.earnedScore,
        });
      })
      .addCase(submitAnswer.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
        s.isAnswered = true;
        s.timerActive = false;
        s.gamePhase = 'result';
      })

      .addCase(skipQuestion.fulfilled, (s, a) => {
        s.powerUps.skip = a.payload.remainingSkips;
        s.isAnswered = true;
        s.timerActive = false;
        s.gamePhase = 'result';
        s.answers.push({
          questionIndex: s.currentQuestionIndex,
          selectedOption: -1,
          isCorrect: false,
          earnedScore: 0,
        });
      });
  },
});

export const {
  initGame, startQuestion, setSelectedOption, tickTimer, setTimeLeft,
  setGamePhase, setLeaderboard, addChatMessage, toggleDoubleScore,
  useSkip, clearGame, setQuestionStartTime,
} = gameSlice.actions;
export default gameSlice.reducer;
