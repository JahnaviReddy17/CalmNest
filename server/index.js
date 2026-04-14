import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import http from "http";
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
