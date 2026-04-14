import GroupMessage from "./models/GroupMessage.js";
import MentorChat from "./models/MentorChat.js";

const safeCircleRooms = {};

export function setupSocket(io) {
  io.on("connection", (socket) => {
    
    // Join personal user room to receive private realtime updates
    socket.on("join-user", ({ userId }) => {
      if (userId) socket.join(userId);
    });

    socket.on("join-safe-circle", async ({ topic, userId, name }) => {
      socket.join(`circle-${topic}`);
      if (!safeCircleRooms[topic]) safeCircleRooms[topic] = [];
      const userDisplay = name || userId.slice(0, 8) + "...";
      safeCircleRooms[topic].push({ socketId: socket.id, userId, name: userDisplay });
      
      io.to(`circle-${topic}`).emit("circle-update", {
        topic,
        members: safeCircleRooms[topic].length,
      });

      try {
        // Send the last 50 messages of this topic instantly to the user
        const pastMessages = await GroupMessage.find({ topic }).sort({ timestamp: -1 }).limit(50);
        socket.emit("previous-messages", pastMessages.reverse());
      } catch (err) {
        console.error("Error fetching past messages:", err);
      }
    });

    socket.on("circle-message", async ({ topic, message, userId, name }) => {
      try {
        const userDisplay = name || userId.slice(0, 8) + "...";
        const newMsg = await GroupMessage.create({ topic, userId, message });
        
        io.to(`circle-${topic}`).emit("new-circle-message", {
          _id: newMsg._id,
          userId: userDisplay,
          message: newMsg.message,
          timestamp: newMsg.timestamp,
        });
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    socket.on("typing-start", ({ topic, name, userId }) => {
      const display = name || userId.slice(0, 8) + "...";
      socket.to(`circle-${topic}`).emit("user-typing", { user: display });
    });

    socket.on("typing-stop", ({ topic }) => {
      socket.to(`circle-${topic}`).emit("user-stopped-typing");
    });

    socket.on("join-mentor-chat", ({ roomId }) => {
      socket.join(`mentor-${roomId}`);
    });

    socket.on("mentor-message", async ({ roomId, message, senderId, userId, mentorId }) => {
      try {
        let chat = await MentorChat.findOne({ userId, mentorId });
        if (!chat) {
          chat = await MentorChat.create({ userId, mentorId, messages: [] });
        }
        
        chat.messages.push({ senderId, text: message });
        await chat.save();
        
        io.to(`mentor-${roomId}`).emit("new-mentor-message", {
          senderId,
          text: message,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error("Error saving mentor chat message:", err);
      }
    });

    socket.on("disconnect", () => {
      for (const topic in safeCircleRooms) {
        safeCircleRooms[topic] = safeCircleRooms[topic].filter((u) => u.socketId !== socket.id);
        io.to(`circle-${topic}`).emit("circle-update", {
          topic,
          members: safeCircleRooms[topic].length,
        });
      }
    });
  });
}
