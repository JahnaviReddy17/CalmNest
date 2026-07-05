import mongoose from "mongoose";

const activityHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  activityType: { type: String, required: true }, // 'meditation', 'breathing', 'journaling'
  duration: { type: Number }, // in seconds
  moodBefore: { type: Number },
  moodAfter: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ActivityHistory", activityHistorySchema);
