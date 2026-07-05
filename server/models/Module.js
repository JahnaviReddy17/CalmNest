import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String }, // optional resource link (video, article, etc.)
  type: { type: String, enum: ["Course", "Exercise", "Reading", "Video"], default: "Exercise" },
  recommendedDuration: { type: Number, default: 10 }, // minutes
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Module", moduleSchema);
