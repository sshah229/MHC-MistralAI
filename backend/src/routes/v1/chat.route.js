const express = require("express");
const { orchestrate } = require("../../utils/agents");
const query4 = require("../../utils/open4");
const router = express.Router();

router.post("/chatbot", async (req, res) => {
  try {
    const { message, email, language, facialEmotion } = req.body;
    if (!message || !email) {
      return res.status(400).json({ error: "Missing message or email" });
    }

    console.log("Chatbot request:", { email, message, language, facialEmotion });

    let enrichedMessage = message;
    if (facialEmotion) {
      enrichedMessage += `\n[System note: user's facial expression appears ${facialEmotion}]`;
    }

    const { sessionId } = req.body;
    const result = await orchestrate(enrichedMessage, email, language, sessionId);

    const key = result.sentiment;
    console.log("Agent:", result.agentName, "Sentiment:", key, "Answer:", result.answer);

    return res.json({
      answer: result.answer,
      sentiment: result.sentiment,
      agent: result.agent,
      agentName: result.agentName,
      action: result.action || null,
    });
  } catch (err) {
    console.error("Chatbot route error:", err);
    return res.status(500).json({ error: "Chatbot failed" });
  }
});

router.post("/diagnose", async (req, res) => {
  try {
    const diagnosis = await query4();
    if (!diagnosis) {
      return res.status(500).json({ error: "Diagnosis failed" });
    }

    console.log("Diagnosis result:", diagnosis);
    return res.json({ diagnosis });
  } catch (err) {
    console.error("Diagnosis route error:", err);
    return res.status(500).json({ error: "Diagnosis failed" });
  }
});

module.exports = router;
