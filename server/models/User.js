import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String },
  isAnonymous: { type: Boolean, default: false },
  anonymousId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: String,
  role: { type: String, enum: ["user", "mentor", "admin"], default: "user" },
  riskLevel: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("User", userSchema);
