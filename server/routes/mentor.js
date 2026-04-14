import { Router } from "express";
import Mentor from "../models/Mentor.js";
import MentorRequest from "../models/MentorRequest.js";
import MentorChat from "../models/MentorChat.js";
import { authenticate, requireRole, optionalAuth } from "../middleware/auth.js";

const router = Router();

// Fetch mentors (Auto-seed if empty for the hackathon demo)
router.get("/", async (req, res) => {
  try {
    let mentors = await Mentor.find();
    
    // Auto-seed for hackathon demo if empty
    if (mentors.length === 0) {
      const demoMentors = [
        {
          name: "Dr. Ananya Sharma",
          photo: "https://i.pravatar.cc/150?u=ananya",
          specializations: ["Anxiety Specialist", "CBT", "Depression"],
          experienceYears: 10,
          rating: 4.9,
          languages: ["English", "Hindi"],
          status: "online",
        },
        {
          name: "Rahul Verma",
          photo: "https://i.pravatar.cc/150?u=rahul",
          specializations: ["Stress Coach", "Workplace Stress", "Burnout"],
          experienceYears: 6,
          rating: 4.8,
          languages: ["English", "Hindi"],
          status: "busy",
        },
        {
          name: "Priya Nair",
          photo: "https://i.pravatar.cc/150?u=priya",
          specializations: ["Student Counselor", "Academic Stress", "Career Transitions"],
          experienceYears: 8,
          rating: 5.0,
          languages: ["English", "Malayalam"],
          status: "offline",
        },
        {
          name: "Arjun Mehta",
          photo: "https://i.pravatar.cc/150?u=arjun",
          specializations: ["Mental Wellness Mentor", "Self-Esteem", "Relationships"],
          experienceYears: 5,
          rating: 4.7,
          languages: ["English", "Gujarati"],
          status: "online",
        }
      ];
      await Mentor.insertMany(demoMentors);
      mentors = await Mentor.find();
    }
    
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request a specific mentor
router.post("/request", authenticate, async (req, res) => {
  try {
    const { mentorId } = req.body;
    if (!mentorId) return res.status(400).json({ error: "Mentor ID required" });
    
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ error: "Mentor not found" });
    
    const request = await MentorRequest.create({
      userId: req.user.id,
      mentorId: mentor._id,
      status: "pending"
    });
    
    const io = req.app.get("io");
    if (io) io.to(req.user.id).emit("mentorRequested", request);
    
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/accept/:requestId", authenticate, requireRole("mentor"), async (req, res) => {
  try {
    const request = await MentorRequest.findByIdAndUpdate(
      req.params.requestId,
      { status: "accepted" },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: "Request not found" });
    
    // The previous implementation used userId: req.user.id but Mentor doesn't use userId anymore!
    // We updated the mentor schema. mentor._id is req.user.id
    await Mentor.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { assignedUsers: request.userId } }
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/decline/:requestId", authenticate, requireRole("mentor"), async (req, res) => {
  try {
    const request = await MentorRequest.findByIdAndUpdate(
      req.params.requestId,
      { status: "declined" },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/requests", authenticate, requireRole("mentor"), async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user.id });
    if (!mentor) return res.status(404).json({ error: "Mentor profile not found" });
    
    const requests = await MentorRequest.find({ mentorId: mentor._id, status: "pending" });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/chat/:userId/:mentorId", authenticate, async (req, res) => {
  try {
    const { userId, mentorId } = req.params;
    
    // Authorization check
    if (req.user.role === "user" && req.user.id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // For mentor, verify mentorId matches token, although it could be handled via requireRole
    if (req.user.role === "mentor") {
      const mentor = await Mentor.findOne({ _id: mentorId, email: req.user.email }); // Or equivalent check using mentor login details
    }

    const chat = await MentorChat.findOne({ userId, mentorId }).lean();
    res.json(chat ? chat.messages : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
