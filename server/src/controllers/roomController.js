import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Room } from '../models/Room.js';

export const getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ members: req.user._id }).populate('members', 'name email isOnline lastSeen');
  res.json({ rooms });
});

export const createDirectRoom = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const existing = await Room.findOne({
    isGroup: false,
    members: { $all: [req.user._id, userId], $size: 2 }
  });

  if (existing) return res.json({ room: existing });

  const room = await Room.create({
    name: 'Direct Message',
    isGroup: false,
    members: [req.user._id, userId]
  });

  return res.status(201).json({ room });
});

export const createGroupRoom = asyncHandler(async (req, res) => {
  const { name, memberIds } = req.body;
  const members = [...new Set([req.user._id.toString(), ...memberIds])].map((id) => new mongoose.Types.ObjectId(id));

  const room = await Room.create({
    name,
    isGroup: true,
    members,
    admin: req.user._id
  });

  res.status(201).json({ room });
});
