import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
  socket.on('disconnect', (reason) => console.log('🔌 Socket disconnected:', reason));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoomSocket = (roomId) => {
  socket?.emit('join_room', { roomId });
};

export const leaveRoomSocket = (roomId) => {
  socket?.emit('leave_room', { roomId });
};

export const emitGameStarted = (roomId) => {
  socket?.emit('game_started', { roomId });
};

export const emitNextQuestion = (roomId, questionIndex) => {
  socket?.emit('next_question', { roomId, questionIndex });
};

export const emitScoreUpdate = (roomId) => {
  socket?.emit('score_update', { roomId });
};

export const emitGameOver = (roomId, leaderboard) => {
  socket?.emit('game_over', { roomId, leaderboard });
};

export const emitChatMessage = (roomId, message, username, avatar) => {
  socket?.emit('chat_message', { roomId, message, username, avatar });
};

export const emitPlayerReady = (roomId, isReady) => {
  socket?.emit('player_ready', { roomId, isReady });
};
