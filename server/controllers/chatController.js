import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const aiChat = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `
You are a supportive mental health assistant.
- Be empathetic
- Be calm and helpful
- Do NOT judge
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    // 🚨 Crisis detection
    const crisisWords = ["suicide", "kill myself", "die"];
    const crisis = crisisWords.some(word =>
      message.toLowerCase().includes(word)
    );

    res.json({
      reply,
      chatId: chatId || Date.now().toString(),
      crisis,
    });

  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({
      reply: "AI is not working right now",
      crisis: false,
    });
  }
};