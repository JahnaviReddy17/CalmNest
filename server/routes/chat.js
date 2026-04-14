import { Router } from "express";
import Chat from "../models/Chat.js";
import CrisisAlert from "../models/CrisisAlert.js";
import { analyzeMessage } from "../services/aiService.js";
import { optionalAuth } from "../middleware/auth.js";
import Groq from "groq-sdk";

console.log("ENV CHECK:", process.env.GROQ_API_KEY);
const router = Router();

// ✅ Groq setup
const groq = new Groq({
  apiKey: "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",
});

// ✅ AI function
const chatWithAI = async (messages) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are a helpful, intelligent, and friendly AI assistant inside a web application.

Your role is to:
- Help users clearly and accurately
- Provide simple, easy-to-understand explanations
- Be polite, concise, and supportive
- Ask follow-up questions when needed

Guidelines:
- Keep answers short unless the user asks for details
- Use examples when explaining concepts
- If the user asks something unclear, ask for clarification
- Do not provide incorrect or misleading information
- If you don’t know something, say so honestly

Tone:
- Friendly and conversational
- Supportive and respectful
- Avoid overly technical language unless asked

Context:
This chatbot is part of a project called "MindSafe", focused on helping users with productivity, mental well-being, and guidance.

Always prioritize:
- Clarity
- Helpfulness
- User comfort`
      },
      ...messages
    ],
  });

  return completion.choices[0].message.content;
};


// ✅ MAIN ROUTE
router.post("/ai", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.anonymousId;
    const { message, chatId } = req.body;

    let chat;

    if (chatId) {
      chat = await Chat.findById(chatId);
    }

    if (!chat) {
      chat = await Chat.create({
        userId,
        type: "ai",
        messages: [],
      });
    }

    // Save user message
    chat.messages.push({ role: "user", content: message });

    // Format messages for AI
    const aiMessages = chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // ✅ Call Groq AI
    const reply = await chatWithAI(aiMessages);

    // Save AI reply
    chat.messages.push({ role: "assistant", content: reply });

    // ✅ Sentiment analysis (your existing function)
    const sentiment = await analyzeMessage(message);
    chat.sentimentScore = sentiment.score;

    await chat.save();

    // 🚨 Crisis detection
    let crisis = null;
    if (
      sentiment.crisis ||
      sentiment.severity === "high" ||
      sentiment.severity === "critical"
    ) {
      crisis = await CrisisAlert.create({
        userId,
        severity: sentiment.severity,
        triggerSource: "chat",
        triggerContent: message,
      });
    }

    const io = req.app.get("io");
    if (io) io.to(userId).emit("chatUpdated", { chatId: chat._id });

    res.json({
      reply,
      chatId: chat._id,
      crisis,
      sentiment,
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Chat history
router.get("/history/:userId", optionalAuth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;