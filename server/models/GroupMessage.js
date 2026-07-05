import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  userId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("GroupMessage", groupMessageSchema);
