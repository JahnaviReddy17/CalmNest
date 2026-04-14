import { Router } from "express";
import User from "../models/User.js";
import Mood from "../models/Mood.js";
import ActivityHistory from "../models/ActivityHistory.js";
import CrisisAlert from "../models/CrisisAlert.js";
import ModuleProgress from "../models/ModuleProgress.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import Mentor from "../models/Mentor.js";

const router = Router();

router.get("/:userId", authenticate, requireRole("mentor"), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure mentor is actually assigned to this user
    const mentor = await Mentor.findById(req.user.id);
    if (!mentor || !mentor.assignedUsers.includes(userId)) {
      return res.status(403).json({ error: "Access denied. Patient is not assigned to you." });
    }

    const patientInfo = await User.findById(userId).select("-password").lean();
    if (!patientInfo) return res.status(404).json({ error: "Patient not found" });

    // Fetch deep analytics
    const moods = await Mood.find({ userId }).sort({ timestamp: -1 }).limit(14).lean();
    const activities = await ActivityHistory.find({ userId }).sort({ timestamp: -1 }).limit(10).lean();
    const crisisAlerts = await CrisisAlert.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();
    
    // Fetch module progress for this specific mentor
    const modules = await ModuleProgress.find({ userId, mentorId: mentor._id })
      .populate("moduleId", "title type recommendedDuration")
      .lean();

    res.json({
      profile: patientInfo,
      analytics: {
        moods: moods.reverse(),
        activities,
        crisisAlerts,
        modules
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
