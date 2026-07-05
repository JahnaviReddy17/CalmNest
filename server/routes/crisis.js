import { Router } from "express";
import CrisisAlert from "../models/CrisisAlert.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/alerts", authenticate, requireRole("mentor", "admin"), async (req, res) => {
  try {
    const alerts = await CrisisAlert.find().sort({ timestamp: -1 }).limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/resolve/:id", authenticate, requireRole("mentor", "admin"), async (req, res) => {
  try {
    const alert = await CrisisAlert.findByIdAndUpdate(req.params.id, { resolved: true }, { new: true });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
