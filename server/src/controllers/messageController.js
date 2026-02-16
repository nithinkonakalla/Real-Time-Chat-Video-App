import { asyncHandler } from '../utils/asyncHandler.js';
import { Message } from '../models/Message.js';
import { Room } from '../models/Room.js';

export const getMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ _id: roomId, members: req.user._id });
  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  const messages = await Message.find({ room: roomId })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: 1 })
    .limit(200);

  res.json({ messages });
});

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ fileUrl, fileName: req.file.originalname });
});
