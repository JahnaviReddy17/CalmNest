import mongoose from "mongoose";

const moduleProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
  completionStatus: { type: Boolean, default: false },
  completedAt: { type: Date }
});

// Ensure only one progress tracking per user-module pair
moduleProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

export default mongoose.model("ModuleProgress", moduleProgressSchema);
