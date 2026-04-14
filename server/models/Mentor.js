import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "mentor" },
  bio: { type: String, default: "Professional wellness mentor." },
  photo: { type: String, default: "https://i.pravatar.cc/150" },
  specializations: [String],
  experienceYears: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  languages: [String],
  availability: { type: Boolean, default: true },
  status: { type: String, enum: ["online", "offline", "busy"], default: "offline" },
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Mentor", mentorSchema);
