import jwt from 'jsonwebtoken';
import Room from '../models/Room.js';

const connectedUsers = new Map(); // userId -> socketId
const roomSockets = new Map();   // roomId -> Set of socketIds

export const initializeSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId})`);
    connectedUsers.set(socket.userId, socket.id);

    // Join a room channel
    socket.on('join_room', async ({ roomId }) => {
      try {
        socket.join(`room:${roomId}`);
        if (!roomSockets.has(roomId)) roomSockets.set(roomId, new Set());
        roomSockets.get(roomId).add(socket.id);

        const room = await Room.findById(roomId).populate('quiz', 'title category');
        if (!room) return;

        // Notify other participants
        socket.to(`room:${roomId}`).emit('player_joined', {
          userId: socket.userId,
          participantCount: room.participants.length,
        });

        // Send current room state to joiner
        socket.emit('room_state', {
          status: room.status,
          participants: room.participants.map((p) => ({
            userId: p.user,
            username: p.username,
            avatar: p.avatar,
            isReady: p.isReady,
            score: p.score,
          })),
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Leave a room channel
    socket.on('leave_room', ({ roomId }) => {
      socket.leave(`room:${roomId}`);
      if (roomSockets.has(roomId)) roomSockets.get(roomId).delete(socket.id);
      socket.to(`room:${roomId}`).emit('player_left', { userId: socket.userId });
    });

    // Player ready state
    socket.on('player_ready', async ({ roomId, isReady }) => {
      try {
        await Room.updateOne(
          { _id: roomId, 'participants.user': socket.userId },
          { $set: { 'participants.$.isReady': isReady } }
        );
        io.to(`room:${roomId}`).emit('player_ready_update', { userId: socket.userId, isReady });
      } catch {}
    });

    // Game started by host
    socket.on('game_started', ({ roomId }) => {
      io.to(`room:${roomId}`).emit('game_starting', { countdown: 3 });
    });

    // Question advancement
    socket.on('next_question', ({ roomId, questionIndex }) => {
      io.to(`room:${roomId}`).emit('question_changed', { questionIndex });
    });

    // Score update broadcast
    socket.on('score_update', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;
        const leaderboard = room.participants
          .slice()
          .sort((a, b) => b.score - a.score)
          .map((p, i) => ({
            userId: p.user,
            username: p.username,
            avatar: p.avatar,
            score: p.score,
            rank: i + 1,
          }));
        io.to(`room:${roomId}`).emit('leaderboard_update', { leaderboard });
      } catch {}
    });

    // Chat message
    socket.on('chat_message', ({ roomId, message, username, avatar }) => {
      if (message?.length > 200) return;
      io.to(`room:${roomId}`).emit('new_chat_message', {
        userId: socket.userId,
        username,
        avatar,
        message,
        timestamp: Date.now(),
      });
    });

    // Game over broadcast
    socket.on('game_over', ({ roomId, leaderboard }) => {
      io.to(`room:${roomId}`).emit('game_finished', { leaderboard });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      connectedUsers.delete(socket.userId);
      roomSockets.forEach((sockets, roomId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          socket.to(`room:${roomId}`).emit('player_disconnected', { userId: socket.userId });
        }
      });
    });
  });
};

export const emitToRoom = (io, roomId, event, data) => {
  io.to(`room:${roomId}`).emit(event, data);
};
