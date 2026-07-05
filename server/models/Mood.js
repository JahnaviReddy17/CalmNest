import mongoose from "mongoose";
const moodSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mood: { type: Number, min: 1, max: 5, required: true },
  emoji: String,
  note: String,
  timestamp: { type: Date, default: Date.now },
});
export default mongoose.model("Mood", moodSchema);
