import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  badgeName: { type: String, required: true },
  description: { type: String },
  streakCount: { type: Number, default: 0 },
  unlockedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Achievement", achievementSchema);
