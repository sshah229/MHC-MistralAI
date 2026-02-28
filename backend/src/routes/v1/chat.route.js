const express = require("express");
const query = require("../../utils/open"); // your LLM responder
const query2 = require("../../utils/open2"); // AnalyzeEmotion(prompt, email)
const query3 = require("../../utils/open3"); // self‑harm check
const query4 = require("../../utils/open4");
const router = express.Router();

router.post("/chatbot", async (req, res) => {
  try {
    const { message, email } = req.body;
    if (!message || !email) {
      return res.status(400).json({ error: "Missing message or email" });
    }

    console.log("Chatbot request:", { email, message });

    // 1) Emotion analysis & logging
    const entry = await query2(message, email);
    console.log("Raw AnalyzeEmotion entry:", entry);

    // 2) Derive sentiment, with a keyword fallback
    let sentiment = entry?.emotion_category?.toLowerCase();
    const msg = message.toLowerCase();

    // If Gemini failed or returned something unexpected:
    if (!["happy", "sad", "neutral", "anxious", "angry"].includes(sentiment)) {
      if (msg.includes("sad")) sentiment = "sad";
      else if (msg.includes("angry")) sentiment = "angry";
      else if (msg.includes("anxious")) sentiment = "anxious";
      else sentiment = "neutral";
      console.log("Fallback sentiment →", sentiment);
    }

    // 3) Self‑harm guard
    const selfHarm = await query3(message);
    if (selfHarm === 1) {
      console.log("Self‑harm risk – safe response sent");
      return res.json({
        answer: "Please reach out immediately—you're not alone.",
        sentiment,
      });
    }

    // 4) LLM reply
    const answer = await query(message);
    console.log("LLM answer:", answer, "Sentiment used:", sentiment);

    // 5) Return both
    return res.json({ answer, sentiment });
  } catch (err) {
    console.error("Chatbot route error:", err);
    return res.status(500).json({ error: "Chatbot failed" });
  }
});

router.post("/diagnose", async (req, res) => {
  try {
    // Call the diagnosis function
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
