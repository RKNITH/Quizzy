import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import quizReducer from './slices/quizSlice.js';
import roomReducer from './slices/roomSlice.js';
import gameReducer from './slices/gameSlice.js';
import leaderboardReducer from './slices/leaderboardSlice.js';
import historyReducer from './slices/historySlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
    room: roomReducer,
    game: gameReducer,
    leaderboard: leaderboardReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['game/setQuestionStartTime'],
        ignoredPaths: ['game.questionStartTime'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export default store;