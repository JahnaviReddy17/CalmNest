import { Router } from "express";
import Mentor from "../models/Mentor.js";
import MentorRequest from "../models/MentorRequest.js";
import User from "../models/User.js";
import Mood from "../models/Mood.js";
import CrisisAlert from "../models/CrisisAlert.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/overview", authenticate, requireRole("mentor"), async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.user.id);
    if (!mentor) return res.status(404).json({ error: "Mentor not found" });

    // 1. Fetch pending requests
    const pendingRequests = await MentorRequest.find({ mentorId: mentor._id, status: "pending" }).populate("userId", "name isAnonymous anonymousId").lean();

    // 2. Fetch assigned users and their details
    const assignedUsers = await User.find({ _id: { $in: mentor.assignedUsers } }).lean();

    let crisisAlertsCount = 0;
    
    // Attach latest moods and crisis alerts to users
    for (let u of assignedUsers) {
      const moods = await Mood.find({ userId: u._id }).sort({ timestamp: -1 }).limit(7).lean();
      u.moods = moods.reverse(); // ascending order for charts
      u.latestMood = moods.length > 0 ? moods[moods.length - 1] : null;

      const alerts = await CrisisAlert.find({ userId: u._id, resolved: { $ne: true } }).lean();
      u.activeCrisis = alerts.length > 0;
      crisisAlertsCount += alerts.length;
    }

    const stats = {
      totalAssigned: mentor.assignedUsers.length,
      activeSessions: mentor.assignedUsers.length, // approximation for now
      pendingRequests: pendingRequests.length,
      crisisAlertsCount,
      todaySessions: 0 // hook this up to MentorChat message timestamp today if needed
    };

    res.json({ assignedUsers, stats, pendingRequests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
