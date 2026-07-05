import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const mentorChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

// Ensure only one chat document exists per user-mentor pair
mentorChatSchema.index({ userId: 1, mentorId: 1 }, { unique: true });

export default mongoose.model("MentorChat", mentorChatSchema);
