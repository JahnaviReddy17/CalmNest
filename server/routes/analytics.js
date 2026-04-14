import { Router } from "express";
import Mood from "../models/Mood.js";
import CrisisAlert from "../models/CrisisAlert.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// NGO / Admin Analytics
router.get("/dashboard", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const moods = await Mood.find({ timestamp: { $gte: thirtyDaysAgo } });
    const avgMood = moods.length ? moods.reduce((s, m) => s + m.mood, 0) / moods.length : 0;

    const alerts = await CrisisAlert.countDocuments({ timestamp: { $gte: thirtyDaysAgo } });
    const activeUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const dailyMoods = await Mood.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          avg: { $avg: "$mood" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const severityCounts = await CrisisAlert.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);

    let stressLevel = "low";
    if (avgMood < 2) stressLevel = "critical";
    else if (avgMood < 3) stressLevel = "high";
    else if (avgMood < 3.5) stressLevel = "medium";

    res.json({
      avgMoodScore: Math.round(avgMood * 100) / 100,
      stressLevel,
      activeUsers,
      alertsCount: alerts,
      dailyMoods,
      severityCounts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Personal User Dashboard
router.get("/me", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.headers["x-anonymous-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const userMoods = await Mood.find({ userId, timestamp: { $gte: thirtyDaysAgo } }).sort({ timestamp: 1 });
    const totalCheckins = userMoods.length;
    
    // Create an array of recent 7 moods for the chart
    const recentMoods = userMoods.slice(-7);
    
    const alertsCount = await CrisisAlert.countDocuments({ userId, timestamp: { $gte: thirtyDaysAgo } });
    const chatSessions = await Chat.countDocuments({ userId });
    
    // Check if the user has a recent crisis
    const lastAlert = await CrisisAlert.findOne({ userId }).sort({ timestamp: -1 });
    
    // Calculate simple streak
    let streak = 0;
    // Basic logic just for demo
    if (totalCheckins > 0) streak = Math.min(totalCheckins, 14); 

    res.json({
      moods: recentMoods,
      totalCheckins,
      alertsCount,
      chatSessions,
      hasRecentAlert: lastAlert ? (new Date() - new Date(lastAlert.timestamp) < 24 * 60 * 60 * 1000) : false,
      streak
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
