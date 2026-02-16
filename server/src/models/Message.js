import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true, default: '' },
    type: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
