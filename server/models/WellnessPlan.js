import mongoose from "mongoose";

const wellnessPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mood: { type: Number },
  stressLevel: { type: String },
  generatedPlan: [
    {
      task: String,
      completed: { type: Boolean, default: false }
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("WellnessPlan", wellnessPlanSchema);
