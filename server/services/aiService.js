export const analyzeMessage = async (message) => {
  const lowerMsg = message.toLowerCase();

  let sentiment = "neutral";
  let crisis = false;
  let severity = "low";
  let score = 0;

  if (lowerMsg.includes("sad") || lowerMsg.includes("depressed")) {
    sentiment = "negative";
    severity = "medium";
    score = -0.5;
  }

  if (
    lowerMsg.includes("suicide") ||
    lowerMsg.includes("kill myself") ||
    lowerMsg.includes("end my life")
  ) {
    crisis = true;
    sentiment = "negative";
    severity = "critical";
    score = -1;
  }

  return {
    sentiment,
    crisis,
    severity,
    score,
    response: crisis
      ? "⚠️ Please reach out to someone you trust."
      : "I'm here for you 💙",
  };
};