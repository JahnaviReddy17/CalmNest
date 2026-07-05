import mongoose from "mongoose";
const requestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" },
  status: { type: String, enum: ["pending", "accepted", "rejected", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("MentorRequest", requestSchema);
