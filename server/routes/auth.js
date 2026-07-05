import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import Mentor from "../models/Mentor.js";

const router = Router();

router.post("/anonymous", async (req, res) => {
  try {
    const anonymousId = uuidv4();
    const user = await User.create({ isAnonymous: true, anonymousId });
    res.json({ userId: anonymousId, isAnonymous: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "Name, email and password required" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, role: role || "user" });
    const token = jwt.sign({ id: user._id, name: user.name, email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, name: user.name, email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/link-anonymous", async (req, res) => {
  try {
    const { anonymousId, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.findOneAndUpdate(
      { anonymousId },
      { email, password: hashed, isAnonymous: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "Anonymous user not found" });
    const token = jwt.sign({ id: user._id, email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/mentor-register", async (req, res) => {
  try {
    const { name, email, password, specializations, experienceYears, bio } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "Name, email and password required" });
    const exists = await Mentor.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 12);
    
    const mentor = await Mentor.create({ 
      name, 
      email, 
      password: hashed, 
      role: "mentor",
      specializations: specializations || ["General Wellness"],
      experienceYears: experienceYears || 0,
      bio: bio || "Professional wellness mentor."
    });
    
    const token = jwt.sign({ id: mentor._id, name: mentor.name, email, role: "mentor" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: mentor._id, name: mentor.name, email, role: "mentor" } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/mentor-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const mentor = await Mentor.findOne({ email });
    if (!mentor) return res.status(400).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, mentor.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: mentor._id, name: mentor.name, email, role: "mentor" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: mentor._id, name: mentor.name, email, role: "mentor" } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
