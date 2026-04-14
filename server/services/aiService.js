export const analyzeMessage = async (message) => {
  const lowerMsg = message.toLowerCase();

  let sentiment = "neutral";
  let crisis = false;

  if (lowerMsg.includes("sad") || lowerMsg.includes("depressed")) {
    sentiment = "negative";
  }

  if (
    lowerMsg.includes("suicide") ||
    lowerMsg.includes("kill myself") ||
    lowerMsg.includes("end my life")
  ) {
    crisis = true;
  }

  return {
    sentiment,
    crisis,
    response: crisis
      ? "⚠️ Please reach out to someone you trust."
      : "I'm here for you 💙",
  };
};