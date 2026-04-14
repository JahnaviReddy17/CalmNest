import mongoose from "mongoose";
const crisisSchema = new mongoose.Schema({
  userId: String,
  severity: { type: String, enum: ["medium", "high", "critical"], required: true },
  triggerSource: { type: String, enum: ["chat", "mood", "journal"], required: true },
  triggerContent: String,
  resolved: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});
export default mongoose.model("CrisisAlert", crisisSchema);
