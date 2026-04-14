import { Router } from "express";
import WellnessPlan from "../models/WellnessPlan.js";
import ActivityHistory from "../models/ActivityHistory.js";
import Achievement from "../models/Achievement.js";
import Mood from "../models/Mood.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { authenticate } from "../middleware/auth.js";
import Groq from "groq-sdk";

const router = Router();
const groq = new Groq({ apiKey: "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" });

router.get("/plan", authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let plan = await WellnessPlan.findOne({
      userId: req.user.id,
      createdAt: { $gte: today },
    });

    if (!plan) {
      // 1. Fetch last 5 moods
      const moods = await Mood.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(5);
      const recentMood = moods.length > 0 ? moods[0].mood : 3;
      const stressLevel = recentMood <= 2 ? "High" : recentMood === 3 ? "Medium" : "Low";

      let prompt = `Generate a daily wellness plan consisting of exactly 5 short, actionable tasks for a user with a recent mood rating of ${recentMood} out of 5 and a stress level of ${stressLevel}. Return ONLY a JSON array of strings. Do not include markdown code block formatting like \`\`\`json. Example: ["Drink 1 liter of water", "5-minute breathing", "Short walk", "Journal for 10 min", "Listen to calm music"]`;

      let generatedTasks = [];
      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.1-8b-instant",
        });
        
        let rawContent = completion.choices[0].message.content.trim();
        // try to parse it if there is markdown json wrapper
        if (rawContent.startsWith("```")) {
            rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        }
        generatedTasks = JSON.parse(rawContent);

        if (!Array.isArray(generatedTasks) || generatedTasks.length === 0) throw new Error();
      } catch (err) {
        // Fallback
        generatedTasks = [
          "5-minute 4-4-4 breathing exercise",
          "Drink a glass of water",
          "Log your daily mood",
          "Take a 10-minute walk outside",
          "Listen to calming music"
        ];
      }

      plan = await WellnessPlan.create({
        userId: req.user.id,
        mood: recentMood,
        stressLevel,
        generatedPlan: generatedTasks.map(t => ({ task: t, completed: false })),
      });
    }

    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/plan/:planId/task/:taskId", authenticate, async (req, res) => {
  try {
    const plan = await WellnessPlan.findOne({ _id: req.params.planId, userId: req.user.id });
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    const task = plan.generatedPlan.id(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.completed = true;
    await plan.save();

    const io = req.app.get("io");
    if (io) io.to(req.user.id).emit("dashboardUpdated");

    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/activity", authenticate, async (req, res) => {
  try {
    const { activityType, duration } = req.body;
    
    await ActivityHistory.create({
      userId: req.user.id,
      activityType,
      duration
    });

    const count = await ActivityHistory.countDocuments({ userId: req.user.id, activityType });
    
    let newAchievement = null;
    if (count === 1) {
      newAchievement = await Achievement.create({
        userId: req.user.id,
        badgeName: `First ${activityType.charAt(0).toUpperCase() + activityType.slice(1)} Completed`,
        description: `You completed your first ${activityType} session!`
      });
    } else if (count === 5) {
      newAchievement = await Achievement.create({
        userId: req.user.id,
        badgeName: `Consistency Champion: ${activityType}`,
        description: `You completed 5 ${activityType} sessions!`
      });
    }

    const io = req.app.get("io");
    if (io) {
      io.to(req.user.id).emit("dashboardUpdated");
      if (newAchievement) {
        io.to(req.user.id).emit("achievementUnlocked", newAchievement);
        
        // Push notification for the badge
        const notif = await Notification.create({
          userId: req.user.id,
          message: `🏆 You earned a new badge: ${newAchievement.badgeName}!`
        });
        io.to(req.user.id).emit("newNotification", notif);
      }
    }

    res.json({ success: true, newAchievement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/achievements", authenticate, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id }).sort({ unlockedAt: -1 });
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
