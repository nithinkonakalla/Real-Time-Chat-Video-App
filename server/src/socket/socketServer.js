import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { env } from '../config/env.js';
import { verifyToken } from '../utils/token.js';
import { addSocket, isOnline, removeSocket } from './presenceStore.js';
import { Message } from '../models/Message.js';
import { Room } from '../models/Room.js';
import { User } from '../models/User.js';

export const setupSocket = async (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  if (env.enableRedisAdapter) {
    const pubClient = createClient({ url: env.redisUrl });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.io Redis adapter enabled');
  }

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyToken(token);
      socket.userId = payload.id;
      return next();
    } catch (error) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    addSocket(socket.userId, socket.id);
    await User.findByIdAndUpdate(socket.userId, { isOnline: true });
    socket.broadcast.emit('presence:update', { userId: socket.userId, isOnline: true });

    const rooms = await Room.find({ members: socket.userId }).select('_id');
    rooms.forEach((room) => socket.join(room._id.toString()));

    socket.on('room:join', (roomId) => socket.join(roomId));

    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:start', { roomId, userId: socket.userId });
    });

    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:stop', { roomId, userId: socket.userId });
    });

    socket.on('message:send', async ({ roomId, content, type = 'text', fileUrl = '', fileName = '' }) => {
      const allowed = await Room.exists({ _id: roomId, members: socket.userId });
      if (!allowed) return;

      const message = await Message.create({
        room: roomId,
        sender: socket.userId,
        content,
        type,
        fileUrl,
        fileName
      });

      const payload = await message.populate('sender', 'name email avatar');
      io.to(roomId).emit('message:new', payload);
      io.to(roomId).emit('notification:new', { roomId, message: payload });
    });

    socket.on('call:offer', ({ roomId, offer }) => socket.to(roomId).emit('call:offer', { offer, from: socket.userId }));
    socket.on('call:answer', ({ roomId, answer }) => socket.to(roomId).emit('call:answer', { answer, from: socket.userId }));
    socket.on('call:ice-candidate', ({ roomId, candidate }) => socket.to(roomId).emit('call:ice-candidate', { candidate, from: socket.userId }));
    socket.on('call:end', ({ roomId }) => socket.to(roomId).emit('call:end', { from: socket.userId }));

    socket.on('disconnect', async () => {
      removeSocket(socket.userId, socket.id);
      if (!isOnline(socket.userId)) {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
        socket.broadcast.emit('presence:update', { userId: socket.userId, isOnline: false });
      }
    });
  });

  return io;
};
