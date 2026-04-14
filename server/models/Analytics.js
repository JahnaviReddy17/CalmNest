import mongoose from "mongoose";
const analyticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  avgMoodScore: Number,
  stressLevel: String,
  activeUsers: Number,
  alertsCount: Number,
});
export default mongoose.model("Analytics", analyticsSchema);
