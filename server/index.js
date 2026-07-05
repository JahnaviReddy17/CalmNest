// Must be the very first import: ES module imports are hoisted and evaluated
// in source order before any other top-level code runs, so a plain
// `dotenv.config()` statement placed after other imports would execute AFTER
// files imported below (chat.js, wellness.js) have already run their
// top-level `new Groq({ apiKey: process.env.GROQ_API_KEY })` calls, causing
// "GROQ_API_KEY environment variable is missing" even with a correct .env.
// `import "dotenv/config"` is itself an import, so it's guaranteed to run
// first.
import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import moodRoutes from "./routes/mood.js";
import chatRoutes from "./routes/chat.js";
import mentorRoutes from "./routes/mentor.js";
import analyticsRoutes from "./routes/analytics.js";
import crisisRoutes from "./routes/crisis.js";
import wellnessRoutes from "./routes/wellness.js";
import notificationRoutes from "./routes/notifications.js";
import mentorDashboardRoutes from "./routes/mentorDashboard.js";
import mentorPatientRoutes from "./routes/mentorPatient.js";
import moduleRoutes from "./routes/modules.js";
import { setupSocket } from "./socket.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.set("io", io);

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/crisis", crisisRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/mentor-dashboard", mentorDashboardRoutes);
app.use("/api/mentor-patient", mentorPatientRoutes);
app.use("/api/modules", moduleRoutes);

setupSocket(io);

// ---------------------------------------------------------------------
// Serve the built React app (client/dist) from this same Express server
// in production, so frontend + backend + Socket.IO all share one origin.
// This avoids CORS and cross-origin WebSocket issues, and lets both
// pieces run as a single free-tier web service.
// ---------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, "../client/dist");

// Check for the built client folder directly (instead of relying on
// NODE_ENV, which not every platform sets) so this works the same way
// locally after `npm run build` or on any host.
if (fs.existsSync(path.join(clientDistPath, "index.html"))) {
  app.use(express.static(clientDistPath));

  // SPA fallback: any non-/api route serves index.html so React Router
  // can handle client-side routing (e.g. refreshing on /dashboard).
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
