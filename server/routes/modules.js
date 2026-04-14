import { Router } from "express";
import Module from "../models/Module.js";
import ModuleProgress from "../models/ModuleProgress.js";
import User from "../models/User.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

// ============================
// Mentor Routes
// ============================

// Mentors view all the modules they've created
router.get("/mentor", authenticate, requireRole("mentor"), async (req, res) => {
  try {
    const modules = await Module.find({ mentorId: req.user.id }).populate("assignedUsers", "name email isAnonymous");
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mentors create a new module
router.post("/mentor/create", authenticate, requireRole("mentor"), async (req, res) => {
  try {
    const { title, description, link, type, recommendedDuration, assignedUserIds } = req.body;
    
    // Create the module
    const newModule = await Module.create({
      mentorId: req.user.id,
      title,
      description,
      link,
      type,
      recommendedDuration,
      assignedUsers: assignedUserIds || []
    });

    // If assigned to users array directly upon creation, map to module progress docs
    if (assignedUserIds && assignedUserIds.length > 0) {
      const progressDocs = assignedUserIds.map((userId) => ({
        userId,
        moduleId: newModule._id,
        mentorId: req.user.id
      }));
      await ModuleProgress.insertMany(progressDocs);
    }

    res.json(newModule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Mentors can assign an existing module to distinct users
router.put("/mentor/assign/:moduleId", authenticate, requireRole("mentor"), async (req, res) => {
  try {
    const { userIds } = req.body; // Array of user IDs to assign
    const moduleId = req.params.moduleId;
    
    const targetModule = await Module.findById(moduleId);
    if (!targetModule || targetModule.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized or module not found" });
    }

    const newTargetUsers = userIds.filter(id => !targetModule.assignedUsers.includes(id));
    
    // Push new users to assigned list on module
    await Module.findByIdAndUpdate(moduleId, { $addToSet: { assignedUsers: { $each: newTargetUsers } } });
    
    // Bulk create tracking progress docs 
    const progressDocs = newTargetUsers.map((userId) => ({
      userId,
      moduleId: targetModule._id,
      mentorId: req.user.id
    }));
    await ModuleProgress.insertMany(progressDocs, { ordered: false }).catch(err => console.log("Some progress docs may already exist"));
    
    res.json({ message: "Assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// User Routes
// ============================

// Users view the modules assigned to them by their mentor
router.get("/user", authenticate, async (req, res) => {
  try {
    const progressList = await ModuleProgress.find({ userId: req.user.id })
      .populate({
        path: "moduleId",
        populate: { path: "mentorId", select: "name photo" }
      });
      
    res.json(progressList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Users toggle module progress completion (true/false)
router.put("/user/complete/:progressId", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    
    const progress = await ModuleProgress.findOneAndUpdate(
      { _id: req.params.progressId, userId: req.user.id },
      { 
        completionStatus: status, 
        completedAt: status ? new Date() : null 
      },
      { new: true }
    ).populate({
        path: "moduleId",
        populate: { path: "mentorId", select: "name photo" }
    });

    if (!progress) return res.status(404).json({ error: "Progress tracking not found" });

    // Ensure we emit web sockets allowing mentor to see when their patient completes a course (if io is available)
    const io = req.app.get("io");
    if (io && status) {
        io.to(`mentor-${progress.mentorId}`).emit("module-completed", {
           userId: req.user.id,
           moduleName: progress.moduleId.title
        });
    }

    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
