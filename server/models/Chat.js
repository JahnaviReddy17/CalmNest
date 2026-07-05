import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant", "system"] },
  content: String,
  timestamp: { type: Date, default: Date.now },
});
const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ["ai", "peer", "mentor"], default: "ai" },
  messages: [messageSchema],
  sentimentScore: Number,
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("Chat", chatSchema);
